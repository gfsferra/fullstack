<?php

namespace App\Repositories\Contracts;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface UserRepositoryInterface
 *
 * Define o contrato para operações de persistência de usuários.
 * Implementa o padrão Repository para abstrair a camada de dados.
 *
 * @package App\Repositories\Contracts
 * @author Sistema de Cadastro
 * @version 1.0.0
 */
interface UserRepositoryInterface
{
    /**
     * Retorna todos os usuários cadastrados.
     *
     * @return Collection<int, User>
     */
    public function all(): Collection;

    /**
     * Busca um usuário pelo ID.
     *
     * @param int $id ID do usuário
     * @return User|null
     */
    public function findById(int $id): ?User;

    /**
     * Busca um usuário pelo e-mail.
     *
     * @param string $email E-mail do usuário
     * @return User|null
     */
    public function findByEmail(string $email): ?User;

    /**
     * Busca um usuário pelo Google ID.
     *
     * @param string $googleId ID do Google
     * @return User|null
     */
    public function findByGoogleId(string $googleId): ?User;

    /**
     * Cria um novo usuário.
     *
     * @param array<string, mixed> $data Dados do usuário
     * @return User
     */
    public function create(array $data): User;

    /**
     * Atualiza um usuário existente.
     *
     * @param int $id ID do usuário
     * @param array<string, mixed> $data Dados a serem atualizados
     * @return User|null
     */
    public function update(int $id, array $data): ?User;

    /**
     * Remove um usuário.
     *
     * @param int $id ID do usuário
     * @return bool
     */
    public function delete(int $id): bool;

    /**
     * Busca usuários com cadastro completo.
     *
     * @return Collection<int, User>
     */
    public function findRegisteredUsers(): Collection;

    /**
     * Busca usuários com cadastro pendente.
     *
     * @return Collection<int, User>
     */
    public function findPendingUsers(): Collection;

    /**
     * Busca usuários paginados com filtros opcionais.
     *
     * @param array<string, mixed> $filters Filtros (name, cpf)
     * @param int $perPage Itens por página
     * @param int $page Página atual
     * @return LengthAwarePaginator
     */
    public function paginate(array $filters = [], int $perPage = 15, int $page = 1): LengthAwarePaginator;
}

