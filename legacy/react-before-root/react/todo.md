# Próximas alterações

- [x] Criar modal interativo de nova transação com valor, tipo e categoria.
- [x] Atualizar a tabela de lançamentos e os indicadores locais após o envio do formulário.
- [x] Adicionar alternador de tema claro/escuro no cabeçalho com transições suaves.
- [x] Persistir o tema escolhido no navegador e respeitar a preferência de movimento reduzido.
- [x] Validar as interações em desktop e mobile, executar check/build e sincronizar a pasta `react` no repositório.

## Nova solicitação

- [x] Reordenar o dashboard para destacar saldo, receitas, despesas e economia antes de “Saúde financeira”.
- [x] Reduzir o destaque visual do card “Saúde financeira” e posicioná-lo depois dos cards principais.
- [x] Abrir edição ao clicar diretamente em uma transação e remover os três pontinhos da tabela.
- [x] Adicionar carteira de cartões empilhados com visual premium, cor, bandeira e criação de novos cartões.
- [x] Ampliar o modal de transação para selecionar conta, cartão de crédito, receita ou despesa.
- [x] Validar as interações em desktop e mobile, executar check/build e registrar o checkpoint.

## Nova solicitação

- [x] Trocar o filtro “Últimos 30 dias” por seletor real de mês e ano.
- [x] Transformar “Sua carteira” em central de cartões de crédito, faturas e total comprometido.
- [x] Modelar faturas do cartão e permitir escolher a fatura no lançamento.
- [x] Criar lançamentos parcelados automaticamente com quantidade de parcelas e valor mensal.
- [x] Criar assinaturas recorrentes automaticamente com frequência e quantidade de ocorrências.
- [x] Validar filtros, faturas, parcelamentos e recorrências em desktop/mobile, executar check/build e sincronizar `react/`.

## Nova solicitação

- [x] Compactar o modal de transação para preencher melhor a área disponível.
- [x] Reduzir gaps e reorganizar valor, categoria, conta/cartão, fatura e data em uma grade mais densa.
- [x] Manter parcelamento, assinatura, rodapé e mobile sem overflow ou rolagem excessiva.
- [x] Validar a nova composição, executar check/build e registrar o checkpoint.

## Nova solicitação

- [x] Integrar a Carteira de crédito ao card Saldo disponível em um único módulo.
- [x] Exibir conta principal, cartões, limite disponível e faturas sem duplicação.
- [x] Preservar criação, seleção de cartão, seleção de fatura e lançamentos parcelados/recorrentes.
- [x] Validar o módulo unificado em desktop/mobile, executar check/build e registrar o checkpoint.

## Nova solicitação

- [x] Implementar pagamento de fatura com baixa automática dos lançamentos correspondentes e débito no saldo da conta principal.
- [x] Criar visualização detalhada por cartão com histórico mensal de transações, fatura selecionada e exportação em CSV.
- [x] Refinar a experiência dos cartões empilhados com transições suaves, hover, foco por teclado e feedback de seleção.
- [x] Validar os fluxos em desktop/mobile, executar check/build e registrar o checkpoint.

## Correção de edição visual

- [x] Remover o bloco superior “Saldo total” até “Receitas, Despesas e Guardado” conforme a intenção visual.
- [x] Preservar o card patrimonial integrado com saldo, carteira e cartões de crédito.
- [x] Validar TypeScript, build e composição responsiva após a remoção.

## Ajuste da carteira e da fatura

- [x] Remover o resumo inicial de “Limite total”, “Comprometido” e “Disponível” do card “Sua carteira”.
- [x] Remover a faixa final “Faturas 4 acompanhadas”.
- [x] Fazer a barra de “Fatura atual” representar o total da fatura em relação ao limite do cartão, com teto visual em 100%.
- [x] Validar a nova hierarquia em desktop/mobile, executar check/build e registrar checkpoint.

## Ajuste da janela do gráfico

- [x] Fazer o modo 6M mostrar um mês anterior ao mês atual e quatro meses posteriores.
- [x] Fazer o modo 12M mostrar um mês anterior ao mês atual e dez meses posteriores.
- [x] Manter o mês atual como referência e exibir janeiro a dezembro no modo YTD.
- [x] Validar o gráfico em desktop/mobile, executar check/build e registrar checkpoint.

## Compartilhamento P2P

- [x] Sondar o fluxo público de compartilhamento P2P no MuFinance original e documentar suas regras observáveis.
- [x] Definir um modelo local demonstrativo seguro para contatos, divisão de despesas, convites e status.
- [x] Implementar a interface P2P na versão React sem alegar transferência bancária real.
- [x] Validar estados, acessibilidade, responsividade, check/build e registrar checkpoint.

## Ajuste da busca P2P

- [x] Não exibir sugestões ao digitar apenas `@` ou menos de três caracteres após o arroba.
- [x] Exibir somente usuários com histórico local de envio ou recebimento.
- [x] Validar busca, estado vazio, seleção de contato, mobile, check/build e registrar checkpoint.

## Auditoria visual, Perfil e Veículo

- [x] Corrigir o espaço em branco abaixo do gráfico de Receitas vs. despesas.
- [x] Ajustar a proporção visual do cartão de crédito empilhado.
- [x] Atualizar ícones e elevar a linguagem visual da sidebar lateral.
- [x] Ativar Ctrl+B para revelar e esconder a sidebar.
- [x] Sondar e implementar as funções observáveis de Perfil do MuFinance original.
- [x] Sondar e implementar o menu Veículo e suas funções principais.
- [x] Validar desktop/mobile, check/build e registrar checkpoint.

## Refinamento da experiência mobile

- [x] Fixar uma navegação inferior mobile com itens principais e área segura para o gesto de toque.
- [x] Manter no topo mobile somente notificações e alternância claro/escuro.
- [x] Criar o botão “+” central e revelar atrás dele as ações Receita, Despesa e Veículo.
- [x] Ajustar cards e espaçamentos para uma composição mobile própria, sem comprimir o desktop.
- [x] Validar animações, acessibilidade, mobile/desktop, check/build e registrar checkpoint.

## Refinamento de cabeçalho e tema

- [x] Remover o botão/seletor PT/BR do cabeçalho.
- [x] Melhorar a hierarquia visual e os estados do painel de notificações.
- [x] Refinar o modo escuro em superfícies, bordas, textos, controles e feedbacks interativos.
- [x] Validar tema claro/escuro, notificações, responsividade, check/build e registrar checkpoint.

## Nova solicitação: central de configurações

- [x] Pesquisar a estrutura observável da área de configurações do MuFinance original.
- [x] Reorganizar a tela de configurações em seções funcionais e visualmente hierarquizadas.
- [x] Criar gerenciamento local de categorias de receitas e despesas, com adicionar, editar, ativar/desativar e excluir.
- [x] Conectar as categorias gerenciadas ao modal de lançamento de transações.
- [x] Validar estados vazios, confirmações, feedbacks, responsividade, check/build e registrar checkpoint.

## Nova solicitação: extrato, compromissos, contas e veículo

- [x] Melhorar o modal de Próximos compromissos com resumo, status, calendário e ações claras.
- [x] Melhorar o modal de Contas com saldos, movimentações e ações da conta selecionada.
- [x] Melhorar a visualização de Relatórios com indicadores, período e gráfico mais informativos.
- [x] Criar uma tela dedicada de Extrato ao clicar em “Ver tudo”, com resumo diário de saldo.
- [x] Criar uma tela detalhada de Veículo com abastecimentos, manutenção, quilometragem e custos.
- [x] Validar navegação, estados vazios, responsividade, acessibilidade, check/build e registrar checkpoint.

## Correção do painel de notificações

- [x] Remover o acesso direto a configurações de dentro do painel de notificações.
- [x] Manter notificações focadas em alertas, leitura e estados de atividade.
- [x] Validar o painel em tema claro/escuro, desktop/mobile, check/build e registrar checkpoint.
- [x] Mover o card “Saúde financeira” do dashboard principal para a tela dedicada de Extrato.

## Novo FAB de transação

- [x] Transformar “Adicionar transação” em botão circular flutuante no canto inferior direito.
- [x] Preservar abertura do modal, acessibilidade, contraste e interação por teclado.
- [x] Ajustar a posição para desktop e mobile sem conflitar com a navegação inferior.
- [x] Validar responsividade, tema, check/build e registrar checkpoint.

## Correção de visibilidade, notificações e perfil

- [x] Corrigir o botão do olho para alternar a visibilidade do saldo sem falhar.
- [x] Fazer o painel de notificações abrir abaixo do topo, em fluxo vertical e sem sobreposição lateral.
- [x] Reparar o menu e o painel de perfil, incluindo abertura, fechamento, contraste e ações internas.
- [x] Validar desktop/mobile, teclado, tema, check/build e registrar checkpoint.

## Ajuste de privacidade e navegação do usuário

- [x] Fazer o botão do olho embassar apenas os números, mantendo seus caracteres visíveis.
- [x] Remover “Perfil” da barra lateral e manter o acesso por “Minha conta” no menu do usuário.
- [x] Remover “Configurações” da barra lateral e manter o acesso pelo menu do usuário.
- [x] Validar menu do usuário, tema, desktop/mobile, check/build e registrar checkpoint.

## Auditoria de Conta, Cartão e Veículo

- [x] Revisar a ação de Conta bancária e garantir que o formulário e o resumo sejam coerentes.
- [x] Revisar a ação de Cartão de crédito e garantir que bandeira, limite, fechamento e vencimento funcionem.
- [x] Revisar a ação de Veículo e garantir que o detalhe, abastecimento, manutenção e quilometragem sejam acessíveis.
- [x] Validar abertura, fechamento, foco, mobile, tema, check/build e registrar checkpoint.

## Nova solicitação: edição de carteiras e cadastro do veículo

- [x] Permitir editar dados da conta bancária e ajustar o saldo demonstrativo com confirmação e feedback.
- [x] Permitir editar cartão de crédito, incluindo limite, bandeira, fechamento, vencimento e identificação visual.
- [x] Permitir editar o veículo, selecionando tipo (carro ou moto), fabricante e modelo.
- [x] Validar formulários, persistência local, estados de erro/sucesso, desktop/mobile, check/build e registrar checkpoint.

## Nova solicitação: simplificação da navegação

- [x] Remover o item “Filtros” do menu principal.
- [x] Remover o destino residual do painel de filtros sem afetar os filtros contextuais do Extrato.
- [x] Validar navegação desktop/mobile, check/build e registrar checkpoint.

## Nova solicitação: edição de contas bancárias

- [x] Permitir abrir o editor diretamente pela conta selecionada.
- [x] Permitir alterar nome, identificação e saldo atual da conta.
- [x] Refletir o saldo ajustado nos cards, carteira patrimonial e fluxos dependentes durante a sessão.
- [x] Validar confirmação, feedback, estados inválidos, desktop/mobile, check/build e registrar checkpoint.

## Nova solicitação: refinamento após edição visual

- [x] Remover o filtro residual indicado no dashboard.
- [x] Adicionar setas esquerda/direita ao seletor de período para facilitar a navegação.
- [x] Remover o texto “Editar” da tabela, mantendo a abertura do modal ao clicar na linha.
- [x] Validar TypeScript, build, navegação e criar checkpoint.

## Nova solicitação: botão circular

- [x] Tornar circular o botão indicado pela edição visual.
- [x] Validar tamanho, contraste, hover, foco, desktop/mobile, check/build e registrar checkpoint.

## Nova solicitação: FAB e ações circulares

- [x] Garantir que o FAB central seja um círculo completo, sem formato quadrado arredondado.
- [x] Garantir que as ações Receita, Despesa e Veículo reveladas também sejam círculos completos.
- [x] Validar abertura, fechamento, contraste, foco, desktop/mobile, check/build e registrar checkpoint.

## Nova solicitação: movimento radial do menu mobile

- [x] Comparar a animação atual com o menu mobile do MuFinance original.
- [x] Fazer Receita, Despesa e Veículo surgirem de trás do botão “+” com movimento radial e profundidade.
- [x] Validar fechamento, acessibilidade, movimento reduzido, desktop/mobile, check/build e registrar checkpoint.

## Nova solicitação: refinamento do editor de veículo

- [x] Organizar o modal de edição de veículo com hierarquia visual, seções e espaçamento consistentes.
- [x] Melhorar os campos de tipo, fabricante, modelo e demais dados do veículo sem perder a edição existente.
- [x] Validar estados selecionados, foco, tema claro/escuro, desktop/mobile, check/build e registrar checkpoint.

## Nova solicitação: correção visual do Extrato

- [x] Reorganizar o layout da tela de Extrato para corrigir blocos desalinhados e espaçamento quebrado.
- [x] Preservar resumo diário, Saúde financeira, busca, segmentação e lista de lançamentos.
- [x] Validar tema claro/escuro, desktop/mobile, acessibilidade, check/build e registrar checkpoint.

## Nova solicitação: Extrato mensal operacional

- [x] Fazer “Ver tudo” abrir o Extrato com todas as transações do mês selecionado.
- [x] Adicionar filtros de busca, tipo, categoria, conta/cartão e status quando aplicável.
- [x] Adicionar paginação funcional e estado vazio para resultados filtrados.
- [x] Remover os cards de resumo da tela de Extrato e manter o saldo diário em seção própria.
- [x] Validar navegação, filtros, paginação, edição por clique, desktop/mobile, check/build e registrar checkpoint.

## Nova solicitação: saldo diário ao final de cada dia

- [x] Agrupar os lançamentos do Extrato por data, mantendo a ordem cronológica e os filtros atuais.
- [x] Exibir o saldo do dia depois dos lançamentos de cada grupo diário, sem deixá-lo no topo da seção.
- [x] Recalcular o saldo diário corretamente conforme receitas, despesas, cartões e ajustes demonstrativos.
- [x] Validar a leitura no padrão de extratos financeiros, responsividade, tema, check/build e registrar checkpoint.
