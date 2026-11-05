# Vertex Grupo de Corrida — Plataforma de Inscrições

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind v4 · shadcn/ui · Prisma 7 · NextAuth v5.
Convenções e regras de negócio: ver [`CLAUDE.md`](./CLAUDE.md).

## Primeiros passos

```bash
npm install            # também roda `prisma generate`
cp .env.example .env   # preencher DATABASE_URL e AUTH_SECRET (npx auth secret)
npm run db:migrate     # cria as tabelas
npm run dev
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Desenvolvimento |
| `npm run lint` | ESLint |
| `npm run typecheck` | Gera tipos de rota e roda `tsc --noEmit` |
| `npm run build` | Build de produção |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:studio` | Prisma Studio |
| `npm run test:e2e` | Testes end-to-end (Playwright, desktop + mobile 360px) |
| `npm run test:e2e:ui` | Playwright em modo interativo |
| `npm run test:e2e:report` | Abre o relatório HTML da última execução |

## Testes end-to-end

Ficam em `e2e/` e rodam contra o `next dev` com `USE_MOCK_DATA=true`, então **não precisam de banco**.
Se já houver um servidor em `localhost:3000`, ele é reaproveitado; senão o Playwright sobe um.

```bash
npx playwright install chromium   # primeira vez
npm run test:e2e
```

Logos oficiais vão em `public/brand/` (`vertex-logo.png`, `vertex-logo-white.png`, `vertex-symbol.png`).

---
Desenvolvido por Pedro Benjamin
