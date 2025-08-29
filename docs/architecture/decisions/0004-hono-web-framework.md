# 4. Escolha do Framework Web Hono

Data: 2025-08-29

## Status

Aceito

## Contexto

Para o backend da aplicação, precisávamos escolher um framework web que atendesse aos seguintes requisitos:

1. Suporte nativo para deploy serverless
2. Compatibilidade com Node.js standalone
3. TypeScript first-class support
4. Leveza e simplicidade para desenvolvimento rápido

## Decisão

Escolhemos o [Hono](https://github.com/honojs/hono) como framework web para o backend.

## Justificativa

### Web Standards

- Baseado em Web Standards e utiliza APIs nativas da web como Request/Response
- Funciona em diferentes runtimes (Node.js, Bun, Deno, Cloudflare Workers)

### Deploy Flexível

- [Suporte nativo AWS Lambda](https://hono.dev/docs/getting-started/aws-lambda): Deploy serverless sem adaptadores
- [Suporte nativo Node.js](https://hono.dev/docs/getting-started/nodejs): Deploy tradicional em servidor
- Zero configuração: Não requer adaptadores ou tem drawbacks explicitos como outras alternativas

### Developer Experience

- Validação integrada: Suporte nativo para Zod via @hono/zod-validator
- Full-featured: Possui uma vasta coleção de funcionalidades built-in como [cors](https://hono.dev/docs/middleware/builtin/cors), [validação JWT](https://hono.dev/docs/middleware/builtin/jwt) e [Request ID](https://hono.dev/docs/middleware/builtin/request-id)

## Consequências

### Positivas

- Justificativa mencionadas acima

### Negativas

- Framework relativamente novo (menor ecossistema que Express)
- Menos recursos educacionais disponíveis
- Possível necessidade de implementar middlewares customizados

## Alternativas Consideradas

### Express.js

- Requer adaptadores como [serverless-express](https://github.com/CodeGenieApp/serverless-express) para deploy serverless
- Pouquíssimas funcionalidades built-in menores

### NestJS

- [Problemas conhecidos de cold start](https://docs.nestjs.com/faq/serverless#cold-start) em ambientes serverless
- Framework muito pesado para o escopo do projeto
- Bundle size significativamente maior
