# Vertex Grupo de Corrida — Plataforma de Inscrições (frontend)

Guia de contexto e convenções para o desenvolvimento do site de inscrições em corridas de rua do **Vertex Grupo de Corrida** (Fortaleza/CE). Leia este arquivo inteiro antes de qualquer tarefa e siga-o em todo o código gerado.

> Desenvolvedor: **Pedro Benjamin** (prestador de serviço). O rodapé de todas as páginas públicas deve conter o crédito "Desenvolvido por Pedro Benjamin".

> **Arquitetura:** este repositório é **somente o frontend** (Next.js 16). Regras de negócio, banco, autenticação, preços, vagas e pagamentos vivem no **backend VertexMove (NestJS)**, consumido via HTTP em `/api/v1`. O contrato de referência é a collection Postman **"VertexMove — Admin Auth + Inscrições"** (ver §6). O front **não** tem Prisma, banco nem regras de preço próprias.

---

## 1. Visão geral

Plataforma web onde o atleta:

1. Vê as corridas publicadas do Vertex;
2. Escolhe a prova, a distância e, se houver, o kit e o tamanho da camisa;
3. Preenche os dados, aceita regulamento e termo de responsabilidade, gera a inscrição e paga via **Mercado Pago Checkout Pro** (Pix ou cartão — **endpoint pendente no backend**);
4. Compra camisas, viseiras e acessórios na **loja** (o Vertex **não vende medalhas**) (**pendente no backend**, ver §16);
5. Conhece o grupo, os parceiros e as corridas parceiras com cupom exclusivo;
6. Consulta suas inscrições **sem login e sem senha**, informando WhatsApp **ou** CPF.

E onde o organizador (admin), numa área protegida:

- Cria e edita corridas, distâncias, lotes de preço, kits, tamanhos de camisa e documentos (regulamento/termo);
- Controla o ciclo de vida da corrida (publicar, despublicar, encerrar, cancelar, restaurar, excluir);
- Consulta a trilha de auditoria administrativa;
- Acompanha inscrições e exporta a lista de inscritos (**endpoints pendentes no backend**).

**Público:** corredores amadores de Fortaleza e região, acessando majoritariamente **pelo celular, vindo do Instagram ou WhatsApp**. Mobile-first é obrigatório.

**Idioma:** toda a interface em português do Brasil. Identificadores de código (variáveis, funções, tipos, arquivos) em inglês — **exceto as chaves dos payloads da API**, que seguem o contrato do backend em português (ver §9, "Tipos da API").

---

## 2. Identidade e estrutura do site

**Referência histórica:** o projeto começou espelhando https://www.corredasamigas.com.br/ e ficou idêntico a ela. Em 2026-11-13 o site ganhou estrutura e voz próprias (design em `docs/plans/2026-11-13-identidade-propria-design.md`). **Não voltar a copiar a referência** (ordem de seções, cards de destaque com foto, frase de três batidas, textos).

### Voz: superação / "vértice"
Vertex vem de vértice: o topo. Os textos falam de **topo, subida, degrau, largada**, em frases curtas e diretas. Exemplos em uso: "Todo corredor tem um topo. Qual é o seu?", "Cada prova é um degrau." (tagline), "Próximos topos", "Topos conquistados", "Começar a subida". Telas funcionais (inscrição, pagamento, termos, privacidade) mantêm texto neutro e claro.

**Menu principal** (header e rodapé): Início · Provas · Loja · Provas parceiras · O Vertex · Parceiros · Fale com a gente · Área administrativa (discreto, por último). Rodapé: logo + tagline, colunas "Fale com a gente" e "Explore", crédito "Desenvolvido por Pedro Benjamin".

### Home, nesta ordem
1. **Hero "Próximo topo"** (navy, pico gigante esmaecido): nome, data/largada e local da próxima corrida aberta (`getNextEvent` sobre `GET /eventos`), CTAs "Começar a subida" (página da corrida) e "Ver todas as provas" (`#corridas`), capa inclinada. Sem corrida aberta ou com a API fora → hero institucional "Todo corredor tem um topo. Qual é o seu?".
2. **Próximos topos** (`#corridas`): grade de corridas abertas + selo com a contagem; link para as encerradas.
3. **Do primeiro passo ao pódio**: seis degraus em escada (o 1º embaixo) + cartão "Já se inscreveu?" para `/consulta`.
4. **Quem sobe junto** (navy): números da comunidade + quatro selos + CTA para `/sobre`. Sem números definidos, ficam só os selos.
5. **Topos conquistados**: carrossel de edições passadas. Some se não houver dados.
6. **Loja + provas parceiras**, lado a lado no desktop: bloco verde "Vista a subida" e "Outras trilhas, com desconto" (até 2 corridas com cupom). As parceiras somem se não houver dados.
7. **Marcas na nossa subida**: logos dos parceiros. Some se não houver parceiros.

**Header:** barra navy com a logo (placa branca), carrinho e menu lateral (hambúrguer) em todos os tamanhos.

### Páginas internas
- **O Vertex** (`/sobre`): "Por que Vertex" (o nome), "Nossa subida" (história), "Onde queremos chegar" (missão), números e CTA. Textos provisórios até o cliente enviar os oficiais.
- **Topos conquistados** (`/corridas/encerradas`), **Outras trilhas** (`/corridas-parceiras`, cupom com botão copiar e link externo), **Loja** (eyebrow "Vista a subida"; sem medalhas), **Onde está minha inscrição?** (`/consulta`), **Parceiros**, **Fale com a gente** (`/contato`).

### O que o Vertex é (e não é)
- Corridas de rua **presenciais** abertas a todos: nada de desafios online ou "meus quilômetros"; no lugar, informações de prova (data, largada, local, percurso, kit, regulamento, resultados).
- Listas renderizadas no servidor (SEO e skeleton com os 4 estados); contato e redes sempre preenchidos.
- Consulta de inscrição **sem login**, "Como funciona" em degraus e **FAQ** na página do evento.

---

## 3. Identidade visual

### Logo
- Arquivo oficial: `public/brand/vertex-logo.svg` (quadrado 1:1, fundo branco; pico + corredor + "VERTEX" + "GRUPO DE CORRIDA"). Sobre fundo escuro, usar a `VertexLogoPlate` (placa branca quadrada).
- Ainda faltam: `vertex-symbol` (só pico + corredor, para favicon/app icon) e `vertex-logo-white` (para fundos escuros). O SVG atual foi traçado de imagem: pedir ao cliente o vetorial original (AI/PDF), se houver.
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
- Títulos: **Montserrat** (700/800, caixa alta em títulos curtos). Corpo: **Inter**. Carregar via `next/font/google`.
- Eyebrows (acima dos títulos de seção): caixa alta, `tracking-widest`, com o pico verde à frente.

### Linguagem visual (adaptada da referência)
- **Ritmo de seções:** poucas alternâncias. Hero e comunidade em navy (`brand-navy-deep`); o resto branco ou cinza-claro (`slate-50`), separado por borda fina. Sem faixa verde de números; o verde aparece em CTAs, no bloco da loja e nos números sobre o navy.
- **Cabeçalho de seção:** eyebrow pequeno em caixa alta na cor de destaque (verde escurecido para passar AA sobre branco) → título **muito grande e pesado** (Montserrat 800/900, `text-4xl`–`text-6xl`) → linha de apoio em cinza; botões secundários ("Ver todas →") alinhados à direita no desktop.
- **Cards:** cantos bem arredondados (`rounded-2xl`), borda clara e sombra suave; imagem de capa no topo; linhas de informação com ícones lucide na cor de destaque; preço em destaque e botão pequeno com seta.
- **Botões:** primário na cor de destaque com seta (`ArrowRight`); secundário branco com borda.
- **Mobile:** tudo empilhado, botões em largura total.

### Motivo gráfico
- O **pico/chevron verde** ("^") é o elemento-assinatura: marca d'água no hero, prefixo dos eyebrows (no lugar de traços laterais), bullet de listas, ícone de "subida/progresso".
- Fotos: corredores reais de Fortaleza (Beira-Mar, Aterro, Parque do Cocó) pedidas ao cliente. Evitar banco de imagens genérico.

---

## 4. Stack

- **Framework:** Next.js 16 (App Router, Server Components por padrão). Ler `AGENTS.md` e os guias em `node_modules/next/dist/docs/` antes de usar APIs do Next — a versão tem breaking changes (ex.: `middleware.ts` → `proxy.ts`, `cookies()`/`headers()` assíncronos).
- **Linguagem:** TypeScript (strict)
- **Backend:** API **VertexMove (NestJS)** em `${API_URL}/api/v1` — fonte única de dados e regras.
- **UI:** shadcn/ui + Radix UI
- **Estilo:** Tailwind CSS
- **Auth (somente admin):** JWT emitido pelo backend; sessão gerenciada pelo próprio Next via cookies HttpOnly (padrão BFF, ver §8). **Não usar NextAuth.** Atletas não têm conta.
- **Pagamentos:** **Mercado Pago — Checkout Pro** (Pix e cartão na página do Mercado Pago, com redirecionamento). A preferência de pagamento, as credenciais (`Access Token`) e o webhook ficam **no backend**; o Next só redireciona para o `init_point` e trata o retorno (ver §7, "Pagamento"). Sem SDK do Mercado Pago no front.
- **Estado:** Zustand (UI, filtros, cursor de paginação, formulário multi-etapas, carrinho) + TanStack Query (dados no client)
- **Formulários:** React Hook Form + Zod
- **Datas:** date-fns com locale `ptBR`, fuso `America/Fortaleza`
- **Toasts:** sonner
- **Animações:** Motion (`motion/react`, sucessora do Framer Motion) — sutil, respeitando prefers-reduced-motion. Variants e constantes em `src/animations/`; componentes reutilizáveis (Reveal, StaggerGroup/StaggerItem, HeroTitle, ParallaxLayer, AnimatedCounter, ScrollProgressBar) em `src/components/motion/`. Só nas páginas públicas (nunca no admin).
- **Imagens:** URLs vindas da API (`imagemCapaUrl`, `fotos[].url`); configurar `images.remotePatterns` para o CDN.
- **Deploy:** Vercel

---

## 5. Páginas e rotas

### Públicas — `src/app/(public)/`
| Rota | Conteúdo | API |
|---|---|---|
| `/` | Hero "próximo topo", próximos topos, como funciona em degraus, comunidade, topos conquistados, loja + provas parceiras, parceiros (ver §2) | `GET /eventos` |
| `/corridas/encerradas` | "Corridas que já vivemos": edições passadas | **pendente** (API pública só lista publicadas) |
| `/corridas/[slug]` | Página do evento: capa, data/largada, local (mapa por `latitude`/`longitude`), distâncias e preço do lote vigente, kits (fotos), percurso, regulamento, FAQ, CTA fixo "Inscrever-se" no mobile | `GET /eventos/:slug` |
| `/corridas/[slug]/inscricao` | Formulário em etapas (ver §7) | `POST /inscricoes` |
| `/inscricao/confirmada` | Confirmação pós-criação com código e valores (dados vindos da resposta do `POST /inscricoes`, guardados em memória no store) | — |
| `/inscricao/retorno` | Página de volta do Checkout Pro (`back_urls`): lê `external_reference` e consulta o status real no backend | **pendente** (status por código) |
| `/inscricao/[code]` | Status da inscrição e botão "Pagar agora" (gera novo link do Checkout Pro se ainda pendente) | **pendente** (`GET` por código não existe) |
| `/consulta` | Consulta por WhatsApp **ou** CPF → lista mascarada; cada item tem "Ver inscrição" (confirma a data de nascimento → detalhes + "Baixar comprovante (PDF)") | `POST /inscricoes/consulta`, `POST /inscricoes/comprovante` (**proposto**) |
| `/loja`, `/loja/[slug]`, `/loja/carrinho`, `/loja/checkout`, `/pedido/[code]` | Loja de camisas e acessórios | **pendente** |
| `/corridas-parceiras` | Corridas de parceiros com cupom exclusivo e link externo | **pendente** (conteúdo estático até haver endpoint) |
| `/sobre` | Conheça o Vertex: história, missão, fotos, números | estático |
| `/parceiros` | Apoiadores (logos e links) | estático |
| `/contato` | WhatsApp, Instagram, e-mail, treinos | estático |
| `/regulamento/[slug]` | Regulamento do evento (link para `documento.url`) | depende de §15 |
| `/privacidade` | Política de privacidade (LGPD) | — |

### Admin — `src/app/admin/`
| Rota | Conteúdo | API |
|---|---|---|
| `/admin/login` | Login (e-mail + senha) | `POST /admin/auth/login` |
| `/admin` | Dashboard (perfil, atalhos; métricas quando houver endpoint) | `GET /admin/me` |
| `/admin/eventos` | Lista com filtro por status e paginação por cursor | `GET /admin/eventos` |
| `/admin/eventos/novo` e `/admin/eventos/[id]` | Formulário do evento + ações de ciclo de vida | `POST/GET/PATCH/DELETE /admin/eventos/:id`, `POST .../publicar|despublicar|encerrar|cancelar|restaurar` |
| `/admin/eventos/[id]/distancias` | CRUD de distâncias e, dentro de cada uma, lotes | `/admin/eventos/:id/distancias`, `/admin/distancias/:id`, `/admin/distancias/:id/lotes`, `/admin/lotes/:id` |
| `/admin/eventos/[id]/kits` | CRUD de kits com fotos | `/admin/eventos/:id/kits`, `/admin/kits/:id` |
| `/admin/eventos/[id]/documentos` | Regulamento e termo de responsabilidade versionados | `/admin/documentos?eventoId=` |
| `/admin/tamanhos-camisa` | Catálogo global de tamanhos | `/admin/tamanhos-camisa` |
| `/admin/auditoria` | Trilha de auditoria (cursor) | `GET /admin/auditoria` |
| `/admin/eventos/[id]/inscricoes` | Inscritos, exportação CSV, retirada de kit | **pendente** |
| `/admin/loja/*` | Produtos e pedidos | **pendente** |

Proteger `/admin/*` (exceto `/admin/login`) no `proxy.ts`, que também renova o access token (ver §8). Admin com `noindex`.

### Rotas de API no Next
- **Nenhuma** regra de negócio. Só criar Route Handlers quando um componente client precisar de um proxy fino para a API (preferir server actions).

---

## 6. Contrato da API (VertexMove)

Base: `${API_URL}/api/v1` (saúde fora do prefixo: `GET ${API_URL}/health/live` e `/health/ready`).

### Convenções gerais
- JSON; datas `YYYY-MM-DD` (`dataEvento`, `dataNascimento`), horários `HH:mm` (`horarioLargada`), instantes ISO-8601 com offset `-03:00` (`inicioEm`, `fimEm`, `vigenteEm`).
- **Dinheiro em centavos** (`precoCentavos`, `valorBaseCentavos`, `valorDescontoCentavos`, `valorTotalCentavos`). Formatar só na UI com `formatCurrency`.
- **Listas paginadas por cursor:** `{ items: T[], nextCursor: string | null }`, query `cursor` e `limit` (1–100, padrão 20). Algumas listas administrativas (distâncias, lotes, kits, tamanhos, documentos) retornam **array simples**.
- **Criação:** `201` com o recurso e header `Location`. **Ações e exclusão:** `204` sem corpo.
- **Erros:** `{ error: { codigo: string, mensagem: string } }`. Códigos conhecidos:

| HTTP | `codigo` | Situação / mensagem na UI |
|---|---|---|
| 401 | `NAO_AUTENTICADO` | Credenciais inválidas ou sem token → "E-mail ou senha inválidos." / redirecionar ao login |
| 403 | `MFA_NECESSARIO` | Conta com MFA (ainda não implementado) → "Esta conta exige verificação em duas etapas, ainda indisponível." |
| 403 | `ACESSO_NEGADO` | CSRF ausente/inválido ou papel sem permissão |
| 404 | — | Evento não publicado/inexistente → `notFound()` |
| 409 | `INSCRICAO_DUPLICADA` | "Já existe uma inscrição para este atleta nesta distância." |
| 409 | `IDENTIDADES_CONFLITANTES` | CPF e WhatsApp pertencem a atletas diferentes → "Os dados informados pertencem a cadastros diferentes. Confira o CPF e o WhatsApp." |
| 422 | `DOCUMENTO_ACEITE_OBRIGATORIO` | Faltou aceitar regulamento/termo |
| 422 | `DADO_INVALIDO` | Validação (ex.: consulta com CPF **e** WhatsApp) |

- Respostas sensíveis vêm com `Cache-Control: no-store` e `Referrer-Policy: no-referrer`: **nunca cachear** no Next (`cache: 'no-store'`) inscrição, consulta ou admin.
- O login tem **lockout após 5 tentativas**: não fazer retries automáticos no login.

### Autenticação admin
| Método | Rota | Corpo / headers | Resposta |
|---|---|---|---|
| POST | `/admin/auth/login` | `{ email, senha }` | `200 { accessToken, tokenType: 'Bearer', expiresIn: 900, csrfToken, admin: { id, nome, papel, mfaAtivo } }` + cookies `vm_admin_rt` (HttpOnly) e `vm_admin_csrf` |
| POST | `/admin/auth/refresh` | cookies `vm_admin_rt` + `vm_admin_csrf`; header `X-CSRF-Token` = valor do csrf | `200 { accessToken, expiresIn, csrfToken }` + **novo** `vm_admin_rt` (rotação) |
| POST | `/admin/auth/logout` | mesmos de refresh | `204`, revoga a família de sessões |
| GET | `/admin/me` | `Authorization: Bearer` | `{ id, nome, email, papel, mfaAtivo }` |
| GET | `/admin/auditoria?limit&cursor` | Bearer | página por cursor |

Papéis vistos no seed: organização (`admin@example.com`), operador (`operador@example.com`), super admin (exige MFA). Esconder na UI ações que o `papel` não pode executar, mas sempre tratar `403` vindo da API.

### Catálogo público
| Método | Rota | Observações |
|---|---|---|
| GET | `/eventos?cursor&limit` | Só publicadas; **não** expõe `status` |
| GET | `/eventos/:slug` | Detalhe público com `localizacao` (objeto) e sem `id`. Rascunho/encerrada/cancelada/arquivada → 404 |

### Catálogo admin (Bearer)
- **Evento** — `POST /admin/eventos`, `GET /admin/eventos?status&limit&cursor`, `GET|PATCH|DELETE /admin/eventos/:id` (DELETE = soft delete).
  Campos: `slug, nome, descricao, dataEvento, horarioLargada, localNome, endereco, complemento, bairro, cidade, uf, cep (só dígitos), latitude, longitude, imagemCapaUrl, galeriaUrl`.
  Resposta adiciona `id, status, localizacao { localNome, cidade, uf, ... }, localizacaoResumo`.
  **Status:** nasce `rascunho`; muda **somente** pelas ações `publicar`, `despublicar`, `encerrar`, `cancelar`, `restaurar` (`POST /admin/eventos/:id/<acao>`, 204). Valores: `rascunho | publicado | encerrado | cancelado | arquivado` (confirmar lista exata com o backend).
- **Distância** — `POST|GET /admin/eventos/:eventoId/distancias`, `PATCH /admin/distancias/:id`.
  Campos: `nome, descricao, distanciaMetros, capacidadeTotal, horarioLargada, percursoUrl, ordem, ativo`.
- **Lote** — `POST|GET /admin/distancias/:distanciaId/lotes`, `PATCH /admin/lotes/:id`.
  Campos: `nome, precoCentavos, inicioEm, fimEm, quantidadeTotal, ordem, ativo`. O lote vigente é decidido pelo backend.
- **Kit** — `POST|GET /admin/eventos/:eventoId/kits`, `PATCH /admin/kits/:id`.
  Campos: `nome, descricao, precoCentavos, ativo, fotos: [{ url, alt, ordem }]`. **`precoCentavos` é proposto** (§16): valor do kit somado ao lote na inscrição. Kits do Vertex: ex. "Kit Camisa + Medalha" e "Kit Camisa"; "Sem kit" = só o valor da corrida.
- **Tamanho de camisa** (catálogo global) — `POST|GET /admin/tamanhos-camisa`, `PATCH /admin/tamanhos-camisa/:id`.
  Campos: `codigo ("GG"), descricao, ordem, ativo`.
- **Documento** — `POST /admin/documentos`, `GET /admin/documentos?eventoId=`.
  Campos: `eventoId, tipo ('regulamento' | 'termo_responsabilidade'), versao, titulo, url, hashSha256, vigenteEm`. Documentos são versionados e imutáveis (sem PATCH): nova versão = novo documento.
- IDs são numéricos. A collection às vezes envia `eventoId` como string — no front, tipar como `number` e enviar número.

### Inscrições (público, sem auth)
**`POST /inscricoes`**
```json
{
  "eventoSlug": "corrida-do-sol-2026",
  "distanciaId": 12,
  "kitId": 3,                 // opcional
  "tamanhoCamisaId": 4,       // opcional (quando o kit tem camisa)
  "nomeCompleto": "Ana Silva",
  "dataNascimento": "1990-05-10",
  "cpf": "52998224725",       // opcional — só dígitos
  "whatsapp": "+5585999999999", // opcional — E.164
  "email": "ana@example.com", // opcional
  "documentosAceitos": [101, 102] // IDs do regulamento e do termo vigentes
}
```
- Identificação: **CPF ou WhatsApp** (pelo menos um). Combinações válidas: CPF+WhatsApp, CPF+e-mail, só WhatsApp.
- O mesmo WhatsApp pode ter vários atletas (família): o atleta é identificado por nome + nascimento dentro do telefone.
- Resposta `201`: `{ codigo: "VX-2026-00000042", status: "pendente", valorBaseCentavos, valorDescontoCentavos, valorTotalCentavos, kitId?, tamanhoCamisaId? }`. **Sem PII** na resposta.
- Formato do código: `/^VX-\d{4}-\d{8}$/`.

**`POST /inscricoes/consulta`** — corpo com **exatamente um** de `{ cpf }` ou `{ whatsapp }` (os dois → 422).
- Resposta: `{ items: [{ nomeMascarado, evento, distancia, status, inscritoEm }], nextCursor }`.
- **Não retorna código nem valores**; CPF sem inscrições → `200` com `items: []` (não revela se o CPF existe).
- **Proposto:** cada item traz `referencia` (opaca, não é o código) para pedir o comprovante.

**`POST /inscricoes/comprovante`** (**proposto**, já no mock) — `{ referencia, dataNascimento: 'YYYY-MM-DD' }`.
- Resposta `200`: `{ codigo, status, nomeCompleto, cpfMascarado, evento: { nome, dataEvento, horarioLargada, localizacaoResumo }, distancia, kit, tamanhoCamisa, valorBaseCentavos, valorDescontoCentavos, valorTotalCentavos, inscritoEm }`.
- Referência inexistente **ou** nascimento errado → mesmo `404` (não revela qual falhou). Precisa de rate limit no backend.
- O PDF do comprovante é gerado no servidor do Next (`src/server/pdf/`, `pdf-lib`) e entregue por server action em base64 — nunca por URL com dados do atleta.

---

## 7. Regras de negócio (no front)

O backend é a autoridade. O front **valida para UX** e **nunca** calcula preço, vaga ou lote para decidir algo — exibe o que a API retorna.

- **Preço/lote/vagas:** exibir o que vier do detalhe público do evento; a cobrança é o `valorTotalCentavos` devolvido por `POST /inscricoes`.
- **Kit:** cada kit tem preço próprio (`precoCentavos`) somado ao lote; sem kit, paga só o lote. O resumo mostra a prévia (lote + kit = total); o valor cobrado é o que a API devolver. No mock, o desconto 60+ incide só sobre o lote.
- **Normalização antes de enviar:** CPF só dígitos (`normalizeCpf`), WhatsApp em E.164 `+55DDDNÚMERO` (`toE164Phone`), datas `YYYY-MM-DD`. Máscaras apenas na UI.
- **Validação local (Zod):** dígitos do CPF (`isValidCpf`), WhatsApp brasileiro válido, nascimento no passado, pelo menos CPF ou WhatsApp, ambos os documentos aceitos.
- **Consulta:** campo único com seletor "WhatsApp / CPF"; enviar só o escolhido. Lista exibe nome mascarado, evento, distância, status e data — sem link para o código (a API não o devolve).
- **Erros da API** mapeados para mensagens amigáveis pela tabela de §6 (`getApiErrorMessage` em `src/lib/utils/api-errors.ts`). `409 INSCRICAO_DUPLICADA` sugere ir para `/consulta`.
- **Rate limit:** feito pelo backend. Como as chamadas saem do servidor do Next, **repassar o IP do cliente** em `X-Forwarded-For` (e `User-Agent`) para que o limite valha por atleta e não pelo IP da Vercel (confirmar com o backend qual header ele confia).
- **Desconto 60+, cupons, número de peito, expiração de pendentes:** regras do backend (pendentes de implementação/definição — §16). O front só exibe `valorDescontoCentavos`.

### Fluxo do formulário de inscrição (multi-etapas, estado em Zustand)
1. **Distância e kit** — distância; kit (opcional, se o evento tiver); tamanho da camisa (quando aplicável)
2. **Dados do atleta** — nome completo, data de nascimento, CPF, WhatsApp, e-mail (CPF ou WhatsApp obrigatório; recomendar ambos)
3. **Termos** — checkbox do regulamento e do termo de responsabilidade, cada um com link para `documento.url` e versão; consentimento LGPD com link para `/privacidade`
4. **Resumo e envio** — distância, lote, kit, total exibido → `POST /inscricoes`
5. **Confirmação + pagamento** — `/inscricao/confirmada` com código, status "Pendente" e valores da resposta; orientar a guardar o código e botão "Ir para o pagamento" (Checkout Pro).

### Pagamento — Mercado Pago Checkout Pro
1. Após criar a inscrição, a server action pede ao backend o link de pagamento (endpoint **pendente**, sugestão: `POST /inscricoes/:codigo/pagamento` → `{ checkoutUrl }`). O backend cria a **preferência** com:
   - `external_reference` = código da inscrição (`VX-AAAA-NNNNNNNN`)
   - item com título "Inscrição — <evento> — <distância>" e valor = `valorTotalCentavos` (preço sempre do servidor)
   - `payer` com e-mail/nome quando houver, para pré-preencher
   - `back_urls` → `${NEXT_PUBLIC_SITE_URL}/inscricao/retorno` (success, pending, failure) e `auto_return: 'approved'`
   - `notification_url` → webhook **do backend**
   - meios: Pix e cartão; **excluir boleto** (compensação demora mais que a reserva da vaga)
   - `expires` / `date_of_expiration` alinhados ao prazo de reserva da inscrição pendente
2. O front redireciona com `window.location.assign(checkoutUrl)` (validar que o host é `mercadopago.com.br`/`mercadopago.com` antes de redirecionar). Nunca montar a URL no front.
3. **Retorno** (`/inscricao/retorno`): o Mercado Pago anexa `status`, `collection_status`, `payment_id` e `external_reference` na URL. **Não confiar nesses parâmetros**: exibir "Confirmando seu pagamento…" e consultar o status real no backend pelo código, com polling curto (ex.: a cada 3 s por até 1 min). Estados de tela:
   - `aprovado/pago` → sucesso, dados da prova e orientação de retirada de kit
   - `pendente` (Pix gerado e não pago) → "Aguardando pagamento" + botão "Pagar agora" (novo link)
   - `recusado`/`cancelado` → mensagem amigável + "Tentar novamente"
   - backend sem confirmação após o polling → "Ainda não recebemos a confirmação. Consulte em instantes em Consultar inscrição."
4. A confirmação definitiva vem **só do webhook no backend**. O front nunca marca pagamento como aprovado.
5. Depois do retorno, limpar os parâmetros da URL (`router.replace('/inscricao/' + codigo)`) para não ficarem no histórico.
6. CSP: navegação para os domínios do Mercado Pago. Redirecionar por `window.location` não é limitado pela CSP (`form-action` só vale para `<form>`), então nenhum domínio do Mercado Pago entra na CSP.

Campos que a API **ainda não aceita** (sexo, equipe/assessoria, contato de emergência): não exibir até o backend suportar (§16).

---

## 8. Integração com a API (padrão BFF)

O navegador **nunca** chama a API diretamente nem vê tokens. Todo acesso passa por código de servidor do Next (Server Components, server actions, `proxy.ts`).

### Estrutura
```
src/server/api/
├── api-client.ts          # apiFetch<T>(): base URL, JSON, timeout, X-Forwarded-For, parse de erro → ApiError
├── api-error.ts           # class ApiError { status, codigo, mensagem }
├── admin-session.ts       # leitura/gravação dos cookies de sessão, getAccessToken(), clearSession()
├── admin-fetch.ts         # adminFetch<T>(): apiFetch + Bearer; em 401 → redireciona ao login
├── set-cookie-parser.ts   # extrai vm_admin_rt / vm_admin_csrf dos Set-Cookie do backend
└── endpoints/             # uma função por rota, tipada (events.ts, distances.ts, price-tiers.ts, kits.ts,
                           #   shirt-sizes.ts, documents.ts, registrations.ts, admin-auth.ts, audit.ts)
```
Tudo em `src/server/` importa `server-only`.

### Sessão do admin
Cookies no domínio do Next, todos `HttpOnly`, `Secure`, `SameSite=Lax`, `path=/`:
- `vm_admin_at` — access token, `maxAge = expiresIn` (900 s)
- `vm_admin_rt` — refresh token copiado do `Set-Cookie` do backend (mesmo `Max-Age`)
- `vm_admin_csrf` — csrf token (HttpOnly aqui: só o servidor do Next o envia como header)

Fluxos:
- **Login** (server action `loginAdmin`): `POST /admin/auth/login` → grava os três cookies → `redirect('/admin')`. Tratar `401` e `403 MFA_NECESSARIO`.
- **Renovação** no `proxy.ts`, para rotas `/admin/*`: se `vm_admin_at` ausente/expirando (< 60 s) e houver `vm_admin_rt`, chamar `POST /admin/auth/refresh` com `Cookie: vm_admin_rt=…; vm_admin_csrf=…` e `X-CSRF-Token`, e regravar os cookies na resposta. Se o refresh falhar → limpar cookies e redirecionar a `/admin/login`. Ignorar requisições de prefetch para não disparar refresh concorrente (o refresh rotaciona e reuso pode revogar a família).
- **Chamadas admin**: Server Components e actions usam `adminFetch` com o token de `vm_admin_at`. Server Components não gravam cookies — por isso a renovação fica no `proxy.ts`.
- **Logout** (server action): `POST /admin/auth/logout` com csrf → limpar cookies → `redirect('/admin/login')`.
- O `admin` retornado no login/`me` alimenta header e permissões por `papel`.
- **Autorização na camada de dados:** o `proxy.ts` só renova a sessão (ele é pulado em prefetch). Toda página, componente ou action do admin que leia ou altere dados chama `requireAdminSession()` (ou usa `adminFetch`) — nunca confiar só no proxy.
- **Refresh concorrente:** o proxy usa single-flight por refresh token dentro da instância; entre instâncias, o backend deve tolerar reuso do refresh anterior por alguns segundos (§16).
- `Secure` nos cookies só em produção (em `http://localhost` o navegador recusaria).

### Cache
- `GET /eventos` e `GET /eventos/:slug`: cacheáveis (revalidação curta, ~60 s) com tag `events` / `event:<slug>`; seguir o mecanismo de cache do Next 16 descrito em `node_modules/next/dist/docs/` (`'use cache'` + `cacheTag`/`cacheLife` se Cache Components estiver ativo).
- Mutações no admin chamam `revalidateTag('events')` / `revalidateTag('event:<slug>')`.
- Inscrição, consulta e todo o admin: `cache: 'no-store'`.

---

## 9. Estrutura de diretórios

```
src/
├── app/
│   ├── (public)/
│   │   ├── corridas/
│   │   │   ├── encerradas/
│   │   │   └── [slug]/
│   │   │       ├── components/
│   │   │       └── inscricao/
│   │   ├── consulta/
│   │   ├── inscricao/
│   │   │   ├── confirmada/
│   │   │   ├── retorno/
│   │   │   └── [code]/
│   │   ├── corridas-parceiras/
│   │   ├── loja/
│   │   ├── pedido/[code]/
│   │   ├── sobre/
│   │   ├── parceiros/
│   │   └── contato/
│   ├── admin/
│   │   ├── login/
│   │   ├── eventos/
│   │   ├── tamanhos-camisa/
│   │   └── auditoria/
│   └── actions/                # Server actions por domínio (events, distances, price-tiers, kits,
│                               #   shirt-sizes, documents, registrations, admin-auth)
├── proxy.ts                    # Proteção de /admin e renovação do token
├── components/
│   ├── ui/                     # shadcn/ui
│   ├── brand/                  # Logo, chevron, eyebrow
│   ├── layout/                 # Header, footer
│   └── motion/                 # Animações client (motion/react) reutilizáveis
├── server/
│   └── api/                    # Cliente HTTP, sessão e endpoints (ver §8)
├── lib/
│   ├── env.ts                  # Validação das variáveis com Zod
│   ├── utils/                  # formatCurrency, formatDate, formatDistance, maskCpf, normalizeCpf,
│   │                           #   isValidCpf, toE164Phone, maskPhone, getApiErrorMessage, query-keys...
│   └── validations/            # Schemas Zod dos formulários
├── types/
│   └── api/                    # *.interface.ts espelhando o contrato da API
├── enums/                      # *.enum.ts (EVENT_STATUS, REGISTRATION_STATUS, DOCUMENT_TYPE, API_ERROR_CODE)
├── hooks/
│   └── data/                   # Hooks de TanStack Query
├── stores/                     # Zustand (registration-form-store, admin-events-filters-store, cart-store...)
└── animations/                 # Variants do Motion (motion/react)
public/
└── brand/
```

---

## 10. Convenções de código (obrigatórias)

### Nomenclatura
- Arquivos: kebab-case (`event-card.tsx`, `use-event.ts`)
- Componentes: PascalCase no nome, kebab-case no arquivo
- Interfaces: PascalCase em arquivos `.interface.ts`
- Enums: SCREAMING_SNAKE_CASE em arquivos `.enum.ts`
- Hooks: prefixo `use`; stores: `use<Nome>Store`

### Tipos da API
- Interfaces em `src/types/api/` com **nome em inglês** e **chaves exatamente como a API** (português), sem tradução nem camada de mapeamento:
```ts
// src/types/api/event.interface.ts
export interface PublicEvent {
  slug: string
  nome: string
  descricao: string
  dataEvento: string // YYYY-MM-DD
  horarioLargada: string // HH:mm
  localizacao: EventLocation
  imagemCapaUrl: string | null
}

// src/types/api/cursor-page.interface.ts
export interface CursorPage<T> {
  items: T[]
  nextCursor: string | null
}

// src/types/api/api-error-body.interface.ts
export interface ApiErrorBody {
  error: { codigo: string; mensagem: string }
}
```
- Valores de status/enum da API em minúsculas (`'rascunho'`, `'pendente'`) — os enums do front mapeiam esses literais: `EVENT_STATUS.DRAFT = 'rascunho'`.
- Labels e cores de badge por status em `src/lib/utils/` (`getEventStatusLabel`, `getRegistrationStatusLabel`).

### Componentes
- **Um componente por arquivo. Nunca** criar dois componentes no mesmo arquivo.
- Itens renderizados em `.map()` **sempre** extraídos para componente próprio (`event-list.tsx` → `event-list-item.tsx`).
- Funções auxiliares **sempre** em `src/lib/utils/`, nunca inline no componente.
- `'use client'` só quando houver interatividade. Server Components por padrão.
- Props tipadas com `interface`. Sem `any` (exceto em `catch` quando inevitável).
- Cada página/feature tem sua própria pasta `components/` com `index.ts`.

### Busca de dados — os 4 estados são obrigatórios
Todo componente que busca dados implementa: **loading** (Skeleton com o mesmo layout final), **erro** (`ServerError`), **vazio** (mensagem + ícone + CTA quando fizer sentido) e **sucesso** (transformações com `useMemo`).
- RSC: cada seção dentro de `<Suspense>` com skeleton correspondente; chamada à API via `src/server/api/endpoints`; `ApiError` 404 → `notFound()`, demais → `ServerError`.
- Client: TanStack Query chamando **server actions** (nunca a API direto), `queryKey` de `src/lib/utils/query-keys.ts`, `staleTime` de 5 min (exceto consulta/admin: `staleTime: 0`).
- Paginação server-side: a API usa **cursor**. Guardar no Zustand o filtro e a pilha de cursores (`cursorStack`) para "Anterior/Próxima"; nunca em search params; filtro + cursor na query key; debounce na busca.

### Server actions
- Sempre `'use server'`, validar entrada com Zod e, nas de admin, usar `adminFetch` (que exige sessão).
- Chamam as funções de `src/server/api/endpoints/`; não montam URL nem headers à mão.
- Retornar sempre `HttpResponse<T>`, convertendo `ApiError`:
```ts
export interface HttpResponse<T = unknown> {
  status: number
  data?: T
  error?: string   // mensagem amigável (getApiErrorMessage)
  code?: string    // error.codigo da API, para a UI decidir o fluxo
  title?: string
}
```
- Após mutações no admin, `revalidateTag`/`revalidatePath` das páginas afetadas.
- **Nunca** devolver tokens ou PII completa para o client.

### Formulários
- React Hook Form + `zodResolver`, todos os `defaultValues` definidos.
- Schemas espelham os campos da API (mesmas chaves) para enviar sem remapear.
- Mensagens de validação em português.
- Feedback com `toast.success` / `toast.error` usando o `title`/`error` da action.
- Erros `422` com campo identificável → `setError` no campo; demais → toast.

### Dialogs, drawers e popovers
- Todos fecham na troca de rota com `useCloseOnRouteChange(() => setIsOpen(false), isOpen)`.
- Padrão responsivo: Dialog no desktop, Drawer no mobile.
- Ações destrutivas do admin (excluir, cancelar, encerrar evento) sempre com confirmação.

### Estilo
- Tokens do tema em vez de valores arbitrários; `cn()` para classes; `cva` para variantes.
- Mobile-first. Testar em 360px de largura.
- CTA de inscrição sempre visível no mobile na página do evento (barra fixa no rodapé).

---

## 11. SEO, performance e acessibilidade

- `generateMetadata` em cada página de evento (título, descrição, OG com `imagemCapaUrl`).
- JSON-LD `SportsEvent` nas páginas de evento (`localizacao`, `latitude`/`longitude`).
- `sitemap.ts` (slugs de `GET /eventos`) e `robots.ts`; admin com `noindex`.
- `next/image` para todas as imagens.
- HTML semântico, foco visível, labels em todos os inputs, contraste AA (atenção ao verde da marca).
- Meta: Lighthouse ≥ 90 em mobile nas páginas públicas.

---

## 12. LGPD e segurança

- Coletar só os dados que a API aceita; consentimento com link para `/privacidade`.
- CPF e telefone mascarados em qualquer tela pública; **nunca** em URLs, query strings ou logs. Consulta usa `POST`.
- Tokens apenas em cookies HttpOnly do Next; nada em `localStorage`.
- `API_URL` e demais segredos só no servidor; nunca com prefixo `NEXT_PUBLIC_`.
- Não logar corpos de request/response de inscrição, consulta ou login.
- Headers de segurança no `next.config` (CSP, `Referrer-Policy: no-referrer` nas páginas de inscrição/consulta).

---

## 13. Variáveis de ambiente

```
API_URL=http://localhost:3000        # Backend VertexMove (sem /api/v1)
API_TIMEOUT_MS=10000
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_INSTAGRAM_URL=
```
Rodar o Next em outra porta no dev (ex.: `next dev -p 3001`), já que a API usa a 3000. Validar as variáveis em `src/lib/env.ts` com Zod.

---

## 14. Comandos

```bash
npm run dev          # Desenvolvimento (porta 3001)
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run build        # Build de produção
```
Backend local: no repositório da API, `npm run db:migrate` e `npm run db:seed`. Contas de dev: `admin@example.com` e `operador@example.com`, senha `Vertex@Dev12345`. Use a collection Postman para criar evento → distância → lote vigente → documentos → publicar antes de testar a inscrição no front.

Antes de cada commit: `lint`, `typecheck` e `build` passando. Commits no padrão Conventional Commits.

---

## 15. Fases de entrega

1. **MVP (API já disponível)** — Home e página do evento (catálogo público), formulário de inscrição + confirmação, consulta por WhatsApp/CPF, login/logout/renovação do admin, CRUD de eventos, distâncias, lotes, kits, tamanhos e documentos, ciclo de vida do evento, auditoria.
2. **MVP (depende do backend)** — Pagamento via Checkout Pro (Pix e cartão), páginas `/inscricao/retorno` e `/inscricao/[code]`, lista/exportação de inscritos no admin, e-mail de confirmação.
3. **Fase 2** — Cupons, loja de camisas e acessórios, check-in de retirada de kit e de pedidos.
4. **Fase 3** — Resultados/classificação, galeria de fotos (`galeriaUrl`), notificações por WhatsApp.

---

## 16. Pendências e decisões em aberto

### Backend (combinar com o time da API)
- [ ] O detalhe público `GET /eventos/:slug` precisa expor: distâncias (com `id`), preço do lote vigente e vagas/esgotado, kits ativos (com `id` e fotos), tamanhos de camisa disponíveis e **IDs dos documentos vigentes** (regulamento e termo) — sem eles o front não consegue montar `documentosAceitos`, `kitId` e `tamanhoCamisaId`.
- [ ] Preço do kit: `precoCentavos` no kit (admin e detalhe público), somado ao lote em `valorBaseCentavos`. Definir se o desconto 60+ incide sobre o kit.
- [ ] Comprovante na consulta: `referencia` opaca em cada item de `POST /inscricoes/consulta` e `POST /inscricoes/comprovante` (`{ referencia, dataNascimento }` → dados da inscrição), com rate limit por IP/referência.
- [ ] Endpoint para buscar inscrição por código (status/pagamento) — hoje a consulta não devolve código.
- [ ] Pagamento via **Checkout Pro**: endpoint que cria a preferência e devolve `checkoutUrl` (`init_point`), webhook do Mercado Pago (validar assinatura `x-signature`, idempotente por `payment_id`), status da inscrição por código para a página de retorno, expiração de pendentes alinhada à preferência e novo link para "Pagar agora".
- [ ] Listagem/exportação de inscrições no admin e marcação de retirada de kit.
- [ ] Campos extras na inscrição: sexo, equipe/assessoria, contato de emergência.
- [ ] Campo de aceite/identificação do responsável legal para atletas menores de 18 anos.
- [ ] Lista exata de `status` de evento e inscrição; matriz de permissões por `papel`.
- [ ] MFA/TOTP para super admin.
- [ ] Janela de tolerância ao reuso do refresh token (ex.: aceitar o anterior por 10–30 s devolvendo o mesmo par), para o Next em várias instâncias não deslogar o admin em requisições concorrentes.
- [ ] Código/status de bloqueio por tentativas no login (429/423) para a UI mostrar "aguarde".
- [ ] Qual header de IP do cliente o rate limit confia (`X-Forwarded-For`?) e como o Next se autentica como proxy confiável.
- [ ] Domínio/`SameSite` dos cookies em produção e CORS (se algum dia o browser chamar a API direto).
- [ ] Loja (produtos, variantes, pedidos, estoque).
- [ ] Listagem pública de corridas encerradas (histórico) e, depois, resultados/galeria. Proposta: `GET /eventos/encerrados?cursor&limit` → `CursorPage<PublicEvent>` (já implementada no mock).
- [ ] Corridas parceiras (nome, data, distâncias, cupom, link externo, imagem) com CRUD no admin. Proposta: `GET /corridas-parceiras` → `PartnerRace[]` (já implementada no mock).
- [ ] Parceiros/apoiadores e números da comunidade: estáticos no front até haver endpoint (mock fornece dados de demonstração).

### Cliente
- [x] Gateway: Mercado Pago Checkout Pro
- [ ] Aplicação criada na **conta Mercado Pago do Vertex** (não na do desenvolvedor), chave Pix cadastrada e quem arca com as taxas
- [ ] Parcelamento no cartão: permitido? Juros por conta de quem?
- [ ] Hex exatos e arquivo vetorial da logo
- [ ] Domínio do site
- [ ] Número de WhatsApp e @ do Instagram oficiais
- [ ] Regras do desconto 60+ e de outros descontos (assessorias, PCD)
- [ ] Política de cancelamento, reembolso e transferência de inscrição
- [ ] Número de peito: automático ou manual
- [ ] Haverá eventos virtuais além das corridas presenciais?
- [ ] Fotos oficiais e textos institucionais do Vertex (história, missão, frase do hero, 4 selos de "Mais que corrida")
- [ ] Lista de parceiros/apoiadores e de corridas parceiras com cupons
- [ ] O Vertex tem treinos coletivos para divulgar (como os "encontros" da referência)?
- [ ] Loja: catálogo inicial, preços, estoque e locais/horários de retirada
