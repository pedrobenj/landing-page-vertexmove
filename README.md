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

Logos oficiais vão em `public/brand/` (`vertex-logo.png`, `vertex-logo-white.png`, `vertex-symbol.png`).

---
Desenvolvido por Pedro Benjamin
