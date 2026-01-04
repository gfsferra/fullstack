<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;

/**
 * Controller para endpoints gerais da API.
 *
 * Responsável por fornecer informações sobre a API
 * e verificar a saúde dos serviços.
 *
 * @package App\Http\Controllers\Api
 */
class ApiController extends Controller
{
    /**
     * Retorna informações gerais sobre a API.
     *
     * @return JsonResponse
     */
    public function info(): JsonResponse
    {
        return response()->json([
            'name' => config('app.name'),
            'version' => '1.0.0',
            'description' => 'API de cadastro de usuários com autenticação Google OAuth',
            'documentation' => url('/api'),
            'endpoints' => [
                'users' => url('/api/users'),
                'auth' => [
                    'google_redirect' => url('/api/auth/google/redirect'),
                    'google_callback' => url('/api/auth/google/callback'),
                    'user' => url('/api/auth/user'),
                    'logout' => url('/api/auth/logout'),
                ],
                'registration' => [
                    'complete' => url('/api/registration/complete'),
                    'status' => url('/api/registration/status/{userId}'),
                ],
                'health' => url('/api/health'),
            ],
        ]);
    }

    /**
     * Verifica a saúde dos serviços da aplicação.
     *
     * @return JsonResponse
     */
    public function health(): JsonResponse
    {
        $health = [
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
            'services' => [],
        ];

        $this->checkDatabase($health);
        $this->checkRedis($health);
        $this->checkQueue($health);

        $statusCode = $health['status'] === 'ok' ? 200 : 503;

        return response()->json($health, $statusCode);
    }

    /**
     * Verifica a conexão com o banco de dados.
     *
     * @param array $health Array de saúde
     * @return void
     */
    private function checkDatabase(array &$health): void
    {
        try {
            DB::connection()->getPdo();
            $health['services']['database'] = [
                'status' => 'ok',
                'connection' => config('database.default'),
            ];
        } catch (\Exception $e) {
            $health['status'] = 'degraded';
            $health['services']['database'] = [
                'status' => 'error',
                'message' => 'Database connection failed',
            ];
        }
    }

    /**
     * Verifica a conexão com o Redis.
     *
     * @param array $health Array de saúde
     * @return void
     */
    private function checkRedis(array &$health): void
    {
        try {
            $redis = app('redis');
            $redis->ping();
            $health['services']['redis'] = [
                'status' => 'ok',
            ];
        } catch (\Exception $e) {
            $health['status'] = 'degraded';
            $health['services']['redis'] = [
                'status' => 'error',
                'message' => 'Redis connection failed',
            ];
        }
    }

    /**
     * Verifica o tamanho da fila de jobs.
     *
     * @param array $health Array de saúde
     * @return void
     */
    private function checkQueue(array &$health): void
    {
        try {
            $queueSize = Queue::size();
            $health['services']['queue'] = [
                'status' => 'ok',
                'pending_jobs' => $queueSize,
            ];
        } catch (\Exception $e) {
            $health['services']['queue'] = [
                'status' => 'unknown',
                'message' => 'Could not check queue',
            ];
        }
    }
}

