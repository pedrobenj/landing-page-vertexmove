# Vertex Grupo de Corrida — Plataforma de Inscrições (frontend)

Site de inscrições em corridas de rua do **Vertex Grupo de Corrida** (Fortaleza/CE).
Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind v4 · shadcn/ui · TanStack Query · Zustand · Motion.

Convenções, rotas e regras: ver [`CLAUDE.md`](./CLAUDE.md) (e [`AGENTS.md`](./AGENTS.md) para as mudanças do Next 16).

## Arquitetura (BFF)

Este repositório é **somente o frontend**. Banco, autenticação, preços, lotes, vagas e pagamentos vivem
no backend **VertexMove (NestJS)**, consumido em `${API_URL}/api/v1`.

- O navegador **nunca** chama a API nem vê tokens: Server Components, server actions e o `src/proxy.ts`
  falam com a API pelo cliente em `src/server/api/` (`apiFetch`, `adminFetch`, `endpoints/`).
- Admin: o JWT do backend fica em cookies `HttpOnly` do próprio Next (`vm_admin_at`, `vm_admin_rt`,
  `vm_admin_csrf`). O `proxy.ts` renova o access token nas rotas `/admin/*`; toda leitura/escrita do admin
  chama `requireAdminSession()`/`adminFetch`.
- Atletas não têm conta: a inscrição é `POST /inscricoes` e a consulta é `POST /inscricoes/consulta`
  (WhatsApp **ou** CPF).
- Catálogo público (`GET /eventos`, `GET /eventos/:slug`) em cache com `"use cache"` (~60 s, tags `events`
  e `event:<slug>`); inscrição, consulta e admin nunca são cacheados.
- Com `USE_MOCK_API=true`, as chamadas são respondidas por um backend falso em memória
  (`src/server/api/mocks/`), com as mesmas rotas, status e erros do contrato.

## Variáveis de ambiente

Copie `.env.example` para `.env`:

| Variável | Uso |
|---|---|
| `API_URL` | Backend VertexMove, **sem** `/api/v1` (padrão `http://localhost:3000`). Só no servidor. |
| `API_TIMEOUT_MS` | Timeout das chamadas à API (padrão `10000`). |
| `USE_MOCK_API` | `true` responde com o backend falso em memória (somente desenvolvimento; recusado em produção). |
| `IMAGE_REMOTE_HOSTS` | Hosts das imagens remotas (capas, fotos de kit, logos), separados por vírgula, sem protocolo (ex.: `cdn.vertex.com.br,**.cloudfront.net`). Lido no build pelo `next.config.ts`. No `next dev` entram também `example.com` e `**.example.com` (mock e e2e). |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site (sitemap, Open Graph). |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp de contato (só dígitos, com DDI). |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Perfil do Instagram. |

As variáveis do servidor são validadas com Zod em `src/lib/env.ts`.

## Como rodar

O Next roda na porta **3001** (a API usa a 3000).

```bash
npm install
cp .env.example .env
```

### Com o backend local

No repositório da API VertexMove:

```bash
npm run db:migrate
npm run db:seed
# e suba a API em http://localhost:3000 (ver o README da API)
```

Aqui, com `USE_MOCK_API=false` e `API_URL=http://localhost:3000`:

```bash
npm run dev             # http://localhost:3001
```

Contas do seed (senha `Vertex@Dev12345`): `admin@example.com` (organização) e `operador@example.com`
(operador). O super admin exige MFA, ainda não disponível. Antes de testar a inscrição, crie pelo admin
(ou pela collection Postman "VertexMove — Admin Auth + Inscrições") evento → distância → lote vigente →
documentos → publicar.

### Em modo mock (sem backend)

Com `USE_MOCK_API=true` no `.env`, `npm run dev` sobe o site com corridas, lotes, documentos, inscrições,
auditoria e loja fictícios, guardados em memória até o servidor reiniciar. As mesmas contas e senha acima
funcionam no mock.

### Loja

A loja (`/loja`, carrinho, checkout, pedidos e `/admin/loja`) **só funciona no modo mock** até o backend
expor a API (§16 do `CLAUDE.md`). Sem o mock (e em produção), as páginas mostram
"A loja estará disponível em breve.". O desenho está em `docs/plans/2026-11-04-loja-design.md`.

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Desenvolvimento na porta 3001 |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção na porta 3001 (`npm run start -- -p 3002` para outra porta) |
| `npm run lint` | ESLint |
| `npm run typecheck` | Gera os tipos de rota (`next typegen`) e roda `tsc --noEmit` |
| `npm test` | Testes unitários (Vitest) |
| `npm run test:watch` | Vitest em modo watch |
| `npm run test:e2e` | Testes end-to-end (Playwright, desktop + mobile 360px) |
| `npm run test:e2e:ui` | Playwright em modo interativo |
| `npm run test:e2e:report` | Abre o relatório HTML da última execução |

O build roda sem o mock e não precisa da API de pé:

```bash
USE_MOCK_API=false API_URL=http://localhost:3000 npm run build
```

Antes de cada commit: `npm run lint`, `npm run typecheck`, `npm test` e, se mexer em rotas, o build.

## Testes end-to-end

Ficam em `e2e/` e rodam contra o `next dev` na porta 3001 com **`USE_MOCK_API=true`**, sem backend.
Se já houver um servidor em `localhost:3001`, o Playwright o reaproveita (com o estado em memória que ele
tiver); senão sobe um com o mock ligado. Rodam com 2 workers localmente.

Os testes cadastram dados no mock (corridas, kits, produtos "E2E …"). **Reinicie o dev server antes de
uma rodada limpa**:

```bash
npx playwright install chromium   # primeira vez
lsof -ti :3001 | xargs kill        # derruba o dev server, se houver
npm run dev &                      # com USE_MOCK_API=true no .env
npm run test:e2e
```

Na primeira rodada, o `next dev` compila cada rota sob demanda; abrir as páginas principais antes
(`curl` em `/`, `/corridas/...`, `/consulta`, `/admin/login`, `/loja`) reduz timeouts.

## Segurança

O `next.config.ts` envia em todas as rotas `Content-Security-Policy`, `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` e
`Permissions-Policy: camera=(), microphone=(), geolocation=()`. As páginas de inscrição e consulta usam
`Referrer-Policy: no-referrer`. A CSP é sem nonce (com `'unsafe-inline'`): nonce obrigaria a renderizar
todas as páginas sob demanda e não combina com o Partial Prerendering.

## Marca

Logos oficiais vão em `public/brand/` (`vertex-logo.png`, `vertex-logo-white.png`, `vertex-symbol.png`).

---
Desenvolvido por Pedro Benjamin
