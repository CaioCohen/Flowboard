# Backend — Workspaces e membros

## Escopo e responsabilidade

O domínio de workspaces cria e edita workspaces. O subdomínio de membership representa a participação e a role por workspace, aplica autorização administrativa e preserva o invariante de ao menos um `ADMIN` por workspace. Ele publica fatos de mudança para que notificações sejam criadas na mesma unidade transacional, sem acoplar o caso de uso ao transporte de notificação.

## Contratos HTTP

Todos os endpoints exigem JWT.

| Método | Rota | Regra de acesso |
| --- | --- | --- |
| `GET` | `/workspaces` | Lista somente memberships do solicitante. |
| `POST` | `/workspaces` | Qualquer autenticado; criador torna-se `ADMIN`. |
| `GET` | `/workspaces/:id` | Somente membro. |
| `PATCH` | `/workspaces/:id` | Somente `ADMIN`; altera nome. |
| `POST` | `/workspaces/:id/members` | Somente `ADMIN`; adiciona usuário existente. |
| `PATCH` | `/workspaces/:id/members/:userId` | Somente `ADMIN`; altera role. |
| `DELETE` | `/workspaces/:id/members/:userId` | Somente `ADMIN`; remove membro. |
| `POST` | `/workspaces/:id/leave` | O próprio membro deixa o workspace. |

DTOs devem validar UUIDs, nome, email do membro e o enum `ADMIN | EMPLOYEE`. O formato final de paginação/listagem não foi definido no requisito principal; a primeira versão pode retornar a coleção completa, documentando uma futura evolução compatível.

## Modelo e relações

- `Workspace`: `id`, `name`, `createdAt`, `updatedAt`.
- `WorkspaceMember`: `id`, `workspaceId`, `userId`, `role`, `createdAt`, `updatedAt`.
- Constraint: `UNIQUE(workspaceId, userId)`.

A role pertence sempre a `WorkspaceMember`, nunca a `User` ou ao JWT.

## Regras de negócio e autorização

- Criar workspace e criar a membership `ADMIN` do criador acontece em uma transação.
- Acesso a workspace, seus membros e seus recursos exige membership atual consultada no banco.
- Apenas `ADMIN` pode editar o workspace, adicionar/remover membros ou trocar roles.
- O usuário adicionado deve existir e não pode ser membro atual.
- Todo workspace mantém pelo menos um `ADMIN`: o último administrador não pode ser removido, sair ou ser rebaixado para `EMPLOYEE`.
- Mudança de nome não cria notificação de membership.
- Adição, remoção e mudança de role criam a notificação apropriada ao membro afetado na mesma transação que a mudança.

## Erros

| Situação | Status |
| --- | --- |
| ID, body ou enum inválido | `400` |
| Sem JWT válido | `401` |
| Não membro ou membro sem role necessária | `403` |
| Workspace ou usuário-alvo inexistente | `404` |
| Usuário já é membro; violação do último administrador | `409` |

Para a última regra de administrador, a resposta é `409` com `A workspace must have at least one administrator.`

## Limites arquiteturais e aceitação

O serviço/caso de uso de membership possui os invariantes e a porta de autorização; o controlador não decide roles. A contagem de administradores e a mutação devem ser protegidas transacionalmente para evitar violação em operações concorrentes. Repositórios escondem Prisma e retornam dados de domínio/DTOs simples.

Aceito quando um criador vira `ADMIN`, membros não acessam workspaces alheios, operações administrativas são bloqueadas para `EMPLOYEE`, duplicidade é recusada e as três operações que poderiam deixar zero administradores retornam `409`.
