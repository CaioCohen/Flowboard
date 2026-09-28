# Infraestrutura: ambiente local e runtime

## Objetivo

Disponibilizar um ambiente local reproduzível para o monorepo Flowboard, composto por frontend React/Vite, backend NestJS e PostgreSQL, sem exigir serviços externos.

## Requisitos

- O repositório deve manter frontend e backend como aplicações separadas no monorepo, com pacotes compartilhados quando necessários.
- O gerenciador preferencial é `pnpm` com workspaces; as instruções de inicialização devem indicar os pré-requisitos e os comandos necessários.
- PostgreSQL deve poder ser iniciado localmente por Docker Compose.
- Após clonar o repositório, instalar dependências, iniciar PostgreSQL e aplicar migrations, a aplicação deve estar apta para uso; o seed é opcional.
- Frontend, backend e banco devem ter portas/configurações separáveis por ambiente, sem valores sensíveis embutidos.
- A documentação de operação local deve cobrir: configuração a partir de `.env.example`, subida do banco, migrations, seed opcional, frontend, backend e testes.

## Limites de responsabilidade

- Docker Compose é requisito explícito para o PostgreSQL local. A conteinerização do frontend e do backend é uma **decisão em aberto**.
- A especificação não exige hospedagem em nuvem, orquestrador, balanceador, CDN ou ambiente público.
- O ambiente de testes pode usar uma instância PostgreSQL distinta da de desenvolvimento; o mecanismo de isolamento é uma **decisão em aberto**.

## Critérios de aceite

- Uma pessoa nova consegue preparar o ambiente a partir do README e do `.env.example`, sem receber segredos reais.
- A conexão backend–PostgreSQL e a comunicação frontend–backend podem ser verificadas localmente.
