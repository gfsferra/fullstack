<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\UserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

/**
 * Class UserServiceTest
 *
 * Testes unitários para o serviço de usuários.
 * Verifica a lógica de negócio e validações.
 *
 * @package Tests\Unit\Services
 * @author Sistema de Cadastro
 * @version 1.0.0
 */
class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Instância do serviço.
     *
     * @var UserService
     */
    protected UserService $service;

    /**
     * Configuração inicial dos testes.
     *
     * @return void
     */
    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(UserService::class);
    }

    /**
     * Testa se getAllUsers() retorna todos os usuários.
     *
     * @return void
     */
    public function test_get_all_users_returns_collection(): void
    {
        User::factory()->count(5)->create();

        $users = $this->service->getAllUsers();

        $this->assertCount(5, $users);
    }

    /**
     * Testa se getUserById() retorna o usuário correto.
     *
     * @return void
     */
    public function test_get_user_by_id_returns_user(): void
    {
        $user = User::factory()->create();

        $found = $this->service->getUserById($user->id);

        $this->assertNotNull($found);
        $this->assertEquals($user->id, $found->id);
    }

    /**
     * Testa se createUser() cria um novo usuário.
     *
     * @return void
     */
    public function test_create_user_creates_new_user(): void
    {
        $data = [
            'name' => 'Novo Usuário',
            'email' => 'novo@example.com',
        ];

        $user = $this->service->createUser($data);

        $this->assertNotNull($user->id);
        $this->assertEquals('Novo Usuário', $user->name);
    }

    /**
     * Testa se createUser() lança exceção para dados inválidos.
     *
     * @return void
     */
    public function test_create_user_throws_validation_exception(): void
    {
        $this->expectException(ValidationException::class);

        $this->service->createUser([
            'name' => '',
            'email' => 'invalid-email',
        ]);
    }

    /**
     * Testa se createUser() lança exceção para e-mail duplicado.
     *
     * @return void
     */
    public function test_create_user_throws_exception_for_duplicate_email(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $this->expectException(ValidationException::class);

        $this->service->createUser([
            'name' => 'Novo Usuário',
            'email' => 'existing@example.com',
        ]);
    }

    /**
     * Testa se updateUser() atualiza o usuário.
     *
     * @return void
     */
    public function test_update_user_updates_user(): void
    {
        $user = User::factory()->create(['name' => 'Nome Antigo']);

        $updated = $this->service->updateUser($user->id, [
            'name' => 'Nome Novo',
            'email' => $user->email,
        ]);

        $this->assertNotNull($updated);
        $this->assertEquals('Nome Novo', $updated->name);
    }

    /**
     * Testa se deleteUser() remove o usuário.
     *
     * @return void
     */
    public function test_delete_user_removes_user(): void
    {
        $user = User::factory()->create();

        $result = $this->service->deleteUser($user->id);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    /**
     * Testa se getRegisteredUsers() retorna apenas usuários completos.
     *
     * @return void
     */
    public function test_get_registered_users(): void
    {
        User::factory()->count(3)->create(['registration_completed' => true]);
        User::factory()->count(2)->create(['registration_completed' => false]);

        $registered = $this->service->getRegisteredUsers();

        $this->assertCount(3, $registered);
    }

    /**
     * Testa se getPendingUsers() retorna apenas usuários pendentes.
     *
     * @return void
     */
    public function test_get_pending_users(): void
    {
        User::factory()->count(3)->create(['registration_completed' => true]);
        User::factory()->count(2)->create(['registration_completed' => false]);

        $pending = $this->service->getPendingUsers();

        $this->assertCount(2, $pending);
    }
}

