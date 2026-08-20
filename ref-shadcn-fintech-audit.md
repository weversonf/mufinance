# Auditoria visual — shadcn-fintech

Fonte: https://shadcn-fintech.vercel.app/dashboard

## Estrutura observada

A referência usa uma aplicação financeira em modo escuro com sidebar fixa à esquerda, largura aproximada de 248px, e uma área principal com fundo quase preto. No topo da área principal há botão de recolher sidebar, breadcrumb/título `Dashboard`, atalho de busca com `⌘ K`, alternância de tema e botão `Customize`.

A sidebar tem marca no topo, grupos de navegação com títulos curtos (`Daily`, `Money`, `Insights`, `Auth`), ícones lineares, item ativo com fundo levemente mais claro e perfil do usuário fixado no rodapé. Os itens principais são Overview, Accounts, Transactions, Cards, Transfers, Investments, Crypto, Analytics, Budgets e Sign In.

## Dashboard de referência

O primeiro bloco é um card grande `Financial Overview`, com legenda de Current Year e Last Year, seletor de intervalo de datas no canto superior direito e gráfico mensal de janeiro a dezembro. Ao lado existe uma coluna de cards menores.

O card superior direito é `Quick Transfer`, com contatos em avatares horizontais, indicação do destinatário, campo Amount e botão Send. Abaixo fica `Monthly Spending Limit`, com Budget, Spend, Remaining e uma barra de progresso.

A segunda faixa apresenta `Money Movement`, com seletor `7d`, métricas Money In, Money Out e Net Flow, seguida por um gráfico temporal. Também aparecem cards de patrimônio com contas/cartões, Wallet Balance e variação mensal.

Na parte inferior há `Financial Health`, com pontuação, barras para Savings Rate, Spending Habits, Debt Ratio, Investment Growth, Emergency Fund e Bill Payments, e uma tabela `Recent Transactions` com Merchant, Transaction ID, Amount e Date.

## Linguagem visual

A referência usa cards escuros com bordas discretas, raio médio, poucos gradientes, contraste alto, tipografia sans-serif compacta, títulos em branco, textos auxiliares em cinza, acentos verde/teal para crescimento e transações positivas e vermelho/rosa para despesas. O espaçamento é generoso e a grade é assimétrica: área de gráfico dominante à esquerda e cards de suporte à direita.

## Adaptação obrigatória para MuFinance

A estrutura deve ser reproduzida visualmente, mas os conceitos precisam usar os dados do MuFinance: saldo disponível sem contas blindadas, receitas do mês, despesas do mês, metas, contas, cartões, orçamento mensal, fluxo de caixa, saúde financeira calculada somente com dados reais e lançamentos recentes. Não usar os valores fictícios do repositório de referência.

A navegação deve apontar para as rotas existentes do MuFinance (`/`, `/reports`, `/categories`, `/planning`, `/import`) e manter autenticação Firebase, snapshot autenticado e estados vazios quando o usuário não possuir dados. A interface deve permanecer responsiva e manter light/dark mode.
