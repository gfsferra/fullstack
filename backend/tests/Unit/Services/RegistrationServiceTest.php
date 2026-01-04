<?php

namespace Tests\Unit\Services;

use App\Services\RegistrationService;
use App\Services\GoogleService;
use App\Repositories\Contracts\UserRepositoryInterface;
use Tests\TestCase;
use Mockery;

/**
 * Class RegistrationServiceTest
 *
 * Testes unitários para o RegistrationService.
 * Foca na validação matemática do CPF.
 *
 * @package Tests\Unit\Services
 * @author Sistema de Cadastro
 * @version 1.0.0
 */
class RegistrationServiceTest extends TestCase
{
    /**
     * Instância do serviço sendo testado.
     *
     * @var RegistrationService
     */
    protected RegistrationService $service;

    /**
     * Setup do teste.
     *
     * @return void
     */
    protected function setUp(): void
    {
        parent::setUp();

        $userRepository = Mockery::mock(UserRepositoryInterface::class);
        $googleService = Mockery::mock(GoogleService::class);

        $this->service = new RegistrationService($userRepository, $googleService);
    }

    /**
     * Testa que CPFs válidos passam na validação.
     *
     * @return void
     * @dataProvider validCpfProvider
     */
    public function test_validate_cpf_accepts_valid_cpfs(string $cpf): void
    {
        $this->assertTrue($this->service->validateCpf($cpf));
    }

    /**
     * Testa que CPFs inválidos falham na validação.
     *
     * @return void
     * @dataProvider invalidCpfProvider
     */
    public function test_validate_cpf_rejects_invalid_cpfs(string $cpf): void
    {
        $this->assertFalse($this->service->validateCpf($cpf));
    }

    /**
     * Testa que CPFs com dígitos iguais são rejeitados.
     *
     * @return void
     */
    public function test_validate_cpf_rejects_same_digit_cpfs(): void
    {
        $sameDigitCpfs = [
            '00000000000',
            '11111111111',
            '22222222222',
            '33333333333',
            '44444444444',
            '55555555555',
            '66666666666',
            '77777777777',
            '88888888888',
            '99999999999',
        ];

        foreach ($sameDigitCpfs as $cpf) {
            $this->assertFalse(
                $this->service->validateCpf($cpf),
                "CPF com dígitos iguais deveria ser inválido: $cpf"
            );
        }
    }

    /**
     * Testa que CPFs com tamanho incorreto são rejeitados.
     *
     * @return void
     */
    public function test_validate_cpf_rejects_wrong_length(): void
    {
        $this->assertFalse($this->service->validateCpf('123456789')); // 9 dígitos
        $this->assertFalse($this->service->validateCpf('1234567890')); // 10 dígitos
        $this->assertFalse($this->service->validateCpf('1234567890123')); // 13 dígitos
    }

    /**
     * Testa que a validação aceita CPFs com formatação.
     *
     * @return void
     */
    public function test_validate_cpf_handles_formatted_input(): void
    {
        // CPF válido com formatação
        $this->assertTrue($this->service->validateCpf('529.982.247-25'));
        
        // CPF inválido com formatação
        $this->assertFalse($this->service->validateCpf('123.456.789-00'));
    }

    /**
     * Provider de CPFs válidos para testes.
     *
     * CPFs verificados matematicamente.
     *
     * @return array<array<string>>
     */
    public static function validCpfProvider(): array
    {
        return [
            ['52998224725'],     // 529.982.247-25
            ['12345678909'],     // 123.456.789-09
            ['11144477735'],     // 111.444.777-35
            ['529.982.247-25'],  // Com formatação
            ['123.456.789-09'],  // Com formatação
            ['111.444.777-35'],  // Com formatação
        ];
    }

    /**
     * Provider de CPFs inválidos para testes.
     *
     * @return array<array<string>>
     */
    public static function invalidCpfProvider(): array
    {
        return [
            ['12345678900'],     // Dígitos verificadores incorretos
            ['00000000001'],     // Quase todos iguais
            ['12345678901'],     // Dígitos verificadores incorretos
            ['123.456.789-00'],  // Formatado mas inválido
            ['529.982.247-99'],  // Dígito verificador errado
        ];
    }

    /**
     * Cleanup após testes.
     *
     * @return void
     */
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}

