<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Class UserFactory
 *
 * Factory para geração de dados fake de usuários.
 * Utilizada para testes e seeding do banco de dados.
 *
 * @package Database\Factories
 * @author Sistema de Cadastro
 * @version 1.0.0
 *
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<User>
     */
    protected $model = User::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake('pt_BR')->name(),
            'email' => fake()->unique()->safeEmail(),
            'birth_date' => fake()->dateTimeBetween('-60 years', '-18 years')->format('Y-m-d'),
            'cpf' => $this->generateCpf(),
            'google_id' => null,
            'avatar' => null,
            'google_token' => null,
            'registration_completed' => true,
        ];
    }

    /**
     * Indica que o usuário está com cadastro pendente.
     *
     * @return static
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'cpf' => null,
            'birth_date' => null,
            'registration_completed' => false,
        ]);
    }

    /**
     * Indica que o usuário veio do Google OAuth.
     *
     * @return static
     */
    public function fromGoogle(): static
    {
        return $this->state(fn (array $attributes) => [
            'google_id' => fake()->uuid(),
            'avatar' => fake()->imageUrl(200, 200, 'people'),
            'google_token' => fake()->sha256(),
        ]);
    }

    /**
     * Indica que o usuário é menor de idade.
     *
     * @return static
     */
    public function minor(): static
    {
        return $this->state(fn (array $attributes) => [
            'birth_date' => fake()->dateTimeBetween('-17 years', '-10 years')->format('Y-m-d'),
        ]);
    }

    /**
     * Gera um CPF válido para testes.
     *
     * @return string CPF formatado (XXX.XXX.XXX-XX)
     */
    protected function generateCpf(): string
    {
        $n = [];
        for ($i = 0; $i < 9; $i++) {
            $n[$i] = random_int(0, 9);
        }

        // Calcula primeiro dígito verificador
        $sum = 0;
        for ($i = 0; $i < 9; $i++) {
            $sum += $n[$i] * (10 - $i);
        }
        $remainder = $sum % 11;
        $n[9] = ($remainder < 2) ? 0 : 11 - $remainder;

        // Calcula segundo dígito verificador
        $sum = 0;
        for ($i = 0; $i < 10; $i++) {
            $sum += $n[$i] * (11 - $i);
        }
        $remainder = $sum % 11;
        $n[10] = ($remainder < 2) ? 0 : 11 - $remainder;

        return sprintf(
            '%d%d%d.%d%d%d.%d%d%d-%d%d',
            $n[0], $n[1], $n[2],
            $n[3], $n[4], $n[5],
            $n[6], $n[7], $n[8],
            $n[9], $n[10]
        );
    }
}
