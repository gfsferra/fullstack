<?php

namespace App\Models;

use App\Casts\CpfCast;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class User
 *
 * Model que representa um usuário do sistema.
 * Contém informações pessoais e dados de autenticação via Google OAuth.
 *
 * @package App\Models
 * @author Sistema de Cadastro
 * @version 1.0.0
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $birth_date
 * @property string|null $cpf
 * @property string|null $google_id
 * @property string|null $avatar
 * @property string|null $google_token
 * @property string|null $google_refresh_token
 * @property Carbon|null $google_token_expires_at
 * @property bool $registration_completed
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @property-read int|null $age Idade calculada a partir da data de nascimento
 */
class User extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'users';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'birth_date',
        'cpf',
        'google_id',
        'avatar',
        'google_token',
        'google_refresh_token',
        'google_token_expires_at',
        'registration_completed',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'google_token',
        'google_refresh_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'birth_date' => 'date',
        'registration_completed' => 'boolean',
        'cpf' => CpfCast::class,
        'google_token_expires_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'age',
    ];

    /**
     * Accessor para obter a idade do usuário.
     *
     * Calcula a idade baseada na data de nascimento.
     *
     * @return Attribute<int|null, never>
     */
    protected function age(): Attribute
    {
        return Attribute::make(
            get: function (): ?int {
                if (!$this->birth_date) {
                    return null;
                }

                return $this->birth_date->age;
            }
        );
    }

    /**
     * Mutator para o nome do usuário.
     *
     * Converte o nome para Title Case (primeira letra maiúscula).
     *
     * @return Attribute<string, string>
     */
    protected function name(): Attribute
    {
        return Attribute::make(
            get: fn (string $value): string => $value,
            set: fn (string $value): string => mb_convert_case(trim($value), MB_CASE_TITLE, 'UTF-8')
        );
    }

    /**
     * Verifica se o usuário completou o cadastro.
     *
     * @return bool
     */
    public function hasCompletedRegistration(): bool
    {
        return $this->registration_completed === true;
    }

    /**
     * Verifica se o usuário se registrou via Google.
     *
     * @return bool
     */
    public function isGoogleUser(): bool
    {
        return !empty($this->google_id);
    }

    /**
     * Verifica se o usuário é maior de idade.
     *
     * @return bool|null Null se não tiver data de nascimento
     */
    public function isAdult(): ?bool
    {
        if (!$this->birth_date) {
            return null;
        }

        return $this->age >= 18;
    }

    /**
     * Scope para filtrar usuários com cadastro completo.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRegistered($query)
    {
        return $query->where('registration_completed', true);
    }

    /**
     * Scope para filtrar usuários com cadastro pendente.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePending($query)
    {
        return $query->where('registration_completed', false);
    }

    /**
     * Scope para filtrar usuários do Google.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFromGoogle($query)
    {
        return $query->whereNotNull('google_id');
    }
}
