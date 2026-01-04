<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro Concluído</title>
</head>

<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <!-- Main Container -->
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"
                    style="max-width: 600px; width: 100%;">
                    <!-- Card -->
                    <tr>
                        <td
                            style="background: linear-gradient(135deg, #1e1e2e 0%, #313244 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);">

                            <!-- Header -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td align="center"
                                        style="padding: 40px 40px 30px; background: linear-gradient(135deg, #45475a 0%, #313244 100%);">
                                        <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #cdd6f4;">
                                            Cadastro Concluído!</h1>
                                    </td>
                                </tr>
                            </table>

                            <!-- Content -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td style="padding: 40px;">
                                        <!-- Greeting -->
                                        <p style="margin: 0 0 16px; font-size: 18px; color: #cdd6f4;">
                                            Olá, <span
                                                style="color: #b4befe; font-weight: 600;">{{ $user->name }}</span>!
                                        </p>

                                        <p style="margin: 0 0 32px; font-size: 16px; color: #a6adc8;">
                                            Seu cadastro foi concluído com sucesso em nosso sistema. Agora você tem
                                            acesso completo a todas as funcionalidades.
                                        </p>

                                        <!-- User Data Card -->
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                                            border="0"
                                            style="background: #45475a; border-radius: 12px; margin-bottom: 32px;">
                                            <tr>
                                                <td style="padding: 24px;">
                                                    <h3
                                                        style="margin: 0 0 20px; font-size: 14px; font-weight: 600; color: #a6adc8; text-transform: uppercase; letter-spacing: 0.05em;">
                                                        SEUS DADOS</h3>

                                                    <table role="presentation" width="100%" cellspacing="0"
                                                        cellpadding="0" border="0">
                                                        <tr>
                                                            <td
                                                                style="padding: 8px 0; color: #a6adc8; font-size: 14px; width: 120px;">
                                                                Nome:</td>
                                                            <td
                                                                style="padding: 8px 0; color: #cdd6f4; font-size: 14px; font-weight: 500;">
                                                                {{ $user->name }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style="padding: 8px 0; color: #a6adc8; font-size: 14px;">
                                                                E-mail:</td>
                                                            <td style="padding: 8px 0;">
                                                                <a href="mailto:{{ $user->email }}"
                                                                    style="color: #89b4fa; text-decoration: none; font-size: 14px;">{{ $user->email }}</a>
                                                            </td>
                                                        </tr>
                                                        @if($user->cpf)
                                                            <tr>
                                                                <td
                                                                    style="padding: 8px 0; color: #a6adc8; font-size: 14px;">
                                                                    CPF:</td>
                                                                <td
                                                                    style="padding: 8px 0; color: #cdd6f4; font-size: 14px; font-weight: 500;">
                                                                    {{ $user->cpf }}</td>
                                                            </tr>
                                                        @endif
                                                        @if($user->birth_date)
                                                            <tr>
                                                                <td
                                                                    style="padding: 8px 0; color: #a6adc8; font-size: 14px;">
                                                                    Nascimento:</td>
                                                                <td
                                                                    style="padding: 8px 0; color: #cdd6f4; font-size: 14px; font-weight: 500;">
                                                                    {{ $user->birth_date->format('d/m/Y') }}</td>
                                                            </tr>
                                                        @endif
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Security Notice -->
                                        <p style="margin: 0 0 32px; font-size: 14px; color: #a6adc8;">
                                            Se você não realizou este cadastro, por favor entre em contato conosco
                                            imediatamente.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Footer -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td align="center" style="padding: 24px 40px; border-top: 1px solid #45475a;">
                                        <p style="margin: 0 0 8px; font-size: 12px; color: #6c7086;">
                                            Este é um e-mail automático. Por favor, não responda.
                                        </p>
                                        <p style="margin: 0; font-size: 12px; color: #6c7086;">
                                            © {{ date('Y') }} Sistema de Cadastro de Usuários
                                        </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>