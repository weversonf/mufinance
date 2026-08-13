# Referências visuais analisadas

## Dashboard de referência (Vireo)

- Estrutura desktop de dashboard com **barra lateral fixa**, topo compacto e conteúdo em cartões sobre fundo cinza-azulado claro.
- Cabeçalho principal com breadcrumb, título, subtítulo, filtro temporal, atualização e ação de adicionar transação.
- Um cartão de destaque em tom claro com mensagem de economia e CTAs; à direita, pequenos indicadores.
- Quatro cartões KPI com ícone em superfície colorida, rótulo, valor e variação percentual.
- Área principal em grade: gráfico de fluxo de caixa largo à esquerda e um bloco de saldo/cartão financeiro à direita.
- Abaixo: gastos por categoria, contas, utilização de orçamento, tabela de transações e contas a pagar.
- Aparência: muito espaçamento, cantos arredondados, sombras discretas, tipografia sans moderna, chips, barras de progresso, verde-esmeralda como destaque e gradiente roxo/rosa no cartão bancário.

## MuFinance atual

- Marca identificada como **Mu Finance** e navegação com: Início, Extrato, Relatórios, Cartões, Metas, Orçamento, Perfil e Configurações.
- Idioma e moeda são brasileiros; valores devem usar **BRL/R$** e conteúdo em português.
- Funcionalidades já aparentes incluem saldo acumulado, receitas e despesas mensais, categorias, atividade, insights, fluxo de caixa e compromissos.
- A nova experiência deve preservar o nome e a proposta do MuFinance, adotando o acabamento visual do dashboard de referência sem reutilizar ativos de terceiros.

## Direção de implementação

- Construir uma SPA React responsiva dentro de `react/`, com dados demonstrativos locais e interações visuais de dashboard.
- Para telas móveis, trocar a barra lateral por navegação inferior e priorizar o gráfico de rosca de categorias logo abaixo dos cards de saldo, conforme preferência registrada.
- Criar animações de entrada, transições de filtros, hover nos cartões e feedback de interface, respeitando `prefers-reduced-motion`.
