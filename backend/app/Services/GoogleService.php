<?php

namespace App\Services;

use Google\Client as GoogleClient;
use Google\Service\Oauth2;
use Illuminate\Support\Facades\Log;

/**
 * Class GoogleService
 *
 * Serviço responsável pela integração com as APIs do Google.
 * Utiliza a biblioteca oficial google/apiclient para acessar
 * informações do usuário através de tokens OAuth.
 *
 * @package App\Services
 * @author Sistema de Cadastro
 * @version 1.0.0
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
}
