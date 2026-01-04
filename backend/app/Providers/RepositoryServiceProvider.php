<?php

namespace App\Providers;

use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Eloquent\UserRepository;
use Illuminate\Support\ServiceProvider;

/**
 * Class RepositoryServiceProvider
 *
 * Service Provider responsável por registrar os bindings dos Repositories.
 * Implementa o padrão de inversão de dependência (DIP) do SOLID.
 *
 * @package App\Providers
 * @author Sistema de Cadastro
 * @version 1.0.0
 */
class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Array de bindings interface => implementação.
     *
     * @var array<class-string, class-string>
     */
    public array $bindings = [
        UserRepositoryInterface::class => UserRepository::class,
    ];

    /**
     * Register services.
     *
     * Registra os bindings das interfaces com suas implementações concretas.
     * Isso permite a injeção de dependência automática pelo container do Laravel.
     *
     * @return void
     */
    public function register(): void
    {
        foreach ($this->bindings as $abstract => $concrete) {
            $this->app->bind($abstract, $concrete);
        }
    }
}
