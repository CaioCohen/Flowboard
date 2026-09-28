# Infraestrutura: PostgreSQL, Prisma e ciclo de dados

## Objetivo

Operar a persistência relacional de modo reproduzível e evolutivo para usuários, workspaces, membros, notificações e tickets.

## Requisitos

- PostgreSQL é o banco de dados relacional do produto e deve ser disponível por Docker Compose no desenvolvimento local.
- Prisma define o estado do schema em `database/prisma/schema.prisma`; migrations ficam em `database/prisma/migrations/`.
- Toda mudança estrutural deve criar uma nova migration versionada.
- Migrations já aplicadas não devem ser editadas.
- A rotina documentada deve suportar: iniciar PostgreSQL, aplicar migrations e, opcionalmente, executar seed.
- Seeds são exclusivamente dados de desenvolvimento/demonstração e não podem conter credenciais reais.
- Operações de negócio que exigem consistência, como criar workspace e sua associação ADMIN inicial ou alterar membro e criar notificação, devem preservar atomicidade por transação de banco quando aplicável.

## Dados e isolamento

- A URL de conexão deve ser configurada externamente por `DATABASE_URL`.
- Dados de teste, desenvolvimento e futura produção não devem compartilhar a mesma base.
- Constraints do modelo (por exemplo, unicidade de email e de membro por workspace) são parte da proteção de integridade no banco, não apenas validações da aplicação.

## Decisões em aberto

- Versão de PostgreSQL, imagem Docker, persistência de volume e política de reinicialização local.
- Estratégia de provisionamento/migration em ambiente remoto.
- Retenção, anonimização e geração dos dados de seed.

## Critérios de aceite

- Um banco vazio pode ser recriado a partir das migrations versionadas.
- O seed opcional prepara dados demonstrativos sem depender de dados pessoais ou segredos reais.
