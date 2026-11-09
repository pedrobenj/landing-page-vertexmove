# Migração para a API VertexMove: plano de implementação

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or superpowers:subagent-driven-development) to implement this plan task-by-task.

**Goal:** Adaptar o front ao novo `CLAUDE.md`, em quatro frentes:
- consumir a API VertexMove (NestJS) no padrão BFF;
- remover Prisma e NextAuth;
- entregar a nova home e as páginas da referência corredasamigas.com.br;
- implementar inscrição, consulta e o admin de catálogo.

Tudo deve rodar sem backend em modo mock.

**Architecture:**
- **Acesso à API.** Todo acesso passa por `src/server/api/` (somente servidor):
  - `apiFetch` monta a URL, os headers, o timeout e o `X-Forwarded-For`, e converte erros em `ApiError`;
  - `adminFetch` acrescenta o Bearer lido do cookie;
  - `endpoints/*` têm uma função tipada por rota.
- **Modo mock** (`USE_MOCK_API=true`): `apiFetch` troca o `fetch` real por um `mockFetch`, que implementa as mesmas rotas e devolve `Response` no formato exato do contrato (status, corpo, `Set-Cookie`, erros `{ error: { codigo, mensagem } }`). Endpoints, parser de cookies e tratamento de erros são exercitados igualmente nos dois modos.
- **Sessão do admin:**
  - cookies HttpOnly do Next (`vm_admin_at`, `vm_admin_rt`, `vm_admin_csrf`);
  - renovação no `proxy.ts`;
  - login e logout por server actions.
- **Loja:** não existe no contrato. Passa a ser um "backend falso" em `src/server/api/mocks/store/`, acessado só por `endpoints/store.ts`. Sem mock, `endpoints/store.ts` lança `ApiError(503, "LOJA_INDISPONIVEL")` e as páginas da loja mostram "Loja em breve".

**Tech Stack:**
- Next.js 16.4 (App Router, Cache Components, `proxy.ts` em runtime Node)
- React 19.3, TypeScript strict, Tailwind v4, shadcn/ui
- Zod 4, React Hook Form, TanStack Query 5, Zustand 5, date-fns + @date-fns/tz
- Vitest 4 e Playwright

---

## Convenções para quem executar

- **Leia `CLAUDE.md` inteiro antes da primeira tarefa.** Ele é a fonte de verdade para nomes, estrutura, regra de um componente por arquivo, os 4 estados de dados e `HttpResponse`. Leia também `AGENTS.md` e, antes de usar uma API do Next, o guia correspondente em `node_modules/next/dist/docs/`. Os mais usados aqui:
  - `01-app/03-api-reference/03-file-conventions/proxy.md`
  - `01-app/01-getting-started/08-caching.md`
  - `01-app/01-getting-started/09-revalidating.md`
- **shadcn:** `npx shadcn add` sobrescreve `src/lib/utils/cn.ts` e gera imports `from "cn"`. Depois de cada `add`, rode `git checkout src/lib/utils/cn.ts` e troque `from "cn"` por `from "@/lib/utils"` nos arquivos gerados.
- **Antes de cada commit:** `npm run lint && npm run typecheck && npm test`. Antes de commits que mexem em rotas, rode também `npm run build`.
  - O build roda **sem** mock: `USE_MOCK_API=false API_URL=http://localhost:3000 npm run build`.
  - A API não precisa estar de pé. As páginas que dependem dela são dinâmicas, ou tratam o erro de conexão como `ServerError`.
- **Commits:** Conventional Commits, em português, terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Rotas:** `next typegen` gera `PageProps<"/rota">` e `LayoutProps<"/rota">`. O script `typecheck` já roda o typegen.
- **Páginas com 404 real:**
  - `notFound()` dentro de `<Suspense>` responde 200. Para devolver 404, use o padrão bloqueante já usado em `src/app/admin/(panel)/loja/produtos/[id]/page.tsx`: `export const instant = false`, buscar os dados no corpo da página e chamar `notFound()` antes de renderizar.
  - Leia esse arquivo antes de criar uma página com 404.
- **Este repositório roda numa máquina com 8 GB de RAM:** e2e com `workers: 2`.

---

## Lote 1 — Fundação

### Task 1: Remover Prisma, NextAuth e regras de servidor

**Delete:**
- **Prisma e banco:** `prisma/`, `prisma.config.ts`, `src/generated/`, `src/server/db.ts`.
- **Auth:** `src/auth.ts`, `src/auth.config.ts`, `src/types/next-auth.d.ts`, `src/app/api/auth/`, `src/server/auth/`.
- **API do Next:** `src/app/api/webhooks/` (o webhook fica no backend). Remova também `src/app/api/` se ficar vazio.
- **Regras de servidor:**
  - `src/server/services/capacity.service.ts`, `src/server/services/pricing.service.ts`, `src/server/services/event.service.ts`, `src/server/payments/`;
  - `src/server/repositories/prisma-store.repository.ts`;
  - `src/server/rate-limit.ts`, `src/server/rate-limit.test.ts`, `src/server/request-rate-limit.ts`;
  - `src/server/mocks/admin-user.mock.ts`, `src/server/mocks/open-events.mock.ts`.
- **Tipos, enums e utils obsoletos:**
  - `src/types/price-breakdown.interface.ts`, `src/types/registration-lookup-item.interface.ts`, `src/types/registration-filters.interface.ts`;
  - `src/stores/admin-registrations-filters-store.ts`, `src/lib/validations/admin-login.schema.ts`;
  - `src/enums/coupon-type.enum.ts`, `src/enums/gender.enum.ts`, `src/enums/payment.enum.ts`;
  - `src/lib/utils/unique-violation-target.ts` e o seu `.test.ts`;
  - `src/lib/validations/participant.schema.ts`, `src/lib/validations/registration.schema.ts`.
- **Cópia antiga do e-mail:** `src/emails/` (sai do escopo do front).

**Modify:**
- `package.json`:
  - remover as dependências `@prisma/adapter-pg`, `@prisma/client`, `next-auth`, `bcryptjs`, `pg` e `cn` (pacote errado instalado pelo shadcn);
  - remover as devDependencies `prisma`, `@types/pg` e `dotenv`;
  - remover os scripts `postinstall` e `db:*`;
  - `"dev": "next dev -p 3001"` e `"start": "next start -p 3001"`.
  - Rodar `npm uninstall @prisma/adapter-pg @prisma/client next-auth bcryptjs pg cn prisma @types/pg dotenv`.
- `src/enums/product-type.enum.ts` e `src/enums/order-status.enum.ts`: hoje reexportam de `@/generated/prisma`. Reescrever como enums próprios, seguindo §10 do CLAUDE.md (SCREAMING_SNAKE_CASE, valores iguais aos atuais para não quebrar a loja):
  ```ts
  // src/enums/product-type.enum.ts
  export enum PRODUCT_TYPE {
    SHIRT = "SHIRT",
    MEDAL = "MEDAL",
  }
  export const PRODUCT_TYPE_LABEL: Record<PRODUCT_TYPE, string> = { SHIRT: "Camisas", MEDAL: "Medalhas" }
  ```
  - Preserve os labels e exports auxiliares que os arquivos atuais tiverem: leia-os antes.
  - O mesmo vale para `ORDER_STATUS` (PENDING, PAID, READY_FOR_PICKUP, PICKED_UP, CANCELLED, EXPIRED, REFUNDED).
  - Atualize todos os imports com `grep -rn "generated/prisma" src`.
- `src/enums/event-status.enum.ts` e `src/enums/registration-status.enum.ts`: reescrever com os literais da API (lista "a confirmar com o backend", §16):
  ```ts
  export enum EVENT_STATUS {
    DRAFT = "rascunho",
    PUBLISHED = "publicado",
    CLOSED = "encerrado",
    CANCELLED = "cancelado",
    ARCHIVED = "arquivado",
  }
  export enum REGISTRATION_STATUS {
    PENDING = "pendente",
    CONFIRMED = "confirmada",
    CANCELLED = "cancelada",
    EXPIRED = "expirada",
  }
  ```
  - Labels **não** ficam no enum: vão para `src/lib/utils/status-labels.ts` (Task 2).
  - Apague `registration-step.enum.ts` só se não houver uso após a Task 13. Por ora, mantenha.
- `src/lib/env.ts`:
  ```ts
  const serverEnvSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    API_URL: z.url().default("http://localhost:3000"),
    API_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
    /** Responde as chamadas à API com dados fictícios (sem backend). Somente fora de produção. */
    USE_MOCK_API: z.stringbool().default(false),
  })
  ```
  - Manter o tratamento de erro atual e o `throw` se `NODE_ENV === "production" && USE_MOCK_API`.
- `.env.example`: substituir pelo bloco de §13 do CLAUDE.md, mais `USE_MOCK_API=false`.
  - Avise no relatório que o `.env` local do usuário precisa ganhar `USE_MOCK_API=true` (não edite o `.env`: ele é do usuário).
- `playwright.config.ts`:
  - `PORT` padrão `3001`;
  - `webServer.env = { USE_MOCK_API: "true" }` (remover `DATABASE_URL`, `AUTH_SECRET` e `USE_MOCK_DATA`);
  - atualizar o comentário do topo.
- `vitest.config.mts`: remover referências a Prisma, se houver.
- `src/proxy.ts`: substituir temporariamente por um proxy que só deixa passar. A versão real entra na Task 7.
  ```ts
  import { NextResponse } from "next/server"
  export default function proxy() { return NextResponse.next() }
  export const config = { matcher: ["/admin/:path*"] }
  ```

**Ponto de compilação temporário.** Páginas e actions que usavam o que foi removido devem ficar compilando:
- `src/app/actions/admin-auth.ts` e `src/app/actions/store.ts`: stubs que retornam `{ status: 503, error: "Em migração" }`;
- `src/app/(public)/components/open-events.tsx`: `ServerError`;
- telas de admin que chamavam `getAdminSession`: removem a checagem (o proxy protegerá na Task 7).

Marque cada stub com `// TODO(migracao): Task N`. Os testes unitários que dependem de arquivos deletados são removidos junto com eles.

**Verify:**
- `grep -rn "prisma\|next-auth\|USE_MOCK_DATA\|getAdminSession" src e2e` → vazio, exceto TODOs e comentários a remover.
- `npm run lint && npm run typecheck && npm test`.

**Commit:** `refactor!: remove Prisma e NextAuth; front passa a consumir a API VertexMove`

---

### Task 2: Tipos da API, enums e utilitários puros

**Create** `src/types/api/` (chaves exatamente como a API, §6 e §10):
- `cursor-page.interface.ts`: `CursorPage<T>`.
- `api-error-body.interface.ts`: `ApiErrorBody`.
- `event.interface.ts`:
  - `EventLocation { localNome; endereco?; complemento?; bairro?; cidade; uf; cep?; latitude?: number | null; longitude?: number | null }`;
  - `PublicEvent { slug; nome; descricao; dataEvento; horarioLargada; localizacao: EventLocation; imagemCapaUrl: string | null }`.
- `public-event-detail.interface.ts`:
  - `PublicEventDetail extends PublicEvent` com `galeriaUrl?: string | null`;
  - mais os campos **propostos em §16** (comentar isso no arquivo), todos opcionais:
    - `distancias?: PublicDistance[]`;
    - `kits?: PublicKit[]`;
    - `tamanhosCamisa?: ShirtSize[]`;
    - `documentosVigentes?: PublicDocument[]`.
  - `PublicDistance { id: number; nome; descricao?; distanciaMetros; horarioLargada?; percursoUrl?; loteVigente: { nome: string; precoCentavos: number } | null; esgotado: boolean }`;
  - `PublicKit { id: number; nome; descricao?; fotos: KitPhoto[] }`;
  - `PublicDocument { id: number; tipo: DOCUMENT_TYPE; versao: string; titulo: string; url: string }`.
- `admin-event.interface.ts`:
  - `AdminEvent`: todos os campos do evento de §6 mais `id: number; status: EVENT_STATUS; localizacao: EventLocation; localizacaoResumo: string`;
  - `AdminEventInput`: os campos editáveis (`slug, nome, descricao, dataEvento, horarioLargada, localNome, endereco, complemento, bairro, cidade, uf, cep, latitude, longitude, imagemCapaUrl, galeriaUrl`), com os opcionais como `string | null` / `number | null`.
- `distance.interface.ts`: `Distance` (`id, eventoId, nome, descricao, distanciaMetros, capacidadeTotal, horarioLargada, percursoUrl, ordem, ativo`) e `DistanceInput`.
- `price-tier.interface.ts`: `PriceTier` (`id, distanciaId, nome, precoCentavos, inicioEm, fimEm, quantidadeTotal, ordem, ativo`) e `PriceTierInput`.
- `kit.interface.ts`: `Kit` (`id, eventoId, nome, descricao, ativo, fotos: KitPhoto[]`), `KitPhoto { url; alt; ordem }` e `KitInput`.
- `shirt-size.interface.ts`: `ShirtSize` (`id, codigo, descricao, ordem, ativo`) e `ShirtSizeInput`.
- `document.interface.ts`: `EventDocument` (`id, eventoId, tipo, versao, titulo, url, hashSha256, vigenteEm`) e `EventDocumentInput`.
- `registration.interface.ts`:
  - `CreateRegistrationInput` (corpo de `POST /inscricoes`);
  - `CreatedRegistration` (resposta 201);
  - `RegistrationLookupInput = { cpf: string } | { whatsapp: string }`;
  - `RegistrationLookupItem { nomeMascarado; evento; distancia; status: REGISTRATION_STATUS; inscritoEm }`.
- `admin-auth.interface.ts`:
  - `AdminProfile { id: number; nome; email; papel: ADMIN_ROLE; mfaAtivo }`;
  - `AdminLoginResponse { accessToken; tokenType: "Bearer"; expiresIn; csrfToken; admin: Omit<AdminProfile, "email"> }`;
  - `AdminRefreshResponse { accessToken; expiresIn; csrfToken }`.
- `audit-entry.interface.ts`: `AuditEntry { id: number; acao: string; entidade: string; entidadeId: string | null; adminNome: string | null; criadoEm: string; detalhes?: Record<string, unknown> }`. O formato não está no contrato: comente "formato a confirmar com o backend".

**Create** `src/enums/`:
- `document-type.enum.ts`: `DOCUMENT_TYPE { REGULATION = "regulamento", LIABILITY_TERM = "termo_responsabilidade" }`.
- `api-error-code.enum.ts`: `API_ERROR_CODE`, com os códigos de §6 mais `TIMEOUT`, `INDISPONIVEL`, `LOJA_INDISPONIVEL` e `DESCONHECIDO`.
- `admin-role.enum.ts`: `ADMIN_ROLE { ORGANIZATION = "organizacao", OPERATOR = "operador", SUPER_ADMIN = "super_admin" }`. Os valores são palpites: comente "confirmar com o backend (§16)".
- `event-action.enum.ts`: `EVENT_ACTION { PUBLISH = "publicar", UNPUBLISH = "despublicar", CLOSE = "encerrar", CANCEL = "cancelar", RESTORE = "restaurar" }`.

**Create** `src/lib/utils/`, cada um com `.test.ts` (TDD: escreva o teste, veja falhar, implemente):
- `normalize-cpf.ts`: `normalizeCpf(v) = onlyDigits(v).slice(0, 11)`.
- `to-e164-phone.ts`: `toE164Phone("(85) 99999-9999") === "+5585999999999"`. Aceita entrada que já tenha `55` na frente com 12–13 dígitos. Lança `Error` se não houver 10–11 dígitos nacionais.
- `is-valid-br-phone.ts`: 10–11 dígitos, DDD de 11 a 99, e o celular de 11 dígitos começa com 9.
- `format-distance.ts`: `5000 → "5 km"`, `21097 → "21,1 km"`, `800 → "800 m"`.
- `format-api-date.ts`:
  - `formatApiDate("2026-12-06") → "06/12/2026"` e `formatApiDateLong → "domingo, 6 de dezembro de 2026"`;
  - use `parseISO` ou construção local, **sem** deslocar o fuso (data pura);
  - `toApiDate("06/12/2026") → "2026-12-06"`.
- `api-errors.ts`: `getApiErrorMessage(codigo: string | undefined, fallback?: string)`, com as mensagens da tabela de §6. Também cobre:
  - `TIMEOUT`: "A conexão demorou demais. Tente novamente.";
  - `INDISPONIVEL`: "Serviço indisponível no momento. Tente em alguns minutos.";
  - `LOJA_INDISPONIVEL`: "A loja estará disponível em breve.";
  - padrão: "Algo deu errado. Tente novamente."
- `status-labels.ts`: `getEventStatusLabel`, `getEventStatusBadgeClass`, `getRegistrationStatusLabel` e `getRegistrationStatusBadgeClass`, com as classes do tema (`bg-cta text-cta-foreground`, `bg-muted`, etc.).
- `mask-name.ts`: não criar; o mascaramento vem pronto da API.

**Modify** `src/lib/utils/index.ts`: exportar os novos utilitários e remover os deletados.

Em `src/lib/utils/query-keys.ts`, substituir pelo conjunto novo:
- `events.public()` e `events.detail(slug)`;
- `admin.events(filters)`, `admin.event(id)`, `admin.distances(eventId)`, `admin.priceTiers(distanceId)`, `admin.kits(eventId)`, `admin.documents(eventId)`, `admin.shirtSizes()` e `admin.audit(cursor)`;
- `registrations.lookup(input)`;
- `store.cart(items)`, que já existe.

**Modify** `src/types/http-response.interface.ts`: adicionar `code?: string` (§10).

**Verify:** `npm test` (novos testes passando), lint e typecheck.

**Commit:** `feat(api): tipos do contrato VertexMove e utilitários de formatação`

---

### Task 3: Cliente HTTP (`apiFetch`) e `ApiError`

**Create** `src/server/api/api-error.ts`:
```ts
import "server-only"

export class ApiError extends Error {
  override readonly name = "ApiError"
  constructor(
    readonly status: number,
    readonly codigo: string,
    readonly mensagem: string,
  ) {
    super(`${status} ${codigo}: ${mensagem}`)
  }
}

/** instanceof falha entre módulos recarregados pelo HMR — compare pelo name. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && error.name === "ApiError"
}
```

**Create** `src/server/api/transport.ts`:
```ts
import "server-only"
import { env } from "@/lib/env"

export type Transport = (url: string, init: RequestInit) => Promise<Response>

export async function getTransport(): Promise<Transport> {
  if (!env.USE_MOCK_API) return fetch
  const { mockFetch } = await import("./mocks/mock-fetch")
  return mockFetch
}
```

**Create** `src/server/api/client-ip.ts`: `getForwardHeaders()` lê `headers()` do Next e devolve `{ "X-Forwarded-For": ip, "User-Agent": ua }`, onde `ip` é o primeiro IP de `x-forwarded-for` ou `x-real-ip`. Use `try/catch`: fora de uma request (build ou cache), devolve `{}`.

**Create** `src/server/api/api-client.ts`, com a assinatura:
```ts
export interface ApiFetchOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
  query?: Record<string, string | number | undefined | null>
  headers?: Record<string, string>
  /** Repassa IP/UA do atleta (rate limit do backend). Padrão: true */
  forwardClient?: boolean
}
export interface ApiResult<T> { data: T; headers: Headers; status: number }

export async function apiFetchRaw<T>(path: string, options?: ApiFetchOptions): Promise<ApiResult<T>>
export async function apiFetch<T>(path: string, options?: ApiFetchOptions): Promise<T> // = (await apiFetchRaw).data
```

Comportamento de `apiFetchRaw`:
1. **Montar a requisição:**
   - URL = `${env.API_URL}/api/v1${path}`, mais a query sem valores `undefined`/`null`;
   - headers `Accept: application/json` e, se houver body, `Content-Type: application/json`;
   - `X-Forwarded-For`/`User-Agent` quando `forwardClient !== false`;
   - `cache: "no-store"` sempre: o cache das listas públicas é feito por `"use cache"` nos endpoints, nunca pelo fetch.
2. **Timeout:** `AbortSignal.timeout(env.API_TIMEOUT_MS)`. `TimeoutError`/`AbortError` → `ApiError(504, "TIMEOUT", ...)`.
3. **Falha de rede** (`TypeError` do fetch) → `ApiError(503, "INDISPONIVEL", ...)`.
4. **Resposta:**
   - status `204` → `data = undefined as T`;
   - `!res.ok` → tenta ler o `ApiErrorBody` e lança `ApiError(res.status, body.error.codigo ?? "DESCONHECIDO", body.error.mensagem ?? res.statusText)`.
5. **Nunca** logue body de request ou de response (LGPD, §12).

**Test** `src/server/api/api-client.test.ts`: mocke `./transport` com `vi.mock` para devolver um `Transport` falso. Casos:
- monta URL e query;
- envia JSON;
- 204 → `undefined`;
- erro `{ error: { codigo: "INSCRICAO_DUPLICADA", ... } }` → `ApiError` com `status` 409 e o código;
- corpo de erro não JSON → `DESCONHECIDO`;
- timeout → `TIMEOUT`;
- `TypeError` → `INDISPONIVEL`;
- `forwardClient: false` não envia `X-Forwarded-For`.

Mocke `next/headers` também. O stub de `server-only` já existe em `src/test/server-only-stub.ts`: confira o alias no `vitest.config.mts`.

**Commit:** `feat(api): cliente HTTP do BFF com timeout, IP do cliente e ApiError`

---

### Task 4: Mock da API (`mockFetch`)

Objetivo: com `USE_MOCK_API=true`, todas as rotas do contrato funcionam com estado em memória, guardado em `globalThis` para sobreviver ao HMR.

**Create** `src/server/api/mocks/`:
- **`mock-db.ts`:** estado em memória (`globalThis.__vertexMockDb ??= createSeed()`). Exporta `getMockDb()` e `resetMockDb()`; o reset é usado nos testes. O seed:
  - **Eventos `publicado`:**
    - "Corrida Vertex Beira-Mar 2026" (slug `corrida-vertex-beira-mar-2026`, 2026-12-06, 05:30, Aterrinho da Praia de Iracema);
    - "Night Run Vertex" (`night-run-vertex-aterro`, 2027-01-23, 19:00);
    - "Desafio Vertex Parque do Cocó" (`desafio-vertex-parque-do-coco`, 2027-03-14, 06:00).
    - Endereços em Fortaleza/CE, com latitude/longitude reais aproximadas.
  - **Eventos fora da lista pública:** um `rascunho` ("Corrida de Natal Vertex 2026") e um `encerrado` ("Corrida Vertex Beira-Mar 2025", 2025-12-07).
  - **Distâncias:** por evento, 5 km, 10 km e Caminhada 3 km. Cada uma com um lote vigente (`inicioEm` no passado e `fimEm` no futuro, relativos a `new Date()` no momento do seed) e um lote futuro.
  - **Esgotada:** no evento 2, uma distância com `esgotado: true` (capacidade lotada).
  - **Kits:** "Kit Básico" (camisa, número de peito e medalha) e "Kit Premium" (+ viseira), com `fotos: []`.
  - **Tamanhos de camisa:** PP, P, M, G, GG e XGG, ativos.
  - **Documentos:** por evento, um regulamento (id 101 em diante) e um termo (102 em diante), versão "1.0", com `url` `https://example.com/regulamento.pdf`.
  - **Admins:**
    - `admin@example.com` (papel `organizacao`) e `operador@example.com` (`operador`), senha `Vertex@Dev12345`;
    - `superadmin@example.com`, com `mfaAtivo: true`.
  - **Inscrições:** uma lista vazia e uma trilha de auditoria com alguns registros iniciais.
- **`mock-auth.ts`:** tokens sem estado e verificáveis:
  - `accessToken = "mock-at." + base64url(JSON.stringify({ adminId, exp }))`, com `exp = agora + 900 s`;
  - `refreshToken = "mock-rt." + base64url({ adminId, jti })`;
  - `csrfToken = "mock-csrf." + random`.
  - Funções: `issueSession(adminId)`, `readAccessToken(token) → adminId | null` (valida `exp`) e `readRefreshToken(token)`.
  - Não guardar sessões no db: o `proxy.ts` pode rodar noutro contexto de módulo.
- **`mock-routes.ts`:** tabela `{ method, pattern: RegExp, handler(ctx) }`, sendo `ctx = { params, query, body, headers, cookies }`, que devolve `Response`. Use os helpers `json(status, body, init?)`, `noContent()` e `apiError(status, codigo, mensagem)`.
- **`mock-fetch.ts`:** `mockFetch: Transport`. Faz o parse da URL (remove `${env.API_URL}/api/v1`), encontra a rota (404 `{ error: { codigo: "NAO_ENCONTRADO" } }` se não achar), aplica um atraso de 150–300 ms para os skeletons aparecerem e chama o handler.

**Rotas obrigatórias** (validar entradas como o backend faria; formatos de §6):

| Rota | Comportamento |
|---|---|
| `GET /eventos` | Só `publicado`, ordenado por data, paginação por cursor (cursor = id em string, `limit` padrão 20). Sem `status` nem `id`. |
| `GET /eventos/:slug` | `PublicEventDetail` com distâncias (lote vigente calculado pela data atual), kits ativos, tamanhos ativos e documentos vigentes. Não publicado → 404. |
| `POST /inscricoes` | Ver regras abaixo. |
| `POST /inscricoes/consulta` | Exatamente um de `cpf`/`whatsapp`, senão 422 `DADO_INVALIDO`. Filtra as inscrições do mock. Nome mascarado no formato "Ana S****". |
| `POST /admin/auth/login` | Ver regras abaixo. |
| `POST /admin/auth/refresh` | Exige o cookie `vm_admin_rt` válido, `vm_admin_csrf` igual ao header `X-CSRF-Token` (senão 403 `ACESSO_NEGADO`), e rotaciona. |
| `POST /admin/auth/logout` | Mesmas exigências do refresh → 204 e `Set-Cookie` expirando os cookies. |
| `GET /admin/me` | Bearer válido, senão 401 `NAO_AUTENTICADO`. |
| `GET /admin/auditoria` | Cursor. |
| Eventos admin | `GET /admin/eventos?status&cursor&limit`, `POST /admin/eventos` (201 + `Location`, status `rascunho`, slug duplicado → 409 `SLUG_DUPLICADO`), `GET`, `PATCH` e `DELETE` (soft delete → 204). |
| Ações do evento | `POST /admin/eventos/:id/:acao`. Transições válidas: publicar (rascunho→publicado), despublicar (publicado→rascunho), encerrar (publicado→encerrado), cancelar (rascunho/publicado→cancelado), restaurar (cancelado/encerrado→rascunho). Inválida → 422 `TRANSICAO_INVALIDA`. Cada ação grava uma entrada de auditoria. |
| Catálogo admin | Distâncias, lotes, kits, tamanhos e documentos: `GET` (array simples), `POST` (201) e `PATCH` (200), exceto documentos, que não têm PATCH. Todas exigem Bearer e gravam auditoria nas mutações. |

Regras de `POST /inscricoes`:
- evento publicado e distância do evento não esgotada;
- pelo menos um de `cpf`/`whatsapp`, com CPF válido (`isValidCpf`) e WhatsApp em E.164;
- `documentosAceitos` contém os IDs do regulamento e do termo vigentes, senão 422 `DOCUMENTO_ACEITE_OBRIGATORIO`;
- duplicata (mesmo cpf, ou mesmo whatsapp + nome + nascimento, na mesma distância) → 409 `INSCRICAO_DUPLICADA`;
- CPF já ligado a outro WhatsApp → 409 `IDENTIDADES_CONFLITANTES`;
- código `VX-{ano}-{sequencial com 8 dígitos}`;
- valor base = preço do lote vigente; desconto 0, exceto 50% para quem tiver 60 anos ou mais na data da prova (só para exibir `valorDescontoCentavos` no mock);
- resposta 201 sem PII.

Regras de `POST /admin/auth/login`:
- `{ email, senha }`; inválido → 401 `NAO_AUTENTICADO`;
- `superadmin@example.com` → 403 `MFA_NECESSARIO`;
- 5 falhas seguidas do mesmo e-mail → 401 também (lockout simplificado);
- sucesso → 200 com `AdminLoginResponse` e dois headers `Set-Cookie`:
  - `vm_admin_rt=<rt>; Path=/api/v1/admin/auth; HttpOnly; Max-Age=604800; SameSite=Strict`;
  - `vm_admin_csrf=<csrf>; Path=/; Max-Age=604800; SameSite=Strict`.
  - Use `Headers.append("Set-Cookie", ...)`.

**Test** `src/server/api/mocks/mock-fetch.test.ts`, com `resetMockDb()` em `beforeEach`:
- lista pública sem rascunho;
- detalhe 404 para rascunho;
- inscrição feliz (201, formato do código);
- duplicata 409;
- documentos faltando 422;
- consulta com os dois campos 422;
- login (cookies presentes), refresh com csrf errado 403, e ação de evento com transição inválida 422.

**Commit:** `feat(api): modo mock da API VertexMove (USE_MOCK_API)`

---

### Task 5: Endpoints tipados

**Create** `src/server/api/endpoints/`. Uma função por rota, sem lógica além de montar a chamada.
- `events.ts` (público, cacheável):
  ```ts
  export async function listPublicEvents(cursor?: string): Promise<CursorPage<PublicEvent>> {
    "use cache"
    cacheTag("events")
    cacheLife({ stale: 60, revalidate: 60, expire: 300 })
    return apiFetch("/eventos", { query: { cursor, limit: 50 }, forwardClient: false })
  }
  export async function getPublicEvent(slug: string): Promise<PublicEventDetail> {
    "use cache"
    cacheTag("events", `event:${slug}`)
    cacheLife({ stale: 60, revalidate: 60, expire: 300 })
    return apiFetch(`/eventos/${encodeURIComponent(slug)}`, { forwardClient: false })
  }
  ```
  - Confira em `08-caching.md` a importação de `cacheTag`/`cacheLife` e se `headers()` é proibido dentro de `"use cache"`. Por isso o `forwardClient: false`: o `getForwardHeaders` não pode rodar dentro do cache.
  - O `ApiError` lançado dentro de `"use cache"` precisa chegar ao chamador. Teste com 404 no mock: se o erro não atravessar, troque por um retorno discriminado `{ ok: false, status }`.
- `registrations.ts`: `createRegistration(input)` e `lookupRegistrations(input)` (sem cache).
- `admin-auth.ts`:
  - `loginRequest(email, senha)` → `apiFetchRaw` (precisa dos headers para os `Set-Cookie`), com `forwardClient: true`;
  - `refreshRequest({ refreshToken, csrfToken })` e `logoutRequest(...)` → enviam `Cookie` e `X-CSRF-Token`;
  - `getMe()` → `adminFetch` (Task 6).
- `admin-events.ts`: `listAdminEvents({ status, cursor, limit })`, `getAdminEvent(id)`, `createAdminEvent(input)`, `updateAdminEvent(id, input)`, `deleteAdminEvent(id)` e `runEventAction(id, action: EVENT_ACTION)`.
- `distances.ts`, `price-tiers.ts`, `kits.ts`, `shirt-sizes.ts`, `documents.ts` e `audit.ts`, seguindo as rotas de §6.

Todos os endpoints de admin usam `adminFetch` (Task 6). Para não travar a ordem das tasks, a Task 5 já pode criar `admin-fetch.ts` com um placeholder que lança `Error("Task 6")`; ele é substituído na Task 6. Melhor ainda: faça as Tasks 5 e 6 no mesmo commit, se for mais simples.

**Test** `src/server/api/endpoints/events.test.ts`, contra o mock real (`USE_MOCK_API=true` via `vi.stubEnv` antes do import dinâmico, ou mockando `@/lib/env`). Se `"use cache"` atrapalhar no Vitest, teste as funções de mais baixo nível e deixe uma nota.

**Commit:** `feat(api): endpoints tipados do catálogo, inscrições e admin`

---

## Lote 2 — Sessão do admin

### Task 6: Cookies de sessão e `adminFetch`

**Create** `src/server/api/set-cookie-parser.ts`, com teste: `parseSetCookies(headers: Headers): Record<string, { value: string; maxAge?: number }>`. Usa `headers.getSetCookie()` (disponível no Node ≥ 20) e trata `Max-Age` e `Expires`.

**Create** `src/server/api/admin-session.ts`:
```ts
export const SESSION_COOKIES = { access: "vm_admin_at", refresh: "vm_admin_rt", csrf: "vm_admin_csrf" } as const
/** Renova antes de expirar: o cookie do access token vive (expiresIn - 60) s. */
export const ACCESS_TOKEN_SAFETY_MARGIN_S = 60

export interface SessionTokens { accessToken: string; expiresIn: number; refreshToken: string; refreshMaxAge: number; csrfToken: string }

export function sessionCookieOptions(maxAge: number) // { httpOnly: true, secure: NODE_ENV === "production", sameSite: "lax", path: "/", maxAge }
export async function writeSession(tokens: SessionTokens)  // via cookies() — só em actions/route handlers
export async function readSession(): Promise<{ accessToken?: string; refreshToken?: string; csrfToken?: string }>
export async function getAccessToken(): Promise<string | null>
export async function clearSession()
export function applySessionToResponse(res: NextResponse, tokens: SessionTokens) // usado pelo proxy
export function clearSessionOnResponse(res: NextResponse)
```
- `maxAge` do access = `Math.max(expiresIn - ACCESS_TOKEN_SAFETY_MARGIN_S, 30)`.
- `refreshMaxAge` vem do `Max-Age` do `Set-Cookie` do backend (padrão 7 dias).
- `secure` só em produção: em `http://localhost` o browser recusaria o cookie.

**Create** `src/server/api/admin-fetch.ts`:
- `adminFetch<T>(path, options)` lê o token com `getAccessToken()`;
- sem token → `redirect("/admin/login")`;
- chama `apiFetch` com `Authorization: Bearer`;
- `ApiError` 401 → `redirect("/admin/login")` (sem limpar cookies: Server Components não gravam cookies, e o proxy limpará na próxima navegação);
- os demais erros sobem.

**Create** `src/server/api/session-refresh.ts`: `refreshSession(refreshToken, csrfToken): Promise<SessionTokens | null>`. Chama `refreshRequest`, junta o JSON com os `Set-Cookie` e devolve `null` em qualquer erro. Sem `next/headers`, porque roda no proxy.

**Test:** `set-cookie-parser.test.ts` e `session-refresh.test.ts` (contra o mock: login → refresh ok; csrf errado → null).

**Commit:** `feat(admin): sessão BFF em cookies HttpOnly e adminFetch`

---

### Task 7: `proxy.ts`, login, logout e layout do admin

**Rewrite** `src/proxy.ts`. Leia antes `proxy.md`, em especial as seções sobre cookies, `NextResponse.next({ request: { headers } })`, matcher e prefetch.
- Matcher: `["/admin/:path*"]`.
- **`/admin/login`:** com `vm_admin_at` ou `vm_admin_rt`, redireciona para `/admin`; senão, `next()`.
- **Demais rotas:**
  - com `vm_admin_at` → `next()`;
  - sem `vm_admin_at`, mas com `vm_admin_rt` e `vm_admin_csrf`:
    - em prefetch (header `next-router-prefetch` ou `purpose: prefetch`) → `next()`, sem renovar (§8);
    - senão, `refreshSession`. Se der certo, encaminhe a requisição com o header `cookie` atualizado (`vm_admin_at` novo), para o Server Component já ver o token nesta mesma requisição, e aplique `applySessionToResponse` na resposta. Se falhar → redirecione para `/admin/login` com `clearSessionOnResponse`;
  - sem nenhum dos dois → redirecione para `/admin/login`.

**Rewrite** `src/app/actions/admin-auth.ts`:
- `loginAdmin({ email, senha })`:
  - valida com `adminLoginSchema` (recriar em `src/lib/validations/admin-login.schema.ts` com as chaves `email` e `senha`);
  - chama `loginRequest`, lê os cookies com `parseSetCookies`, faz `writeSession` e `redirect("/admin")`;
  - `ApiError` → `HttpResponse` com `getApiErrorMessage` e `code`;
  - **sem retry**.
- `logoutAdmin()`: `logoutRequest` (ignora erro) → `clearSession()` → `redirect("/admin/login")`.

**Modify:**
- `src/app/admin/login/components/admin-login-form.tsx`: campo `senha`, toast com `title`/`error` da action e o mesmo tratamento para `MFA_NECESSARIO`. Leia o arquivo atual antes.
- `src/app/admin/(panel)/layout.tsx`:
  - nav: Eventos · Tamanhos de camisa · Auditoria · Loja;
  - nome do admin (`getMe()`) dentro de `<Suspense>`, em um componente `AdminUserBadge`;
  - logout.
- `src/app/admin/layout.tsx`: confirme `robots: { index: false }`.

**e2e** `e2e/admin.spec.ts`, reescrito:
- login com `admin@example.com` / `Vertex@Dev12345` → dashboard mostra o nome;
- senha errada → toast "E-mail ou senha inválidos.";
- `superadmin@example.com` → mensagem de MFA;
- `/admin/eventos` sem sessão → `/admin/login`;
- logout → `/admin/login`.
- **Remova** `e2e/admin-store.spec.ts` só se a loja do admin ainda não tiver migrado (Task 20); senão, ajuste o login.

**Verify:** lint, typecheck, test, build e `npx playwright test e2e/admin.spec.ts`.

**Commit:** `feat(admin): login, logout e renovação de sessão via API VertexMove`

---

## Lote 3 — Site público

### Task 8: Header, menu mobile e rodapé

**Create** `src/lib/utils/site-navigation.ts`: `SITE_NAV_ITEMS` com Início `/`, Corridas `/#corridas`, Loja `/loja`, Corridas Parceiras `/corridas-parceiras`, Conheça o Vertex `/sobre`, Parceiros `/parceiros` e Contato `/contato`. O link "Área administrativa" fica separado.

**Create** `src/lib/utils/contact-info.ts`:
- `CONTACT_INFO = { email: "contato@vertexcorrida.com.br" /* TODO cliente */, city: "Fortaleza/CE" }`;
- WhatsApp e Instagram vêm de `publicEnv`;
- `SITE_TAGLINE = "Corra. Conecte-se. Evolua."` (TODO: frase do cliente, §16).

**Modify** `src/components/layout/site-header.tsx`:
- desktop (lg+): logo, links de `SITE_NAV_ITEMS`, `CartButton` e o link discreto "Área administrativa";
- mobile: logo, `CartButton` e botão de menu que abre `MobileNav` (Sheet lateral, com `useCloseOnRouteChange`).

**Create:**
- `src/components/layout/mobile-nav.tsx` (`"use client"`);
- `src/components/layout/site-nav-link.tsx` (item do `.map`);
- `src/components/layout/footer-nav-link.tsx`.

**Modify** `src/components/layout/site-footer.tsx`:
- coluna 1: logo branca e tagline;
- coluna 2: "Contato" (WhatsApp `wa.me`, Instagram, e-mail);
- coluna 3: navegação;
- base: `© <CurrentYear /> Vertex Grupo de Corrida · Desenvolvido por Pedro Benjamin` e o link Privacidade.
- Se WhatsApp ou Instagram estiverem vazios, mostre o item com "em breve", porque o CLAUDE.md pede contato sempre preenchido. Avise no relatório que o `.env` precisa dos valores.

**e2e** `e2e/navigation.spec.ts`: links do menu desktop; menu mobile abre, navega e fecha; rodapé com o crédito.

**Commit:** `feat(layout): menu da referência, navegação mobile e rodapé com contato`

---

### Task 9: Home na ordem da referência

**Delete:** `final-cta-section.tsx` e `featured-products*.tsx`, se forem substituídos. Revise o `index.ts`.

**Create/Modify** em `src/app/(public)/components/`, um arquivo por componente. Itens de `.map` vão em arquivos `*-item.tsx`; dados estáticos em `src/lib/utils/*.ts` ou num `*.ts` de constantes na pasta `components`, seguindo o padrão atual de `how-it-works-steps.ts`.
1. **`hero-section.tsx`:**
   - eyebrow "GRUPO DE CORRIDA";
   - título "Corra. Conecte-se. Evolua." (Montserrat 800, caixa alta);
   - uma linha sobre o Vertex;
   - CTAs: "Quero me inscrever" (cta → `#corridas`) e "Conheça nossa história" (outline → `/sobre`);
   - chevron como marca d'água (o uso marcante da tela).
2. **`highlight-cards-section.tsx`**, mais `highlight-card.tsx` e `highlight-cards.ts`: os três cards de §2 (Próximas corridas, Consultar inscrição, Loja). Grade de 3 colunas no `md+`, empilhada no mobile.
3. **`open-events-section.tsx`** (`id="corridas"`):
   - eyebrow, título "Escolha seu próximo desafio" e texto curto;
   - `<Suspense fallback={<EventListSkeleton />}><OpenEvents /></Suspense>`;
   - link "Ver corridas encerradas" → `/corridas/encerradas`.
   - `open-events.tsx`: `await connection()` só se necessário (o endpoint é `"use cache"`; veja o guia). Chama `listPublicEvents()`. `ApiError` → `ServerError`. Vazio → `EmptyState` "Nenhuma corrida aberta no momento." / "Volte em breve!", com CTA para corridas encerradas.
   - `event-list-item.tsx`:
     - recebe `PublicEvent`;
     - capa com `next/image` quando houver `imagemCapaUrl`; senão, um bloco navy com chevron;
     - badge "Inscrições abertas";
     - nome, `formatApiDate(dataEvento)` · largada `horarioLargada`, e `localizacao.localNome`, `cidade`/`uf`;
     - botão "Garantir minha vaga" → `/corridas/[slug]`.
4. **`how-it-works-section.tsx`:** mantido. Passos: escolha a prova → escolha a distância → inscreva-se → retire o kit → corra → receba a medalha. Atualize os textos.
5. **`lookup-section.tsx`:** "Acompanhe sua inscrição"; reaproveita o `LookupForm` da Task 13 inline, ou um CTA para `/consulta`. Comece com o CTA; a Task 13 troca pelo form inline.
6. **`store-teaser-section.tsx`:** "Vista o movimento", texto curto, imagem/ícone e CTA "Conhecer a loja" → `/loja`.
7. **`more-than-running-section.tsx`**, mais `value-badge.tsx` e `value-badges.ts`:
   - "Mais que corrida", com 4 selos de ícone lucide + frase: Ambiente acolhedor, Para todos os níveis, Experiências marcantes, Comunidade em movimento;
   - CTA "Conheça o Vertex" → `/sobre`;
   - TODO: textos do cliente.

**Modify** `src/app/(public)/page.tsx`, na ordem: Hero, HighlightCards, OpenEvents, HowItWorks, Lookup, StoreTeaser, MoreThanRunning.

**Modify** `next.config.ts`: `images.remotePatterns` com `{ protocol: "https", hostname: "**" }` comentado como TODO (restringir ao CDN quando houver). Leia o guia de `images` do Next 16 antes.

**e2e** `e2e/home.spec.ts`, reescrito:
- as 7 seções na ordem (por heading);
- os 3 cards com os links certos;
- 3 corridas do mock;
- link de corridas encerradas;
- layout em 360px sem scroll horizontal (`document.documentElement.scrollWidth <= 360`).

**Commit:** `feat(home): nova home inspirada na referência com dados da API`

---

### Task 10: Página do evento `/corridas/[slug]`

**Rewrite** `src/app/(public)/corridas/[slug]/page.tsx`, com o padrão bloqueante para 404 real:
- `instant = false`;
- `getPublicEvent(slug)`; `ApiError` 404 → `notFound()`; outros erros → `ServerError`;
- `generateMetadata` (título, descrição truncada com `truncateText`, OG com `imagemCapaUrl`);
- JSON-LD `SportsEvent` em `<script type="application/ld+json">` com `name`, `startDate` (`dataEvento` + `horarioLargada` com `-03:00`), `location` (`Place` + `PostalAddress` + `GeoCoordinates`), `image` e `organizer`. Escape `<` no JSON.

**Create** `src/app/(public)/corridas/[slug]/components/`, um componente por arquivo, com `index.ts`:
- `event-hero.tsx`: capa, nome, data longa, largada e local.
- `event-info-list.tsx` e `event-info-item.tsx`: data, largada, local, endereço.
- `event-location-map.tsx`: link "Ver no mapa" (`https://www.google.com/maps/search/?api=1&query=lat,lng`, ou endereço). Iframe só se for simples; o link basta.
- `distance-list.tsx` e `distance-list-item.tsx`:
  - nome, `formatDistance(distanciaMetros)`, largada, `loteVigente.nome` + `formatCurrency(precoCentavos)`;
  - badge "Esgotado";
  - link do percurso.
  - Sem `distancias` no payload → aviso "Distâncias e preços em breve."
- `kit-list.tsx` e `kit-list-item.tsx`: fotos com `next/image` e descrição.
- `event-documents.tsx`: links para regulamento e termo (`documentosVigentes`), mais o link para `/regulamento/[slug]`.
- `event-faq.tsx`: Accordion com 4–5 perguntas genéricas (retirada de kit, cancelamento, idade mínima, pagamento), vindas de `src/lib/utils/event-faq.ts`. TODO: textos do cliente.
- `mobile-registration-bar.tsx`: barra fixa no rodapé, só no mobile, com o preço "a partir de" e o botão "Inscrever-se" → `./inscricao`. Desktop: o botão vai no hero.
- `src/lib/utils/get-lowest-price.ts`, com teste: menor `precoCentavos` entre as distâncias não esgotadas com lote. É só exibição, nenhuma decisão de cobrança depende dele.

**Modify** `src/app/sitemap.ts`:
- estáticas: `/`, `/loja`, `/consulta`, `/sobre`, `/parceiros`, `/contato`, `/corridas-parceiras`, `/corridas/encerradas`, `/privacidade`;
- dinâmicas: `/corridas/[slug]` a partir de `listPublicEvents()`, em `try/catch` (sem API → só as estáticas).

**e2e** `e2e/event.spec.ts`:
- página do evento do mock com distâncias e preço;
- slug inexistente → 404;
- barra mobile visível em 360px e oculta no desktop;
- JSON-LD presente.
- Ajuste o `e2e/seo.spec.ts` se ele cobria sitemap/robots.

**Commit:** `feat(evento): página da corrida com distâncias, kits, FAQ e SEO`

---

### Task 11: Páginas institucionais e estáticas

Todas são Server Components estáticos, com eyebrow + título no padrão de §3 e `metadata`. Dados em `src/lib/utils/*.ts`, sempre com `// TODO(cliente)`.
- **`/sobre`:**
  - título "Conheça o Vertex" + tagline;
  - "Nossa história" e "Missão" (placeholders em tom acolhedor, sem inventar fatos específicos: datas, números e nomes ficam como TODO);
  - bloco de números (`about-stat-item.tsx`) com valores `—` e um TODO;
  - CTA "Ver próximas corridas" → `/#corridas`.
- **`/parceiros`:** grade de `partner-card.tsx` a partir de `PARTNERS` (vazio por padrão). Estado vazio: "Em breve, nossos parceiros aparecerão aqui." + CTA "Quero ser parceiro" (WhatsApp).
- **`/contato`:** cards de WhatsApp, Instagram e e-mail (`contact-channel-item.tsx`) e o bloco "Treinos" com TODO.
- **`/corridas-parceiras`:**
  - `PARTNER_RACES` em `src/lib/utils/partner-races.ts`, com tipo `PartnerRace { nome; data; cidade; distancias: string[]; cupom; descontoTexto; urlInscricao; imagemUrl? }`;
  - inicia **vazio**, com um exemplo comentado;
  - card `partner-race-card.tsx`;
  - `copy-coupon-button.tsx` (`"use client"`): `navigator.clipboard` + `toast.success("Cupom copiado!")`;
  - link externo com `rel="noopener noreferrer"` e `target="_blank"`;
  - estado vazio amigável.
- **`/corridas/encerradas`:** "Corridas que já vivemos". Não há endpoint (§16): estado vazio "O histórico das nossas corridas chega em breve." + CTA "Ver próximas corridas", e o comentário `// TODO(backend): listagem pública de encerradas`.
- **`/regulamento/[slug]`:** página bloqueante com `getPublicEvent`. Mostra os documentos vigentes (título, versão e botão "Abrir PDF" → `url`). Sem documentos → "Regulamento em breve".
- **`/privacidade`:** manter o atual. Revise as menções a dados não coletados (sexo, emergência).
- **`/inscricao/[code]`:** a API ainda não tem GET por código. Mostra "Acompanhe sua inscrição pela consulta", com CTA para `/consulta`, e `// TODO(backend)`. Valida o formato `/^VX-\d{4}-\d{8}$/`; formato inválido → `notFound()`.

**e2e** `e2e/static-pages.spec.ts`: cada página responde e mostra o título; o botão de copiar cupom é testado com uma corrida parceira injetada?
- Não: com a lista vazia, teste só o estado vazio.
- O `CopyCouponButton` ganha um teste unitário com jsdom, se fizer sentido; senão, pule.

**Commit:** `feat(site): páginas Conheça o Vertex, parceiros, contato, corridas parceiras e encerradas`

---

## Lote 4 — Inscrição e consulta

### Task 12: Formulário de inscrição em etapas

**Pré-condição:** `PublicEventDetail` precisa ter `distancias` e `documentosVigentes`. Se faltarem, a página mostra "Inscrições em breve para esta corrida." e um link de volta.

**Create** `src/lib/validations/registration.schema.ts`, com testes. As chaves são as da API:
- `distanceStepSchema`: `{ distanciaId: number, kitId: number | null, tamanhoCamisaId: number | null }`. `tamanhoCamisaId` é obrigatório quando há `kitId` e o evento tem tamanhos (refine com contexto, via factory `createDistanceStepSchema(event)`).
- `athleteStepSchema`: `{ nomeCompleto, dataNascimento (DD/MM/AAAA na UI), cpf, whatsapp, email }`:
  - nome com 2 palavras ou mais;
  - nascimento válido, no passado e com no máximo 110 anos;
  - CPF opcional, mas válido se preenchido;
  - WhatsApp opcional, mas válido (`isValidBrPhone`) se preenchido;
  - e-mail opcional e válido;
  - **pelo menos um** entre CPF e WhatsApp (refine no objeto com `path: ["cpf"]` e mensagem "Informe o CPF ou o WhatsApp").
- `termsStepSchema`: `{ aceitaRegulamento: true, aceitaTermo: true, aceitaPrivacidade: true }` (literal true, com mensagens em pt-BR).
- `toCreateRegistrationInput(eventSlug, state, documentIds)`: normaliza (`normalizeCpf`, `toE164Phone`, `toApiDate`) e omite os vazios. Vai em `src/lib/utils/to-create-registration-input.ts`, com teste.

**Rewrite** `src/stores/registration-form-store.ts`:
- estado `{ eventSlug, step, distance, athlete, terms, confirmation: CreatedRegistration | null }`;
- `confirmation` **não** é persistido (`partialize`);
- `persist` em sessionStorage, mantido.
- **Não persistir CPF/WhatsApp em storage?** Decisão: persistir o passo de atleta só em sessionStorage (some ao fechar a aba). Está de acordo com a versão atual; registre isso no comentário.

**Create** `src/app/actions/registrations.ts`:
- `createRegistrationAction(input: CreateRegistrationInput)`:
  - valida com um Zod espelho do contrato (`createRegistrationInputSchema`);
  - chama `createRegistration`;
  - 201 → `{ status: 201, data }`;
  - `ApiError` → `{ status, error: getApiErrorMessage(codigo), code: codigo, title }`.

**Create** em `src/app/(public)/corridas/[slug]/inscricao/components/`, um arquivo por componente:
- `registration-wizard.tsx` (`"use client"`, recebe `event: PublicEventDetail`): chama `start(slug)` no mount e renderiza a etapa atual.
- `registration-steps-indicator.tsx` e `registration-step-indicator-item.tsx`.
- `distance-step.tsx`:
  - RadioGroup de distâncias (`distance-option.tsx`), com esgotada desabilitada;
  - kits (`kit-option.tsx`) + opção "Sem kit" só se o evento permitir? O contrato diz kit opcional: inclua "Sem kit";
  - tamanhos (`shirt-size-option.tsx`).
- `athlete-step.tsx`: máscaras (`formatCpfInput`, `formatPhoneInput`, `formatDateInput`) e a dica "Recomendamos informar CPF e WhatsApp".
- `terms-step.tsx`: 3 checkboxes, com links para `documento.url` (versão visível) e para `/privacidade`.
- `summary-step.tsx`:
  - distância, lote, preço exibido, kit, tamanho e dados mascarados (`maskCpf`, `maskPhone`);
  - aviso "O valor final é confirmado após o envio";
  - botão "Confirmar inscrição", com guarda contra duplo envio.
  - Sucesso: salva `confirmation` no store e faz `router.push("/inscricao/confirmada")`.
  - `409 INSCRICAO_DUPLICADA` → toast com uma ação "Consultar inscrição" → `/consulta`.
  - `IDENTIDADES_CONFLITANTES` → volta para a etapa do atleta com `setError` em cpf/whatsapp.
  - `DOCUMENTO_ACEITE_OBRIGATORIO` → volta para os termos.
- `registration-closed-notice.tsx`.

**Rewrite** `src/app/(public)/corridas/[slug]/inscricao/page.tsx`:
- bloqueante (404 real);
- `getPublicEvent`;
- `metadata` com `robots: noindex`.

**Create** `src/app/(public)/inscricao/confirmada/page.tsx` + `components/registration-confirmation.tsx` (`"use client"`):
- lê `confirmation` do store;
- sem dados → mensagem e link para `/consulta`;
- com dados → código em destaque com botão copiar, status "Pendente", base/desconto/total com `formatCurrency`;
- "Guarde este código", e "Pagamento: você receberá as instruções em breve" (TODO backend);
- limpa o formulário (`reset` mantendo `confirmation`).

**Headers:** em `next.config.ts`, `headers()` com `Referrer-Policy: no-referrer` para `/corridas/:slug/inscricao`, `/inscricao/:path*` e `/consulta` (§12).

**e2e** `e2e/registration.spec.ts`:
- fluxo completo no mock (5 km, kit básico, tamanho M, CPF válido `52998224725`, WhatsApp) → página de confirmação com o código no formato `VX-`;
- validação "Informe o CPF ou o WhatsApp";
- reenviar o mesmo CPF → toast de duplicata;
- recarregar no meio mantém os dados.
- Use `test.slow()`.

**Commit:** `feat(inscricao): formulário em etapas integrado ao POST /inscricoes`

---

### Task 13: Consulta por WhatsApp ou CPF

**Create** `src/lib/validations/lookup.schema.ts`, reescrito com testes: `{ tipo: "whatsapp" | "cpf", valor: string }`, com refine pelo tipo (`isValidCpf` / `isValidBrPhone`).

**Create** `src/app/actions/registrations.ts` → `lookupRegistrationsAction(input)`:
- valida;
- converte para `{ cpf: normalizeCpf }` **ou** `{ whatsapp: toE164Phone }`;
- chama `lookupRegistrations`;
- devolve `HttpResponse<CursorPage<RegistrationLookupItem>>`.

**Create** `src/app/(public)/consulta/components/`:
- `lookup-form.tsx` (`"use client"`):
  - ToggleGroup ou RadioGroup "WhatsApp / CPF" e um único campo com a máscara do tipo;
  - submit via `useMutation` (a consulta é `POST`; não use `useQuery` com PII na key);
  - resultado em estado local.
- `lookup-results.tsx`: os 4 estados:
  - loading: skeleton da lista;
  - erro: `ServerError`/toast;
  - vazio: "Nenhuma inscrição encontrada para os dados informados." + CTA "Ver corridas" (sem revelar se o CPF existe);
  - sucesso: lista.
- `lookup-result-item.tsx`: `nomeMascarado`, evento, distância, badge de status (`getRegistrationStatusLabel`) e `inscritoEm` formatado.

**Modify:**
- `src/app/(public)/consulta/page.tsx`: título, explicação (LGPD: dados mascarados) e `LookupForm`;
- `src/app/(public)/components/lookup-section.tsx` (home): usa o `LookupForm` inline.

**e2e** `e2e/lookup.spec.ts`:
- crie uma inscrição pelo fluxo (ou semeie no mock: uma inscrição de exemplo com CPF `52998224725` e WhatsApp `+5585999990000`) e consulte pelo CPF → item com nome mascarado;
- consulta com CPF inválido → mensagem de validação;
- CPF sem inscrições → estado vazio.

**Commit:** `feat(consulta): consulta de inscrições por WhatsApp ou CPF`

---

## Lote 5 — Admin de catálogo

Padrões comuns:
- Páginas de admin: Server Component com `<Suspense>` e skeleton. Listas paginadas são client (TanStack Query → server action → endpoint).
- Actions em `src/app/actions/admin-*.ts`, com:
  - validação Zod;
  - `adminFetch` via endpoint;
  - `HttpResponse`;
  - `revalidateTag("events")`/`event:<slug>` nas mutações que afetam o público. Veja em `09-revalidating.md` a assinatura atual de `revalidateTag`, que pode exigir um segundo argumento de perfil.
- Formulários: RHF + zodResolver, `defaultValues` completos, toasts e `setError` para 422.
- Ações destrutivas: `ConfirmDialog` responsivo (Dialog no desktop, Drawer no mobile), com `useCloseOnRouteChange`. Crie `src/components/feedback/confirm-dialog.tsx` na Task 14.
- Esconda ações por `papel`: helper `src/lib/utils/admin-permissions.ts` (`canManageEvents(papel)`: organização e super admin; operador só lê). Comente "matriz a confirmar (§16)". Sempre trate o 403.

### Task 14: Lista de eventos

- `src/stores/admin-events-filters-store.ts`: `{ status: EVENT_STATUS | "todos", cursorStack: string[], cursor: string | null, setStatus, nextPage(next), prevPage, reset }`.
- `src/app/actions/admin-events.ts`: `listAdminEventsAction({ status, cursor })`.
- `src/hooks/data/use-admin-events.ts`: `useQuery` com `queryKeys.admin.events({ status, cursor })`, `staleTime: 0` e `placeholderData: keepPreviousData`.
- `src/app/admin/(panel)/eventos/page.tsx` + `components/`:
  - `events-filters.tsx` (Select de status);
  - `events-table.tsx` / `events-table-row.tsx` (nome, data, local, badge de status, link "Editar");
  - `events-table-skeleton.tsx`;
  - `cursor-pagination.tsx` (Anterior/Próxima);
  - estado vazio com o CTA "Nova corrida".
- **e2e:** a lista mostra os 5 eventos do mock; o filtro "Rascunho" mostra 1.

**Commit:** `feat(admin): lista de corridas com filtro e paginação por cursor`

### Task 15: Formulário do evento e ciclo de vida

- `src/lib/validations/admin-event.schema.ts`, com testes:
  - slug kebab-case;
  - `dataEvento` e `horarioLargada` no formato da API (inputs `type="date"` e `type="time"` já entregam `YYYY-MM-DD`/`HH:mm`);
  - `uf` com 2 letras maiúsculas;
  - `cep` com 8 dígitos (normalizar);
  - `latitude`/`longitude` como números opcionais;
  - URLs opcionais.
- Actions: `createAdminEventAction`, `updateAdminEventAction`, `deleteAdminEventAction` e `runEventActionAction(id, action)`.
- `/admin/eventos/novo`: `EventForm` → cria → `router.push(/admin/eventos/[id])`.
- `/admin/eventos/[id]`:
  - bloqueante: 404 se a API devolver 404;
  - `EventForm` em modo edição e `EventLifecycleActions`, mostrando só as ações válidas para o status atual (helper `getAvailableEventActions(status)` em utils, com teste; inclui excluir);
  - encerrar, cancelar e excluir pedem confirmação;
  - abas ou links para Distâncias, Kits e Documentos;
  - slug gerado do nome com `slugify` enquanto o usuário não editar o slug manualmente.
- **e2e:** criar uma corrida → aparece como Rascunho → publicar → aparece na home (revalidação). Use `test.slow()`. Depois, despublicar.

**Commit:** `feat(admin): cadastro de corridas e ações de publicação`

### Task 16: Distâncias e lotes

- `/admin/eventos/[id]/distancias`:
  - lista de distâncias (cards ordenados por `ordem`) com "Nova distância" (Dialog/Drawer com `DistanceForm`) e "Editar";
  - em cada distância, a lista de lotes (`price-tier-row.tsx`) com "Novo lote" e "Editar".
- `PriceTierForm`:
  - preço com `parseCurrencyInput`, que já existe (corrigido para "89.90");
  - `inicioEm`/`fimEm` em `datetime-local`, convertidos para ISO com `-03:00` (helper `toFortalezaIso` em utils, com teste).
- Actions: `createDistanceAction`, `updateDistanceAction`, `createPriceTierAction` e `updatePriceTierAction`. As mutações revalidam `event:<slug>`; o slug é passado pela página.
- **e2e:** criar uma distância e um lote no evento rascunho do mock.

**Commit:** `feat(admin): distâncias e lotes de preço`

### Task 17: Kits

- `/admin/eventos/[id]/kits`:
  - lista e formulário com `nome`, `descricao` e `ativo`;
  - `fotos` como lista editável de `{ url, alt, ordem }` (`useFieldArray`, `kit-photo-field-row.tsx`), só com URLs, porque o upload não está no escopo.
- **e2e:** criar um kit com uma foto.

**Commit:** `feat(admin): kits com fotos`

### Task 18: Documentos e tamanhos de camisa

- `/admin/eventos/[id]/documentos`:
  - lista por tipo (regulamento / termo), com versão, título, vigência e link;
  - "Nova versão" com `tipo`, `versao`, `titulo`, `url`, `hashSha256` (64 hex, opcional? O contrato lista o campo: trate como obrigatório e mostre a dica `shasum -a 256 arquivo.pdf`) e `vigenteEm`;
  - sem editar nem excluir: o aviso "Documentos são imutáveis; publique uma nova versão" fica visível.
- `/admin/tamanhos-camisa`: tabela com `codigo`, `descricao`, `ordem`, `ativo` e "Novo/Editar".
- **e2e:** criar um tamanho "XXGG".

**Commit:** `feat(admin): documentos versionados e tamanhos de camisa`

### Task 19: Auditoria e dashboard

- `/admin/auditoria`: tabela (data, admin, ação, entidade) com paginação por cursor (store Zustand próprio ou genérico).
- `/admin`, o dashboard:
  - "Olá, {nome}" e o papel (via `getMe`);
  - atalhos (Nova corrida, Corridas, Tamanhos, Auditoria);
  - cards de métricas com "Em breve" (§15: dependem do backend).
- `/admin/eventos/[id]/inscricoes`: página "Em breve: aguardando endpoint do backend".
- **e2e:** a auditoria mostra uma entrada depois de publicar um evento.

**Commit:** `feat(admin): auditoria e dashboard`

---

## Lote 6 — Loja sobre mock

### Task 20: Isolar a loja como backend falso

O backend ainda não tem a loja (§16). Hoje a lógica está em `src/server/services/cart.service.ts`, `order.service.ts` e `src/server/repositories/*`. O objetivo é mover tudo para dentro do mock e deixar o front chamando só `endpoints/store.ts`.

- **Move:**
  - `src/server/repositories/{store-repository.interface,mock-store.repository}.ts` (+ testes) → `src/server/api/mocks/store/`;
  - `src/server/services/{cart,order}.service.ts` (+ testes) → `src/server/api/mocks/store/`;
  - `src/server/mocks/store-products.mock.ts` → `src/server/api/mocks/store/store-products.seed.ts`;
  - `src/server/queries/get-active-product.ts` → absorvido por `endpoints/store.ts`;
  - `src/server/errors.ts` (+ teste) → `src/server/api/mocks/store/store-errors.ts`.
  - Apague `src/server/repositories/store.repository.ts`.
- **Create** `src/server/api/endpoints/store.ts`:
  - funções `listStoreProducts()`, `getStoreProduct(slug)`, `priceCart(items)`, `createStoreOrder(input)`, `getStoreOrder(code)` e as de admin (`listAdminProducts`, `getAdminProduct`, `saveAdminProduct`);
  - com `USE_MOCK_API` → delega ao repositório/serviços do mock (estado em `globalThis`);
  - sem mock → `throw new ApiError(503, "LOJA_INDISPONIVEL", "Loja em breve")`;
  - as funções de admin exigem sessão (`getAccessToken()`, senão `redirect`).
- **Modify:**
  - `src/app/actions/store.ts` e `src/app/actions/admin-products.ts` (+ teste): usam `endpoints/store.ts`; `ApiError` → `HttpResponse` com `code`. O rate limit do checkout sai (fica com o backend futuro);
  - as páginas da loja (`/loja`, `/loja/[slug]`, `/loja/carrinho`, `/loja/checkout`, `/pedido/[code]`), a seção da home (`StoreTeaserSection` não depende de dados) e o admin (`/admin/loja/produtos`): tratam `LOJA_INDISPONIVEL` com `EmptyState` "A loja estará disponível em breve." (componente `StoreUnavailable` em `src/components/store/`).
- **Categorias:** a referência lista "Todos" + tipos. Mantenha SHIRT e MEDAL e adicione o filtro "Todos" no `store-section-nav.tsx`, se já não existir.
- **`/medalhas`:** redirecionar para `/loja?tipo=medalhas` (§5). A loja lê `searchParams.tipo` para pré-selecionar o filtro, o que pode exigir Suspense por ser dado dinâmico.
- **Verify:**
  - `grep -rn "server/repositories\|server/services\|server/mocks" src` → vazio;
  - e2e `store.spec.ts` e `admin-store.spec.ts` passando, com o login do admin atualizado para `admin@example.com` / `Vertex@Dev12345`.

**Commit:** `refactor(loja): loja isolada como mock até o backend expor a API`

---

## Lote 7 — Segurança, documentação e verificação final

### Task 21: Headers de segurança, README e checagem completa

- **`next.config.ts`, `headers()` para todas as rotas:**
  - `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` e `Referrer-Policy: strict-origin-when-cross-origin` (as rotas de inscrição e consulta mantêm o `no-referrer` da Task 12, e a regra mais específica deve vencer: teste com `curl -I`);
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`;
  - uma CSP básica: `default-src 'self'; img-src 'self' https: data:; script-src 'self' 'unsafe-inline'` (+ `'unsafe-eval'` só em dev); `style-src 'self' 'unsafe-inline'`; `font-src 'self'`; `connect-src 'self'`; `frame-ancestors 'none'`.
  - Confira no guia de CSP do Next 16 (`node_modules/next/dist/docs/…/content-security-policy.md`) se o App Router exige nonce para os scripts inline. Se exigir, use a abordagem recomendada pelo guia ou deixe a CSP como TODO documentado, sem quebrar a hidratação.
  - Verifique com o build e um `curl -I`.
- **README:**
  - arquitetura BFF;
  - `.env` (`API_URL`, `USE_MOCK_API`);
  - porta 3001;
  - como rodar com o backend local (seed e contas `admin@example.com` / `Vertex@Dev12345`) ou em modo mock;
  - scripts;
  - e2e (rodam com `USE_MOCK_API=true`; reinicie o dev server antes de uma rodada limpa).
  - Remova as instruções de Prisma.
- **Docs:** em `docs/plans/2026-11-04-loja-design.md`, mude o status para "Etapa 1 implementada sobre mock; aguardando API da loja no backend" e acrescente a nota de que Prisma saiu do front.
- **Verificação final**, colando as saídas no relatório:
  ```bash
  npm run lint
  npm run typecheck
  npm test
  USE_MOCK_API=false API_URL=http://localhost:3000 npm run build
  npm run test:e2e   # com o dev server reiniciado
  grep -rn "TODO(migracao)" src   # deve estar vazio
  ```

**Commit:** `chore: headers de segurança, README e verificação final da migração`

---

## Fora do escopo (registrado em §16 do CLAUDE.md)

- Pagamento Pix/cartão e `/inscricao/[code]` com status real.
- Lista e exportação de inscritos no admin e retirada de kit.
- API da loja, corridas encerradas, corridas parceiras dinâmicas.
- MFA, upload de imagens e e-mails.

---

## Revisão 2026-11-08: visual igual à referência (substitui partes das Tasks 4, 8, 9 e 11)

O usuário pediu que o front fique **igual à referência atual** (https://www.corredasamigas.com.br/), com as cores e o conteúdo do Vertex. O CLAUDE.md §2 (ordem da home e header) e o §3 ("Linguagem visual") foram atualizados: **leia-os, porque prevalecem sobre as Tasks 8 e 9 originais.**

Screenshots da referência, para abrir com a ferramenta Read:
- desktop, topo: `/private/tmp/claude-501/-Users-pedbenjamin-Desktop-Projeto-Landing-Corrida/aa13280e-796b-4f78-9c7b-e3eb2e36f10f/scratchpad/top.png`
- desktop, demais trechos (`part1.png` a `part4.png`): `.../scratchpad/part1.png`, `part2.png`, `part3.png`, `part4.png` (no mesmo diretório);
- mobile, topo: `.../scratchpad/mtop.png`;
- página inteira: `.../scratchpad/ref-desktop.png` e `.../scratchpad/ref-mobile.png`.

**Nova ordem de execução:** Lote 1 (Tasks 1–5) → **Lote 3 (Tasks 8–11, revisadas abaixo)** → Lote 2 (6–7) → Lote 4 → Lote 5 → Lote 6 → Lote 7.

Antes da Task 7 (admin), o header usa o link "Área administrativa" para `/admin/login` normalmente.

### Acréscimos à Task 4 (mock)
São rotas **propostas**, ainda pendentes no backend (§16). Marque-as assim no código.
- `GET /eventos/encerrados?cursor&limit` → `CursorPage<PublicEvent>` com os eventos `encerrado`. O seed ganha **4 edições passadas** do Vertex (datas de 2025–2026, nomes como "Corrida Vertex Beira-Mar 2025", "Night Run Vertex 2025", "Vertex Cocó Trail 2026" e "Corrida das Mães Vertex 2026"), com `imagemCapaUrl: null`.
- `GET /corridas-parceiras` → `PartnerRace[]`. Crie `src/types/api/partner-race.interface.ts` com `{ id: number; nome; dataEvento; localNome; cidade; uf; distancias: string[]; cupom; descontoPercentual: number; realizacao?: string | null; urlInscricao; imagemCapaUrl: string | null }`. O seed tem 3 corridas fictícias em Fortaleza, sem nomes de marcas reais, com o cupom `VERTEX10`.
- Endpoints na Task 5:
  - `listPastEvents()` e `listPartnerRaces()`, com `"use cache"`, tag `events` / `partner-races` e `cacheLife` de 5 min;
  - um 404 do backend real (rota inexistente) deve virar **lista vazia**, e não erro.

### Conteúdo estático com demonstração
Crie `src/server/content/`, só para o servidor:
- `partners.ts`: `getPartners(): Partner[]` (`{ nome; logoUrl: string | null; url?: string }`).
- `community-stats.ts`: `getCommunityStats(): CommunityStat[] | null` (`{ valor: string; rotulo: string }`).
- Com `env.USE_MOCK_API`, as duas devolvem dados de demonstração (6 parceiros fictícios sem logo, que a UI exibe como "monograma" com o nome; e os números 12+ corridas, 3.500+ participantes, 5.000+ inscrições, 4 anos). Sem mock, devolvem as listas reais, que ficam em constantes `PARTNERS`/`COMMUNITY_STATS` vazias ou `null` com `// TODO(cliente)`.
- Seções sem dados **não renderizam**.

### Tokens de tema (globals.css)
- Acrescente `--brand-navy-deep` (≈ `#071F4A`) para as faixas escuras e o header/rodapé, e `--brand-green-text` (verde escurecido, ≈ `#4D7A12`, contraste AA sobre branco) para eyebrows e ícones sobre fundo claro.
- Verde puro só sobre fundo escuro ou como fundo, com texto navy.
- **Fonte:** Montserrat 800 e **900**. Adicione o peso 900 no `next/font`.

### Task 8 revisada — Header, menu e rodapé
- **Header:** barra `brand-navy-deep`, altura ~64 px. À esquerda, a logo dentro de uma "placa" branca arredondada mais o texto "Vertex" no desktop (como na referência). À direita, `CartButton` em versão clara e o botão hambúrguer, **em todos os tamanhos**.
- **Menu (Sheet lateral à direita):** itens de `SITE_NAV_ITEMS` em fonte grande, depois "Consultar inscrição" e, por último e discreto, "Área administrativa". Use `useCloseOnRouteChange`.
- **Rodapé:** fundo `brand-navy-deep`, em 3 colunas.
  - Coluna 1: logo em placa branca e "Vertex Grupo de Corrida — {tagline}".
  - Coluna 2: "CONTATO" (eyebrow), com WhatsApp formatado, e-mail e @ do Instagram, cada um com ícone.
  - Coluna 3: "NAVEGAÇÃO", com os mesmos itens do menu e "Área administrativa".
  - Linha final, centralizada: "© {ano} Vertex Grupo de Corrida. Todos os direitos reservados. · Desenvolvido por Pedro Benjamin" e o link Privacidade.

### Task 9 revisada — Home
Crie primeiro os componentes compartilhados em `src/components/sections/`, um por arquivo:
- `section-heading.tsx`: eyebrow + título grande + subtítulo + slot `actions` à direita (`md:flex-row md:items-end md:justify-between`), com variantes `light`/`dark`.
- `pill-badge.tsx`: selo-pílula com ícone opcional.
- `arrow-link.tsx`: link com `ArrowRight`.
- `section-band.tsx`: `<section>` com fundo `white | muted | dark | accent`, padding vertical e container `max-w-6xl`.
- `horizontal-carousel.tsx`: client; scroll-snap horizontal, botões ← → no desktop e indicadores (dots), sem bibliotecas novas. Itens via `children`; cada item é um componente próprio no chamador.

Seções da home, na ordem do CLAUDE.md §2:
1. **`hero-section.tsx`:** pílula "VERTEX GRUPO DE CORRIDA" com ponto verde; H1 "Corra. Conecte-se. Evolua." (Montserrat 900, `text-5xl sm:text-7xl lg:text-8xl`, `leading-[0.95]`, cor navy-deep); subtítulo; botões "Quero me inscrever" (primário) e "Conheça nossa história" (secundário). Chevron como marca d'água discreta.
2. **`highlight-cards-section.tsx`:** 3 cards com imagem de fundo e sobreposição `bg-brand-navy-deep/70`.
   - Enquanto não houver fotos, use um fundo com gradiente navy mais o chevron grande. Deixe `imageSrc` opcional, com TODO de foto do cliente.
   - Selo dinâmico no card de corridas ("{n} corridas abertas", a partir de `listPublicEvents`, dentro de `Suspense` com fallback sem número).
   - Abaixo do card do meio, o botão de largura total "Acompanhe sua inscrição" → `/consulta`, como o "Acompanhe seu desafio" da referência.
3. **`past-events-section.tsx`:** "NOSSA HISTÓRIA EM MOVIMENTO" / "Corridas que já vivemos" / "Edições que viraram histórias, conquistas e amizades."
   - `HorizontalCarousel` de `past-event-card.tsx` (capa alta `aspect-[3/4]`, `rounded-2xl`; data "06 DE SET. DE 2026" com ícone de calendário; nome);
   - botão "Ver todas as corridas" → `/corridas/encerradas`;
   - dentro de `Suspense` com skeleton; vazio → não renderiza.
4. **`open-events-section.tsx`** (`id="corridas"`): "PRÓXIMAS CORRIDAS" / "Escolha seu próximo desafio".
   - Grade 1/2/3 colunas de `event-card.tsx`: capa `aspect-video`; nome; ícones calendário (data · largada), pin (local) e rota (distâncias, se o detalhe as tiver; na lista pública só há o básico, então omita); preço "a partir de" só se disponível; botão "Inscrever-se →" para a página do evento.
   - Os 4 estados. Vazio: "Nenhuma corrida aberta no momento. Volte em breve!" + link para encerradas.
   - Abaixo, linha com borda e o link "Ver corridas encerradas".
5. **`how-it-works-section.tsx`:** no novo estilo (números grandes em verde sobre cards).
6. **`track-registration-band.tsx`:** faixa escura; círculo verde com ícone `Search`/`Ticket`; "Acompanhe sua inscrição!" e texto; botão "Consultar minha inscrição" → `/consulta`.
7. **`partners-strip-section.tsx`:** eyebrow "MARCAS QUE CORREM COM A GENTE"; carrossel de `partner-logo-card.tsx` (caixa branca com borda; logo via `next/image` ou monograma com o nome).
8. **`store-band-section.tsx`:** "LEVE O VERTEX COM VOCÊ" / "Loja Vertex" / "Produtos oficiais para vestir o movimento." + "Conhecer a loja".
9. **`more-than-running-section.tsx`:** faixa escura, com 2 colunas no desktop.
   - À esquerda: eyebrow, título "Quem corre junto vai mais longe", texto e botão.
   - À direita: grade 2×2 de `value-badge.tsx` (ícone verde + rótulo, divisores finos claros).
10. **`partner-races-section.tsx`:** "AGENDA PARCEIRA" / "Próximas corridas parceiras" / "Corridas com benefícios exclusivos para a nossa comunidade." + "Ver todas →".
    - Até 3 `partner-race-card.tsx`: capa com o selo "Inscrições abertas"; nome; data; local; distâncias; "Por {realizacao}"; caixa de cupom (fundo verde claro, borda verde, rótulo "CUPOM", código grande e "{n}% de desconto") com `CopyCouponButton`; botão de largura total "Inscrever-se" (externo).
    - O card e o botão de copiar ficam em `src/components/partner-races/` para reúso na página `/corridas-parceiras`.
11. **`community-stats-band.tsx`:** faixa `brand-green` com 4 números (Montserrat 900, `text-5xl`, navy) e rótulos em caixa alta e `tracking-widest`.

### Acréscimos à Task 11
- `/corridas/encerradas`: lista paginada (grade) de `PastEventCard`, a partir de `listPastEvents`, com os 4 estados.
- `/corridas-parceiras`: grade de `PartnerRaceCard`, a partir de `listPartnerRaces`.
- `/parceiros`: grade de `PartnerLogoCard` a partir de `getPartners()`.
- `/sobre`: `CommunityStatsBand` quando houver números.
- Todas as páginas internas abrem com o mesmo `SectionHeading` grande, no padrão da referência.
