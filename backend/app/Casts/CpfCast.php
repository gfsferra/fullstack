<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

/**
 * Class CpfCast
 *
 * Cast personalizado para formatação automática de CPF.
 * Ao salvar, remove a formatação. Ao recuperar, aplica a formatação.
 *
 * @package App\Casts
 * @author Sistema de Cadastro
 * @version 1.0.0
 *
 * @implements CastsAttributes<string, string>
 */
class CpfCast implements CastsAttributes
{
    /**
     * Transform the attribute from the underlying model values.
     *
     * Formata o CPF para exibição (XXX.XXX.XXX-XX).
     *
     * @param Model $model Instância do modelo
     * @param string $key Nome do atributo
     * @param mixed $value Valor armazenado no banco
     * @param array<string, mixed> $attributes Todos os atributos do modelo
     * @return string|null CPF formatado ou null
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if ($value === null) {
            return null;
        }

        // Remove qualquer formatação existente
        $cpf = preg_replace('/[^0-9]/', '', $value);

        // Se não tiver 11 dígitos, retorna como está
        if (strlen($cpf) !== 11) {
            return $value;
        }

        // Formata: XXX.XXX.XXX-XX
        return sprintf(
            '%s.%s.%s-%s',
            substr($cpf, 0, 3),
            substr($cpf, 3, 3),
            substr($cpf, 6, 3),
            substr($cpf, 9, 2)
        );
    }

    /**
     * Transform the attribute to its underlying model values.
     *
     * Remove a formatação do CPF para armazenamento.
     *
     * @param Model $model Instância do modelo
     * @param string $key Nome do atributo
     * @param mixed $value Valor a ser armazenado
     * @param array<string, mixed> $attributes Todos os atributos do modelo
     * @return string|null CPF sem formatação ou null
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if ($value === null) {
            return null;
        }

        // Remove tudo que não for número
        return preg_replace('/[^0-9]/', '', $value);
    }
}

