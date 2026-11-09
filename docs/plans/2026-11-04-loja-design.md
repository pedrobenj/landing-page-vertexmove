# Loja Vertex — camisas e medalhas

**Data:** 2026-11-04
**Status:** Etapa 1 implementada sobre mock; aguardando API da loja no backend

> **Nota (2026-11-09):** o Prisma saiu do front. O frontend agora é só o BFF da API VertexMove (ver `CLAUDE.md`); a loja roda sobre o mock em `src/server/api/mocks/store/` (`USE_MOCK_API=true`) e, sem o mock, as páginas mostram "A loja estará disponível em breve.". O modelo Prisma abaixo fica como **referência para o backend** implementar produtos, variantes, pedidos e estoque.

## Objetivo

Permitir que atletas e torcedores comprem camisas e medalhas do Vertex pelo site, pagando com Pix e retirando presencialmente. A loja substitui a antiga página de "medalhas de edições anteriores" (fase 2).

## Decisões

| Tema | Decisão |
|---|---|
| Entrega | **Somente retirada** — sem frete, sem endereço. Local/horário definido pelo admin por produto (`pickupInfo`). |
| Compra | **Carrinho com vários itens**, um único Pix por pedido. |
| Acompanhamento | **Mesma consulta das inscrições** (`/consulta`, por WhatsApp ou CPF, sem login). |
| Modelagem | **Catálogo genérico** (`Product` + `ProductVariant`) com pedidos próprios (`Order` + `OrderItem`). Inscrição e loja continuam fluxos separados. |
| Comprador | Dados gravados no próprio pedido (não reaproveita `Participant`, que exige campos de atleta). |

### Alternativas descartadas
- **Tabelas separadas para camisa e medalha:** duplicaria carrinho, estoque e admin; cada novo produto exigiria nova tabela.
- **Pedido único para inscrição + loja:** permitiria um só Pix para tudo, mas obrigaria a refazer o fluxo de inscrição. Pode evoluir a partir do desenho atual se houver demanda.

## Páginas públicas

| Rota | Conteúdo |
|---|---|
| `/loja` | Catálogo em grade, filtro Camisas / Medalhas, selo "Esgotado". |
| `/loja/[slug]` | Fotos, descrição, seletor de tamanho (sem estoque = desabilitado), quantidade, "Adicionar ao carrinho". Medalhas exibem: *"compra apenas da medalha física, não gera inscrição"*. |
| `/loja/carrinho` | Itens, quantidades, remover, subtotal, "Finalizar compra". |
| `/loja/checkout` | Nome, CPF, WhatsApp, e-mail, aceite de privacidade, resumo, Pix. |
| `/pedido/[code]` | QR Pix + copia-e-cola com polling do status; após pago, local/horário de retirada. |
| `/medalhas` | Redireciona para `/loja?tipo=medalhas`. |

Header ganha link "Loja" e ícone de carrinho com contador. Home ganha a seção "Loja Vertex" com até 4 produtos em destaque (`isFeatured`).

## Fluxo de compra

1. **Carrinho** em Zustand persistido em `localStorage`, guardando apenas `variantId` + `quantity` — nunca preço.
2. **Checkout:** o servidor revalida produto ativo, estoque e preço atual; cria `Order` `PENDING` e reserva o estoque por 30 min.
3. **Estoque mudou:** checkout recusa sem cobrar e ajusta o carrinho com aviso.
4. **Pagamento:** webhook confirma o Pix → `PAID` → e-mail/WhatsApp.
5. **Retirada:** admin marca `READY_FOR_PICKUP` e depois `PICKED_UP` (busca rápida por CPF/código).

## Modelo de dados

> Referência para o backend (o front não tem Prisma).

```prisma
enum ProductType { SHIRT MEDAL }

enum OrderStatus {
  PENDING
  PAID
  READY_FOR_PICKUP
  PICKED_UP
  CANCELLED
  EXPIRED
  REFUNDED
}

model Product {
  id          String      @id @default(cuid())
  slug        String      @unique
  name        String
  description String
  type        ProductType
  eventId     String?     // corrida de origem (ex.: medalha da edição 2025)
  imageUrls   String[]
  price       Int         // centavos
  pickupInfo  String
  isActive    Boolean     @default(true)
  isFeatured  Boolean     @default(false)
  variants    ProductVariant[]
}

model ProductVariant {
  id        String @id @default(cuid())
  productId String
  label     String // "P", "M", "G", "Única"
  stock     Int
}

model Order {
  id                String      @id @default(cuid())
  code              String      @unique // VTX-P-XXXX
  buyerName         String
  buyerCpf          String
  buyerWhatsapp     String
  buyerEmail        String
  amount            Int         // centavos
  status            OrderStatus @default(PENDING)
  expiresAt         DateTime?
  privacyAcceptedAt DateTime
  readyAt           DateTime?
  pickedUpAt        DateTime?
  items             OrderItem[]
  payments          Payment[]
}

model OrderItem {
  id           String @id @default(cuid())
  orderId      String
  variantId    String
  quantity     Int
  unitPrice    Int    // centavos, no momento da compra
  productName  String // snapshot
  variantLabel String // snapshot
}
```

Mudanças em modelos existentes:
- `Payment.registrationId` passa a opcional; novo `Payment.orderId` opcional. Exatamente um dos dois deve estar preenchido (validado no serviço + `CHECK` na migration).
- `Medal` é removido.

### Estoque sem overselling
Ao criar o pedido, cada variante é decrementada numa transação com update condicional (`stock >= quantity`). Se alguma falhar, a transação inteira é revertida. Expiração e cancelamento devolvem o estoque. O webhook nunca altera estoque.

## Admin

- `/admin/loja/produtos` — CRUD de produtos com fotos, variantes/estoque, ativo e destaque.
- `/admin/loja/pedidos` — tabela com filtros (status, produto) em Zustand, busca por CPF/código, exportação CSV, ações "Pronto para retirada" e "Retirado".
- Dashboard — card com receita da loja e pedidos aguardando retirada.

## Erros e casos de borda

| Situação | Comportamento |
|---|---|
| Estoque acabou entre carrinho e checkout | Recusa sem cobrar; ajusta o carrinho com aviso. |
| Produto desativado ou preço alterado | Carrinho revalidado ao abrir; preço sempre do servidor. |
| Pix não pago em 30 min | `EXPIRED`, estoque devolvido (mesmo job das inscrições). |
| Webhook duplicado | Ignorado por `providerPaymentId`. |
| Pagamento após expiração | Reativa se houver estoque; senão `REFUNDED` e alerta ao admin. |
| Quantidades abusivas | Zod: máx. 10 por item, 20 itens por pedido. |
| Excesso de tentativas | Rate limit na action de checkout. |

Todas as actions retornam `HttpResponse` com `title` em português.

## Testes

- **Playwright (mocks):** catálogo e filtro, tamanho esgotado desabilitado, adicionar ao carrinho + contador, persistência após reload, validação do checkout, redirect de `/medalhas`, layout em 360px.
- **Com banco:** concorrência de estoque (duas compras da última unidade → só uma passa), expiração devolvendo estoque, idempotência do webhook.

## Entrega em etapas

1. **Etapa 1 (agora):** schema, páginas públicas, carrinho, checkout até a geração do Pix e admin de produtos, tudo funcionando com dados mockados.
2. **Etapa 2 (com o Pix das inscrições):** pagamento, webhook, expiração, notificações e admin de pedidos com ações de retirada.
