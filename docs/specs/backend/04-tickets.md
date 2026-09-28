# Backend — Tickets

## Escopo e responsabilidade

O módulo de tickets administra itens de trabalho dentro de um workspace. Ele depende da porta de membership para validar acesso ao workspace e mantém integridade entre ticket, criador e responsável.

## Contratos HTTP

Todos os endpoints exigem JWT.

| Método | Rota | Resultado |
| --- | --- | --- |
| `GET` | `/workspaces/:id/tickets` | Lista tickets de workspace acessível. |
| `POST` | `/workspaces/:id/tickets` | Cria ticket no workspace acessível. |
| `GET` | `/tickets/:id` | Retorna ticket se o solicitante pertence ao seu workspace. |
| `PATCH` | `/tickets/:id` | Atualiza campos permitidos de ticket acessível. |
| `DELETE` | `/tickets/:id` | Remove ticket conforme política de remoção definida. |

Criação requer `title` e `status`; `description`, `priority` e `assigneeId` são opcionais. Atualização aceita subconjunto validado desses campos. Enums iniciais: status `BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`; prioridade `LOW`, `MEDIUM`, `HIGH`, `URGENT`.

## Modelo e relações

`Ticket`: `id`, `workspaceId`, `title`, `description?`, `status`, `priority?`, `assigneeId?`, `createdById`, `createdAt`, `updatedAt`.

`createdById` é derivado do JWT no servidor. Se `assigneeId` for informado, deve identificar usuário que pertence ao mesmo workspace. O ticket não pode ser movido entre workspaces por `PATCH`.

## Regras e autorização

- Qualquer leitura exige membership atual do workspace.
- Criação e atualização exigem a permissão funcional de tickets do membro. O requisito base exige que `ADMIN` possa gerenciar tickets, mas não define de forma conclusiva se `EMPLOYEE` pode criar, editar ou remover; isso deve ser decidido antes da implementação em uma política explícita/ADR, sem ser inferido do frontend.
- A política de remoção também está explicitamente pendente no requisito base; até sua definição, `DELETE` não deve ser implementado como permissivo por padrão.
- Status e prioridade devem sempre pertencer aos enums permitidos.
- Funcionalidades futuras (comentários, labels, anexos, subtasks, histórico, sprints, estimativas, filtros, busca e Kanban) permanecem fora deste contrato MVP.

## Erros

| Situação | Status |
| --- | --- |
| DTO, UUID ou enum inválido | `400` |
| Sem JWT válido | `401` |
| Sem membership ou sem permissão definida | `403` |
| Workspace, ticket ou responsável inexistente | `404` |
| Responsável não pertence ao workspace | `409` |

## Limites arquiteturais e aceitação

O caso de uso de ticket depende de interfaces de repositório e de uma porta de autorização de workspace; não consulta Prisma diretamente. A validação de acesso é aplicada tanto nas rotas aninhadas quanto nas rotas por ID, impedindo enumeração de dados entre workspaces.

Aceito quando um membro autorizado pode criar e atualizar tickets válidos, campos obrigatórios/enums são validados, `createdById` não pode ser forjado, e tickets não podem ser lidos, alterados ou atribuídos fora do workspace.
