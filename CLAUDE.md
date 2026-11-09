# Vertex Grupo de Corrida — Plataforma de Inscrições (frontend)

Guia de contexto e convenções para o desenvolvimento do site de inscrições em corridas de rua do **Vertex Grupo de Corrida** (Fortaleza/CE). Leia este arquivo inteiro antes de qualquer tarefa e siga-o em todo o código gerado.

> Desenvolvedor: **Pedro Benjamin** (prestador de serviço). O rodapé de todas as páginas públicas deve conter o crédito "Desenvolvido por Pedro Benjamin".

> **Arquitetura:** este repositório é **somente o frontend** (Next.js 16). Regras de negócio, banco, autenticação, preços, vagas e pagamentos vivem no **backend VertexMove (NestJS)**, consumido via HTTP em `/api/v1`. O contrato de referência é a collection Postman **"VertexMove — Admin Auth + Inscrições"** (ver §6). O front **não** tem Prisma, banco nem regras de preço próprias.

---

## 1. Visão geral

Plataforma web onde o atleta:

1. Vê as corridas publicadas do Vertex;
2. Escolhe a prova, a distância e, se houver, o kit e o tamanho da camisa;
3. Preenche os dados, aceita regulamento e termo de responsabilidade e gera a inscrição (pagamento Pix/cartão — **pendente no backend**);
4. Compra camisas, viseiras, acessórios e medalhas na **loja** (**pendente no backend**, ver §16);
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

## 2. Referência do cliente

Referência: **https://www.corredasamigas.com.br/** (site do grupo de corrida feminino "Corre das Amigas"). Substitui a referência anterior (paineldodesafio.com.br).

### Estrutura da referência a seguir

**Menu principal** (header e repetido no rodapé): Início · Corridas · Loja · Corridas Parceiras · Conheça o Vertex · Parceiros · Contato · Área administrativa (link discreto, por último).

**Home, nesta ordem (espelhando o site atual da referência):**
1. **Hero** — selo-pílula com o nome do grupo, frase curta e motivacional de três batidas (no estilo "Corra. Conecte-se. Evolua.") em tipografia enorme, uma linha sobre o grupo e CTA "Conheça nossa história" (`/sobre`). Adicionar um CTA primário "Quero me inscrever" (âncora `#corridas`), já que aqui o foco é a inscrição.
2. **Três cards de destaque com foto e sobreposição escura**, lado a lado no desktop e empilhados no mobile, cada um com selo (ex.: "2 corridas abertas"), título, frase e link:
   - *Próximas corridas* → "Garantir minha vaga" (`#corridas`)
   - *Consultar inscrição* → "Consultar" (`/consulta`) — no lugar dos "Desafios Online" da referência
   - *Loja* → "Acessar a loja" (`/loja`)
3. **Corridas que já vivemos** — carrossel de edições passadas (foto, data, nome) e link "Ver todas" (`/corridas/encerradas`). Some se não houver dados.
4. **Próximas corridas** (`#corridas`) — título "Escolha seu próximo desafio", texto curto, grade de cards de corridas abertas (capa, nome, data/largada, local, distâncias, "a partir de" e botão "Inscrever-se").
5. **Como funciona** — passos numerados (mantido do projeto, não existe na referência).
6. **Acompanhe sua inscrição** — faixa escura com ícone, texto e botão "Consultar minha inscrição" (`/consulta`). Equivale ao "Acompanhe seu desafio" da referência, trocando quilômetros por status da inscrição.
7. **Marcas que correm com a gente** — faixa/carrossel de logos dos parceiros (`/parceiros`). Some se não houver parceiros.
8. **Vista o movimento** — faixa da loja com CTA "Conhecer a loja".
9. **Mais que corrida** — faixa escura: título institucional, texto, CTA para `/sobre` e grade 2×2 com **quatro selos** (ícone + frase: ambiente acolhedor, todos os níveis, experiências marcantes, comunidade em movimento — adaptar ao Vertex).
10. **Próximas corridas parceiras** — três cards com capa, data, local, distâncias, caixa de cupom e botão "Inscrever-se" (link externo), mais link "Ver todas" (`/corridas-parceiras`). Some se não houver dados.
11. **Números da comunidade** — faixa na cor de destaque com 4 indicadores grandes (corridas realizadas, participantes, inscrições, anos de grupo). Some se os números não estiverem definidos.
12. **Rodapé** escuro em 3 colunas — logo + tagline, "Contato" (WhatsApp `wa.me`, e-mail, Instagram) e "Navegação"; linha final com © ano e "Desenvolvido por Pedro Benjamin".

**Header:** barra escura com a logo, carrinho e botão de menu (hambúrguer) que abre a navegação em painel lateral, em todos os tamanhos de tela, como na referência.

**Páginas internas da referência que entram no projeto:**
- **Corridas encerradas** ("Eventos que já vivemos") — histórico das edições passadas com capa e data; futuramente com galeria e resultados.
- **Loja** — grade de produtos (camisas, viseiras, ecobags, acessórios, medalhas) com filtro por categoria ("Todos" + tipos) e link para o carrinho; pagamento Pix ou cartão.
- **Corridas Parceiras** — corridas de outras organizações com **cupom de desconto exclusivo** do Vertex: card com data, distâncias, cupom (botão copiar) e link externo de inscrição.
- **Conheça o Vertex** (`/sobre`) — título + tagline, "Nossa história", "Missão", CTA "Ver próximas corridas". Melhorar em relação à referência com fotos reais e números do grupo.
- **Parceiros** — logos/links dos apoiadores.
- **Contato** — WhatsApp, Instagram, e-mail e, se houver, local/horário dos treinos.

**Tom:** acolhedor, motivacional e inclusivo; frases curtas focadas em comunidade. Títulos de seção no formato eyebrow + título forte (ver §3).

### O que não copiar / o que é diferente
- A referência é um grupo **feminino** com treinos e **desafios online por meta de km**. O Vertex organiza **corridas de rua presenciais** abertas a todos: nada de "desafios online"/"meus quilômetros"; no lugar, informações de prova (data, largada, local, percurso, kit, regulamento, resultados).
- A referência carrega listas só no client ("Carregando eventos...") e deixa contato e redes vazios. Aqui: listas renderizadas no servidor (SEO e skeleton com os 4 estados), contato e redes sempre preenchidos.
- Manter o que já era nosso e a referência não tem: **consulta de inscrição sem login**, seção **"Como funciona"** em passos (pode entrar entre as seções 3 e 4 da home) e **FAQ** na página do evento.
- Estado vazio amigável quando não há corridas abertas: "Nenhuma corrida aberta no momento. Volte em breve!" + link para corridas encerradas.

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
- Títulos: **Montserrat** (700/800, caixa alta em títulos curtos). Corpo: **Inter**. Carregar via `next/font/google`.
- Subtítulos no estilo "GRUPO DE CORRIDA": caixa alta, `tracking-widest`, ladeados por traços verdes — padrão de "eyebrow" acima dos títulos de seção.

### Linguagem visual (adaptada da referência)
- **Ritmo de seções:** faixas brancas alternadas com faixas escuras (`brand-navy`, ou um navy mais profundo como `brand-navy-deep`) e uma faixa na cor de destaque (`brand-green`, texto navy) para os números. Seções brancas separadas por borda fina.
- **Cabeçalho de seção:** eyebrow pequeno em caixa alta na cor de destaque (verde escurecido para passar AA sobre branco) → título **muito grande e pesado** (Montserrat 800/900, `text-4xl`–`text-6xl`) → linha de apoio em cinza; botões secundários ("Ver todas →") alinhados à direita no desktop.
- **Cards:** cantos bem arredondados (`rounded-2xl`), borda clara e sombra suave; imagem de capa no topo; linhas de informação com ícones lucide na cor de destaque; preço em destaque e botão pequeno com seta.
- **Cards de destaque do topo:** foto de fundo com sobreposição escura, selo-pílula, título branco grande e link na cor de destaque.
- **Botões:** primário na cor de destaque com seta (`ArrowRight`); secundário branco com borda.
- **Mobile:** tudo empilhado, botões em largura total.

### Motivo gráfico
- O **pico/chevron verde** ("^") é o elemento-assinatura: divisor de seção, marca d'água no hero, bullet de listas, ícone de "subida/progresso". Um uso marcante por tela.
- Fotos: corredores reais de Fortaleza (Beira-Mar, Aterro, Parque do Cocó) pedidas ao cliente. Evitar banco de imagens genérico.

---

## 4. Stack

- **Framework:** Next.js 16 (App Router, Server Components por padrão). Ler `AGENTS.md` e os guias em `node_modules/next/dist/docs/` antes de usar APIs do Next — a versão tem breaking changes (ex.: `middleware.ts` → `proxy.ts`, `cookies()`/`headers()` assíncronos).
- **Linguagem:** TypeScript (strict)
- **Backend:** API **VertexMove (NestJS)** em `${API_URL}/api/v1` — fonte única de dados e regras.
- **UI:** shadcn/ui + Radix UI
- **Estilo:** Tailwind CSS
- **Auth (somente admin):** JWT emitido pelo backend; sessão gerenciada pelo próprio Next via cookies HttpOnly (padrão BFF, ver §8). **Não usar NextAuth.** Atletas não têm conta.
- **Pagamentos:** a definir no backend (Mercado Pago proposto). O webhook do gateway fica **no backend**, não no Next.
- **Estado:** Zustand (UI, filtros, cursor de paginação, formulário multi-etapas, carrinho) + TanStack Query (dados no client)
- **Formulários:** React Hook Form + Zod
- **Datas:** date-fns com locale `ptBR`, fuso `America/Fortaleza`
- **Toasts:** sonner
- **Animações:** Framer Motion (sutil)
- **Imagens:** URLs vindas da API (`imagemCapaUrl`, `fotos[].url`); configurar `images.remotePatterns` para o CDN.
- **Deploy:** Vercel

---

## 5. Páginas e rotas

### Públicas — `src/app/(public)/`
| Rota | Conteúdo | API |
|---|---|---|
| `/` | Hero, 3 cards de destaque, próximas corridas, como funciona, acompanhe sua inscrição, vista o movimento, mais que corrida (ver §2) | `GET /eventos` |
| `/corridas/encerradas` | "Corridas que já vivemos": edições passadas | **pendente** (API pública só lista publicadas) |
| `/corridas/[slug]` | Página do evento: capa, data/largada, local (mapa por `latitude`/`longitude`), distâncias e preço do lote vigente, kits (fotos), percurso, regulamento, FAQ, CTA fixo "Inscrever-se" no mobile | `GET /eventos/:slug` |
| `/corridas/[slug]/inscricao` | Formulário em etapas (ver §7) | `POST /inscricoes` |
| `/inscricao/confirmada` | Confirmação pós-criação com código e valores (dados vindos da resposta do `POST /inscricoes`, guardados em memória no store) | — |
| `/inscricao/[code]` | Status/pagamento por código (QR Pix, copia-e-cola) | **pendente** (`GET` por código não existe) |
| `/consulta` | Consulta por WhatsApp **ou** CPF → lista mascarada | `POST /inscricoes/consulta` |
| `/loja`, `/loja/[slug]`, `/loja/carrinho`, `/loja/checkout`, `/pedido/[code]` | Loja de camisas e medalhas | **pendente** |
| `/medalhas` | Redireciona para `/loja?tipo=medalhas` | — |
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
  Campos: `nome, descricao, ativo, fotos: [{ url, alt, ordem }]`.
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

---

## 7. Regras de negócio (no front)

O backend é a autoridade. O front **valida para UX** e **nunca** calcula preço, vaga ou lote para decidir algo — exibe o que a API retorna.

- **Preço/lote/vagas:** exibir o que vier do detalhe público do evento; a cobrança é o `valorTotalCentavos` devolvido por `POST /inscricoes`.
- **Normalização antes de enviar:** CPF só dígitos (`normalizeCpf`), WhatsApp em E.164 `+55DDDNÚMERO` (`toE164Phone`), datas `YYYY-MM-DD`. Máscaras apenas na UI.
- **Validação local (Zod):** dígitos do CPF (`isValidCpf`), WhatsApp brasileiro válido, nascimento no passado, pelo menos CPF ou WhatsApp, ambos os documentos aceitos.
- **Consulta:** campo único com seletor "WhatsApp / CPF"; enviar só o escolhido. Lista exibe nome mascarado, evento, distância, status e data — sem link para o código (a API não o devolve).
- **Erros da API** mapeados para mensagens amigáveis pela tabela de §6 (`getApiErrorMessage` em `src/lib/utils/api-errors.ts`). `409 INSCRICAO_DUPLICADA` sugere ir para `/consulta`.
- **Rate limit:** feito pelo backend. Como as chamadas saem do servidor do Next, **repassar o IP do cliente** em `X-Forwarded-For` (e `User-Agent`) para que o limite valha por atleta e não pelo IP da Vercel (confirmar com o backend qual header ele confia).
- **Desconto 60+, cupons, número de peito, expiração de pendentes:** regras do backend (pendentes de implementação/definição — §15). O front só exibe `valorDescontoCentavos`.

### Fluxo do formulário de inscrição (multi-etapas, estado em Zustand)
1. **Distância e kit** — distância; kit (opcional, se o evento tiver); tamanho da camisa (quando aplicável)
2. **Dados do atleta** — nome completo, data de nascimento, CPF, WhatsApp, e-mail (CPF ou WhatsApp obrigatório; recomendar ambos)
3. **Termos** — checkbox do regulamento e do termo de responsabilidade, cada um com link para `documento.url` e versão; consentimento LGPD com link para `/privacidade`
4. **Resumo e envio** — distância, lote, kit, total exibido → `POST /inscricoes`
5. **Confirmação** — `/inscricao/confirmada` com código, status "Pendente" e valores da resposta; orientar a guardar o código. Pagamento entra aqui quando o backend expuser o endpoint.

Campos que a API **ainda não aceita** (sexo, equipe/assessoria, contato de emergência): não exibir até o backend suportar (§15).

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
│   └── layout/                 # Header, footer
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
└── animations/                 # Variants do Framer Motion
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
2. **MVP (depende do backend)** — Pagamento Pix na inscrição e página `/inscricao/[code]`, lista/exportação de inscritos no admin, e-mail de confirmação.
3. **Fase 2** — Cartão, cupons, loja de camisas e medalhas, check-in de retirada de kit e de pedidos.
4. **Fase 3** — Resultados/classificação, galeria de fotos (`galeriaUrl`), notificações por WhatsApp.

---

## 16. Pendências e decisões em aberto

### Backend (combinar com o time da API)
- [ ] O detalhe público `GET /eventos/:slug` precisa expor: distâncias (com `id`), preço do lote vigente e vagas/esgotado, kits ativos (com `id` e fotos), tamanhos de camisa disponíveis e **IDs dos documentos vigentes** (regulamento e termo) — sem eles o front não consegue montar `documentosAceitos`, `kitId` e `tamanhoCamisaId`.
- [ ] Endpoint para buscar inscrição por código (status/pagamento) — hoje a consulta não devolve código.
- [ ] Pagamento (gateway, criação de cobrança Pix, polling de status, webhook) e expiração de pendentes.
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
- [ ] Gateway de pagamento e quem arca com as taxas
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
