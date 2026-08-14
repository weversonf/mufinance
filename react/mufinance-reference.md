# Referência observável: MuFinance original

## 14 de agosto de 2026

O endereço `https://mufinance.online/` apresenta o produto Mu Finance v10.26. Mesmo sem autenticação, a navegação visível lista **Início, Extrato, Relatórios, Cartões, Metas, Orçamento, Perfil e Configurações**. A tela pública mostra uma camada de login com o texto “Entre para acessar sua carteira”, portanto a abertura da área interna de configurações não pôde ser concluída sem credenciais.

No dashboard que permanece visível atrás da camada de login aparecem as seções **Categorias de Receita** e **Categorias de Despesa**, além de “Atividade recente”, “Insights” e “Fluxo de caixa”. Isso confirma que categorias são uma entidade de primeira classe do produto e devem ser acessíveis de maneira explícita, não escondidas apenas dentro do formulário de nova transação.

O aplicativo também expõe **Configurações** como uma entrada própria da navegação lateral. A implementação React deve, portanto, tratar essa área como um centro de preferências com navegação interna e incluir um módulo evidente de categorias de receitas e despesas, com estados de edição e feedback local.

Uma inspeção do HTML público identificou a seguinte hierarquia na página de configurações: **Módulos** com Veículo; **Contas Bancárias** com “Adicionar Conta”; **Cartões**; **Categorias** divididas em acordeões de **Despesas** e **Receitas**, cada uma com “Nova Categoria”; **Administração** com “Gerenciar Licenças”; e **Zona de Perigo** com “Zerar Todas as Transações”, “Limpar Histórico de Importação” e “Remover Transações Duplicadas”. Essa estrutura orienta a remodelação da tela React, mantendo ações destrutivas separadas e explicitamente confirmadas.
