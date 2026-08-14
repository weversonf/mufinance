# Validação do compartilhamento P2P

## Desktop — 1280 × 720

- O botão **Compartilhar** aparece no cabeçalho ao lado do seletor de período e da ação de nova transação.
- A faixa de saúde financeira também oferece um acesso contextual para compartilhar.
- Os KPIs e a carteira de crédito continuam preservados, sem sobreposição visual.

## Mobile — 390 × 844

- O botão **Compartilhar** permanece acessível na faixa de ações abaixo do cabeçalho.
- A navegação inferior, o grid de KPIs e a faixa de saúde financeira seguem sem overflow horizontal na área observada.
- O diálogo P2P usa formulário em coluna única e footer sticky no breakpoint de 640 px; deve ser validado também com o diálogo aberto antes do checkpoint.

## Build

- `pnpm check`: aprovado.
- `pnpm build`: aprovado; Vite emitiu apenas o aviso já existente sobre tamanho de chunk.

## Teste funcional no preview

No diálogo aberto pelo botão **Compartilhar**, a busca por `@ana` retornou **Ana Ribeiro — @ana.ribeiro** e a seleção transformou o resultado em contato ativo, com ação para removê-lo. A troca para **Cobrar amigo** atualizou corretamente o rótulo do destinatário, o placeholder da descrição e a CTA para **Enviar cobrança**. O fluxo permanece explicitamente local e demonstrativo, sem execução bancária real.

## Correção da busca P2P

- A busca agora ignora consultas sem `@` e não agenda resultados antes de existirem três caracteres após o arroba.
- A lista é filtrada pela união de contatos presentes em solicitações e atividades, portanto usuários sem envio ou recebimento anterior não aparecem.
- A composição do dashboard permaneceu íntegra no preview desktop; `pnpm check` e `pnpm build` foram aprovados.
- Em viewport de 390 px, o botão **Compartilhar**, o grid de KPIs, a faixa de saúde financeira e a navegação inferior permanecem acessíveis sem overflow horizontal.
