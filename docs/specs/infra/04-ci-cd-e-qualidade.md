# Infraestrutura: CI/CD e qualidade automatizada

## Objetivo

Definir a automação mínima para impedir regressões e manter o projeto apto a entrega, respeitando os três níveis de teste previstos.

## Requisitos de integração contínua

- Cada alteração candidata à integração deve executar instalação determinística das dependências do monorepo e verificações de linting.
- Devem ser executados testes unitários do frontend e backend, testes de integração contra PostgreSQL de teste e E2E com Playwright.
- A automação deve validar que migrations podem ser aplicadas em banco vazio; alterações de schema devem incluir migration nova.
- Falhas em lint, testes ou migrations devem impedir a aprovação automatizada da alteração.
- Logs e relatórios de teste devem evitar segredos, senhas e JWTs completos.

## Entrega contínua

- A especificação principal exige configuração local reproduzível, mas não define provedor, ambientes remotos, artefatos, estratégia de deploy ou gatilho de publicação.
- Portanto, uma pipeline de deploy e promoção entre ambientes é uma **decisão em aberto**, a ser especificada antes de publicação externa.
- Caso seja adotada, a pipeline deve aplicar migrations de forma controlada, injetar segredos externamente e disponibilizar uma verificação de saúde após a entrega.

## Decisões em aberto

- Plataforma de CI, cache de dependências, matriz de versões Node/pnpm e armazenamento de relatórios.
- Estratégia de E2E (servidores locais, containers ou ambiente efêmero).
- Política de branches, revisão, aprovação e rollback de deploy.

## Critérios de aceite

- As verificações de qualidade requeridas podem ser executadas de forma repetível sem estado manual prévio além das variáveis documentadas.
- A documentação descreve como reproduzir localmente cada categoria de validação da pipeline.
