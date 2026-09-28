# Backend — Notificações

## Escopo e responsabilidade

O módulo de notificações persiste e apresenta notificações pertencentes ao usuário. Ele recebe comandos/fatos internos originados de membership; não recalcula a autorização nem executa alterações de membership.

## Contratos HTTP

Todos os endpoints exigem JWT.

| Método | Rota | Resultado |
| --- | --- | --- |
| `GET` | `/notifications` | Lista as notificações pertencentes ao solicitante, com estado de leitura e contexto. |
| `PATCH` | `/notifications/:id/read` | Marca como lida uma notificação pertencente ao solicitante. |

O formato da lista inclui `id`, `type`, `title`, `message`, `isRead`, `workspaceId`, `actorUserId` e `createdAt`. A paginação ainda não foi definida no escopo principal; a primeira implementação deve manter o contrato preparado para acrescentar metadados sem quebrar consumidores.

## Modelo e dados

`Notification`: `id`, `userId`, `workspaceId?`, `actorUserId?`, `type`, `title`, `message`, `isRead`, `createdAt`.

Tipos atuais: `WORKSPACE_ADDED`, `WORKSPACE_REMOVED`, `WORKSPACE_ROLE_CHANGED`. Tipos futuros de ticket não integram o MVP e não devem ser emitidos antecipadamente.

## Regras e autorização

- Somente o dono pode listar ou marcar sua notificação como lida.
- Adição gera a mensagem de inclusão no workspace; remoção gera a mensagem de remoção; mudança de role informa a nova role.
- Somente mudanças efetivas geram eventos: repetir o valor existente não produz notificação.
- Editar apenas o nome de workspace não produz notificação de membership.
- A mutação de membership e a criação da respectiva notificação são atômicas.
- `PATCH .../read` é idempotente: marcar uma notificação já lida mantém o estado lido e pode retornar `200` com o recurso atualizado.

## Erros

| Situação | Status |
| --- | --- |
| ID inválido | `400` |
| Sem JWT válido | `401` |
| Notificação de outro usuário | `403` |
| Notificação inexistente | `404` |

## Limites arquiteturais e aceitação

O módulo expõe uma porta interna para criar notificações, chamada pelo caso de uso de membership dentro de sua transação. Controladores apenas validam e encaminham requests. Atores e destinatários são IDs, sem confiança em valores informados pelo cliente.

Aceito quando o usuário vê apenas as próprias notificações, pode marcar apenas as próprias como lidas, e adição/remoção/troca real de role criam exatamente uma notificação contextual sem permitir estado parcialmente persistido.
