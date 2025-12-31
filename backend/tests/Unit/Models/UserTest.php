<?php

namespace Tests\Unit\Models;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Class UserTest
 *
 * Testes unitários para o model User.
 * Verifica casts, mutators, accessors e métodos auxiliares.
 *
 * @package Tests\Unit\Models
 * @author Sistema de Cadastro
 * @version 1.0.0
 */
class UserTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Testa se o nome é convertido para Title Case.
     *
     * @return void
     */
    public function test_name_is_converted_to_title_case(): void
    {
        $user = User::factory()->create([
            'name' => 'joão da silva',
        ]);

        $this->assertEquals('João Da Silva', $user->name);
    }

    /**
     * Testa se a idade é calculada corretamente.
     *
     * @return void
     */
    public function test_age_is_calculated_correctly(): void
    {
        $user = User::factory()->create([
            'birth_date' => now()->subYears(25)->format('Y-m-d'),
        ]);

        $this->assertEquals(25, $user->age);
    }

    /**
     * Testa se a idade retorna null quando não há data de nascimento.
     *
     * @return void
     */
    public function test_age_returns_null_when_no_birth_date(): void
    {
        $user = User::factory()->create([
            'birth_date' => null,
        ]);

        $this->assertNull($user->age);
    }

    /**
     * Testa se o CPF é formatado corretamente ao recuperar.
     *
     * @return void
     */
    public function test_cpf_is_formatted_on_get(): void
    {
        $user = User::factory()->create([
            'cpf' => '12345678900',
        ]);

        $this->assertEquals('123.456.789-00', $user->cpf);
    }

    /**
     * Testa se o CPF é desformatado ao salvar.
     *
     * @return void
     */
    public function test_cpf_is_unformatted_on_set(): void
    {
        $user = User::factory()->create([
            'cpf' => '123.456.789-00',
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'cpf' => '12345678900',
        ]);
    }

    /**
     * Testa o método hasCompletedRegistration.
     *
     * @return void
     */
    public function test_has_completed_registration(): void
    {
        $completedUser = User::factory()->create([
            'registration_completed' => true,
        ]);

        $pendingUser = User::factory()->create([
            'registration_completed' => false,
        ]);

        $this->assertTrue($completedUser->hasCompletedRegistration());
        $this->assertFalse($pendingUser->hasCompletedRegistration());
    }

    /**
     * Testa o método isGoogleUser.
     *
     * @return void
     */
    public function test_is_google_user(): void
    {
        $googleUser = User::factory()->fromGoogle()->create();
        $normalUser = User::factory()->create(['google_id' => null]);

        $this->assertTrue($googleUser->isGoogleUser());
        $this->assertFalse($normalUser->isGoogleUser());
    }

    /**
     * Testa o método isAdult.
     *
     * @return void
     */
    public function test_is_adult(): void
    {
        $adult = User::factory()->create([
            'birth_date' => now()->subYears(20)->format('Y-m-d'),
        ]);

        $minor = User::factory()->create([
            'birth_date' => now()->subYears(15)->format('Y-m-d'),
        ]);

        $noBirthDate = User::factory()->create([
            'birth_date' => null,
        ]);

        $this->assertTrue($adult->isAdult());
        $this->assertFalse($minor->isAdult());
        $this->assertNull($noBirthDate->isAdult());
    }

    /**
     * Testa o scope registered.
     *
     * @return void
     */
    public function test_scope_registered(): void
    {
        User::factory()->count(3)->create(['registration_completed' => true]);
        User::factory()->count(2)->create(['registration_completed' => false]);

        $registered = User::registered()->get();

        $this->assertCount(3, $registered);
    }

    /**
     * Testa o scope pending.
     *
     * @return void
     */
    public function test_scope_pending(): void
    {
        User::factory()->count(3)->create(['registration_completed' => true]);
        User::factory()->count(2)->create(['registration_completed' => false]);

        $pending = User::pending()->get();

        $this->assertCount(2, $pending);
    }

    /**
     * Testa o scope fromGoogle.
     *
     * @return void
     */
    public function test_scope_from_google(): void
    {
        User::factory()->count(2)->fromGoogle()->create();
        User::factory()->count(3)->create(['google_id' => null]);

        $fromGoogle = User::fromGoogle()->get();

        $this->assertCount(2, $fromGoogle);
    }
}

