<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Class UserControllerTest
 *
 * Testes de integração para os endpoints da API de usuários.
 * Verifica as respostas HTTP e comportamentos da API.
 *
 * @package Tests\Feature\Api
 * @author Sistema de Cadastro
 * @version 1.0.0
 */
class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Testa GET /api/users retorna lista de usuários.
     *
     * @return void
     */
    public function test_index_returns_users_list(): void
    {
        User::factory()->count(3)->create();

        $response = $this->getJson('/api/users');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    /**
     * Testa GET /api/users retorna lista vazia quando não há usuários.
     *
     * @return void
     */
    public function test_index_returns_empty_list(): void
    {
        $response = $this->getJson('/api/users');

        $response->assertStatus(200)
            ->assertJsonCount(0);
    }

    /**
     * Testa POST /api/users cria novo usuário.
     *
     * @return void
     */
    public function test_store_creates_new_user(): void
    {
        $data = [
            'name' => 'João Silva',
            'email' => 'joao@example.com',
        ];

        $response = $this->postJson('/api/users', $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'João Silva']);

        $this->assertDatabaseHas('users', ['email' => 'joao@example.com']);
    }

    /**
     * Testa POST /api/users retorna erro 422 para dados inválidos.
     *
     * @return void
     */
    public function test_store_returns_validation_error(): void
    {
        $data = [
            'name' => '',
            'email' => 'invalid-email',
        ];

        $response = $this->postJson('/api/users', $data);

        $response->assertStatus(422)
            ->assertJsonStructure(['message', 'errors']);
    }

    /**
     * Testa POST /api/users retorna erro para e-mail duplicado.
     *
     * @return void
     */
    public function test_store_returns_error_for_duplicate_email(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $data = [
            'name' => 'Novo Usuário',
            'email' => 'existing@example.com',
        ];

        $response = $this->postJson('/api/users', $data);

        $response->assertStatus(422);
    }

    /**
     * Testa GET /api/users/{id} retorna usuário específico.
     *
     * @return void
     */
    public function test_show_returns_user(): void
    {
        $user = User::factory()->create();

        $response = $this->getJson("/api/users/{$user->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['id' => $user->id]);
    }

    /**
     * Testa GET /api/users/{id} retorna 404 para usuário inexistente.
     *
     * @return void
     */
    public function test_show_returns_404_for_invalid_id(): void
    {
        $response = $this->getJson('/api/users/9999');

        $response->assertStatus(404);
    }

    /**
     * Testa PUT /api/users/{id} atualiza usuário.
     *
     * @return void
     */
    public function test_update_updates_user(): void
    {
        $user = User::factory()->create(['name' => 'Nome Antigo']);

        $data = [
            'name' => 'Nome Novo',
            'email' => $user->email,
        ];

        $response = $this->putJson("/api/users/{$user->id}", $data);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Nome Novo']);
    }

    /**
     * Testa DELETE /api/users/{id} remove usuário.
     *
     * @return void
     */
    public function test_destroy_removes_user(): void
    {
        $user = User::factory()->create();

        $response = $this->deleteJson("/api/users/{$user->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    /**
     * Testa se a idade é calculada e retornada na resposta.
     *
     * @return void
     */
    public function test_user_includes_age_in_response(): void
    {
        $user = User::factory()->create([
            'birth_date' => now()->subYears(25)->format('Y-m-d'),
        ]);

        $response = $this->getJson("/api/users/{$user->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['age' => 25]);
    }

    /**
     * Testa se o CPF é formatado na resposta.
     *
     * @return void
     */
    public function test_user_cpf_is_formatted_in_response(): void
    {
        $user = User::factory()->create([
            'cpf' => '12345678900',
        ]);

        $response = $this->getJson("/api/users/{$user->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['cpf' => '123.456.789-00']);
    }
}

