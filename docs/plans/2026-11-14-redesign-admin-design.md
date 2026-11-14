# Redesign do admin (cabeçalho navy + dashboard com checklist)

Data: 2026-11-14 · Status: aprovado

## Problema

A home e as páginas públicas ganharam identidade própria (navy, pico/chevron, voz "vértice"; ver
`2026-11-13-identidade-propria-design.md`). O admin só tem a barra navy do topo: os títulos são texto
navy solto, o eyebrow "Painel" não tem o pico e o dashboard é "Dashboard" + atalhos + quatro cartões
vazios. Além disso, nada avisa o organizador quando uma corrida publicada não pode receber inscrições
(sem lote vigente, regulamento ou termo), o que gerou confusão no teste integrado.

## Decisões

- **Escopo:** cabeçalho navy compacto em todas as páginas do admin + dashboard redesenhado.
  Formulários e tabelas continuam brancos e densos. Sem menu lateral.
- **Sem animações** no admin (regra do CLAUDE.md §4).
- **Checklist de prontidão** no dashboard, com dados dos endpoints que já existem.

## Estrutura

- `main` do layout do painel perde o padding; cada página = `AdminPageHero` (faixa navy de largura
  total) + `AdminPageBody` (o contêiner atual `max-w-7xl px-4 py-8`).
- `AdminPageHero`: `bg-brand-navy-deep`, pico esmaecido menor que o público, eyebrow com o pico
  (`SectionHeading tone="dark"`), `h1` em `text-3xl`/`text-4xl`, `py-8`. Slots: `before` (voltar),
  `badge` (status), `actions` (à direita no desktop, largura total no mobile). Estados de erro também
  usam a faixa.

| Página | Eyebrow | Título | Ações |
| --- | --- | --- | --- |
| Dashboard | Painel do organizador | Bom te ver, {nome} | Nova corrida |
| Corridas | Corridas | Suas provas | Nova corrida |
| Nova corrida | Corridas | Nova corrida | — |
| Corrida | Corrida + selo de status | {nome} + data/local | Ver no site + ciclo de vida |
| Distâncias / Kits / Documentos / Inscrições | {nome da corrida} | título da seção | Novo … |
| Tamanhos de camisa | Catálogo | Tamanhos de camisa | Novo tamanho |
| Auditoria | Auditoria | Quem fez o quê | — |
| Loja | Loja | Produtos / Novo / Editar | Novo produto |

## Dashboard

1. Faixa navy: "Painel do organizador" · "Bom te ver, {nome}" · "Daqui você monta cada prova, degrau
   por degrau." · botão Nova corrida (só com permissão). Skeleton do mesmo tamanho enquanto carrega.
2. **Próximos topos:** até 3 corridas futuras (rascunho ou publicada, por data), cada uma com nome,
   data, selo, link "Gerenciar" e checklist ✓/✗ de *lote vigente*, *regulamento* e *termo*, com resumo
   "Pronta para inscrições" ou "Falta: …" (cada item linka para a tela certa). Vazio: "Nenhuma prova
   ainda. Que tal a primeira subida?".
3. Atalhos: os mesmos 4, com ícone.
4. Números: uma faixa fina "relatórios dependem do backend" no lugar dos 4 cartões vazios.

## Dados do checklist

- `GET /admin/eventos` → sem canceladas/encerradas/passadas → por `dataEvento` → 3.
- Por corrida, em paralelo: distâncias, lotes das distâncias ativas, documentos.
- `getEventReadiness` (função pura): lote = distância ativa com lote ativo cuja janela inclui agora
  (mesma regra do `currentTier` público, extraída para util compartilhada); regulamento/termo =
  documento do tipo com `vigenteEm ≤ agora`. Saída `{ ready, missing[] }`.
- Erro numa corrida → "Não foi possível verificar esta prova" só no cartão dela; erro na lista →
  `ServerError` no bloco.

## Testes

- Vitest: `getEventReadiness`, regra de lote vigente compartilhada, seleção das corridas.
- Playwright (mock): specs do admin atualizados para os novos títulos; novo teste da faixa e do checklist.
- Verificação: lint, typecheck, test, test:e2e e capturas em 360px e desktop (mock e API real).

## Implementação

Branch `redesign-admin` a partir de `main`, só no front (worktree separado; a `fase-2-integracao`
segue à parte). Registrar a regra no `CLAUDE.md` (§2/§5: páginas do admin usam `AdminPageHero`).
