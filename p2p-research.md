# Sondagem P2P do MuFinance original

Fonte primária consultada: https://mufinance.online/

## Regras observáveis no código público

O fluxo P2P aparece dentro do modal de nova transação. Para uma saída/despesa, o toggle é rotulado “Enviar para amigo”; para uma entrada/receita, o rótulo muda para “Cobrar de amigo”. Ao ativar o toggle, aparece um campo de busca por `@usuario`, com debounce de 400 ms, busca por username e seleção de um usuário diferente do usuário logado.

Ao selecionar um usuário, o sistema guarda `uid`, `name` e `username` do destinatário/contraparte. A transação própria recebe `p2pCounterpartName` e, conforme o sentido, `p2pTargetUid` ou `p2pSenderUid`.

No envio para amigo, o fluxo cria uma transação de saída para o usuário atual e outra transação de entrada para o usuário selecionado, além de uma notificação. O valor é debitado do remetente e creditado ao destinatário. A operação mostra feedback de sucesso no formato “R$ ... enviado para ...”.

Na cobrança de amigo, o fluxo cria um documento em `p2p_requests` com remetente, destinatário, valor, descrição e timestamps. Também cria uma notificação do tipo `p2p_request` para o usuário cobrado e uma transação própria de cobrança. A notificação oferece as ações “Aceitar” e “Recusar”.

Ao aceitar uma cobrança, o sistema cria uma saída para quem aceita, uma entrada correspondente para quem solicitou, registra referências cruzadas (`p2pRequestId`, `p2pTxId`) e remove a solicitação pendente e suas notificações relacionadas. Ao recusar, remove a solicitação e as notificações sem efetivar transações.

O código também reseta o estado P2P ao abrir/resetar o modal: usuário selecionado, checkbox, busca e resultado. O campo P2P não aparece durante edição de transação; ele é tratado como fluxo de criação.

## Estruturas e nomenclaturas encontradas

Coleções/referências observáveis: `profile`, `p2p_requests`, `notifications` e `transactions`. Campos P2P observáveis: `p2pCounterpartName`, `p2pTargetUid`, `p2pSenderUid`, `p2pRequestId`, `p2pTxId`, `fromUid`, `fromName`, `toUid`, `toName`, `amount`, `desc`, `createdAt` e `updatedAt`.

## Regra do identificador público

O onboarding exige um `@usuario` entre 3 e 20 caracteres, sem contar o `@`, aceitando apenas letras, números, `_` e `.`. O valor é normalizado para minúsculas, precisa ser único na coleção `profile` e, depois de alterado, fica bloqueado por 90 dias.

## Limites da sondagem

O site abriu em uma tela de login e não houve sessão autenticada disponível. Portanto, as regras acima foram inferidas de elementos públicos e do código JavaScript/HTML entregue pelo próprio domínio; não foram executadas transferências reais nem acessados dados de usuários. A implementação React deve permanecer demonstrativa/local até existir backend autenticado, regras de autorização, idempotência, auditoria e integração financeira real.
