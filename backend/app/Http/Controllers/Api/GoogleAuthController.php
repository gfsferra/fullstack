<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

/**
 * Class GoogleAuthController
 *
 * Controller responsável pela autenticação via Google OAuth 2.0.
 * Gerencia o fluxo de login com conta Google e criação de usuários.
 *
 * @package App\Http\Controllers\Api
 * @author Sistema de Cadastro
 * @version 1.0.0
 */
class GoogleAuthController extends Controller
{
    /**
     * Redireciona o usuário para a página de autenticação do Google.
     *
     * Inicia o fluxo OAuth 2.0 redirecionando para o consent screen do Google.
     *
     * @return RedirectResponse
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    /**
     * Processa o callback do Google OAuth.
     *
     * Recebe o código de autorização do Google, obtém os dados do usuário,
     * cria ou atualiza o registro no banco e redireciona para o frontend.
     *
     * @return RedirectResponse
     */
    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            Log::info('Google OAuth callback recebido', [
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
            ]);

            // Verifica se o usuário já existe
            $existingUser = User::where('email', $googleUser->getEmail())->first();

            if ($existingUser) {
                // Atualiza usuário existente com dados do Google
                $existingUser->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'google_token' => $googleUser->token,
                ]);
                $user = $existingUser;
            } else {
                // Cria novo usuário
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'google_token' => $googleUser->token,
                    'registration_completed' => false,
                ]);
            }

            Log::info('Usuário autenticado via Google', [
                'user_id' => $user->id,
                'registration_completed' => $user->registration_completed,
            ]);

            // Redireciona para o frontend com os dados do usuário
            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

            return redirect()->away(
                $frontendUrl . '/auth/callback?' . http_build_query([
                    'success' => 'true',
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'registration_completed' => $user->registration_completed ? 'true' : 'false',
                ])
            );
        } catch (\Exception $e) {
            Log::error('Erro no callback do Google OAuth', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

            return redirect()->away(
                $frontendUrl . '/auth/callback?success=false&error=' . urlencode($e->getMessage())
            );
        }
    }

    /**
     * Retorna os dados do usuário autenticado.
     *
     * Endpoint para SPAs verificarem o estado de autenticação.
     *
     * @return JsonResponse
     *
     * @response 200 {
     *   "authenticated": true,
     *   "user": {...}
     * }
     *
     * @response 401 {
     *   "authenticated": false
     * }
     */
    public function user(): JsonResponse
    {
        $userId = session('user_id');

        if (!$userId) {
            return response()->json(['authenticated' => false], 401);
        }

        $user = User::find($userId);

        if (!$user) {
            return response()->json(['authenticated' => false], 401);
        }

        return response()->json([
            'authenticated' => true,
            'user' => $user,
        ]);
    }

    /**
     * Realiza o logout do usuário.
     *
     * Remove os dados da sessão e invalida a autenticação.
     *
     * @return JsonResponse
     *
     * @response 200 {
     *   "message": "Logout realizado com sucesso"
     * }
     */
    public function logout(): JsonResponse
    {
        session()->forget('user_id');

        return response()->json(['message' => 'Logout realizado com sucesso']);
    }
}
