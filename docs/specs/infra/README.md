# Infraestrutura — índice de subespecificações

Estas especificações de infraestrutura derivam de `docs/specs/flowboard-spec.md`. Elas definem o que deve ser entregue para o MVP, sem prescrever código de aplicação nem introduzir requisitos de produto novos.

| Documento | Responsabilidade |
| --- | --- |
| [01-ambiente-local-e-runtime.md](01-ambiente-local-e-runtime.md) | Execução local reproduzível e fronteiras de runtime |
| [02-configuracao-e-secrets.md](02-configuracao-e-secrets.md) | Contrato de configuração e manejo de segredos |
| [03-postgresql-prisma-e-dados.md](03-postgresql-prisma-e-dados.md) | Serviço PostgreSQL, migrations e seed de desenvolvimento |
| [04-ci-cd-e-qualidade.md](04-ci-cd-e-qualidade.md) | Verificações automatizadas e decisões de entrega |
| [05-observabilidade-e-operacao.md](05-observabilidade-e-operacao.md) | Logs, request IDs, health check e diagnóstico |
| [06-seguranca-e-recuperacao.md](06-seguranca-e-recuperacao.md) | Controles operacionais, backup e recuperação |

Itens marcados como **decisão em aberto** não foram definidos pela especificação principal e devem ser resolvidos antes de uma implantação fora do ambiente local.
