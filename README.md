# 📋 Projeto Recrutamento & Seleção

Sistema completo de **Recrutamento e Seleção** desenvolvido com **Go (Gin)** no backend e **React + TypeScript** no frontend.

## ✨ Funcionalidades

- ✅ Cadastro de usuários (EMAIL + SENHA)
- ✅ Login com autenticação JWT
- ✅ Dashboard com persistência de sessão
- ✅ CRUD completo de vagas (Criar, Editar e Excluir)
- ✅ Candidatura em vagas
- ✅ Busca e filtro de vagas
- ✅ Gestão de candidaturas (recrutador)
- ✅ Rotas protegidas por autenticação
- ✅ Sistema de Notificações em Tempo Real (Toasts)
- ✅ Interface Premium com Glassmorphism

## 🏗️ Arquitetura

```
test-prog/
├── backend/          # API Go + Gin + GORM
│   ├── cmd/          # Entry point
│   ├── internal/     # Handlers, Models, Middleware
│   ├── pkg/          # Auth (JWT)
│   └── go.mod
└── frontend/         # React + TypeScript + Vite
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   ├── services/
    │   └── types/
    └── package.json
```

## 🚀 Setup

### Pré-requisitos

- Go 1.21+
- Node.js 18+
- PostgreSQL
- Git

### 1. Clonar o projeto

```bash
git clone <repo-url>
cd test-prog
```

### 2. Configurar Banco de Dados

```sql
CREATE DATABASE test_prog;
```

### 3. Backend

```bash
cd backend

# Instalar dependências
go mod tidy

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais do PostgreSQL

# Rodar servidor
go run cmd/server/main.go
```

O backend estará disponível em `http://localhost:8080`

### 4. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## 📝 Variáveis de Ambiente

### Backend (.env)

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=test_prog
DB_PORT=5432
JWT_SECRET=your-secret-key
PORT=8080
```

## 🔐 API Endpoints

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/register` | Criar conta | ❌ |
| POST | `/api/login` | Login | ❌ |
| GET | `/api/me` | Dados do usuário | ✅ |
| GET | `/api/jobs` | Listar vagas | ❌ |
| GET | `/api/jobs/my` | Minhas vagas | ✅ |
| GET | `/api/jobs/:id` | Ver vaga | ❌ |
| POST | `/api/jobs` | Criar vaga | ✅ |
| PUT | `/api/jobs/:id` | Atualizar vaga | ✅ (owner) |
| DELETE | `/api/jobs/:id` | Deletar vaga | ✅ (owner) |
| POST | `/api/jobs/:id/apply` | Candidatar-se | ✅ |
| GET | `/api/applications` | Minhas candidaturas | ✅ |
| GET | `/api/jobs/:id/applications` | Candidaturas da vaga | ✅ (owner) |
| PUT | `/api/applications/:id` | Atualizar status | ✅ (owner) |

## 🎯 Tecnologias

### Backend
- Go 1.21
- Gin Framework
- GORM (ORM)
- JWT (autenticação)
- PostgreSQL

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Axios

## 📱 Fluxo de Uso

1. **Cadastro**: `/register` - Criar conta com email e senha
2. **Login**: `/login` - Autenticar com credenciais
3. **Dashboard**: `/dashboard` - Acessar funcionalidades:
   - **Buscar Vagas**: Explorar todas as vagas disponíveis
   - **Minhas Vagas**: Gerenciar vagas criadas
   - **Minhas Candidaturas**: Acompanhar status das aplicações

## 🧪 Testando

### Criar conta
1. Acesse `http://localhost:3000/register`
2. Preencha email e senha
3. Clique em "Criar Conta"

### Criar vaga
1. No dashboard, clique em "Buscar Vagas"
2. Clique em "+ Criar Vaga"
3. Preencha título, empresa, descrição, etc.

### Candidatar-se
1. Em "Buscar Vagas", clique em "Candidatar-se"
2. Adicione uma mensagem (opcional)
3. Envie a candidatura

### Ver candidaturas (recrutador)
1. Em "Minhas Vagas", clique em "Ver Candidaturas"
2. Altere o status (pending/approved/rejected)

## 📄 Licença

MIT

---

**Desenvolvido com ⚡ Go + React**
