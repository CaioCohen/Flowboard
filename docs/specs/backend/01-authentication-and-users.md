# Backend — Autenticação e usuários

## Escopo e responsabilidade

O módulo `auth` autentica credenciais e emite JWTs. O módulo `users` mantém a identidade do usuário e expõe o perfil autenticado. A autorização de domínio não pertence ao JWT nem a estes módulos; ela consulta a associação de workspace no módulo correspondente.

## Contratos HTTP

| Método | Rota | Autenticação | Resultado |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Pública | Cria usuário e retorna token + usuário seguro. |
| `POST` | `/auth/login` | Pública | Valida credenciais e retorna token + usuário seguro. |
| `GET` | `/users/me` | JWT | Retorna o usuário autenticado. |

`POST /auth/register` recebe `firstName`, `lastName`, `email`, `password` e `passwordConfirmation`. `POST /auth/login` recebe `email` e `password`. Respostas de autenticação nunca incluem `passwordHash`.

O token contém somente `sub`, `email`, `firstName`, `lastName`, `iat` e `exp`; é assinado com `JWT_SECRET` e usa a expiração configurada. Requests protegidas usam `Authorization: Bearer <token>`.

## Modelo e persistência

`User`: `id`, `firstName`, `lastName`, `email`, `passwordHash`, `createdAt`, `updatedAt`.

`email` é normalizado antes de consulta e persistência. Deve haver unicidade no banco para o valor normalizado/case-insensitive, além da verificação de aplicação. `passwordHash` é gerado exclusivamente por bcrypt; senha e confirmação não são persistidas.

## Regras e autorização

- Todos os campos de cadastro são obrigatórios; email, tamanhos e política mínima de senha são validados no DTO.
- `password` e `passwordConfirmation` devem coincidir.
- Cadastro bem-sucedido cria o usuário e emite JWT no mesmo fluxo.
- Login normaliza o email e compara a senha com bcrypt.
- Email inexistente e senha inválida retornam a mesma resposta para não enumerar contas.
- O guard JWT valida presença, assinatura e expiração, e disponibiliza a identidade autenticada à camada de caso de uso.

## Erros

| Situação | Status | Mensagem/forma |
| --- | --- | --- |
| DTO inválido | `400` | Formato consistente de erro de validação. |
| Email já utilizado | `409` | `Email is already in use.` |
| Credenciais inválidas | `401` | `Email or password is incorrect.` |
| Token ausente, inválido ou expirado | `401` | Erro autenticado consistente, sem detalhes sensíveis. |
| Usuário autenticado não encontrado | `401` | Sessão não é mais válida. |

Erros internos não expõem hashes, SQL, stack trace, segredos ou JWTs completos.

## Limites arquiteturais e aceitação

Controladores adaptam HTTP e DTOs; casos de uso dependem de portas de repositório, hasher e emissor/verificador de token. Prisma, bcrypt, NestJS e JWT permanecem nos adaptadores externos. O módulo deve aceitar testes unitários de normalização, conflito, credenciais e emissão; e integração para cadastro, login e `/users/me`.

Aceito quando cadastro autentica automaticamente, login retorna o mesmo formato seguro, e toda rota protegida rejeita tokens inválidos antes de executar o caso de uso.
