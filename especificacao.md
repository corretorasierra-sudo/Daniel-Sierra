# Especificação — CRM Comercial Cartão de Todos Guarabira

## Contexto

Camada interna de gestão comercial da franquia Cartão de Todos Guarabira, complementar
ao sistema oficial da empresa (que não cobre acompanhamento diário de vendedores, metas
e produtividade). Construído para o Daniel Sierra (dono/gestor da franquia).

Escopo desta fase: MVP funcional cobrindo o ciclo completo vendedor → lead → venda →
pós-venda, com importação de planilha para vendas (nunca cadastro manual) e para leads.

## Papéis (roles)

- **ADMIN** — acesso total, cadastra usuários/vendedores, define metas.
- **GERENTE** — visão consolidada da unidade, metas, relatórios, ranking. Sem cadastro
  de vendedores (fica com Admin nesta fase, mas pode ver tudo que Coordenador vê).
- **COORDENADOR** (Coordenador de Vendas) — importa planilhas de leads e de vendas,
  resolve pendências de importação, acompanha vendedores.
- **VENDEDOR** — trabalha os próprios leads (funil), registra atividades, faz o
  acompanhamento pós-venda dos próprios clientes vendidos. Nunca cadastra venda.

## Regra central do negócio

**Vendedor nunca cadastra venda manualmente.** Toda venda entra no sistema via
importação de planilha feita por um Coordenador (ou Admin). O fluxo é:

1. Vendedor trabalha `Lead`s no funil (pré-venda): registra ligações, mensagens,
   WhatsApp, agenda retornos, move etapa.
2. Quando a venda de fato acontece, ela é registrada no sistema oficial da empresa
   (fora do CRM) e aparece na planilha de vendas que o Coordenador baixa e importa
   periodicamente aqui.
3. Na importação, o sistema tenta casar automaticamente o nome do vendedor da planilha
   com um `Vendedor` cadastrado — primeiro por `nomeCompleto` exato/normalizado, depois
   por um alias já aprendido (`VendedorAliasVenda`).
4. Linha que não casa vai para `PendenciaImportacao`. Coordenador/Admin resolve
   manualmente atribuindo o vendedor certo — e essa correção é salva como novo alias,
   então da próxima vez o mesmo nome da planilha casa sozinho.
5. Depois de vendida, o cliente entra no `AcompanhamentoPosVenda` do vendedor
   (checklist: app baixado, consulta marcada, orientações passadas, indicações
   recebidas).

Essa separação existe para dar controle de qualidade sobre os dados de vendas (que
viram comissão e meta) sem tirar do vendedor a agilidade de registrar leads.

## Modelo de dados (visão funcional — ver `prisma/schema.prisma` para o detalhe técnico)

- **User** — conta de login (email + senha com hash), role, vínculo opcional com
  `Vendedor`.
- **Vendedor** — cadastro comercial (nome completo, telefone, ativo/inativo), é o que
  aparece nas metas, vendas e leads.
- **Meta** — meta de vendas por período (mensal/semanal/diária), pode ser da unidade
  (vendedorId nulo) ou de um vendedor específico.
- **Venda** — registro de venda importado. Guarda dedupe por `codigoExterno` (se a
  planilha trouxer) ou pela combinação cliente+telefone+vendedor+data+produto.
- **ImportacaoVenda** / **ImportacaoLead** — histórico de cada importação (quem
  importou, quando, quantos lidos/inseridos/duplicados/erros).
- **PendenciaImportacao** — linha de planilha de venda que não casou com nenhum
  vendedor; guarda a linha original e o motivo, até ser resolvida manualmente.
- **VendedorAliasVenda** — tabela de aprendizado nome-da-planilha → vendedor, criada
  toda vez que uma pendência é resolvida manualmente.
- **Lead** — registro de funil pré-venda (nome, telefone com dedupe, cidade, origem,
  etapa, vendedor responsável, observações, próxima ação).
- **HistoricoEtapaLead** — trilha de auditoria de toda mudança de etapa de um lead.
- **Atividade** — cada contato feito com um lead (ligação, mensagem, WhatsApp, retorno
  agendado, presencial, observação), com resultado e próxima ação.
- **AcompanhamentoPosVenda** — checklist por venda: app baixado, consulta marcada,
  orientações recebidas, indicações recebidas, pendências, próxima ação.

## Telas do MVP (ordem de construção)

1. Login (`/login`) — credenciais email + senha, redireciona por role.
2. `/admin/vendedores` — CRUD de vendedores (Admin).
3. `/coordenador/importar-leads` — upload de planilha (.xlsx/.csv), preview, confirmar
   importação, histórico de importações.
4. `/vendedor/leads` — funil de leads por etapa (lista agrupada), ação rápida para
   registrar atividade e mover etapa.
5. `/coordenador/importar-vendas` — upload de planilha de vendas, matching automático,
   resumo pós-importação (lidos/inseridos/duplicados/pendências).
6. `/coordenador/pendencias` — fila de vendas não casadas, atribuição manual de
   vendedor (gera alias para próximas importações).
7. `/admin/metas` — cadastro de meta da unidade e por vendedor (Admin e Gerente).
8. `/vendedor` (home) — progresso da meta, leads por etapa, retornos agendados para
   hoje, clientes vendidos pendentes de acompanhamento pós-venda.
9. `/vendedor/pos-venda` — checklist por cliente vendido.
10. `/gerente` (home) — totais da unidade, % da meta, projeção de fechamento, ranking
    de vendedores, alertas (abaixo da meta, sem venda no período, leads parados).
11. `/gerente/relatorios` — vendas por vendedor/período, leads por etapa, produtividade
    (contatos por tipo), conversão por vendedor, ranking. Acessível por Gerente e Admin.

## Cálculos derivados (`src/lib/metricas.ts`)

Funções puras, server-side, reutilizadas pelas duas homes e pelos relatórios — nenhuma
lógica de negócio duplicada em página:

- `calcularProgressoMeta` — realizado vs meta, percentual.
- `calcularProjecaoFechamento` — com base no ritmo atual de vendas no período, projeta
  o total ao final do período.
- `calcularMediaNecessariaPorDia` — quantas vendas por dia útil restante são
  necessárias para bater a meta.
- `calcularDiasUteisRestantes` — dias úteis (seg-sáb) restantes no período da meta.
- `calcularRanking` — ordena vendedores por realizado/meta.

## Fora de escopo nesta fase

Inadimplência, retenção/churn, financeiro completo, atendimento ao cliente, automação
de marketing, multi-franquia (a arquitetura evita decisões que impeçam isso depois —
por exemplo, nenhuma tabela pressupõe unidade única além de não ter `franquiaId`
ainda).

## Verificação de aceite

- `npx prisma generate` roda limpo.
- Seed cria 1 Admin, 1 Gerente, 1 Coordenador, 2 Vendedores, metas do mês corrente,
  leads de exemplo em etapas variadas, 1-2 vendas com acompanhamento pós-venda.
- Fluxo manual: importar planilha de leads → leads aparecem no funil do vendedor certo
  → registrar uma atividade → importar planilha de vendas com um nome de vendedor
  propositalmente errado → cai em pendências → corrigir manualmente → venda aparece na
  home do vendedor e nos indicadores de meta, e o alias fica salvo.
- `npm run dev` sobe local, telas de Vendedor e Gerente carregam com dados do seed.
