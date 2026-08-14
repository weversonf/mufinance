# Validação da edição visual

Após a remoção manual do conteúdo do artigo `balance-card` — do eyebrow “SALDO TOTAL” até os indicadores “Receitas”, “Despesas” e “Guardado” — o módulo permanece ocupado pela carteira de crédito integrada.

No desktop, o fluxo de caixa ocupa a coluna principal e “Sua carteira” permanece na coluna lateral, sem o cabeçalho e o cartão de saldo duplicados. No mobile, a carteira segue em fluxo vertical, com cartões, fatura atual e faixa de faturas legíveis, sem overflow aparente.

Validações técnicas concluídas: `pnpm check` e `pnpm build` passaram. O build apresentou apenas o aviso já existente de chunk maior que 500 kB e o aviso de configuração `pnpm` ignorada pelo pnpm atual; não houve erro de compilação.
