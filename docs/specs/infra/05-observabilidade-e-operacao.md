# Infraestrutura: observabilidade e operação

## Objetivo

Permitir diagnóstico básico do backend sem registrar dados sensíveis.

## Requisitos

- O backend deve emitir logs estruturados.
- Todo request deve receber ou gerar um `requestId`, que é propagado aos logs relacionados.
- Para requests atendidos, os logs devem permitir ao menos correlacionar nível, request ID, método, caminho, status HTTP e duração em milissegundos.
- Deve existir `GET /health`, retornando estado saudável; idealmente, a checagem inclui conectividade básica com PostgreSQL.
- Devem ser registrados eventos relevantes: falha de autenticação, criação de workspace, alteração administrativa, erro inesperado e falha de acesso ao banco.
- Senhas, hashes, JWTs completos, SQL sensível, variáveis de ambiente e segredos não podem constar dos logs.
- O README e `docs/observability/` devem documentar formato de logs, uso do request ID, endpoint de saúde e procedimento básico de diagnóstico.

## Operação local

- O endpoint de saúde deve poder ser consultado no ambiente local com a porta configurada.
- Uma indisponibilidade do banco deve ser observável no health check e/ou logs de erro, sem revelar detalhes sensíveis de conexão.

## Decisões em aberto

- Biblioteca/coletor de logs, retenção, destino centralizado e níveis de log por ambiente.
- Endpoint de readiness separado, métricas de processo/HTTP e alertas: a especificação requer métricas básicas, mas não define quais métricas, formato ou plataforma.
- Política de acesso ao endpoint de saúde em ambiente exposto.

## Critérios de aceite

- Um incidente de request pode ser rastreado por `requestId`.
- Saúde do serviço e falhas de banco podem ser diagnosticadas por interfaces documentadas, sem exposição de dados sensíveis.
