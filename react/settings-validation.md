# Validação da central de configurações

No preview React, a entrada **Configurações** abre uma central modal com navegação interna para Visão geral, Categorias, Carteiras e Experiência. A seção inicial exibe 6 categorias de despesas e 2 de receitas, com editar, ativar/desativar, exclusão protegida por histórico, criação de novas categorias e uma zona de perigo com confirmação.

O modal de transação recebe as categorias ativas da central. As ações destrutivas ficam separadas da organização cotidiana e são confirmadas antes de executar, preservando a lógica observada no MuFinance original.

O fluxo de criação foi testado com a categoria **Saúde**: após preencher o nome e salvar, a central atualizou o contador para 9 categorias, exibiu Saúde na lista de despesas e mostrou o feedback “Categoria criada — Saúde ficará disponível nos próximos lançamentos.”

Após fechar Configurações e abrir **Adicionar transação**, Saúde apareceu na lista de categorias de despesa, confirmando a conexão entre o gerenciamento e os novos lançamentos.
