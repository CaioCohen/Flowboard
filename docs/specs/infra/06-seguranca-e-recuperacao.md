# Infraestrutura: segurança e backup/recuperação

## Objetivo

Converter os requisitos de segurança do MVP em controles operacionais e registrar explicitamente os limites ainda não definidos.

## Requisitos de segurança

- Senhas são persistidas somente como hashes bcrypt; nunca em texto puro.
- JWTs são assinados, expiram e são validados no backend. O token apenas identifica o usuário; permissões mutáveis de workspace são consultadas no banco.
- Requests autenticados utilizam `Authorization: Bearer <token>`.
- Validação de entrada e autorização devem ser executadas pelo backend; ocultar recursos no frontend não substitui esses controles.
- Consultas devem passar pelo ORM e respostas de erro internas não podem expor stack trace, SQL, configuração, secrets ou hashes.
- Arquivos `.env` e credenciais reais devem ser excluídos do controle de versão; somente exemplos sem valores reais são versionados.
- Logs devem aplicar a mesma política de não exposição de senhas, tokens e segredos.

## Backup e recuperação

- A especificação principal não exige backup ou recuperação para o ambiente local, nem define um ambiente de produção. Assim, não há política mandatória de backup para o MVP acadêmico.
- Antes de disponibilização persistente/externa, deve ser definida uma política de backup do PostgreSQL, incluindo frequência, retenção, local de armazenamento protegido, acesso restrito e teste periódico de restauração.
- Migrations versionadas permitem reconstruir a estrutura do banco, mas não substituem backup dos dados.
- Um procedimento de recuperação futuro deve definir responsável, ordem de restauração, aplicação de migrations compatíveis e validação por health check, preservando segredos fora de documentação pública.

## Decisões em aberto

- Objetivos de RPO/RTO, criptografia de backup, retenção e responsável operacional.
- TLS, CORS e rate limiting para qualquer ambiente público.
- Política de atualização de dependências/imagens, varredura de vulnerabilidades e resposta a incidentes.

## Critérios de aceite

- Os controles mínimos de segredo, autenticação, autorização e logging podem ser verificados por configuração, testes e revisão.
- Não se afirma possuir recuperação de dados até que uma política de backup e um restore testado sejam implementados e documentados.
