<?php

namespace App\Services;

use App\Jobs\SendRegistrationEmail;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * Class RegistrationService
 *
 * Camada de serviço responsável pela lógica de registro de usuários.
 * Gerencia o fluxo de cadastro complementar após login via Google OAuth.
 *
 * @package App\Services
 * @author Sistema de Cadastro
 * @version 1.0.0
 */
class RegistrationService
{
    /**
     * Instância do repositório de usuários.
     *
     * @var UserRepositoryInterface
     */
    protected UserRepositoryInterface $userRepository;

    /**
     * Instância do serviço Google.
     *
     * @var GoogleService
     */
    protected GoogleService $googleService;

    /**
     * RegistrationService constructor.
     *
     * @param UserRepositoryInterface $userRepository Repositório de usuários
     * @param GoogleService $googleService Serviço de integração Google
     */
    public function __construct(
        UserRepositoryInterface $userRepository,
        GoogleService $googleService
    ) {
        $this->userRepository = $userRepository;
        $this->googleService = $googleService;
    }

    /**
     * Completa o cadastro de um usuário.
     *
     * Atualiza os dados do usuário, marca como cadastro completo
     * e dispara o envio de e-mail de confirmação via fila.
     *
     * @param int $userId ID do usuário
     * @param array<string, mixed> $data Dados do cadastro (name, birth_date, cpf)
     * @return User
     * @throws ValidationException Se a validação falhar
     * @throws \Exception Se o usuário não for encontrado
     */
    public function completeRegistration(int $userId, array $data): User
    {
        $this->validateRegistrationData($data, $userId);

        $user = $this->userRepository->findById($userId);

        if (!$user) {
            throw new \Exception('Usuário não encontrado.');
        }

        // Atualiza os dados do usuário
        $user = $this->userRepository->update($userId, [
            'name' => $data['name'],
            'birth_date' => $data['birth_date'],
            'cpf' => $data['cpf'],
            'registration_completed' => true,
        ]);

        // Obtém o e-mail do token Google se disponível
        $email = $this->getEmailForNotification($user);

        Log::info('Disparando job de envio de e-mail', [
            'user_id' => $user->id,
            'email' => $email,
        ]);

        // Dispara o job de envio de e-mail de forma assíncrona
        SendRegistrationEmail::dispatch($user, $email);

        Log::info('Job de e-mail disparado com sucesso', [
            'user_id' => $user->id,
        ]);

        return $user;
    }

    /**
     * Obtém o e-mail para envio de notificação.
     *
     * Utiliza refresh automático de token se necessário.
     * Caso falhe, usa o e-mail cadastrado no sistema.
     *
     * @param User $user Usuário
     * @return string E-mail para notificação
     */
    protected function getEmailForNotification(User $user): string
    {
        // Usa o método com refresh automático
        return $this->googleService->getEmailWithAutoRefresh($user);
    }

    /**
     * Verifica o status de cadastro de um usuário.
     *
     * @param int $userId ID do usuário
     * @return array{completed: bool, user: User|null}
     */
    public function getRegistrationStatus(int $userId): array
    {
        $user = $this->userRepository->findById($userId);

        if (!$user) {
            return [
                'completed' => false,
                'user' => null,
            ];
        }

        return [
            'completed' => $user->registration_completed,
            'user' => $user,
        ];
    }

    /**
     * Valida os dados de registro.
     *
     * @param array<string, mixed> $data Dados a serem validados
     * @param int $userId ID do usuário para validação de unicidade
     * @return void
     * @throws ValidationException Se a validação falhar
     */
    protected function validateRegistrationData(array $data, int $userId): void
    {
        // Remove formatação do CPF para validação de unicidade
        $cpfClean = isset($data['cpf']) ? preg_replace('/[^0-9]/', '', $data['cpf']) : '';

        $rules = [
            'name' => 'required|string|max:255',
            'birth_date' => 'required|date|before:today',
            'cpf' => 'required|string',
        ];

        $messages = [
            'name.required' => 'O nome é obrigatório.',
            'name.string' => 'O nome deve ser um texto válido.',
            'name.max' => 'O nome não pode ter mais de 255 caracteres.',
            'birth_date.required' => 'A data de nascimento é obrigatória.',
            'birth_date.date' => 'A data de nascimento deve estar no formato válido (dd/mm/aaaa).',
            'birth_date.before' => 'A data de nascimento deve ser anterior a hoje.',
            'cpf.required' => 'O CPF é obrigatório.',
            'cpf.string' => 'O CPF deve ser um texto válido.',
        ];

        $validator = Validator::make($data, $rules, $messages);

        // Validação customizada para CPF (validação matemática + unicidade)
        $validator->after(function ($validator) use ($cpfClean, $userId) {
            // Validação matemática do CPF
            if (!$this->validateCpf($cpfClean)) {
                $validator->errors()->add('cpf', 'O CPF informado é inválido.');
                return;
            }

            // Verifica unicidade
            $existingUser = User::where('cpf', $cpfClean)
                ->where('id', '!=', $userId)
                ->first();

            if ($existingUser) {
                $validator->errors()->add('cpf', 'Este CPF já está cadastrado.');
            }
        });

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    /**
     * Valida um CPF brasileiro.
     *
     * @param string $cpf CPF a ser validado (com ou sem formatação)
     * @return bool True se válido, false caso contrário
     */
    public function validateCpf(string $cpf): bool
    {
        // Remove caracteres não numéricos
        $cpf = preg_replace('/[^0-9]/', '', $cpf);

        // Verifica se tem 11 dígitos
        if (strlen($cpf) !== 11) {
            return false;
        }

        // Verifica se todos os dígitos são iguais
        if (preg_match('/^(\d)\1{10}$/', $cpf)) {
            return false;
        }

        // Calcula o primeiro dígito verificador
        $sum = 0;
        for ($i = 0; $i < 9; $i++) {
            $sum += intval($cpf[$i]) * (10 - $i);
        }
        $remainder = $sum % 11;
        $digit1 = ($remainder < 2) ? 0 : 11 - $remainder;

        if (intval($cpf[9]) !== $digit1) {
            return false;
        }

        // Calcula o segundo dígito verificador
        $sum = 0;
        for ($i = 0; $i < 10; $i++) {
            $sum += intval($cpf[$i]) * (11 - $i);
        }
        $remainder = $sum % 11;
        $digit2 = ($remainder < 2) ? 0 : 11 - $remainder;

        return intval($cpf[10]) === $digit2;
    }
}