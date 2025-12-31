<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
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
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email' . ($userId ? ',' . $userId : ''),
            'phone' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'cpf' => 'nullable|string|size:14|unique:users,cpf' . ($userId ? ',' . $userId : ''),
        ];

        $messages = [
            'name.required' => 'O nome é obrigatório.',
            'email.required' => 'O e-mail é obrigatório.',
            'email.email' => 'O e-mail deve ser válido.',
            'email.unique' => 'Este e-mail já está cadastrado.',
            'cpf.size' => 'O CPF deve ter 14 caracteres.',
            'cpf.unique' => 'Este CPF já está cadastrado.',
        ];

        $validator = Validator::make($data, $rules, $messages);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }
}

