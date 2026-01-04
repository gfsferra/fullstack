<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Google\Client as GoogleClient;
use Google\Service\Oauth2;
use Illuminate\Support\Facades\Log;

/**
 * Class GoogleService
 *
 * Serviço responsável pela integração com as APIs do Google.
 * Utiliza a biblioteca oficial google/apiclient para acessar
 * informações do usuário através de tokens OAuth.
 * Implementa refresh automático de tokens expirados.
 *
 * @package App\Services
 * @author Sistema de Cadastro
 * @version 1.1.0
 * @see https://github.com/googleapis/google-api-php-client
 */
class GoogleService
{
    /**
     * Instância do cliente Google API.
     *
     * @var GoogleClient
     */
    protected GoogleClient $client;

    /**
     * GoogleService constructor.
     *
     * Inicializa o cliente Google com as credenciais do ambiente.
     */
    public function __construct()
    {
        $this->client = new GoogleClient();
        $this->client->setClientId(config('services.google.client_id'));
        $this->client->setClientSecret(config('services.google.client_secret'));
        $this->client->setAccessType('offline');
    }

    /**
     * Obtém informações do usuário do Google usando access token.
     *
     * @param string $accessToken Token de acesso OAuth do Google
     * @return array{id: string, email: string, name: string, picture: string, verified_email: bool}|null
     */
    public function getUserInfo(string $accessToken): ?array
    {
        try {
            $this->client->setAccessToken($accessToken);

            $oauth2 = new Oauth2($this->client);
            $userInfo = $oauth2->userinfo->get();

            return [
                'id' => $userInfo->getId(),
                'email' => $userInfo->getEmail(),
                'name' => $userInfo->getName(),
                'picture' => $userInfo->getPicture(),
                'verified_email' => $userInfo->getVerifiedEmail(),
            ];
        } catch (\Exception $e) {
            Log::error('Falha ao obter informações do usuário Google', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return null;
        }
    }

    /**
     * Obtém o e-mail associado a um access token do Google.
     *
     * @param string $accessToken Token de acesso OAuth do Google
     * @return string|null E-mail do usuário ou null em caso de erro
     */
    public function getEmailFromToken(string $accessToken): ?string
    {
        $userInfo = $this->getUserInfo($accessToken);

        return $userInfo['email'] ?? null;
    }

    /**
     * Verifica se um access token ainda é válido.
     *
     * @param string $accessToken Token de acesso OAuth do Google
     * @return bool True se válido, false caso contrário
     */
    public function isTokenValid(string $accessToken): bool
    {
        try {
            $this->client->setAccessToken($accessToken);

            return !$this->client->isAccessTokenExpired();
        } catch (\Exception $e) {
            Log::warning('Erro ao verificar validade do token Google', [
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Tenta renovar um access token expirado usando refresh token.
     *
     * @param string $refreshToken Refresh token do Google
     * @return array{access_token: string, refresh_token: string, expires_in: int}|null
     */
    public function refreshAccessToken(string $refreshToken): ?array
    {
        try {
            $this->client->refreshToken($refreshToken);

            return $this->client->getAccessToken();
        } catch (\Exception $e) {
            Log::error('Falha ao renovar access token do Google', [
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Obtém um access token válido para um usuário.
     *
     * Se o token atual estiver expirado e houver refresh token,
     * tenta renovar automaticamente e atualiza no banco de dados.
     *
     * @param User $user Usuário com tokens Google
     * @return string|null Access token válido ou null em caso de falha
     */
    public function getValidAccessToken(User $user): ?string
    {
        // Se não tem token, não há o que fazer
        if (empty($user->google_token)) {
            Log::warning('Usuário não possui google_token', ['user_id' => $user->id]);
            return null;
        }

        // Verifica se o token atual ainda é válido
        if ($this->isTokenValid($user->google_token)) {
            return $user->google_token;
        }

        Log::info('Token expirado, tentando refresh', ['user_id' => $user->id]);

        // Token expirado - tenta refresh
        if (empty($user->google_refresh_token)) {
            Log::warning('Token expirado e não há refresh_token disponível', [
                'user_id' => $user->id,
            ]);
            return null;
        }

        // Tenta renovar o token
        $newTokenData = $this->refreshAccessToken($user->google_refresh_token);

        if (!$newTokenData || empty($newTokenData['access_token'])) {
            Log::error('Falha ao renovar token do Google', ['user_id' => $user->id]);
            return null;
        }

        // Atualiza os tokens no banco de dados
        $updateData = [
            'google_token' => $newTokenData['access_token'],
            'google_token_expires_at' => isset($newTokenData['expires_in'])
                ? Carbon::now()->addSeconds($newTokenData['expires_in'])
                : null,
        ];

        // Se veio um novo refresh token, atualiza também
        if (!empty($newTokenData['refresh_token'])) {
            $updateData['google_refresh_token'] = $newTokenData['refresh_token'];
        }

        $user->update($updateData);

        Log::info('Token renovado com sucesso', ['user_id' => $user->id]);

        return $newTokenData['access_token'];
    }

    /**
     * Obtém o e-mail de um usuário com refresh automático.
     *
     * @param User $user Usuário com tokens Google
     * @return string|null E-mail do usuário ou null em caso de erro
     */
    public function getEmailWithAutoRefresh(User $user): ?string
    {
        $accessToken = $this->getValidAccessToken($user);

        if (!$accessToken) {
            // Fallback para o e-mail cadastrado
            return $user->email;
        }

        $userInfo = $this->getUserInfo($accessToken);

        return $userInfo['email'] ?? $user->email;
    }
}
