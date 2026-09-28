# Flowboard — Especificação do Projeto

## 1. Visão geral

**Flowboard** é uma aplicação web de gestão de trabalho baseada em metodologias ágeis, inspirada em ferramentas como Jira e Linear.

O sistema permitirá que usuários criem contas, autentiquem-se, participem de múltiplos workspaces, gerenciem membros e permissões e, dentro de cada workspace, criem e acompanhem tickets de trabalho.

O projeto tem finalidade acadêmica e deve demonstrar não apenas funcionalidade, mas também boas práticas de engenharia de software, incluindo:

- frontend e backend separados dentro de um monorepo;
- banco de dados relacional;
- autenticação e autorização;
- código modular;
- testes automatizados;
- refatoração documentada;
- observabilidade;
- documentação técnica;
- uso estratégico de IA como ferramenta de desenvolvimento;
- agentes, skills, regras e comandos customizados para auxiliar a implementação.

A IA **não é uma funcionalidade do produto**. Ela será utilizada como copilot durante o processo de desenvolvimento, testes, revisão, documentação e refatoração.

---

## 2. Objetivo do produto

O Flowboard deve permitir que equipes organizem trabalho em workspaces.

Cada workspace possuirá membros com diferentes níveis de permissão e um dashboard próprio onde serão criados e gerenciados tickets.

O fluxo inicial do produto será:

1. usuário acessa a aplicação;
2. realiza login ou cria uma nova conta;
3. ao criar uma conta, é autenticado automaticamente;
4. acessa a página `My Workspaces`;
5. visualiza todos os workspaces dos quais participa;
6. usuários administradores podem editar o workspace e seus membros;
7. usuários podem sair de workspaces;
8. alterações relevantes em membros geram notificações;
9. ao acessar `/workspace/:id`, o usuário entra no dashboard daquele workspace;
10. dentro do workspace, tickets podem ser criados e gerenciados.

---

## 3. Escopo acadêmico

O projeto deve demonstrar os seguintes itens.

### Funcionalidade

- aplicação funcional;
- autenticação;
- autorização;
- workspaces;
- gerenciamento de membros;
- notificações;
- tickets;
- persistência em PostgreSQL.

### Engenharia

- monorepo;
- arquitetura modular;
- separação entre frontend, backend e banco;
- migrations versionadas;
- validação de dados;
- tratamento consistente de erros;
- regras de negócio implementadas no backend.

### Qualidade

- testes unitários;
- testes de integração;
- testes end-to-end;
- linting;
- código limpo;
- refatoração aplicada e documentada.

### Observabilidade

- logs estruturados;
- identificação de requests;
- health check;
- métricas básicas da aplicação;
- logging de erros relevantes.

### Uso de IA

A IA será utilizada durante o desenvolvimento para:

- geração assistida de código;
- revisão de código;
- geração e revisão de testes;
- análise de arquitetura;
- identificação de problemas;
- refatoração;
- documentação;
- criação de agentes experts;
- criação de skills/comandos reutilizáveis.

O histórico de uso relevante da IA deve ser registrado no projeto.

---

## 4. Stack tecnológica

### Frontend

- React
- TypeScript
- Vite
- React Router
- CSS/SCSS ou solução equivalente
- Vitest
- React Testing Library
- Playwright para E2E

### Backend

- Node.js
- TypeScript
- NestJS
- JWT para autenticação
- bcrypt para hash de senha
- Jest para testes

### Banco de dados

- PostgreSQL
- Prisma ORM
- Prisma Migrate

### Infraestrutura local

- Docker
- Docker Compose

O PostgreSQL poderá ser executado localmente por Docker Compose para tornar o ambiente reproduzível.

### Gerenciamento do monorepo

Preferencialmente:

- pnpm
- pnpm workspaces

---

## 5. Estrutura inicial do repositório

```text
flowboard/
├── apps/
│   ├── frontend/
│   └── backend/
│
├── packages/
│   └── shared/
│
├── database/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── seeds/
│
├── docs/
│   ├── architecture/
│   ├── decisions/
│   ├── ai-usage/
│   ├── refactoring/
│   └── observability/
│
├── .ai/
│   ├── agents/
│   ├── skills/
│   └── rules/
│
├── scripts/
├── infra/
├── .gitignore
├── .env.example
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## 6. Identidade visual

Paleta base do Flowboard:

```scss
$gunmetal: #474448ff;
$shadow-grey: #2d232eff;
$bone: #e0ddcfff;
$taupe-grey: #534b52ff;
$parchment: #f1f0eaff;
```

Uso sugerido:

- `shadow-grey`: fundos mais escuros;
- `gunmetal`: superfícies secundárias;
- `taupe-grey`: bordas, elementos intermediários e estados neutros;
- `bone`: textos ou superfícies claras;
- `parchment`: fundo principal claro.

A aplicação deve manter contraste adequado e consistência visual.

---

# 7. Autenticação

## 7.1 Cadastro

Rota frontend:

```text
/register
```

Campos:

- nome;
- sobrenome;
- email;
- senha;
- repetir senha.

Exemplo:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password",
  "passwordConfirmation": "password"
}
```

### Regras

- todos os campos são obrigatórios;
- o email deve possuir formato válido;
- o email deve ser normalizado antes da persistência;
- emails devem ser tratados de forma case-insensitive;
- `password` e `passwordConfirmation` devem ser iguais;
- a senha deve cumprir a política mínima definida pelo projeto;
- o email não pode estar associado a outro usuário;
- a senha nunca pode ser persistida em texto puro.

Antes de salvar:

```text
password
   ↓
bcrypt
   ↓
passwordHash
```

A tabela `User` deve possuir uma constraint `UNIQUE` para email.

A checagem no código não substitui a constraint no banco.

### Email já existente

Caso o email já esteja sendo utilizado:

```http
409 Conflict
```

Resposta:

```json
{
  "message": "Email is already in use."
}
```

### Cadastro realizado com sucesso

Ao concluir o cadastro:

1. usuário é persistido;
2. backend gera JWT;
3. token é retornado ao frontend;
4. frontend salva o token em `sessionStorage`;
5. usuário é considerado autenticado;
6. usuário é redirecionado para `/workspaces`.

Chave utilizada:

```text
token
```

Exemplo:

```ts
sessionStorage.setItem("token", token);
```

---

## 7.2 Login

Rota frontend:

```text
/login
```

Campos:

- email;
- senha.

Endpoint:

```http
POST /auth/login
```

Fluxo:

```text
email + senha
      ↓
normalização do email
      ↓
busca do usuário
      ↓
bcrypt.compare()
      ↓
gera JWT
      ↓
retorna token + usuário
```

Para email inexistente ou senha incorreta, a resposta deve ser genérica:

```http
401 Unauthorized
```

```json
{
  "message": "Email or password is incorrect."
}
```

O sistema não deve revelar se determinado email existe ou não durante o login.

---

## 7.3 JWT

O JWT deve identificar o usuário, mas não deve ser utilizado como fonte de verdade para permissões mutáveis.

Payload inicial sugerido:

```json
{
  "sub": "user-id",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

Também existirão claims padrão como:

- `iat`;
- `exp`.

O token deve ser assinado com segredo configurado por variável de ambiente.

Exemplo:

```text
JWT_SECRET
```

### O token não deve armazenar

- lista de workspaces;
- roles de workspaces;
- permissões dinâmicas.

Esses dados devem ser consultados no banco sempre que forem necessários para autorização.

---

## 7.4 Persistência do token

No frontend:

```text
sessionStorage["token"]
```

O token deve ser enviado em requests autenticados:

```http
Authorization: Bearer <token>
```

O backend deve:

1. extrair o token;
2. verificar a assinatura;
3. verificar a expiração;
4. recuperar a identidade do usuário;
5. continuar a request somente se o token for válido.

### Resposta 401

Caso a API retorne:

```http
401 Unauthorized
```

o frontend deve:

1. remover `sessionStorage["token"]`;
2. limpar o estado de autenticação;
3. redirecionar para `/login`.

---

# 8. Página inicial autenticada

Rota:

```text
/workspaces
```

A página utilizará um layout autenticado com navbar compartilhada.

Estrutura conceitual:

```text
AppLayout
├── Navbar
│   ├── Logo
│   ├── NotificationButton
│   └── UserMenu
└── PageContent
```

---

# 9. Navbar

## 9.1 Logo

No extremo esquerdo haverá a logo do Flowboard.

Enquanto a identidade visual definitiva não existir, será utilizada uma imagem ou placeholder.

---

## 9.2 Notificações

À direita haverá um ícone de notificações.

Ao clicar:

```text
/notifications
```

Se houver pelo menos uma notificação não lida, o ícone exibirá um indicador visual, inicialmente uma pequena bolinha vermelha.

---

## 9.3 Menu do usuário

No extremo direito:

- ícone circular com as iniciais;
- nome;
- sobrenome.

Exemplo:

```text
JD John Doe
```

Ao clicar, um dropdown será exibido:

```text
Profile
Log out
```

### Profile

Redireciona para:

```text
/profile
```

### Log out

O logout no frontend deve:

1. remover o token do `sessionStorage`;
2. limpar o estado local do usuário;
3. redirecionar para `/login`.

---

# 10. My Workspaces

A página `/workspaces` exibirá:

```text
My Workspaces
```

Cada workspace será apresentado separadamente.

Exemplo:

```text
Flowboard Development
Admin                                      Edit    Leave
```

ou:

```text
University Project
Employee                                          Leave
```

Cada card deverá exibir:

- nome do workspace;
- role atual do usuário;
- botão `Edit`, quando permitido;
- botão `Leave`.

---

# 11. Roles

Inicialmente existirão duas roles:

```text
ADMIN
EMPLOYEE
```

## ADMIN

Pode:

- acessar o workspace;
- editar nome do workspace;
- adicionar membros;
- remover membros;
- alterar roles;
- criar e gerenciar tickets;
- sair do workspace, desde que não seja o último administrador.

## EMPLOYEE

Pode:

- acessar o workspace;
- trabalhar com tickets conforme permissões funcionais;
- sair do workspace;
- não pode gerenciar membros;
- não pode editar configurações administrativas do workspace.

---

# 12. Autorização

Ocultar elementos no frontend não é considerado segurança.

Exemplo:

```text
Frontend:
EMPLOYEE → botão Edit não aparece
```

O backend também deve verificar a autorização:

```text
PATCH /workspaces/:id
       ↓
JWT → userId
       ↓
WorkspaceMember
       ↓
role == ADMIN?
```

Caso o usuário esteja autenticado, mas não possua permissão:

```http
403 Forbidden
```

---

# 13. Criação de workspace

A tela `My Workspaces` deverá possuir uma ação:

```text
Create Workspace
```

Ao criar um workspace:

1. cria-se o registro `Workspace`;
2. o usuário criador é adicionado como membro;
3. sua role inicial é `ADMIN`.

Essas operações devem ser executadas de forma consistente e, preferencialmente, dentro de uma transação de banco.

---

# 14. Edição de workspace

O botão `Edit` estará disponível apenas para administradores.

Ao clicar, será aberto um modal.

O modal permitirá:

- alterar nome do workspace;
- visualizar membros;
- adicionar usuários;
- remover usuários;
- alterar role de membros.

---

# 15. Adição de usuários a workspaces

A adição será baseada em um usuário já cadastrado no Flowboard.

Inicialmente, a busca poderá ocorrer por email.

Exemplo:

```text
Add member

Email: jane@example.com
Role: Employee
```

Regras:

- usuário deve existir;
- usuário não pode já pertencer ao workspace;
- role deve ser válida;
- somente ADMIN pode adicionar membros.

---

# 16. Remoção de usuários

Somente ADMIN pode remover membros.

Quando um usuário é removido:

- `WorkspaceMember` é removido;
- uma notificação é criada para o usuário afetado.

Regra especial:

> Um workspace nunca pode ficar sem pelo menos um administrador.

O último ADMIN:

- não pode ser removido;
- não pode alterar sua própria role para EMPLOYEE;
- não pode sair do workspace.

Tentativas devem retornar:

```http
409 Conflict
```

Exemplo:

```json
{
  "message": "A workspace must have at least one administrator."
}
```

---

# 17. Alteração de roles

Somente ADMIN pode alterar roles.

Possíveis mudanças:

```text
EMPLOYEE → ADMIN
ADMIN → EMPLOYEE
```

Desde que a regra do último administrador seja respeitada.

Alterar uma role deve gerar uma notificação para o usuário afetado.

---

# 18. Saída de workspace

Todo membro terá botão:

```text
Leave
```

Ao clicar, deve ser exibido um modal de confirmação.

Exemplo:

```text
Are you sure you want to leave this workspace?
```

Se confirmado:

- relacionamento `WorkspaceMember` é removido;
- usuário deixa de possuir acesso ao workspace.

A regra do último ADMIN continua válida.

---

# 19. Notificações

Cada notificação pertence a um usuário.

Modelo inicial:

```text
Notification
-----------------------
id
userId
type
title
message
isRead
workspaceId?
actorUserId?
createdAt
```

Tipos iniciais:

```text
WORKSPACE_ADDED
WORKSPACE_REMOVED
WORKSPACE_ROLE_CHANGED
```

Tipos futuros:

```text
TICKET_ASSIGNED
TICKET_UPDATED
TICKET_COMMENTED
```

---

## 19.1 Regras de criação

Notificações só devem ser geradas quando houver uma alteração relevante.

### Adição ao workspace

```text
You were added to workspace "Flowboard Development".
```

### Remoção

```text
You were removed from workspace "Flowboard Development".
```

### Mudança de role

```text
Your role in workspace "Flowboard Development" was changed to Admin.
```

Editar apenas o nome do workspace não deve gerar notificações de alteração de membro.

---

## 19.2 Tela de notificações

Rota:

```text
/notifications
```

A página deve exibir:

- notificações;
- estado lida/não lida;
- data;
- contexto do evento.

Deve existir mecanismo para marcar notificações como lidas.

---

# 20. Workspace Dashboard

Rota:

```text
/workspace/:workspaceId
```

O backend deve sempre verificar se o usuário pertence ao workspace antes de retornar dados.

Caso não pertença:

```http
403 Forbidden
```

O dashboard será a área principal de gestão de trabalho.

---

# 21. Tickets

O primeiro modelo de ticket poderá conter:

```text
Ticket
-----------------------
id
workspaceId
title
description
status
priority
assigneeId?
createdById
createdAt
updatedAt
```

Campos obrigatórios inicialmente:

- título;
- status;
- workspace;
- criador.

Campos opcionais:

- descrição;
- prioridade;
- responsável.

---

## 21.1 Status

Modelo inicial sugerido:

```text
BACKLOG
TODO
IN_PROGRESS
IN_REVIEW
DONE
```

A lista poderá ser evoluída posteriormente para status customizáveis por workspace.

---

## 21.2 Prioridade

Modelo inicial:

```text
LOW
MEDIUM
HIGH
URGENT
```

---

## 21.3 Operações

Usuários autorizados poderão:

- criar ticket;
- visualizar ticket;
- editar ticket;
- alterar status;
- alterar prioridade;
- atribuir responsável;
- remover ticket, conforme política definida.

Funcionalidades futuras podem incluir:

- comentários;
- labels;
- anexos;
- subtasks;
- histórico de atividades;
- sprints;
- estimativas;
- filtros;
- busca;
- board Kanban.

---

# 22. Modelo de dados inicial

## User

```text
id
firstName
lastName
email
passwordHash
createdAt
updatedAt
```

Constraints:

```text
UNIQUE(email)
```

---

## Workspace

```text
id
name
createdAt
updatedAt
```

---

## WorkspaceMember

```text
id
workspaceId
userId
role
createdAt
updatedAt
```

Constraint:

```text
UNIQUE(workspaceId, userId)
```

Relacionamento:

```text
User
  │
  │ N
WorkspaceMember
  │
  │ N
Workspace
```

A role pertence ao relacionamento entre usuário e workspace.

---

## Notification

```text
id
userId
workspaceId?
actorUserId?
type
title
message
isRead
createdAt
```

---

## Ticket

```text
id
workspaceId
title
description?
status
priority?
assigneeId?
createdById
createdAt
updatedAt
```

---

# 23. Banco de dados e migrations

O estado do schema será definido por Prisma.

Estrutura:

```text
database/
└── prisma/
    ├── schema.prisma
    └── migrations/
```

Toda alteração estrutural no banco deve gerar uma nova migration.

Exemplo:

```text
001_initial
002_add_notifications
003_add_ticket_priority
```

Migrations antigas não devem ser alteradas depois de aplicadas.

O objetivo é permitir:

```text
clone repository
      ↓
install dependencies
      ↓
start PostgreSQL
      ↓
run migrations
      ↓
optional seed
      ↓
application ready
```

---

# 24. Seed

O projeto poderá possuir dados de desenvolvimento.

Exemplo:

- usuários;
- workspace de demonstração;
- membros;
- tickets.

Seeds não devem conter credenciais reais.

---

# 25. API

Estrutura inicial sugerida:

```text
/auth
/users
/workspaces
/notifications
/tickets
```

Exemplos:

```http
POST   /auth/register
POST   /auth/login

GET    /users/me

GET    /workspaces
POST   /workspaces
GET    /workspaces/:id
PATCH  /workspaces/:id

POST   /workspaces/:id/members
PATCH  /workspaces/:id/members/:userId
DELETE /workspaces/:id/members/:userId

POST   /workspaces/:id/leave

GET    /notifications
PATCH  /notifications/:id/read

GET    /workspaces/:id/tickets
POST   /workspaces/:id/tickets

GET    /tickets/:id
PATCH  /tickets/:id
DELETE /tickets/:id
```

---

# 26. Códigos HTTP

Padrão inicial:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

Exemplos:

### 400

Dados inválidos.

### 401

Token inexistente, inválido ou expirado.

### 403

Usuário autenticado sem permissão.

### 404

Entidade não encontrada.

### 409

Conflito de regra de negócio, como:

- email já utilizado;
- usuário já membro;
- tentativa de deixar workspace sem administrador.

---

# 27. Validação

Dados externos nunca devem ser considerados confiáveis.

O backend deve validar:

- parâmetros;
- body;
- enums;
- UUIDs;
- email;
- tamanho de campos;
- regras de senha.

NestJS DTOs devem ser utilizados para requests.

A validação do frontend melhora UX, mas não substitui a validação do backend.

---

# 28. Tratamento de erros

A API deve possuir formato consistente para erros.

Exemplo:

```json
{
  "statusCode": 409,
  "message": "Email is already in use.",
  "error": "Conflict"
}
```

Erros internos não devem expor:

- stack traces;
- SQL;
- variáveis de ambiente;
- secrets;
- hashes de senha.

---

# 29. Segurança

Requisitos mínimos:

- senha armazenada somente como hash bcrypt;
- JWT assinado;
- token com expiração;
- secrets somente em variáveis de ambiente;
- `.env` fora do Git;
- `.env.example` versionado;
- validação de inputs;
- autorização implementada no backend;
- queries executadas via ORM;
- nenhuma senha deve aparecer em logs;
- nenhum JWT completo deve aparecer em logs.

---

# 30. Frontend

Rotas iniciais:

```text
/login
/register

/workspaces
/notifications
/profile

/workspace/:workspaceId
```

Estrutura conceitual:

```text
AuthLayout
├── LoginPage
└── RegisterPage

AppLayout
├── Navbar
└── Outlet
    ├── WorkspacesPage
    ├── NotificationsPage
    ├── ProfilePage
    └── WorkspacePage
```

Rotas privadas devem exigir autenticação.

---

# 31. Backend

Estrutura modular esperada no NestJS:

```text
src/
├── auth/
├── users/
├── workspaces/
├── notifications/
├── tickets/
├── common/
└── database/
```

Cada domínio deve possuir responsabilidades bem definidas.

Exemplo:

```text
workspaces/
├── workspace.controller.ts
├── workspace.service.ts
├── workspace.repository.ts
├── dto/
└── guards/
```

A estrutura final poderá evoluir conforme a necessidade.

---

# 32. Observabilidade

O projeto deve possuir observabilidade suficiente para diagnóstico.

## Logs estruturados

Exemplo:

```json
{
  "level": "info",
  "requestId": "d21e...",
  "method": "PATCH",
  "path": "/workspaces/123",
  "statusCode": 200,
  "durationMs": 42
}
```

---

## Request ID

Cada request deve possuir um identificador.

Esse identificador deverá ser propagado pelos logs relacionados à request.

---

## Health check

Endpoint:

```http
GET /health
```

Resposta esperada:

```json
{
  "status": "ok"
}
```

Idealmente deverá validar também conectividade básica com o banco.

---

## Eventos relevantes

Devem existir logs para eventos como:

- falha de autenticação;
- criação de workspace;
- alteração administrativa;
- erros inesperados;
- falhas de acesso ao banco.

Dados sensíveis não devem ser registrados.

---

# 33. Testes

O projeto deverá possuir três níveis principais de teste.

## 33.1 Unitários

Testam regras isoladas.

Exemplos:

- autenticação;
- validação de senha;
- regras do último administrador;
- alteração de role;
- regras de notificações;
- criação de workspace.

---

## 33.2 Integração

Testam múltiplas camadas.

Exemplos:

```text
HTTP
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
PostgreSQL de teste
```

Casos:

- cadastro;
- login;
- criação de workspace;
- adição de membro;
- alteração de role;
- criação de ticket.

---

## 33.3 End-to-end

Playwright deverá testar fluxos reais pelo navegador.

Fluxo principal sugerido:

```text
Register
   ↓
Automatic login
   ↓
Create workspace
   ↓
Open workspace
   ↓
Create ticket
   ↓
Update ticket
```

Outro fluxo:

```text
Admin login
   ↓
Add member
   ↓
Member login
   ↓
Notification visible
```

---

# 34. Refatoração

Pelo menos uma refatoração relevante deverá ser documentada.

Formato sugerido:

```text
docs/refactoring/
```

Cada documentação deverá explicar:

1. estado anterior;
2. problema identificado;
3. decisão tomada;
4. alteração realizada;
5. impacto;
6. testes usados para garantir ausência de regressão.

Exemplo:

```text
WorkspaceService inicialmente acumulava:
- atualização do workspace;
- gerenciamento de membros;
- autorização;
- notificações.

Após a refatoração:
- WorkspaceService
- WorkspaceMemberService
- NotificationService
- WorkspaceAuthorizationService
```

A refatoração deve surgir de uma necessidade real do projeto.

---

# 35. Uso de IA no desenvolvimento

A IA é uma ferramenta de engenharia, não uma funcionalidade do Flowboard.

Estrutura:

```text
.ai/
├── agents/
├── skills/
└── rules/
```

---

## 35.1 Agents

Exemplos:

### Backend Expert

Responsabilidades:

- revisar arquitetura NestJS;
- analisar regras de negócio;
- identificar problemas de segurança;
- revisar acesso a banco;
- revisar DTOs e tratamento de erros.

### Frontend Expert

Responsabilidades:

- revisar arquitetura React;
- revisar componentes;
- verificar acessibilidade;
- analisar estado;
- revisar integração com API.

### Testing Expert

Responsabilidades:

- analisar cobertura;
- sugerir edge cases;
- revisar testes unitários;
- revisar integration tests;
- revisar E2E.

### Code Reviewer

Responsabilidades:

- revisar diffs;
- identificar bugs;
- identificar duplicação;
- sugerir simplificação;
- verificar aderência às regras do projeto.

---

## 35.2 Skills

Exemplos:

```text
create-endpoint
create-migration
create-component
create-unit-test
create-integration-test
create-e2e-test
review-pull-request
refactor-module
```

Cada skill deve possuir instruções claras e reproduzíveis.

---

## 35.3 Rules

Regras globais para IA poderão incluir:

- nunca armazenar senha em texto puro;
- nunca colocar autorização somente no frontend;
- sempre gerar migration para mudanças de schema;
- sempre adicionar testes para regras de negócio;
- não alterar migrations antigas;
- nunca colocar secrets no código;
- manter módulos pequenos e coesos;
- manter tipagem estrita.

---

# 36. Histórico de uso de IA

Interações relevantes deverão ser documentadas em:

```text
docs/ai-usage/
```

Não é necessário registrar toda conversa.

Devem ser priorizados exemplos que demonstrem:

- problema apresentado à IA;
- prompt ou instrução utilizada;
- resposta gerada;
- decisão do desenvolvedor;
- alterações realizadas;
- pontos rejeitados ou corrigidos;
- resultado final.

O objetivo é demonstrar entendimento crítico do código gerado.

---

# 37. Documentação

O projeto deverá possuir pelo menos:

```text
README.md
docs/
├── architecture/
├── decisions/
├── ai-usage/
├── refactoring/
└── observability/
```

O `README.md` deverá explicar:

- objetivo;
- stack;
- pré-requisitos;
- configuração local;
- variáveis de ambiente;
- como subir o banco;
- como rodar migrations;
- como iniciar frontend;
- como iniciar backend;
- como executar testes.

---

# 38. Variáveis de ambiente

Exemplo:

```env
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRATION=
PORT=
FRONTEND_URL=
```

O repositório deve possuir:

```text
.env.example
```

mas nunca:

```text
.env
```

com valores reais versionados.

---

# 39. Regras de negócio consolidadas

1. Email de usuário é único.
2. Email deve ser normalizado antes da persistência e comparação.
3. Senhas devem ser armazenadas usando bcrypt.
4. Usuário recém-cadastrado é autenticado automaticamente.
5. JWT identifica o usuário.
6. Permissões de workspace são consultadas no banco.
7. Cada usuário pode participar de múltiplos workspaces.
8. Cada workspace pode possuir múltiplos usuários.
9. Role pertence ao relacionamento `WorkspaceMember`.
10. Cada workspace deve possuir pelo menos um ADMIN.
11. Apenas ADMIN pode gerenciar membros.
12. Apenas ADMIN pode editar configurações administrativas.
13. Usuários não podem acessar workspaces dos quais não participam.
14. Adicionar membro gera notificação.
15. Remover membro gera notificação.
16. Alterar role gera notificação.
17. Alterar apenas o nome do workspace não gera notificação de membro.
18. Um usuário não pode ser adicionado duas vezes ao mesmo workspace.
19. O último ADMIN não pode sair.
20. O último ADMIN não pode ser removido.
21. O último ADMIN não pode ser rebaixado para EMPLOYEE.
22. Toda alteração de schema deve gerar nova migration.
23. Autorização deve existir no backend independentemente da UI.
24. Informações sensíveis não devem aparecer em logs.
25. Requests autenticados devem enviar JWT pelo header `Authorization`.

---

# 40. Fluxos principais

## Cadastro

```text
/register
   ↓
preenche dados
   ↓
frontend valida
   ↓
POST /auth/register
   ↓
backend valida
   ↓
email já existe?
 ┌───────┴────────┐
sim              não
 ↓                ↓
409          bcrypt password
                  ↓
              create user
                  ↓
              generate JWT
                  ↓
             return token
                  ↓
        sessionStorage.token
                  ↓
             /workspaces
```

---

## Login

```text
/login
   ↓
POST /auth/login
   ↓
validate credentials
   ↓
generate JWT
   ↓
sessionStorage.token
   ↓
/workspaces
```

---

## Request autenticada

```text
React
  ↓
Authorization: Bearer <token>
  ↓
NestJS
  ↓
JWT validation
  ↓
user identity
  ↓
business authorization
  ↓
operation
```

---

## Editar membro

```text
ADMIN
  ↓
Edit Workspace
  ↓
change member
  ↓
backend verifies ADMIN
  ↓
validate business rules
  ↓
database transaction
  ├── update membership
  └── create notification
  ↓
success
```

---

# 41. Critérios de aceitação

## Técnica

- aplicação inicializa corretamente;
- frontend comunica com backend;
- backend comunica com PostgreSQL;
- migrations recriam o banco;
- cadastro funciona;
- login funciona;
- JWT protege rotas;
- workspaces funcionam;
- permissões são respeitadas;
- notificações funcionam;
- tickets podem ser criados e atualizados.

## Engenharia

- monorepo organizado;
- código modular;
- responsabilidades separadas;
- migrations versionadas;
- regras de negócio centralizadas no backend;
- configuração local reproduzível.

## Qualidade

- testes unitários implementados;
- testes de integração implementados;
- E2E implementado;
- linting configurado;
- erros tratados consistentemente;
- refatoração documentada.

## Segurança

- bcrypt utilizado para senha;
- senhas não aparecem em logs;
- secrets não são versionados;
- JWT é validado no backend;
- autorização não depende do frontend.

## Observabilidade

- logs estruturados;
- request ID;
- health endpoint;
- erros relevantes observáveis.

## Uso de IA

- agentes customizados;
- skills reutilizáveis;
- regras para geração de código;
- histórico de uso relevante;
- evidências de revisão humana;
- exemplos de código gerado e posteriormente analisado/refatorado.

---

# 42. Fora do escopo inicial

As seguintes funcionalidades não fazem parte obrigatória do MVP:

- integração de IA dentro do produto;
- autenticação social;
- recuperação de senha;
- confirmação de email;
- realtime;
- WebSockets;
- anexos;
- sprints completas;
- métricas avançadas;
- automações;
- integrações externas;
- permissões customizadas;
- status customizados;
- comentários;
- subtasks;
- times dentro de workspaces.

Podem ser adicionadas posteriormente.

---

# 43. Roadmap inicial sugerido

## Fase 1 — Foundation

- criar monorepo;
- configurar frontend;
- configurar backend;
- configurar PostgreSQL;
- configurar Prisma;
- configurar Docker Compose;
- criar migration inicial;
- configurar lint e testes.

## Fase 2 — Auth

- User;
- register;
- bcrypt;
- login;
- JWT;
- rotas privadas;
- logout.

## Fase 3 — Workspaces

- Workspace;
- WorkspaceMember;
- criação;
- listagem;
- autorização;
- gerenciamento de membros;
- regra do último admin.

## Fase 4 — Notifications

- Notification;
- criação por eventos;
- listagem;
- indicador de não lidas;
- marcar como lida.

## Fase 5 — Tickets

- Ticket;
- criação;
- edição;
- status;
- prioridade;
- responsável;
- dashboard inicial.

## Fase 6 — Quality

- unit tests;
- integration tests;
- E2E;
- refatoração;
- documentação da refatoração.

## Fase 7 — Observability

- logs estruturados;
- request ID;
- health check;
- documentação.

## Fase 8 — AI Engineering Evidence

- agents;
- skills;
- rules;
- registro de interações;
- exemplos de revisão/refatoração com IA.

---

# 44. Definição do MVP

O MVP do Flowboard estará completo quando um usuário puder:

1. criar conta;
2. ser autenticado automaticamente;
3. fazer login posteriormente;
4. criar um workspace;
5. visualizar seus workspaces;
6. administrar membros quando possuir role ADMIN;
7. receber notificações de mudanças relevantes;
8. entrar em um workspace;
9. criar tickets;
10. atualizar tickets;
11. utilizar a aplicação com autenticação e autorização funcionando corretamente.

Além disso, o repositório deverá possuir:

- migrations;
- testes;
- documentação;
- observabilidade;
- evidências de uso de IA;
- pelo menos uma refatoração documentada.
