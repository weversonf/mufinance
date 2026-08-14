# Validação da janela temporal do fluxo de caixa

## Regra aplicada

- **6M:** um mês anterior ao mês atual, o mês atual e quatro meses posteriores. Com agosto de 2026 selecionado, a janela começa em julho e termina em dezembro.
- **12M:** um mês anterior ao mês atual, o mês atual e dez meses posteriores. Com agosto de 2026 selecionado, a janela começa em julho de 2026 e termina em junho de 2027.
- **YTD:** janeiro a dezembro do ano selecionado, independentemente do mês atualmente selecionado.

## Evidências

- A série é derivada com datas reais, atravessa a virada de ano e mantém `periodLabel` completo para o tooltip.
- O mês atual recebe uma linha de referência visual identificada como “atual”.
- O dashboard foi capturado em viewport desktop de 1280 px e mobile de 390 px sem overflow visível.
- `pnpm check` e `pnpm build` concluídos com sucesso.
