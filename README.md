# MuFinance SaaS

O MuFinance é uma aplicação SaaS de finanças pessoais em **Next.js 15, React 19, TypeScript e Firebase**. A arquitetura usa o **App Router**, Server Actions e API Routes, mantendo a experiência visual financeira existente enquanto separa autenticação, domínio, persistência e UI para crescimento multiusuário.

## Arquitetura

A aplicação é organizada em quatro camadas. O diretório `app/` contém layouts, páginas, metadata e API Routes do App Router. O diretório `actions/` contém Server Actions autenticadas para escrita e migração. A pasta `lib/` reúne Firebase Admin, sessão, schemas Zod e normalização do domínio. A camada visual existente em `client/src/` é reaproveitada como Client Components durante a migração incremental, preservando o dashboard, o onboarding e os componentes de interação já testados.

| Camada | Responsabilidade |
|---|---|
| `app/` | App Router, layout global, páginas privadas, loading, 404 e API Routes |
| `actions/` | Escritas autenticadas de contas, transações, cartões, categorias, metas, orçamento e importação |
| `lib/firebase/` | Firebase Web SDK para o browser e Firebase Admin SDK somente no servidor |
| `lib/auth/` | Cookie de sessão HttpOnly e verificação de usuário no servidor |
| `lib/finance/` | Schemas Zod, tipos de entrada e migração idempotente do estado legado |
| `client/src/` | Componentes React existentes, dashboard, modal de transações, onboarding e estilos reutilizados |

## Rotas principais

A rota `/` mantém o dashboard financeiro protegido pelo guarda de autenticação. As rotas `/reports`, `/categories`, `/planning` e `/import` adicionam relatórios reais, CRUD de categorias, metas/orçamento e importação CSV/OFX. As rotas `/api/session`, `/api/finance/snapshot` e `/api/finance/migrate` formam a base de integração server-side para futuras aplicações e jobs.

O login atual aceita e-mail/senha, recuperação de senha e Google Login pelo Firebase Authentication. Após o login, o ID token é trocado por um cookie HttpOnly de curta duração em `/api/session`; Server Actions e API Routes verificam esse cookie com Firebase Admin antes de acessar dados.

## Dados e migração

O formato legado `users/{uid}/finance/state` continua preservado. Depois que a sessão é criada, o `FinanceMigrationBootstrap` executa uma migração idempotente que cria documentos nas coleções `accounts`, `creditCards`, `transactions`, `categories`, `goals` e `budgets`, sempre com `ownerId`, timestamps e indicação da origem. A migração não apaga o estado anterior e não duplica registros normalizados já existentes.

As regras de Firestore permitem leitura e escrita somente quando o `ownerId` do documento corresponde ao UID autenticado. O namespace legado `users/{userId}/**` também permanece protegido. Credenciais do Firebase Admin nunca devem ser colocadas em arquivos versionados ou variáveis `NEXT_PUBLIC_*`.

## Configuração local

Copie `.env.example` para `.env.local` e preencha as variáveis públicas do Firebase. Para operações server-side, configure também `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL` e `FIREBASE_ADMIN_PRIVATE_KEY`. A chave privada deve permanecer somente no ambiente do servidor.

```bash
pnpm install
pnpm dev
```

Para validar a aplicação, use:

```bash
pnpm check
pnpm build
pnpm start
```

Os comandos `pnpm legacy:dev` e `pnpm legacy:build` permanecem disponíveis apenas como fallback durante a migração da antiga SPA Vite.

## Vercel

O projeto está configurado para o preset `nextjs` no `vercel.json`, usando `pnpm install --frozen-lockfile` e `pnpm build`. No projeto Vercel, configure as variáveis de `.env.example` para os ambientes Preview e Production. O domínio personalizado pode continuar apontando para o mesmo projeto Vercel depois da ativação do novo build.

Antes de trocar a produção, valide uma Preview com login por e-mail, Google Login, recuperação de senha, criação de conta, migração do estado legado, adição de transação, cadastro de conta manual, categorias, importação e relatórios. A publicação final deve ocorrer somente depois de confirmar as regras Firestore no projeto correto `projetomu-d5722`.

## Segurança operacional

Não existem dados fictícios no dashboard novo: gráficos e relatórios exibem estados vazios quando o usuário ainda não possui lançamentos. Metas não alteram saldo de contas e contas marcadas para blindagem não devem ser somadas ao saldo geral. Ações destrutivas exigem confirmação visual no cliente e verificação de proprietário no servidor.
