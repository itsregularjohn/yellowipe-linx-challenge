# 6. Arquitetura Backend Lightweight

Data: 2025-08-29

## Status

Aceito

## Contexto

Para o backend da aplicação, era necessário definir o nível de abstração e framework a ser utilizado. As opções consideradas incluíam desde frameworks full-featured até abordagens mais minimalistas.

## Decisão

Optamos por uma arquitetura lightweight, evitando frameworks pesados e focando em deploy serverless otimizado.

## Justificativa

### Performance em Cold Starts
- Frameworks pesados como NestJS têm [problemas conhecidos de cold start](https://docs.nestjs.com/faq/serverless#cold-start)
- Inicialização rápida é crítica para funções serverless
- Bundle size menor resulta em cold starts mais rápidos

### Deploy Serverless Nativo
- Express.js requer adaptadores como [serverless-express](https://github.com/CodeGenieApp/serverless-express)
- Adaptadores adicionam overhead e complexidade
- Hono oferece suporte nativo para múltiplos ambientes de deploy

### Flexibilidade de Deploy
- Mesmo código funciona em Node.js standalone
- Deploy serverless (AWS Lambda) sem modificações
- Possibilidade futura de deploy em edge computing (Cloudflare Workers)

### Simplicidade
- Menos abstrações desnecessárias
- Controle total sobre o request/response cycle
- Facilita debugging e manutenção

## Consequências

### Positivas
- Cold starts extremamente rápidos
- Deploy flexível entre diferentes ambientes
- Bundle size otimizado
- Performance superior em ambientes serverless
- Controle granular sobre a aplicação

### Negativas
- Necessidade de implementar algumas abstrações manualmente
- Menos "mágica" comparado a frameworks full-featured
- Pode requerer mais configuração inicial para projetos complexos

## Alternativas Consideradas

### NestJS
- Rejeitado: Cold start lento devido ao sistema de DI e decorators
- Overhead significativo para o escopo do projeto
- Complexidade desnecessária

### Express.js com Serverless Framework
- Rejeitado: Requer serverless-express ou similar
- Cold start subótimo
- Menos flexibilidade para diferentes runtimes