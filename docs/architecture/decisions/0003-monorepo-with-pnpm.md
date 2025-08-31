# 3. Adoção de Monorepo com pnpm

Data: 2025-08-29

## Status

Aceito

## Contexto

O projeto Yellowipe/Linx requer um backend (Node.js) e frontend (React) que precisam compartilhar validações e tipos comuns. Diferentes abordagens foram consideradas:

1. Repositórios separados com pacotes npm publicados
2. Monorepo com Yarn Workspaces
3. Monorepo com pnpm Workspaces
4. Submodules do Git

## Decisão

Escolhemos implementar um monorepo utilizando [pnpm Workspaces](https://pnpm.io/workspaces).

## Justificativa

### Compartilhamento de Código

- Schemas compartilhados consistentes entre frontend e backend
- TypeScript e garantia de compatibilidade de tipos em tempo de compilação
- Facilita compartilhamento de lógica comum

### Escalabilidade Futura

- Se o projeto evoluir para arquitetura de microserviços, cada serviço pode compartilhar as mesmas regras de negócio
- Funcionalidades específicas do projeto podem virar queues ou cronjobs
- Cada parte da aplicação pode ter seu próprio ciclo de deploy

### Vantagens do pnpm

- Mais rápido que npm e Yarn para instalação de dependências
- Hard links evitam duplicação de node_modules
- Suporte robusto para monorepos com [exemplos de uso em diversos projetos](https://pnpm.io/workspaces#usage-examples)

## Consequências

### Positivas

- Consistência de dados entre frontend e backend
- Facilita refatorações que afetam múltiplas aplicações
- Deploy e versionamento coordenados
- Reutilização de código maximizada

### Negativas

- Maior complexidade inicial de configuração
- Todos os desenvolvedores precisam ter acesso a todo o código
- Builds podem ser mais lentos em projetos grandes

## Alternativas Consideradas

- Repositórios separados: Rejeitado devido à dificuldade de manter schemas sincronizados
- Yarn Workspaces: Rejeitado em favor da performance superior do pnpm
- Git Submodules: Rejeitado devido à complexidade de gerenciamento
