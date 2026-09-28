# Infraestrutura: configuração e segredos

## Objetivo

Estabelecer um contrato seguro e versionável para configuração por ambiente.

## Requisitos

- Configurações e segredos devem ser fornecidos por variáveis de ambiente.
- O repositório deve versionar `.env.example`, sem valores reais de segredos, e manter arquivos `.env` fora do Git.
- O contrato mínimo definido para o backend contém `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRATION`, `PORT` e `FRONTEND_URL`.
- O segredo de assinatura do JWT deve vir de `JWT_SECRET`; tokens devem ter expiração configurável.
- Erros, logs e respostas da API nunca devem expor variáveis de ambiente, segredos, hashes de senha ou JWTs completos.
- A inicialização deve falhar de modo claro e seguro quando uma configuração obrigatória estiver ausente ou inválida; o formato exato da mensagem é implementação a definir.

## Separação por ambiente

- Desenvolvimento local usa arquivos de ambiente não versionados derivados de `.env.example`.
- Testes devem usar configuração e banco isolados dos dados de desenvolvimento.
- Qualquer ambiente de entrega futura deve injetar segredos pelo mecanismo da plataforma/CI, nunca por arquivos versionados ou imagens.

## Decisões em aberto

- Cofre/provedor de segredos para ambientes remotos.
- Rotação, tamanho mínimo e procedimento de revogação de `JWT_SECRET`.
- Convenção de nomes para variáveis adicionais e estratégia de configuração do frontend em build versus runtime.

## Critérios de aceite

- Nenhum segredo real é necessário para clonar o repositório ou aparece em documentação, logs ou artefatos de build.
- O conjunto mínimo de variáveis e sua finalidade estão documentados no README e em `.env.example`.
