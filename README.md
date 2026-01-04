# Sistema de Cadastro de Usuários

Sistema fullstack de cadastro de usuários com autenticação Google OAuth 2.0, desenvolvido com Laravel 11 (Backend) e Vue.js 3 (Frontend).

![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=flat-square&logo=laravel)
![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração do Google OAuth](#-configuração-do-google-oauth)
- [Instalação e Execução](#-instalação-e-execução)
- [Como Rodar os Testes](#-como-rodar-os-testes)
- [Arquitetura e Decisões Técnicas](#-arquitetura-e-decisões-técnicas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Coleção Bruno (API Client)](#-coleção-bruno-api-client)

---

## ✨ Funcionalidades

- **Autenticação Google OAuth 2.0** com refresh token automático
- **Cadastro de usuários** com validação de CPF (algoritmo matemático)
- **Listagem de usuários** com paginação server-side e filtros
- **Envio de e-mail assíncrono** via filas (Redis)
- **Interface responsiva** com tema dark (Catppuccin Mocha)

---

## 📦 Pré-requisitos

### Com Docker (Recomendado)

- [Docker](https://docs.docker.com/get-docker/) >= 20.x
- [Docker Compose](https://docs.docker.com/compose/install/) >= 2.x

### Sem Docker (Desenvolvimento Local)

- PHP >= 8.2 com extensões: `pdo_mysql`, `mbstring`, `xml`, `curl`, `redis`
- Composer >= 2.x
- Node.js >= 18.x
- npm >= 9.x
- MySQL >= 8.0
- Redis >= 6.x

---

## 🔐 Configuração do Google OAuth

### 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. No menu lateral, vá em **APIs e Serviços** > **Credenciais**

### 2. Configurar Tela de Consentimento OAuth

1. Clique em **Configurar tela de consentimento**
2. Selecione **Externo** e clique em **Criar**
3. Preencha:
   - Nome do app: `Sistema de Cadastro`
   - E-mail de suporte: seu e-mail
   - Domínios autorizados: (deixe vazio para desenvolvimento)
4. Em **Escopos**, adicione:
   - `email`
   - `profile`
   - `openid`
5. Adicione seu e-mail como **Usuário de teste**

### 3. Criar Credenciais OAuth 2.0

1. Vá em **Credenciais** > **Criar credenciais** > **ID do cliente OAuth**
2. Tipo de aplicativo: **Aplicativo da Web**
3. Nome: `Sistema de Cadastro - Web`
4. **Origens JavaScript autorizadas**:
   ```
   http://localhost:5173
   http://localhost:8000
   ```
5. **URIs de redirecionamento autorizados**:
   ```
   http://localhost:8000/api/auth/google/callback
   ```
6. Clique em **Criar** e copie o **Client ID** e **Client Secret**

### 4. Configurar Variáveis de Ambiente

No arquivo `backend/.env`:

```env
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

---

## 🚀 Instalação e Execução

### Com Docker (Recomendado)

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd fullstack

# 2. Copie o arquivo de ambiente do backend
cp backend/.env.example backend/.env

# 3. Configure as variáveis do Google OAuth no backend/.env
# (veja seção anterior)

# 4. Inicie os containers
docker compose up -d

# 5. Execute as migrations
docker compose exec backend php artisan migrate

# 6. (Opcional) Popule o banco com dados de teste
docker compose exec backend php artisan db:seed
```

**Acessos:**
- 🌐 Frontend: http://localhost:5173
- 🔧 Backend API: http://localhost:8000/api
- 🗄️ MySQL: localhost:3307 (user: laravel, password: ver .env)

**Comandos úteis:**

```bash
# Ver logs de todos os serviços
docker compose logs -f

# Ver logs apenas do queue worker
docker compose logs -f queue

# Parar todos os containers
docker compose down

# Reiniciar um serviço específico
docker compose restart backend

# Acessar o container do backend
docker compose exec backend bash

# Limpar banco e recriar
docker compose exec backend php artisan migrate:fresh --seed
```

### Sem Docker (Desenvolvimento Local)

```bash
# Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve

# Em outro terminal - Queue Worker
cd backend
php artisan queue:work redis --tries=3

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev
```

---

## 🧪 Como Rodar os Testes

### Testes do Backend (PHPUnit)

```bash
# Com Docker
docker compose exec backend php artisan test

# Sem Docker
cd backend
php artisan test

# Com cobertura de código
docker compose exec backend php artisan test --coverage

# Rodar testes específicos
docker compose exec backend php artisan test --filter=UserServiceTest
docker compose exec backend php artisan test --filter=RegistrationControllerTest
```

**Estrutura dos testes:**

| Tipo | Diretório | Descrição |
|------|-----------|-----------|
| Unit | `tests/Unit/Models/` | Testes de Models, Casts, Mutators |
| Unit | `tests/Unit/Services/` | Testes de Services (lógica de negócio) |
| Unit | `tests/Unit/Repositories/` | Testes de Repositories |
| Feature | `tests/Feature/Api/` | Testes de endpoints da API |

### Testes do Frontend (Vitest)

```bash
# Com Docker
docker compose exec frontend npm run test

# Sem Docker
cd frontend
npm run test

# Com interface gráfica
npm run test:ui

# Com cobertura
npm run test:coverage
```

---

## 🏗️ Arquitetura e Decisões Técnicas

### Padrões Arquiteturais

#### Repository Pattern
Abstrai a camada de persistência, permitindo:
- Troca de ORM sem impacto na lógica de negócio
- Facilidade para criar mocks em testes
- Separação clara de responsabilidades

```
app/
├── Repositories/
│   ├── Contracts/
│   │   └── UserRepositoryInterface.php
│   └── Eloquent/
│       └── UserRepository.php
```

#### Service Layer
Encapsula a lógica de negócio, mantendo Controllers enxutos:

```
app/
├── Services/
│   ├── UserService.php          # CRUD de usuários
│   ├── RegistrationService.php  # Lógica de cadastro
│   └── GoogleService.php        # Integração com Google API
```

#### Injeção de Dependência
Bindings configurados em Service Providers:

```php
// app/Providers/RepositoryServiceProvider.php
$this->app->bind(UserRepositoryInterface::class, UserRepository::class);
```

### Recursos do Laravel Utilizados

| Recurso | Uso | Arquivo |
|---------|-----|---------|
| **Custom Cast** | Formatação automática de CPF | `app/Casts/CpfCast.php` |
| **Mutators** | Normalização de nome (Title Case) | `app/Models/User.php` |
| **Accessors** | Cálculo de idade a partir de birth_date | `app/Models/User.php` |
| **Local Scopes** | Filtros reutilizáveis (registered, pending) | `app/Models/User.php` |
| **Jobs/Queues** | Envio assíncrono de e-mails | `app/Jobs/SendRegistrationEmail.php` |
| **Mailable** | Template de e-mail de cadastro | `app/Mail/RegistrationCompleted.php` |
| **Factories** | Geração de dados fake para testes | `database/factories/UserFactory.php` |
| **Seeders** | População do banco para desenvolvimento | `database/seeders/` |

### Validação de CPF

Implementação do algoritmo oficial de validação:
- Verifica quantidade de dígitos (11)
- Rejeita CPFs com todos os dígitos iguais
- Calcula e valida os dois dígitos verificadores

```php
// app/Services/RegistrationService.php
public function validateCpf(string $cpf): bool
```

### Refresh Token do Google

O sistema armazena e gerencia refresh tokens para:
- Renovar access tokens expirados automaticamente
- Garantir envio de e-mails mesmo após expiração do token inicial

```php
// app/Services/GoogleService.php
public function getValidAccessToken(User $user): ?string
```

### Frontend

| Tecnologia | Uso |
|------------|-----|
| **Vue 3 + Composition API** | Framework reativo |
| **TypeScript** | Tipagem estática |
| **Pinia** | Gerenciamento de estado |
| **Vue Router** | Navegação SPA |
| **Sass (SCSS)** | Estilização com variáveis e mixins |
| **VueUse** | Utilitários (debounce, etc.) |
| **Axios** | Cliente HTTP |

### Tema Visual

Baseado no [Catppuccin Mocha](https://github.com/catppuccin/catppuccin):
- Cores definidas em `frontend/src/styles/abstracts/_variables.scss`
- Dark mode por padrão
- Botão Google seguindo [Brand Guidelines](https://developers.google.com/identity/branding-guidelines)

---

## 📁 Estrutura do Projeto

```
fullstack/
├── backend/                    # Laravel 11
│   ├── app/
│   │   ├── Casts/             # Custom Casts (CPF)
│   │   ├── Http/Controllers/  # Controllers da API
│   │   ├── Jobs/              # Jobs para filas
│   │   ├── Mail/              # Mailables
│   │   ├── Models/            # Eloquent Models
│   │   ├── Providers/         # Service Providers
│   │   ├── Repositories/      # Repository Pattern
│   │   └── Services/          # Business Logic
│   ├── database/
│   │   ├── factories/         # Model Factories
│   │   ├── migrations/        # Database Migrations
│   │   └── seeders/           # Database Seeders
│   ├── resources/views/emails/ # Templates de e-mail
│   ├── routes/api.php         # Rotas da API
│   └── tests/                 # PHPUnit Tests
│
├── frontend/                   # Vue.js 3
│   ├── src/
│   │   ├── components/        # Componentes Vue
│   │   ├── services/          # API Client
│   │   ├── stores/            # Pinia Stores
│   │   ├── styles/            # SCSS (ITCSS)
│   │   ├── types/             # TypeScript Types
│   │   └── views/             # Páginas/Views
│   └── src/__tests__/         # Vitest Tests
│
├── docker-compose.yml         # Orquestração Docker
└── README.md                  # Esta documentação
```

---

## 🔌 API Endpoints

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/auth/google/redirect` | Inicia fluxo OAuth |
| GET | `/api/auth/google/callback` | Callback do Google |
| GET | `/api/auth/user` | Retorna usuário autenticado |
| POST | `/api/auth/logout` | Encerra sessão |

### Cadastro

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/registration/complete` | Completa cadastro |
| GET | `/api/registration/status/{id}` | Status do cadastro |

### Usuários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/users` | Lista usuários (paginado) |
| GET | `/api/users/{id}` | Detalhes do usuário |

**Parâmetros de listagem:**

```
GET /api/users?search=nome&per_page=10&page=1
```

---

## 🔧 Coleção Bruno (API Client)

O projeto inclui uma coleção [Bruno](https://www.usebruno.com/) para testar a API.

### Instalação do Bruno

```bash
# Via npm
npm install -g @usebruno/cli

# Ou baixe o app: https://www.usebruno.com/downloads
```

### Estrutura da Coleção

```
bruno/
├── bruno.json              # Configuração da coleção
├── collection.bru          # Headers globais
├── environments/
│   └── local.bru           # Variáveis de ambiente (localhost)
├── auth/
│   ├── google-redirect.bru # Iniciar OAuth
│   ├── google-callback.bru # Callback OAuth
│   ├── get-user.bru        # Usuário autenticado
│   └── logout.bru          # Encerrar sessão
├── registration/
│   ├── complete.bru        # Completar cadastro
│   └── status.bru          # Status do cadastro
└── users/
    ├── list.bru            # Listar usuários
    ├── show.bru            # Detalhes do usuário
    ├── store.bru           # Criar usuário
    ├── update.bru          # Atualizar usuário
    └── delete.bru          # Remover usuário
```

### Como Usar

1. Abra o Bruno
2. Clique em **Open Collection**
3. Navegue até a pasta `fullstack/bruno`
4. Selecione o ambiente **local** no canto superior direito
5. Execute as requisições!

### Via CLI

```bash
cd bruno

# Executar todas as requisições
bru run --env local

# Executar uma requisição específica
bru run users/list.bru --env local
```

---

## 📝 Licença

Este projeto foi desenvolvido como teste técnico.

---

## 👨‍💻 Autor

Desenvolvido por Gabriel Sferra

