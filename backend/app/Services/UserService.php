<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * Class UserService
 *
 * Camada de serviço responsável pela lógica de negócio relacionada a usuários.
 * Atua como intermediário entre os Controllers e os Repositories,
 * aplicando regras de negócio e validações.
 *
 * @package App\Services
 * @author Sistema de Cadastro
 * @version 1.0.0
 */
class UserService
{
    /**
     * Instância do repositório de usuários.
     *
     * @var UserRepositoryInterface
     */
    protected UserRepositoryInterface $userRepository;

    /**
     * UserService constructor.
     *
     * @param UserRepositoryInterface $userRepository Repositório injetado via DI
     */
    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * Retorna todos os usuários cadastrados.
     *
     * @return Collection<int, User>
     */
    public function getAllUsers(): Collection
    {
        return $this->userRepository->all();
    }

    /**
     * Retorna usuários paginados com filtros.
     *
     * @param array<string, mixed> $filters Filtros (name, cpf)
     * @param int $perPage Itens por página
     * @param int $page Página atual
     * @return LengthAwarePaginator
     */
    public function paginateUsers(array $filters = [], int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return $this->userRepository->paginate($filters, $perPage, $page);
    }

    /**
     * Busca um usuário pelo ID.
     *
     * @param int $id ID do usuário
     * @return User|null
     */
    public function getUserById(int $id): ?User
    {
        return $this->userRepository->findById($id);
    }

    /**
     * Busca um usuário pelo e-mail.
     *
     * @param string $email E-mail do usuário
     * @return User|null
     */
    public function getUserByEmail(string $email): ?User
    {
        return $this->userRepository->findByEmail($email);
    }

    /**
     * Cria um novo usuário.
     *
     * @param array<string, mixed> $data Dados do usuário
     * @return User
     * @throws ValidationException Se a validação falhar
     */
    public function createUser(array $data): User
    {
        $this->validateUserData($data);

        return $this->userRepository->create($data);
    }

    /**
     * Atualiza um usuário existente.
     *
     * @param int $id ID do usuário
     * @param array<string, mixed> $data Dados a serem atualizados
     * @return User|null
     * @throws ValidationException Se a validação falhar
     */
    public function updateUser(int $id, array $data): ?User
    {
        $this->validateUserData($data, $id);

        return $this->userRepository->update($id, $data);
    }

    /**
     * Remove um usuário.
     *
     * @param int $id ID do usuário
     * @return bool
     */
    public function deleteUser(int $id): bool
    {
        return $this->userRepository->delete($id);
    }

    /**
     * Retorna usuários com cadastro completo.
     *
     * @return Collection<int, User>
     */
    public function getRegisteredUsers(): Collection
    {
        return $this->userRepository->findRegisteredUsers();
    }

    /**
     * Retorna usuários com cadastro pendente.
     *
     * @return Collection<int, User>
     */
    public function getPendingUsers(): Collection
    {
        return $this->userRepository->findPendingUsers();
    }

    /**
     * Valida os dados do usuário.
     *
     * @param array<string, mixed> $data Dados a serem validados
     * @param int|null $userId ID do usuário (para update)
     * @return void
     * @throws ValidationException Se a validação falhar
     */
    protected function validateUserData(array $data, ?int $userId = null): void
    {
        $cpfClean = isset($data['cpf']) ? preg_replace('/[^0-9]/', '', $data['cpf']) : null;

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email' . ($userId ? ',' . $userId : ''),
            'birth_date' => 'nullable|date',
            'cpf' => 'nullable|string',
        ];

        $messages = [
            'name.required' => 'O nome é obrigatório.',
            'name.string' => 'O nome deve ser um texto válido.',
            'name.max' => 'O nome não pode ter mais de 255 caracteres.',
            'email.required' => 'O e-mail é obrigatório.',
            'email.email' => 'O e-mail deve ser válido.',
            'email.unique' => 'Este e-mail já está cadastrado.',
            'birth_date.date' => 'A data de nascimento deve ser uma data válida.',
        ];

        $validator = Validator::make($data, $rules, $messages);

        $validator->after(function ($validator) use ($cpfClean, $userId) {
            if ($cpfClean) {
                if (strlen($cpfClean) !== 11) {
                    $validator->errors()->add('cpf', 'O CPF deve ter 11 dígitos.');
                    return;
                }

                if (!$this->validateCpfDigits($cpfClean)) {
                    $validator->errors()->add('cpf', 'O CPF informado é inválido.');
                    return;
                }

                $existingUser = User::where('cpf', $cpfClean)
                    ->when($userId, fn($q) => $q->where('id', '!=', $userId))
                    ->first();

                if ($existingUser) {
                    $validator->errors()->add('cpf', 'Este CPF já está cadastrado.');
                }
            }
        });

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    /**
     * Valida os dígitos verificadores do CPF.
     *
     * @param string $cpf CPF apenas com números
     * @return bool
     */
    protected function validateCpfDigits(string $cpf): bool
    {
        if (preg_match('/^(\d)\1{10}$/', $cpf)) {
            return false;
        }

        $sum = 0;
        for ($i = 0; $i < 9; $i++) {
            $sum += intval($cpf[$i]) * (10 - $i);
        }
        $remainder = $sum % 11;
        $digit1 = ($remainder < 2) ? 0 : 11 - $remainder;

        if (intval($cpf[9]) !== $digit1) {
            return false;
        }

        $sum = 0;
        for ($i = 0; $i < 10; $i++) {
            $sum += intval($cpf[$i]) * (11 - $i);
        }
        $remainder = $sum % 11;
        $digit2 = ($remainder < 2) ? 0 : 11 - $remainder;

        return intval($cpf[10]) === $digit2;
    }
}

