<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * Class AppServiceProvider
 *
 * Service Provider responsável por registrar os serviços da aplicação.
 * Implementa o padrão de inversão de dependência (DIP) do SOLID.
 *
 * @package App\Providers
 * @author Sistema de Cadastro
 * @version 1.0.0
 */
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register(): void
    {
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot(): void
    {
    }
}
