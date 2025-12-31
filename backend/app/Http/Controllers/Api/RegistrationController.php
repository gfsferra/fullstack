<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RegistrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

/**
 * Class RegistrationController
 *
 * Controller responsável pelo fluxo de cadastro complementar de usuários.
 * Gerencia a conclusão do registro após autenticação via Google OAuth.
 *
 * @package App\Http\Controllers\Api
 * @author Sistema de Cadastro
 * @version 1.0.0
 */
class RegistrationController extends Controller
{
    /**
     * Instância do serviço de registro.
     *
     * @var RegistrationService
     */
    protected RegistrationService $registrationService;

    /**
     * RegistrationController constructor.
     *
     * @param RegistrationService $registrationService Serviço injetado via DI
     */
    public function __construct(RegistrationService $registrationService)
    {
        $this->registrationService = $registrationService;
    }

    /**
     * Completa o cadastro de um usuário.
     *
     * Recebe os dados complementares (nome, data de nascimento, CPF),
     * atualiza o registro do usuário e dispara o envio de e-mail
     * de confirmação via fila assíncrona.
     *
     * @param Request $request Requisição HTTP
     * @return JsonResponse
     *
     * @bodyParam user_id integer required ID do usuário. Example: 1
     * @bodyParam name string required Nome completo. Example: João Silva
     * @bodyParam birth_date date required Data de nascimento. Example: 1990-01-15
     * @bodyParam cpf string required CPF com formatação. Example: 123.456.789-00
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Cadastro concluído com sucesso! Um e-mail de confirmação foi enviado.",
     *   "user": {
     *     "id": 1,
     *     "name": "João Silva",
     *     "email": "joao@email.com",
     *     "registration_completed": true
     *   }
     * }
     *
     * @response 422 {
     *   "success": false,
     *   "errors": {"cpf": ["O CPF é obrigatório."]}
     * }
     */
    public function complete(Request $request): JsonResponse
    {
        try {
            $user = $this->registrationService->completeRegistration(
                $request->input('user_id'),
                $request->only(['name', 'birth_date', 'cpf'])
            );

            return response()->json([
                'success' => true,
                'message' => 'Cadastro concluído com sucesso! Um e-mail de confirmação foi enviado.',
                'user' => $user,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Obtém o status de cadastro de um usuário.
     *
     * @param int $userId ID do usuário
     * @return JsonResponse
     *
     * @urlParam userId integer required ID do usuário. Example: 1
     *
     * @response 200 {
     *   "success": true,
     *   "registration_completed": true,
     *   "user": {...}
     * }
     *
     * @response 404 {
     *   "success": false,
     *   "message": "Usuário não encontrado."
     * }
     */
    public function status(int $userId): JsonResponse
    {
        $status = $this->registrationService->getRegistrationStatus($userId);

        if ($status['user'] === null) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário não encontrado.',
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'success' => true,
            'registration_completed' => $status['completed'],
            'user' => $status['user'],
        ]);
    }
}
