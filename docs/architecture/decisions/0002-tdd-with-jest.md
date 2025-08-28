# 2. Usar TDD com Jest para testes HTTP

Data: 28/08/2025

## Status

Aceito

## Contexto

Precisamos de uma estratégia de testes para garantir a qualidade do código e facilitar refatorações futuras. O backend da aplicação expõe uma API REST que precisa ser testada de forma confiável e eficiente.

## Decisão

Adotaremos Test-Driven Development (TDD) usando Jest como framework de testes para testes HTTP da nossa API REST.

### Detalhes da implementação:

- Jest como test runner e assertion library
- Testes no nível HTTP usando fetch nativo do Node.js
- Estrutura de testes em `apps/server/src/__tests__/`
- Watch mode para desenvolvimento iterativo (`jest --watch`)
- TypeScript com ts-jest para suporte completo ao TypeScript

### Padrões estabelecidos:

- Testes organizados por módulo/funcionalidade (ex: `auth.test.ts`)
- Setup/teardown de dados de teste usando Prisma
- Validação de status codes HTTP apropriados (409, 401, 200, etc.)
- Testes de fluxos completos (signup → login → protected routes)

## Consequências

### Positivas:
- Qualidade de código: TDD força design mais limpo e testável
- Confiança: Testes HTTP garantem que a API funciona end-to-end
- Refatoração segura: Mudanças podem ser feitas com confiança
- Documentação viva: Testes servem como especificação da API
- Desenvolvimento iterativo: Watch mode acelera o ciclo de feedback

### Negativas:
- Tempo inicial: TDD pode ser mais lento no início
- Manutenção: Testes precisam ser mantidos junto com o código
- Setup complexo: Banco de dados de teste e limpeza de dados

### Mitigações:
- Jest configurado com timeout adequado (10s) para operações de banco
- Setup/teardown automatizado para limpeza de dados de teste
- Foco em testes de integração HTTP ao invés de unit tests isolados