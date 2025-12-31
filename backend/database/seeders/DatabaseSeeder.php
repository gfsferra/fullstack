<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Class DatabaseSeeder
 *
 * Seeder principal que orquestra a execução de todos os seeders.
 *
 * @package Database\Seeders
 * @author Sistema de Cadastro
 * @version 1.0.0
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
        ]);
    }
}
