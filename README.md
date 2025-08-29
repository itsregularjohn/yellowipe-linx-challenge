# Yellowipe

Uma aplicação de rede social simples desenvolvida como parte de um teste técnico. O projeto permite que usuários se cadastrem, façam login, façam upload de imagens e visualizem um feed básico.

## Stack Tecnológica

Arquitetura: Monorepo com [pnpm](https://github.com/pnpm/pnpm) workspaces

Backend:
- Node.js + TypeScript
- [Hono](https://github.com/honojs/hono) web framework  
- PostgreSQL + [Prisma](https://www.prisma.io/) ORM
- AWS S3 para uploads
- [JWT](https://github.com/auth0/node-jsonwebtoken) + [bcrypt](https://github.com/dcodeIO/bcrypt.js) para autenticação
- [Jest](https://github.com/jestjs/jest) para testes (TDD)

Frontend:
- React 19 + TypeScript
- [Vite](https://github.com/vitejs/vite) bundler
- [react-hook-form](https://github.com/react-hook-form/react-hook-form) para formulários
- React Context para estado

Validação: [Zod](https://github.com/colinhacks/zod) schemas compartilhados

> Decisões arquiteturais detalhadas estão documentadas em [docs/architecture/decisions/](docs/architecture/decisions/)

## Estrutura do Projeto

```
yellowipe/
├── apps/
│   ├── client/          # Frontend React
│   └── server/          # Backend Node.js
├── packages/
│   └── schemas/         # Schemas Zod compartilhados
└── package.json         # Configuração do monorepo
```

## Configuração e Execução

### Pré-requisitos
- Node.js >= 18
- PostgreSQL
- pnpm

### Instalação

```bash
# Instalar dependências
pnpm install

# Configurar banco de dados (PostgreSQL)
# Copie .env.example para .env.local no diretório apps/server/
# Configure as variáveis de ambiente do banco

# Executar migrações do banco
cd apps/server
npx prisma migrate dev
```

### Desenvolvimento

```bash
# Executar todos os serviços
pnpm dev

# Ou executar individualmente:
pnpm run dev --filter=@yellowipe/server  # Backend
pnpm run dev --filter=@yellowipe/client  # Frontend
```

### Build

```bash
# Build de todos os pacotes
pnpm build
```

### Testes

```bash
# Executar testes do backend
cd apps/server
pnpm test

# Executar testes em modo watch
pnpm test:watch
```

## Deploy

Backend (AWS Lambda):
```bash
cd apps/server
pnpm deploy:sls:dev   # desenvolvimento
pnpm deploy:sls       # produção
```

Frontend (Netlify):
```bash
cd apps/client
pnpm deploy:dev       # desenvolvimento
pnpm deploy           # produção
```