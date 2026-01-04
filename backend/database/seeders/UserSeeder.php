<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Class UserSeeder
 *
 * Seeder para popular a tabela de usuários com dados de teste.
 * Cria diferentes tipos de usuários para simular cenários reais.
 *
 * @package Database\Seeders
 * @author Sistema de Cadastro
 * @version 1.0.0
 */
class UserSeeder extends Seeder
{
    /**
     * Executa o seeder.
     * 
     * @return void
     *
     * Cria:
     * - 10 usuários com cadastro completo
     * - 3 usuários com cadastro pendente (via Google)
     * - 2 usuários menores de idade
     *
     * @return void
     */
    public function run(): void
    {
        User::factory()
            ->count(10)
            ->create();

        User::factory()
            ->count(3)
            ->fromGoogle()
            ->pending()
            ->create();

        User::factory()
            ->count(5)
            ->fromGoogle()
            ->create();

        User::factory()
            ->count(2)
            ->minor()
            ->create();

        $this->command->info('Usuários criados com sucesso!');
        $this->command->table(
            ['Tipo', 'Quantidade'],
            [
                ['Cadastro Completo', 10],
                ['Google (Pendente)', 3],
                ['Google (Completo)', 5],
                ['Menores de Idade', 2],
            ]
        );
    }
}
