<?php

namespace Tests\Feature\Api;

use App\Jobs\SendRegistrationEmail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

/**
 * Class RegistrationControllerTest
 *
 * Testes de integração para os endpoints de registro.
 * Verifica o fluxo de cadastro complementar.
 *
 * @package Tests\Feature\Api
 * @author Sistema de Cadastro
 * @version 1.0.0
 */
class RegistrationControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Testa POST /api/registration/complete completa o cadastro.
     *
     * @return void
     */
    public function test_complete_registration_successfully(): void
    {
        Queue::fake();

        $user = User::factory()->pending()->fromGoogle()->create();

        $data = [
            'user_id' => $user->id,
            'name' => 'João da Silva',
            'birth_date' => '1990-01-15',
            'cpf' => '123.456.789-00',
        ];

        $response = $this->postJson('/api/registration/complete', $data);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'success' => true,
                'registration_completed' => true,
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'registration_completed' => true,
        ]);

        Queue::assertPushed(SendRegistrationEmail::class);
    }

    /**
     * Testa se o job de e-mail é disparado corretamente.
     *
     * @return void
     */
    public function test_registration_dispatches_email_job(): void
    {
        Queue::fake();

        $user = User::factory()->pending()->fromGoogle()->create();

        $data = [
            'user_id' => $user->id,
            'name' => 'Maria Silva',
            'birth_date' => '1985-06-20',
            'cpf' => '987.654.321-00',
        ];

        $this->postJson('/api/registration/complete', $data);

        Queue::assertPushed(SendRegistrationEmail::class, function ($job) use ($user) {
            return true; // Verifica se o job foi disparado
        });
    }

    /**
     * Testa validação de CPF obrigatório.
     *
     * @return void
     */
    public function test_registration_requires_cpf(): void
    {
        $user = User::factory()->pending()->fromGoogle()->create();

        $data = [
            'user_id' => $user->id,
            'name' => 'João da Silva',
            'birth_date' => '1990-01-15',
            'cpf' => '',
        ];

        $response = $this->postJson('/api/registration/complete', $data);

        $response->assertStatus(422)
            ->assertJsonStructure(['errors' => ['cpf']]);
    }

    /**
     * Testa validação de data de nascimento.
     *
     * @return void
     */
    public function test_registration_requires_valid_birth_date(): void
    {
        $user = User::factory()->pending()->fromGoogle()->create();

        $data = [
            'user_id' => $user->id,
            'name' => 'João da Silva',
            'birth_date' => now()->addDay()->format('Y-m-d'), // Data futura
            'cpf' => '123.456.789-00',
        ];

        $response = $this->postJson('/api/registration/complete', $data);

        $response->assertStatus(422)
            ->assertJsonStructure(['errors' => ['birth_date']]);
    }

    /**
     * Testa validação de CPF único.
     *
     * @return void
     */
    public function test_registration_validates_unique_cpf(): void
    {
        User::factory()->create(['cpf' => '98765432100']);

        $user = User::factory()->pending()->fromGoogle()->create();

        $data = [
            'user_id' => $user->id,
            'name' => 'João da Silva',
            'birth_date' => '1990-01-15',
            'cpf' => '987.654.321-00',
        ];

        $response = $this->postJson('/api/registration/complete', $data);

        $response->assertStatus(422)
            ->assertJsonStructure(['errors' => ['cpf']]);
    }

    /**
     * Testa GET /api/registration/status/{userId} retorna status.
     *
     * @return void
     */
    public function test_status_returns_registration_status(): void
    {
        $user = User::factory()->create(['registration_completed' => true]);

        $response = $this->getJson("/api/registration/status/{$user->id}");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'success' => true,
                'registration_completed' => true,
            ]);
    }

    /**
     * Testa GET /api/registration/status/{userId} retorna 404 para usuário inexistente.
     *
     * @return void
     */
    public function test_status_returns_404_for_invalid_user(): void
    {
        $response = $this->getJson('/api/registration/status/9999');

        $response->assertStatus(404)
            ->assertJsonFragment(['success' => false]);
    }
}

