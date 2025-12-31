<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

/**
 * Class UserController
 *
 * Controller responsável pelas operações CRUD de usuários via API REST.
 * Utiliza a camada de Service para lógica de negócio.
 *
 * @package App\Http\Controllers\Api
 * @author Sistema de Cadastro
 * @version 1.0.0
 */
class UserController extends Controller
{
    /**
     * Instância do serviço de usuários.
     *
     * @var UserService
     */
    protected UserService $userService;

    /**
     * UserController constructor.
     *
     * @param UserService $userService Serviço injetado via DI
     */
    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Lista todos os usuários.
     *
     * @return JsonResponse
     *
     * @response 200 {
     *   "data": [
     *     {
     *       "id": 1,
     *       "name": "João Silva",
     *       "email": "joao@email.com",
     *       "phone": "11999999999",
     *       "birth_date": "1990-01-15",
     *       "cpf": "123.456.789-00",
     *       "age": 34
     *     }
     *   ]
     * }
     */
    public function index(): JsonResponse
    {
        $users = $this->userService->getAllUsers();

        return response()->json($users);
    }

    /**
     * Cria um novo usuário.
     *
     * @param Request $request Requisição HTTP
     * @return JsonResponse
     *
     * @bodyParam name string required Nome do usuário. Example: João Silva
     * @bodyParam email string required E-mail do usuário. Example: joao@email.com
     * @bodyParam phone string Telefone do usuário. Example: 11999999999
     * @bodyParam birth_date date Data de nascimento. Example: 1990-01-15
     *
     * @response 201 {
     *   "id": 1,
     *   "name": "João Silva",
     *   "email": "joao@email.com",
     *   "created_at": "2024-01-15T10:00:00.000000Z"
     * }
     *
     * @response 422 {
     *   "message": "O e-mail é obrigatório.",
     *   "errors": {"email": ["O e-mail é obrigatório."]}
     * }
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $user = $this->userService->createUser($request->all());

            return response()->json($user, Response::HTTP_CREATED);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Erro de validação.',
                'errors' => $e->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    /**
     * Exibe um usuário específico.
     *
     * @param User $user Usuário (Route Model Binding)
     * @return JsonResponse
     *
     * @urlParam user integer required ID do usuário. Example: 1
     *
     * @response 200 {
     *   "id": 1,
     *   "name": "João Silva",
     *   "email": "joao@email.com"
     * }
     */
    public function show(User $user): JsonResponse
    {
        return response()->json($user);
    }

    /**
     * Atualiza um usuário existente.
     *
     * @param Request $request Requisição HTTP
     * @param User $user Usuário (Route Model Binding)
     * @return JsonResponse
     *
     * @urlParam user integer required ID do usuário. Example: 1
     * @bodyParam name string required Nome do usuário. Example: João Silva
     * @bodyParam email string required E-mail do usuário. Example: joao@email.com
     *
     * @response 200 {
     *   "id": 1,
     *   "name": "João Silva Atualizado",
     *   "email": "joao@email.com"
     * }
     */
    public function update(Request $request, User $user): JsonResponse
    {
        try {
            $updatedUser = $this->userService->updateUser($user->id, $request->all());

            return response()->json($updatedUser);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Erro de validação.',
                'errors' => $e->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    /**
     * Remove um usuário.
     *
     * @param User $user Usuário (Route Model Binding)
     * @return JsonResponse
     *
     * @urlParam user integer required ID do usuário. Example: 1
     *
     * @response 204 {}
     */
    public function destroy(User $user): JsonResponse
    {
        $this->userService->deleteUser($user->id);

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
