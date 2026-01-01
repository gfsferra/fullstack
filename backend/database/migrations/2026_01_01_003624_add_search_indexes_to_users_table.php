<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration para adicionar índices de busca otimizados.
 * 
 * Índices criados para otimizar buscas em grandes volumes de dados:
 * - name: índice para busca por nome
 * - cpf: índice para busca por CPF
 * 
 * @package Database\Migrations
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Índice para busca por nome
            $table->index('name', 'idx_users_name');
            
            // Índice para busca por CPF
            $table->index('cpf', 'idx_users_cpf');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_name');
            $table->dropIndex('idx_users_cpf');
        });
    }
};
