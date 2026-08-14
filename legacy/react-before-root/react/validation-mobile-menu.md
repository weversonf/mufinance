# Validação do menu mobile

Após o ajuste radial, `pnpm check` e `pnpm build` passaram. No preview desktop, o botão de nova transação manteve sua ação original e abriu o modal “Adicionar transação”; o teste não alterou a lógica das ações. A validação visual do movimento radial deve ser feita no viewport mobile, onde `mobile-nav` e `mobile-fab-actions` são renderizados.
