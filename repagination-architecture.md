# Arquitetura da repaginação MuFinance

## Princípio

Reproduzir a composição e a densidade visual do `shadcn-fintech` em uma interface de finanças pessoais brasileira, sem copiar seus dados demo, nomes ou fluxos simulados. O MuFinance mantém Next.js 15 App Router, Firebase Auth, Firestore, Server Actions, API Routes e as rotas funcionais existentes.

## Shell compartilhado

A página autenticada usa um layout visual único dentro do dashboard: sidebar de 248px em desktop, área principal com header de 64px, breadcrumb e conteúdo em grid. Em telas intermediárias a sidebar pode recolher para 76px; em mobile vira drawer com scrim e navegação inferior mínima. O item ativo é derivado da rota atual, não fica fixo na visão geral.

## Navegação adaptada

| Grupo da referência | MuFinance |
|---|---|
| Daily | Visão geral, Contas, Lançamentos, Cartões |
| Money | Transferências/P2P, Importar dados |
| Insights | Relatórios, Categorias, Planejamento |
| Preferences | Configurações, Tema |

Itens que ainda não possuem rota dedicada apontam para o fluxo já existente mais próximo ou exibem estado de recurso em breve, sem inventar dados.

## Dashboard

A grade principal seguirá a referência: `Financial Overview` grande à esquerda e patrimônio/cartões à direita; faixa seguinte com movimentação e saúde/orçamento; tabela de lançamentos recentes em largura total. Os componentes terão dados derivados do snapshot normalizado do Firebase. Sem contas, metas, orçamentos ou transações, cada card mostra empty state.

## Dados reais

O saldo exclui contas blindadas/cadeadas. Metas aparecem no controle de objetivos, mas não afetam saldo, receitas ou despesas. Receitas e despesas são filtradas por mês e normalizadas para BRL. Transações recentes mostram estabelecimento, categoria, tipo, valor e data; IDs internos não serão exibidos como se fossem IDs de fatura.

## Interações

O shell terá alternância de tema usando o ThemeProvider existente, recolhimento de sidebar com transição, busca visual com atalho `⌘ K`, dropdown de período do gráfico, botão de adicionar lançamento conectado ao fluxo real existente e links ativos para as rotas. Customização de layout será visualmente preparada, mas não adicionará drag-and-drop demo nem ações que não estejam ligadas ao produto.
