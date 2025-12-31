<?php

namespace App\Jobs;

use App\Mail\RegistrationCompleted;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Class SendRegistrationEmail
 *
 * Job responsável pelo envio assíncrono de e-mail de confirmação de cadastro.
 * Utiliza o sistema de filas do Laravel para processamento em background,
 * melhorando a performance e experiência do usuário.
 *
 * @package App\Jobs
 * @author Sistema de Cadastro
 * @version 1.0.0
 */
class SendRegistrationEmail implements ShouldQueue
{
    use Queueable, Dispatchable, InteractsWithQueue, SerializesModels;

    /**
     * Número máximo de tentativas de execução do job.
     *
     * @var int
     */
    public int $tries = 3;

    /**
     * Tempo máximo de execução em segundos.
     *
     * @var int
     */
    public int $timeout = 60;

    /**
     * Tempo de espera entre tentativas em segundos.
     *
     * @var array<int, int>
     */
    public array $backoff = [10, 30, 60];

    /**
     * Usuário que completou o cadastro.
     *
     * @var User
     */
    protected User $user;

    /**
     * E-mail de destino para a notificação.
     *
     * @var string
     */
    protected string $email;

    /**
     * Create a new job instance.
     *
     * @param User $user Usuário que completou o cadastro
     * @param string $email E-mail de destino
     */
    public function __construct(User $user, string $email)
    {
        $this->user = $user;
        $this->email = $email;
    }

    /**
     * Execute the job.
     *
     * Envia o e-mail de confirmação de cadastro utilizando
     * o Mailable RegistrationCompleted.
     *
     * @return void
     */
    public function handle(): void
    {
        Log::info('Iniciando envio de e-mail de confirmação de cadastro', [
            'user_id' => $this->user->id,
            'email' => $this->email,
        ]);

        try {
            Mail::to($this->email)->send(new RegistrationCompleted($this->user));

            Log::info('E-mail de confirmação enviado com sucesso', [
                'user_id' => $this->user->id,
                'email' => $this->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Falha ao enviar e-mail de confirmação', [
                'user_id' => $this->user->id,
                'email' => $this->email,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     *
     * Executado quando todas as tentativas de envio falharam.
     *
     * @param \Throwable $exception Exceção que causou a falha
     * @return void
     */
    public function failed(\Throwable $exception): void
    {
        Log::critical('Falha definitiva no envio de e-mail de confirmação', [
            'user_id' => $this->user->id,
            'email' => $this->email,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);
    }

    /**
     * Get the tags that should be assigned to the job.
     *
     * Tags para identificação no sistema de filas.
     *
     * @return array<int, string>
     */
    public function tags(): array
    {
        return [
            'email',
            'registration',
            'user:' . $this->user->id,
        ];
    }
}
