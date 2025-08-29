# 5. Adoção do Zod para Validação de Schemas

Data: 2025-08-29

## Status

Aceito

## Contexto

O projeto necessita de validação consistente de dados entre frontend e backend, com tipagem estática em TypeScript. Diferentes bibliotecas de validação foram consideradas:

1. Yup
2. Zod
3. Validação manual com TypeScript

## Decisão

Escolhemos Zod como biblioteca principal para validação de schemas e geração de tipos.

## Justificativa

### Adoção na Comunidade

- [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/typescript-sdk): Protocolo da Anthropic utiliza Zod
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs?lang=javascript): SDK oficial suporta Zod
- [tRPC](https://trpc.io/docs/server/validators#with-zod): Framework type-safe utiliza Zod como validador padrão
- Tendência crescente na comunidade TypeScript

### Integração com Ferramentas

- [React Hook Form](https://github.com/react-hook-form/resolvers?tab=readme-ov-file#zod): Integração nativa via `@hookform/resolvers`
- [Hono Validation](https://hono.dev/docs/guides/validation#with-zod): Suporte nativo via `@hono/zod-validator`
- TypeScript: Inferência automática de tipos sem código adicional

### Características Técnicas

- Projetado especificamente para TypeScript
- Validação em tempo de execução com tipos estáticos
- Schemas podem ser compostos e reutilizados
- Mensagens de erro detalhadas e customizáveis

## Consequências

### Positivas

- Validação consistente entre frontend e backend
- Tipos TypeScript gerados automaticamente
- Redução de código boilerplate
- Mensagens de erro padronizadas

### Negativas

- Dependência adicional no bundle
- Possível overhead em schemas muito complexos

## Alternativas Consideradas

### Yup

- Inferência de tipos existe com `yup.InferType` mas é menos robusta
- Menor número de integrações nativas

### Validação Manual

- Muito código boilerplate
- Dificuldades com validações complexas
