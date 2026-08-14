# Validação manual — pagamentos e cartões

## 14/08/2026

O preview desktop foi validado com o cartão Mu Platinum selecionado. O diálogo de detalhe exibiu a fatura de agosto com dois lançamentos, total em aberto de **R$ 4.480,00**, status individual **Em aberto** e a ação **Pagar fatura**.

Após a confirmação do pagamento demonstrativo, os dois lançamentos foram marcados como **Baixado**, o valor comprometido da carteira caiu para **R$ 0,00**, o limite disponível passou a **R$ 30.000,00** e o saldo disponível da conta principal foi ajustado de **R$ 32.540,00** para **R$ 28.060,00**. O toast confirmou a baixa automática.

O detalhe reaberto mostrou **R$ 0,00** em aberto, **R$ 4.480,00** baixados e limite livre de **R$ 12.000,00** para o cartão. A exportação do histórico gerou o feedback de sucesso com **2 lançamentos** baixados em CSV.

Também foram capturadas validações visuais em viewport desktop de 1280 px e mobile de 390 px. A pilha de cartões permanece utilizável, com seleção por foco/clique, elevação suave no hover e adaptação do módulo patrimonial para telas estreitas.
