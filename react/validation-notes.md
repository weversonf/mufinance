# Notas de validação

O preview abriu corretamente em desktop. O botão **Adicionar transação** abre um modal acessível com descrição, valor, categoria, conta, tipo de movimento, data, cancelamento e fechamento por clique fora. O formulário aceitou a descrição `Consultoria avulsa`, o valor `1250,50`, a categoria `Receitas` e o tipo `Receita`; o envio fechou o modal, exibiu feedback e inseriu o lançamento no topo da tabela com `+R$ 1.250,50`.

O alternador de tema foi validado no desktop e permanece disponível no cabeçalho mobile; a preferência é salva em `localStorage`, e a troca de superfícies usa transições suaves com redução automática para usuários que preferem menos movimento.
