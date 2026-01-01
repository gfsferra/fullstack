<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class UserRepository
 *
 * Implementação do repositório de usuários utilizando Eloquent ORM.
 * Encapsula todas as operações de persistência de dados de usuários.
 *
 * @package App\Repositories\Eloquent
 * @author Sistema de Cadastro
 * @version 1.0.0
 */
class UserRepository implements UserRepositoryInterface
{
    /**
     * Instância do modelo User.
     *
     * @var User
     */
    protected User $model;

    /**
     * UserRepository constructor.
     *
     * @param User $model Instância do modelo User injetada via DI
     */
    public function __construct(User $model)
    {
        $this->model = $model;
    }

    /**
     * {@inheritDoc}
     */
    public function all(): Collection
    {
        return $this->model
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function findById(int $id): ?User
    {
        return $this->model->find($id);
    }

    /**
     * {@inheritDoc}
     */
    public function findByEmail(string $email): ?User
    {
        return $this->model
            ->where('email', $email)
            ->first();
    }

    /**
     * {@inheritDoc}
     */
    public function findByGoogleId(string $googleId): ?User
    {
        return $this->model
            ->where('google_id', $googleId)
            ->first();
    }

    /**
     * {@inheritDoc}
     */
    public function create(array $data): User
    {
        return $this->model->create($data);
    }

    /**
     * {@inheritDoc}
     */
    public function update(int $id, array $data): ?User
    {
        $user = $this->findById($id);

        if (!$user) {
            return null;
        }

        $user->update($data);

        return $user->fresh();
    }

    /**
     * {@inheritDoc}
     */
    public function delete(int $id): bool
    {
        $user = $this->findById($id);

        if (!$user) {
            return false;
        }

        return $user->delete();
    }

    /**
     * {@inheritDoc}
     */
    public function findRegisteredUsers(): Collection
    {
        return $this->model
            ->where('registration_completed', true)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function findPendingUsers(): Collection
    {
        return $this->model
            ->where('registration_completed', false)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function paginate(array $filters = [], int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        // Filtro por nome (busca parcial case-insensitive)
        if (!empty($filters['name'])) {
            $query->where('name', 'LIKE', '%' . $filters['name'] . '%');
        }

        // Filtro por CPF (busca parcial, remove formatação)
        if (!empty($filters['cpf'])) {
            $cpfClean = preg_replace('/\D/', '', $filters['cpf']);
            $query->where('cpf', 'LIKE', '%' . $cpfClean . '%');
        }

        // Índice para otimização: ordenar por ID (índice primário)
        $query->orderBy('id', 'desc');

        return $query->paginate(perPage: $perPage, page: $page);
    }
}

