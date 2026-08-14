# Validação do Extrato mensal operacional

## Data

14 de agosto de 2026.

## Fluxos verificados

- O botão “Ver tudo” em “Últimos lançamentos” abre a tela dedicada de Extrato com agosto de 2026 como período ativo.
- A tela não exibe os cards de resumo do dashboard; apresenta filtros, saldo diário e a lista operacional de transações.
- Os filtros de busca, categoria, conta/cartão e tipo permanecem disponíveis.
- A lista usa cinco lançamentos por página e apresenta duas páginas com os dados demonstrativos do mês.
- A navegação para a página 2 troca corretamente os lançamentos exibidos sem remover a seção de saldo diário.
- As linhas continuam acionáveis para abrir a edição do lançamento.

## Validação técnica

`pnpm check` e `pnpm build` concluídos com sucesso após o ajuste do tamanho da página.

## Validação visual complementar

As capturas de desktop e mobile do projeto permaneceram estáveis após a alteração da tela de Extrato. A navegação inferior, os controles de período, os cards principais e o FAB não apresentaram overflow no layout geral.
