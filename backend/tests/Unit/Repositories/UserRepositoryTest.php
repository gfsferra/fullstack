<?php

namespace Tests\Unit\Repositories;

use App\Models\User;
use App\Repositories\Eloquent\UserRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Class UserRepositoryTest
 *
 * Testes unitários para o repositório de usuários.
 * Verifica todas as operações de persistência.
 *
 * @package Tests\Unit\Repositories
 * @author Sistema de Cadastro
 * @version 1.0.0
 */
class UserRepositoryTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Instância do repositório.
     *
     * @var UserRepository
     */
    protected UserRepository $repository;

    /**
     * Configuração inicial dos testes.
     *
     * @return void
     */
    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new UserRepository(new User());
    }

    /**
     * Testa se all() retorna todos os usuários.
     *
     * @return void
     */
    public function test_all_returns_all_users(): void
    {
        User::factory()->count(5)->create();

        $users = $this->repository->all();

        $this->assertCount(5, $users);
    }

    /**
     * Testa se findById() retorna o usuário correto.
     *
     * @return void
     */
    public function test_find_by_id_returns_correct_user(): void
    {
        $user = User::factory()->create();

        $found = $this->repository->findById($user->id);

        $this->assertNotNull($found);
        $this->assertEquals($user->id, $found->id);
    }

    /**
     * Testa se findById() retorna null para ID inexistente.
     *
     * @return void
     */
    public function test_find_by_id_returns_null_for_invalid_id(): void
    {
        $found = $this->repository->findById(9999);

        $this->assertNull($found);
    }

    /**
     * Testa se findByEmail() retorna o usuário correto.
     *
     * @return void
     */
    public function test_find_by_email_returns_correct_user(): void
    {
        $user = User::factory()->create(['email' => 'test@example.com']);

        $found = $this->repository->findByEmail('test@example.com');

        $this->assertNotNull($found);
        $this->assertEquals($user->id, $found->id);
    }

    /**
     * Testa se findByGoogleId() retorna o usuário correto.
     *
     * @return void
     */
    public function test_find_by_google_id_returns_correct_user(): void
    {
        $user = User::factory()->fromGoogle()->create();

        $found = $this->repository->findByGoogleId($user->google_id);

        $this->assertNotNull($found);
        $this->assertEquals($user->id, $found->id);
    }

    /**
     * Testa se create() cria um novo usuário.
     *
     * @return void
     */
    public function test_create_creates_new_user(): void
    {
        $data = [
            'name' => 'Novo Usuário',
            'email' => 'novo@example.com',
        ];

        $user = $this->repository->create($data);

        $this->assertNotNull($user->id);
        $this->assertEquals('Novo Usuário', $user->name);
        $this->assertDatabaseHas('users', ['email' => 'novo@example.com']);
    }

    /**
     * Testa se update() atualiza o usuário.
     *
     * @return void
     */
    public function test_update_updates_user(): void
    {
        $user = User::factory()->create(['name' => 'Nome Antigo']);

        $updated = $this->repository->update($user->id, ['name' => 'Nome Novo']);

        $this->assertNotNull($updated);
        $this->assertEquals('Nome Novo', $updated->name);
    }

    /**
     * Testa se update() retorna null para ID inexistente.
     *
     * @return void
     */
    public function test_update_returns_null_for_invalid_id(): void
    {
        $updated = $this->repository->update(9999, ['name' => 'Teste']);

        $this->assertNull($updated);
    }

    /**
     * Testa se delete() remove o usuário.
     *
     * @return void
     */
    public function test_delete_removes_user(): void
    {
        $user = User::factory()->create();

        $result = $this->repository->delete($user->id);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    /**
     * Testa se delete() retorna false para ID inexistente.
     *
     * @return void
     */
    public function test_delete_returns_false_for_invalid_id(): void
    {
        $result = $this->repository->delete(9999);

        $this->assertFalse($result);
    }

    /**
     * Testa se findRegisteredUsers() retorna apenas usuários completos.
     *
     * @return void
     */
    public function test_find_registered_users(): void
    {
        User::factory()->count(3)->create(['registration_completed' => true]);
        User::factory()->count(2)->create(['registration_completed' => false]);

        $registered = $this->repository->findRegisteredUsers();

        $this->assertCount(3, $registered);
    }

    /**
     * Testa se findPendingUsers() retorna apenas usuários pendentes.
     *
     * @return void
     */
    public function test_find_pending_users(): void
    {
        User::factory()->count(3)->create(['registration_completed' => true]);
        User::factory()->count(2)->create(['registration_completed' => false]);

        $pending = $this->repository->findPendingUsers();

        $this->assertCount(2, $pending);
    }
}

