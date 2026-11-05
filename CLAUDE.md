# Vertex Grupo de Corrida — Plataforma de Inscrições

Guia de contexto e convenções para o desenvolvimento do site de inscrições em corridas de rua do **Vertex Grupo de Corrida** (Fortaleza/CE). Leia este arquivo inteiro antes de qualquer tarefa e siga-o em todo o código gerado.

> Desenvolvedor: **Pedro Benjamin** (prestador de serviço). O rodapé de todas as páginas públicas deve conter o crédito "Desenvolvido por Pedro Benjamin".

---

## 1. Visão geral

Plataforma web onde o atleta:

1. Vê as corridas abertas do Vertex;
2. Escolhe a prova, a distância/modalidade e o kit;
3. Preenche os dados e paga a inscrição (Pix e cartão);
4. Consulta sua inscrição **sem login e sem senha**, informando WhatsApp ou CPF.

E onde o organizador (admin), numa área protegida:

- Cria e edita eventos, modalidades, lotes de preço, kits e cupons;
- Acompanha inscrições e pagamentos em tempo real;
- Exporta a lista de inscritos (CSV/Excel) para entrega de kits e cronometragem.

**Público:** corredores amadores de Fortaleza e região, acessando majoritariamente **pelo celular, vindo do Instagram ou WhatsApp**. Mobile-first é obrigatório.

**Idioma:** toda a interface em português do Brasil. Identificadores de código (variáveis, funções, tipos, arquivos) em inglês.

---

## 2. Referência do cliente

Referência: https://www.paineldodesafio.com.br/ (plataforma do "Desafio Virtual Correr e Viver").

O que **aproveitar** da referência:

- Home de página única e direta: hero com dois CTAs ("Quero me inscrever" e "Consultar minha inscrição"), seção de consulta, lista de eventos, seção "Como funciona" em passos numerados e CTA final.
- **Consulta sem login**: o atleta digita o WhatsApp cadastrado e vê suas inscrições/status.
- Seção "Como funciona" com passos curtos (escolha a prova → escolha a distância → pague → retire o kit → corra → receba a medalha).
- Página separada de **medalhas de edições anteriores** ("Complete sua coleção"), com aviso claro de que a compra é só da medalha física e não gera inscrição.
- Rodapé enxuto: logo, WhatsApp (link `wa.me`), Instagram e link para medalhas.
- Link discreto para "Área do admin" no header.
- Estado vazio amigável quando não há eventos abertos ("Nenhuma corrida aberta no momento. Volte em breve!").

O que **é diferente** aqui: a referência é de desafio *virtual* (o atleta registra quilômetros). Este projeto é de **corrida de rua presencial**, então substituímos "registrar quilômetros/progresso" por informações de prova: data, horário de largada, local, percurso, retirada de kit, regulamento e, futuramente, resultados.

---

## 3. Identidade visual

### Logo
- Arquivo oficial: `public/brand/vertex-logo.png` (versão completa: pico + corredor + "VERTEX" + "GRUPO DE CORRIDA").
- Criar também versões: `vertex-symbol` (só pico + corredor, para favicon/app icon e header mobile) e `vertex-logo-white` (para fundos escuros). Pedir ao cliente o arquivo vetorial (SVG/AI/PDF) — se não houver, vetorizar.
- Nunca distorcer, recolorir ou aplicar sombra na logo. Manter área de respiro mínima equivalente à altura do "E" de VERTEX.

### Cores (extraídas da logo — confirmar hex com o arquivo vetorial)

| Token | Hex aprox. | Uso |
|---|---|---|
| `brand-navy` | `#0B3275` | Cor primária: textos de destaque, header, botões principais, rodapé |
| `brand-green` | `#7AC21E` | Cor de ação/energia: CTAs de inscrição, badges "inscrições abertas", destaques, detalhes |
| `brand-white` | `#FFFFFF` | Fundos |
| neutros | escala slate do Tailwind | Textos secundários, bordas, fundos de seção |

Mapear no tema do shadcn/ui (CSS variables em `globals.css`):
- `--primary` → navy; `--primary-foreground` → branco
- `--accent` / variante `cta` do Button → green com texto navy (verificar contraste AA; texto branco sobre o verde **não** passa)
- `--ring` → green

### Tipografia
- A logo usa uma sans geométrica pesada. Títulos: **Montserrat** (700/800, caixa alta em títulos curtos). Corpo: **Inter**. Carregar via `next/font/google`.
- Subtítulos no estilo "GRUPO DE CORRIDA": caixa alta, `tracking-widest`, ladeados por traços verdes — usar como padrão de "eyebrow" acima dos títulos de seção.

### Motivo gráfico
- O **pico/chevron verde** (forma de "^") é o elemento-assinatura: usar como divisor de seção, marca d'água no hero, bullet de listas e ícone de "subida/progresso". Não exagerar — um uso marcante por tela.
- Fotos: corredores reais de Fortaleza (Beira-Mar, Aterro, Parque do Cocó) pedidas ao cliente. Evitar banco de imagens genérico.

---

## 4. Stack

- **Framework:** Next.js 16 (App Router, Server Components por padrão)
- **Linguagem:** TypeScript (strict)
- **UI:** shadcn/ui + Radix UI
- **Estilo:** Tailwind CSS
- **Banco:** PostgreSQL + Prisma ORM *(proposta — confirmar hospedagem: Neon ou Supabase)*
- **Auth (somente admin):** NextAuth v5 (Credentials, estratégia JWT). Atletas **não** têm conta.
- **Pagamentos:** Mercado Pago (Pix + cartão) com webhook *(proposta — confirmar com o cliente qual gateway ele já usa)*
- **Estado:** Zustand (estado de UI/filtros/formulário multi-etapas) + TanStack Query (dados no client)
- **Formulários:** React Hook Form + Zod
- **Datas:** date-fns com locale `ptBR`, fuso `America/Fortaleza`
- **Toasts:** sonner
- **Animações:** Framer Motion (sutil)
- **E-mail transacional:** Resend + React Email *(confirmação de inscrição e pagamento)*
- **Storage de imagens:** Vercel Blob ou Cloudflare R2 (banners de evento, fotos de kit/medalha)
- **Deploy:** Vercel

---

## 5. Páginas e rotas

### Públicas — `src/app/(public)/`
| Rota | Conteúdo |
|---|---|
| `/` | Hero, consulta de inscrição, corridas abertas, "Como funciona", sobre o Vertex, FAQ, CTA final |
| `/corridas/[slug]` | Página do evento: banner, data/horário, local (mapa), modalidades e preços do lote atual, kit (com fotos e tamanhos de camisa), percurso, retirada de kit, regulamento, FAQ, CTA fixo "Inscrever-se" no mobile |
| `/corridas/[slug]/inscricao` | Formulário de inscrição em etapas (ver §7) |
| `/inscricao/[code]` | Status da inscrição/pagamento (QR Pix, copia-e-cola, comprovante, dados da prova) |
| `/consulta` | Consulta por WhatsApp ou CPF → lista de inscrições do atleta |
| `/medalhas` | Medalhas de edições anteriores à venda (fase 2) |
| `/regulamento/[slug]` | Regulamento completo do evento (também exportável em PDF) |
| `/privacidade` | Política de privacidade (LGPD) |

### Admin — `src/app/admin/`
| Rota | Conteúdo |
|---|---|
| `/admin/login` | Login do organizador |
| `/admin` | Dashboard: inscritos por evento/modalidade, receita, pagamentos pendentes |
| `/admin/eventos` | CRUD de eventos, modalidades, lotes, kits, cupons |
| `/admin/eventos/[id]/inscricoes` | Tabela com filtro/busca/paginação server-side, exportação CSV, marcar kit como retirado |
| `/admin/medalhas` | CRUD de medalhas avulsas (fase 2) |

Proteger `/admin/*` (exceto `/admin/login`) no `middleware.ts`.

### API — `src/app/api/`
- `api/webhooks/payments` — webhook do gateway (validar assinatura, idempotente)
- `api/auth/[...nextauth]` — NextAuth

---

## 6. Modelo de domínio (base para o schema Prisma)

- **Event**: `id, slug, name, description, date, startTime, location, address, mapUrl, bannerUrl, status (DRAFT | OPEN | CLOSED | FINISHED), registrationOpensAt, registrationClosesAt, regulation, kitPickupInfo`
- **Modality** (distância/categoria): `id, eventId, name ("5 km", "10 km", "Caminhada"), distanceKm, capacity, minAge`
- **PriceTier** (lote): `id, modalityId, name ("1º lote"), price (em centavos), startsAt, endsAt, maxSlots?`
- **Kit**: `id, eventId, name ("Kit Básico", "Kit Premium"), extraPrice, items[], imageUrl, shirtSizes[]`
- **Participant**: `id, name, cpf, birthDate, gender, whatsapp, email, emergencyContactName, emergencyContactPhone, team?`
- **Registration**: `id, code (curto, legível, ex: VTX-7K3P), eventId, modalityId, kitId, participantId, shirtSize, priceTierId, amount, discount, couponId?, status (PENDING | PAID | CANCELLED | EXPIRED | REFUNDED), bibNumber?, kitPickedUpAt?, createdAt`
- **Payment**: `id, registrationId, provider, providerPaymentId, method (PIX | CARD), status, amount, pixQrCode?, pixCopyPaste?, paidAt?, rawPayload`
- **Coupon**: `id, eventId?, code, type (PERCENT | FIXED), value, maxUses, usedCount, expiresAt`
- **Medal** (fase 2): `id, edition, name, imageUrl, price, stock`
- **AdminUser**: `id, name, email, passwordHash, role`

Valores monetários **sempre em centavos (integer)**. Formatar só na UI com `formatCurrency`.

---

## 7. Regras de negócio

- **Lote vigente**: o preço é o do `PriceTier` ativo pela data atual (e por vagas, se `maxSlots` definido). Calcular sempre no servidor — nunca confiar em preço vindo do client.
- **Vagas**: bloquear a modalidade quando `inscrições PAID + PENDING não expiradas >= capacity`. Exibir "Esgotado".
- **Reserva**: inscrição `PENDING` expira se não paga em **30 min** (Pix) — job/cron muda para `EXPIRED` e libera a vaga.
- **Desconto 60+**: aplicar desconto para atletas com 60 anos ou mais na data da prova, conforme o Estatuto da Pessoa Idosa (percentual e regras a confirmar com o cliente).
- **Idade mínima** por modalidade, calculada na data da prova.
- **CPF**: validar dígitos; um CPF não pode ter duas inscrições ativas na mesma modalidade do mesmo evento.
- **Webhook**: idempotente (chave `providerPaymentId`), atualiza `Payment` e `Registration` em transação, dispara e-mail/WhatsApp de confirmação.
- **Número de peito** (`bibNumber`): atribuído pelo admin ou automaticamente por modalidade após pagamento (definir com o cliente).
- **Consulta sem login**: busca por WhatsApp ou CPF retorna apenas dados mínimos (evento, modalidade, status, código). Mascarar CPF/e-mail. Aplicar rate limit na action de consulta.

### Fluxo do formulário de inscrição (multi-etapas, estado em Zustand)
1. **Modalidade e kit** — distância, kit, tamanho da camisa
2. **Dados do atleta** — nome, CPF, nascimento, sexo, WhatsApp, e-mail, equipe/assessoria (opcional), contato de emergência
3. **Termos** — aceite do regulamento e do termo de responsabilidade/condição de saúde (checkbox obrigatório, salvar data/hora do aceite)
4. **Pagamento** — resumo (lote, kit, desconto, cupom, total) → Pix ou cartão
5. **Confirmação** — redireciona para `/inscricao/[code]`

Máscaras de input para CPF, telefone e data. Botão "Copiar código Pix" e polling do status do pagamento na tela do Pix.

---

## 8. Estrutura de diretórios

```
src/
├── app/
│   ├── (public)/               # Rotas públicas
│   │   ├── corridas/[slug]/
│   │   │   ├── components/
│   │   │   └── inscricao/
│   │   ├── consulta/
│   │   ├── inscricao/[code]/
│   │   └── medalhas/
│   ├── admin/                  # Área protegida
│   ├── actions/                # Server actions por domínio (events, registrations, payments, coupons, admin)
│   └── api/                    # Webhooks e NextAuth
├── components/
│   ├── ui/                     # shadcn/ui
│   ├── brand/                  # Logo, chevron, eyebrow
│   └── layout/                 # Header, footer
├── server/                     # Acesso a dados e integrações (somente servidor)
│   ├── db.ts                   # Prisma client
│   ├── services/               # Regras de negócio (pricing, capacity, registration)
│   └── payments/               # Cliente do gateway
├── lib/
│   ├── utils/                  # Helpers (formatCurrency, formatDate, maskCpf, isValidCpf, calcAge...)
│   └── validations/            # Schemas Zod
├── types/                      # *.interface.ts
├── enums/                      # *.enum.ts
├── hooks/
│   └── data/                   # Hooks de TanStack Query
├── stores/                     # Zustand (registration-form-store, admin-filters-store...)
├── emails/                     # Templates React Email
└── animations/                 # Variants do Framer Motion
prisma/
└── schema.prisma
public/
└── brand/                      # Logos e favicon
```

---

## 9. Convenções de código (obrigatórias)

### Nomenclatura
- Arquivos: kebab-case (`event-card.tsx`, `use-event.ts`)
- Componentes: PascalCase no nome, kebab-case no arquivo
- Interfaces: PascalCase em arquivos `.interface.ts`
- Enums: SCREAMING_SNAKE_CASE em arquivos `.enum.ts`
- Hooks: prefixo `use`; stores: `use<Nome>Store`

### Componentes
- **Um componente por arquivo. Nunca** criar dois componentes no mesmo arquivo.
- Itens renderizados em `.map()` **sempre** extraídos para componente próprio (`event-list.tsx` → `event-list-item.tsx`).
- Funções auxiliares **sempre** em `src/lib/utils/`, nunca inline no componente.
- `'use client'` só quando houver interatividade. Server Components por padrão.
- Props tipadas com `interface`. Sem `any` (exceto em `catch` quando inevitável).
- Composição em vez de herança; compound components para UIs complexas.
- Cada página/feature tem sua própria pasta `components/` com `index.ts`.

### Busca de dados — os 4 estados são obrigatórios
Todo componente que busca dados implementa: **loading** (Skeleton com o mesmo layout final), **erro** (`ServerError`), **vazio** (mensagem + ícone + CTA quando fizer sentido) e **sucesso** (transformações com `useMemo`).
- RSC: cada seção dentro de `<Suspense>` com skeleton correspondente; seções carregam de forma independente.
- Client: TanStack Query com `queryKey` vinda de `src/lib/utils/query-keys.ts`, `staleTime` de 5 min.
- Filtros/ordenação/paginação server-side (ex.: tabela de inscritos no admin): estado em **Zustand**, nunca em search params; incluir o estado dos filtros na query key; debounce na busca.

### Server actions
- Sempre `'use server'`, validar entrada com Zod e, nas actions de admin, checar sessão primeiro.
- Retornar sempre `HttpResponse<T>`:
```ts
export interface HttpResponse<T = unknown> {
  status: number
  data?: T
  error?: string
  title?: string
}
```
- Regras de negócio ficam em `src/server/services/`; a action orquestra e trata erros.
- Após mutações, `revalidatePath`/`revalidateTag` nas páginas afetadas.

### Formulários
- React Hook Form + `zodResolver`, todos os `defaultValues` definidos.
- Mensagens de validação em português.
- Feedback com `toast.success` / `toast.error` usando o `title` retornado pela action.

### Dialogs, drawers e popovers
- Todos fecham na troca de rota com `useCloseOnRouteChange(() => setIsOpen(false), isOpen)`.
- Padrão responsivo: Dialog no desktop, Drawer no mobile.

### Estilo
- Tokens do tema em vez de valores arbitrários; `cn()` para classes; `cva` para variantes.
- Mobile-first. Testar em 360px de largura.
- CTA de inscrição sempre visível no mobile na página do evento (barra fixa no rodapé).

---

## 10. SEO, performance e acessibilidade

- `generateMetadata` em cada página de evento (título, descrição, OG image com banner do evento).
- JSON-LD `SportsEvent` nas páginas de evento.
- `sitemap.ts` e `robots.ts`; admin com `noindex`.
- `next/image` para todas as imagens; banners otimizados.
- HTML semântico, foco visível, labels em todos os inputs, contraste AA (atenção ao verde da marca).
- Meta: Lighthouse ≥ 90 em mobile nas páginas públicas.

---

## 11. LGPD e segurança

- Coletar só os dados necessários; checkbox de consentimento com link para `/privacidade`.
- CPF e telefone mascarados em qualquer tela pública; nunca em URLs ou query strings.
- Rate limit nas actions de consulta e inscrição.
- Senhas do admin com hash (bcrypt/argon2).
- Variáveis secretas apenas no servidor; nunca com prefixo `NEXT_PUBLIC_`.

---

## 12. Variáveis de ambiente

```
DATABASE_URL=
AUTH_SECRET=
AUTH_URL=
PAYMENT_ACCESS_TOKEN=
PAYMENT_WEBHOOK_SECRET=
RESEND_API_KEY=
EMAIL_FROM=
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_INSTAGRAM_URL=
```

Validar as variáveis obrigatórias na inicialização (`src/lib/env.ts` com Zod).

---

## 13. Comandos

```bash
npm run dev          # Desenvolvimento
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run build        # Build de produção
npx prisma migrate dev
npx prisma studio
```

Antes de cada commit: `lint`, `typecheck` e `build` passando. Commits no padrão Conventional Commits.

---

## 14. Fases de entrega

1. **MVP** — Home, página do evento, inscrição com Pix, consulta por WhatsApp/CPF, e-mail de confirmação, admin com CRUD de eventos e lista/exportação de inscritos.
2. **Fase 2** — Cartão de crédito, cupons, medalhas de edições anteriores, check-in de retirada de kit (busca rápida por CPF/código no admin).
3. **Fase 3** — Resultados/classificação por evento, galeria de fotos, notificações por WhatsApp.

---

## 15. Decisões em aberto (confirmar com o cliente)

- [ ] Gateway de pagamento (Mercado Pago, Asaas, Pagar.me, outro?) e quem arca com as taxas
- [ ] Hex exatos e arquivo vetorial da logo
- [ ] Domínio do site
- [ ] Número de WhatsApp e @ do Instagram oficiais
- [ ] Regras do desconto 60+ e de outros descontos (assessorias, PCD)
- [ ] Política de cancelamento, reembolso e transferência de inscrição
- [ ] Número de peito: automático ou manual
- [ ] Haverá eventos virtuais (como na referência) além das corridas presenciais?
- [ ] Fotos oficiais e textos institucionais do Vertex
