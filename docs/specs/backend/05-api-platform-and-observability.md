# Backend — Plataforma de API, dados e observabilidade

## Escopo e responsabilidade

Este módulo transversal define a borda HTTP, persistência, tratamento uniforme de erros, segurança operacional e diagnóstico. Ele não contém regras de negócio de autenticação, membership ou tickets; fornece adaptadores e políticas compartilhadas para eles.

## Contratos HTTP transversais

- `GET /health` retorna `200` e `{ "status": "ok" }`; idealmente também confirma conectividade básica com o banco.
- A API usa `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409` e `500` conforme os contratos dos domínios.
- Erros seguem uma forma consistente, por exemplo `{ "statusCode": 409, "message": "...", "error": "Conflict" }`.
- Cada request recebe ou gera um `requestId`, devolvido/propagado por convenção de infraestrutura e incluído nos logs associados.

## Dados e migrations

Prisma é a fonte do schema em `database/prisma/schema.prisma`. Cada mudança estrutural cria uma nova migration versionada em `database/prisma/migrations`; migrations aplicadas são imutáveis. Seeds são somente dados de desenvolvimento e não podem conter credenciais reais.

O banco deve assegurar constraints de negócio críticas: unicidade de email normalizado/case-insensitive e `UNIQUE(workspaceId, userId)`. Operações compostas que exigem consistência — criação de workspace + membership inicial e mutação de membership + notificação — executam em transação.

## Segurança e autorização transversal

- DTOs validam todo input externo: parâmetros, UUIDs, emails, tamanhos, enums e senha.
- JWT é validado antes dos controladores protegidos; identidade e permissão mutável são distintas.
- Roles e memberships são consultados no banco em cada decisão de workspace.
- Segredos vêm de variáveis de ambiente; `.env` não é versionado e `.env.example` não contém valores reais.
- ORM é a única via normal de query. Logs não registram senhas, hashes, JWT completo, segredos, SQL de falha ou stack trace ao cliente.

## Observabilidade e falhas

Logs estruturados incluem, quando aplicável, nível, `requestId`, método, caminho, status e duração. Devem registrar falhas de autenticação, criação de workspace, alterações administrativas, falhas de banco e erros inesperados, sanitizando dados sensíveis.

Erros esperados de domínio são mapeados na borda para seus códigos HTTP. Exceções inesperadas são registradas com contexto seguro e retornam `500` genérico. Controladores permanecem finos; filtros/interceptores/middlewares implementam concernes HTTP comuns.

## Arquitetura e aceitação

A composição NestJS fica na borda: controladores, guards, pipes, filtros, interceptores, Prisma e logger são adaptadores. Casos de uso dependem de portas estáveis e dados simples; dependências apontam para dentro e não há ciclos entre domínios. Módulos colaboram por interfaces e eventos/comandos internos, não por acesso direto a detalhes de banco de outro módulo.

Aceito quando migrations recriam o schema, validação bloqueia entrada inválida, erros têm formato consistente, `/health` responde conforme contrato, logs correlacionam requests sem vazar dados sensíveis e transações preservam as invariantes interdomínio.
