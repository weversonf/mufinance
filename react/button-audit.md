# Auditoria de interações

- [x] Mapear todos os botões, links, filtros, menus, toggles e ações de tabela.
- [x] Testar navegação lateral, atalhos, busca, perfil, idioma e notificações.
- [x] Testar ações de resumo, período, moeda, transferir, depositar, relatório e gerenciamento.
- [x] Testar orçamento, compromissos, sugestões, filtros e menus de transações.
- [x] Testar modal de nova transação, tema claro/escuro e navegação mobile.
- [x] Implementar ações funcionais, estados persistentes e feedbacks claros para cada fluxo.
- [x] Validar teclado, fechamento de menus/modais, responsividade, TypeScript e build.
- [x] Sincronizar a versão corrigida para `react/` no repositório MuFinance.

## Registro de validação

- Os fluxos de logout/login, suporte, ajuda, contato, transferência, contas a pagar, idioma e modo compacto foram exercitados no preview.
- O botão de Suporte abre o painel; a Central de ajuda, o formulário de contato e o envio de mensagem também foram confirmados.
- O build e o check TypeScript passaram após a auditoria. O fechamento por Escape, busca rápida via `⌘K`/`Ctrl+K`, abertura/fechamento de menus e responsividade desktop/mobile foram validados.
- Os botões de navegação, resumo, período, moeda, transferir, depositar, relatório, contas, orçamento, agenda, filtros, transações, suporte, privacidade, perfil, sessão, notificações, idioma, modo compacto, tema e exportação têm handlers ou submetem formulários reais.
