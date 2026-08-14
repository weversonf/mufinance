# Configuração do Firebase no MuFinance

A aplicação já está preparada para usar o projeto `projetomu-d5722` por meio do SDK modular do Firebase. A configuração web fornecida pelo proprietário está em `client/src/lib/firebase.ts`; ela também pode ser sobrescrita por variáveis `VITE_FIREBASE_*` na Vercel.

## Ativar o login

No console do Firebase, abra **Authentication → Sign-in method**, ative **Email/Password** e salve. A aplicação exibe login, criação de conta, recuperação de senha e logout.

## Criar o banco

Abra **Firestore Database**, crie o banco no modo de produção e escolha a região desejada. Depois publique as regras deste repositório (`firestore.rules`). Elas permitem acesso somente ao usuário autenticado dentro do caminho `users/{uid}/...` e bloqueiam os demais documentos.

## Dados salvos

Cada usuário possui um documento em `users/{uid}/finance/state`. Esse documento armazena transações, contas, cartões, categorias, veículo, preferências e atividades P2P. A primeira sessão começa com os dados demonstrativos; depois que o usuário fizer alterações, elas são sincronizadas com o Firestore.

## Publicação

O build da Vercel pode usar a configuração embutida em `client/src/lib/firebase.ts`, portanto não depende de variáveis secretas para funcionar. Se preferir manter a configuração fora do código-fonte, cadastre na Vercel as variáveis `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID` e `VITE_FIREBASE_APP_ID`.
