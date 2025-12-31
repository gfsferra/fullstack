<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Class RegistrationCompleted
 *
 * Mailable para envio de e-mail de confirmação de cadastro.
 * Enviado quando o usuário completa seu registro no sistema.
 *
 * @package App\Mail
 * @author Sistema de Cadastro
 * @version 1.0.0
 */
class RegistrationCompleted extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * O usuário que completou o cadastro.
     *
     * @var User
     */
    public User $user;

    /**
     * Create a new message instance.
     *
     * @param User $user Usuário que completou o cadastro
     */
    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * Get the message envelope.
     *
     * Define os metadados do e-mail como assunto e remetente.
     *
     * @return Envelope
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Cadastro Concluído com Sucesso!',
        );
    }

    /**
     * Get the message content definition.
     *
     * Define o template Blade a ser usado para renderizar o e-mail.
     *
     * @return Content
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.registration-completed',
            with: [
                'user' => $this->user,
                'appName' => config('app.name'),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
