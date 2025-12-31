<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro Concluído</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #4CAF50;
        }
        .header h1 {
            color: #4CAF50;
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 30px 0;
        }
        .success-icon {
            text-align: center;
            font-size: 64px;
            margin-bottom: 20px;
        }
        .user-info {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .user-info p {
            margin: 8px 0;
        }
        .user-info strong {
            color: #555;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #888;
            font-size: 14px;
        }
        .btn {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Cadastro Concluído!</h1>
        </div>
        
        <div class="content">
            <div class="success-icon">✅</div>
            
            <p>Olá, <strong>{{ $user->name }}</strong>!</p>
            
            <p>Seu cadastro em nosso sistema foi concluído com sucesso. Estamos muito felizes em tê-lo conosco!</p>
            
            <div class="user-info">
                <h3>📋 Seus Dados Cadastrados:</h3>
                <p><strong>Nome:</strong> {{ $user->name }}</p>
                <p><strong>E-mail:</strong> {{ $user->email }}</p>
                @if($user->cpf)
                <p><strong>CPF:</strong> {{ $user->cpf }}</p>
                @endif
                @if($user->birth_date)
                <p><strong>Data de Nascimento:</strong> {{ $user->birth_date->format('d/m/Y') }}</p>
                @endif
                <p><strong>Cadastrado em:</strong> {{ $user->created_at->format('d/m/Y H:i') }}</p>
            </div>
            
            <p>Agora você tem acesso completo ao nosso sistema. Aproveite todos os recursos disponíveis!</p>
            
            <p style="text-align: center;">
                <a href="{{ config('app.url') }}" class="btn">Acessar o Sistema</a>
            </p>
        </div>
        
        <div class="footer">
            <p>Este é um e-mail automático, por favor não responda.</p>
            <p>© {{ date('Y') }} {{ $appName ?? config('app.name') }}. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
