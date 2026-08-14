# MuFinance React

A versão principal do MuFinance agora vive na raiz deste repositório. O app é uma SPA React 19 com TypeScript, Vite, Framer Motion, Recharts e Lucide React.

## Desenvolvimento

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm check
pnpm build
```

O build de produção é gerado em `dist/public`. O projeto legado e a cópia anterior da versão React foram preservados em `legacy/`.

## Vercel

O repositório está preparado para publicação com o diretório raiz do projeto (`./`), preset Vite e configuração declarada em `vercel.json`.

> A integração React com o Firebase do projeto inicial ainda precisa ser migrada antes de ativar dados reais em produção. A configuração original foi preservada em `legacy/original-site/`.
