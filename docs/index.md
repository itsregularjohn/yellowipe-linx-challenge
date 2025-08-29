# Yellowipe - Documentação

## Visão Geral

Esta documentação contém as decisões arquiteturais e justificativas técnicas do projeto.

## Decisões Arquiteturais (ADRs)

As seguintes Architecture Decision Records documentam as principais escolhas técnicas:

- [ADR-0001: Registro de Decisões Arquiteturais](architecture/decisions/0001-record-architecture-decisions.md)
- [ADR-0002: TDD com Jest](architecture/decisions/0002-tdd-with-jest.md)
- [ADR-0003: Adoção de Monorepo com pnpm](architecture/decisions/0003-monorepo-with-pnpm.md)
- [ADR-0004: Escolha do Framework Web Hono](architecture/decisions/0004-hono-web-framework.md)
- [ADR-0006: Arquitetura Backend Lightweight](architecture/decisions/0006-lightweight-backend-architecture.md)
- [ADR-0005: Adoção do Zod para Validação de Schemas](architecture/decisions/0005-zod-validation-schema.md)

Backend (`apps/server/src/modules/`):

```
modules/
├── core/           # Tipos, contexto, middleware, configuração
├── auth/           # Autenticação (signup, login, JWT)
└── uploads/        # Upload de arquivos S3
```

Frontend (`apps/client/src/modules/`):

```
modules/
├── core/           # Layout, roteamento, componentes base
└── auth/           # Formulários e contexto de autenticação
```

## Funcionalidades Implementadas

- ✅ Sistema de autenticação completo
- ✅ Upload de imagens para S3 com URLs pré-assinadas
- ✅ Validação compartilhada frontend/backend
- ✅ Testes automatizados com cobertura de auth e uploads

## Funcionalidades em Desenvolvimento

- 🚧 Sistema de posts
- 🚧 Sistema de comentários
- 🚧 Sistema de reações/likes

---

Esta documentação é mantida junto ao código para garantir que as decisões técnicas estejam sempre atualizadas e acessíveis à equipe de desenvolvimento.