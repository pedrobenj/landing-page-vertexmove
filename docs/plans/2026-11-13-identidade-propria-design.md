# Identidade própria do site (sair do espelho do Corre das Amigas)

Data: 2026-11-13 · Status: aprovado

## Problema

A home foi construída espelhando a referência (corredasamigas.com.br) seção por seção, na mesma ordem e com textos parecidos (CLAUDE.md §2). O resultado ficou idêntico à referência. O site precisa de estrutura e voz próprias.

## Decisões

- **Escopo:** home reestruturada + textos reescritos no site todo. Páginas internas mudam só no texto. Telas de inscrição, pagamento, termos e privacidade mantêm o texto atual (funcional).
- **Tom de voz:** superação / "vértice": topo, subida, degrau, evolução. Conversa com o chevron da logo.

## Home (11 → 7 seções)

| # | Seção | Conteúdo |
| --- | --- | --- |
| 1 | Hero "próximo topo" | Fundo navy + chevron gigante esmaecido. Próxima corrida aberta: nome, data/largada, local, "a partir de"; CTAs "Começar a subida" e "Ver todas as provas"; capa inclinada como o pico. Sem corrida aberta → hero institucional "Todo corredor tem um topo. Qual é o seu?" |
| 2 | "Próximos topos" | Grade de corridas abertas (cards atuais) + contador "N provas abertas". Âncora `#corridas`. |
| 3 | "Do primeiro passo ao pódio" | Como funciona em escada vertical (passo 1 embaixo) + card lateral "Já se inscreveu? Consulte…" (funde "Como funciona" e "Acompanhe sua inscrição"). |
| 4 | "Quem sobe junto" | Números da comunidade + 4 selos num bloco navy (funde "Mais que corrida" e a faixa verde de números). |
| 5 | "Topos conquistados" | Carrossel de edições passadas. |
| 6 | Loja + corridas parceiras | Lado a lado no desktop, empilhados no mobile: "Vista a subida" e "Outras trilhas, com desconto". |
| 7 | Parceiros | Faixa de logos. |

Removidos: os três cards de destaque com foto e a frase de três batidas no hero (traços mais reconhecíveis da referência).

## Textos

- Menu: Provas · Loja · Provas parceiras · O Vertex · Parceiros · Fale com a gente · Área administrativa.
- Rodapé: tagline "Cada prova é um degrau."; colunas "Fale com a gente" e "Explore"; crédito "Desenvolvido por Pedro Benjamin" mantido.
- Sobre ("O Vertex"): "Por que Vertex", "Nossa subida", "Onde queremos chegar" (texto provisório até o cliente enviar o conteúdo).
- Encerradas: "Topos conquistados". Parceiras: "Outras trilhas". Loja: "Vista a subida". Consulta: "Onde está minha inscrição?".
- Estados vazios/erro no mesmo tom.

## Visual

- Logo: `public/brand/vertex-logo.svg` na placa branca (header/rodapé), placa um pouco maior.
- Chevron como motivo: marca d'água no hero, prefixo dos eyebrows (no lugar dos traços verdes laterais), linha em degraus no "como funciona".
- Menos alternância de faixas: hero e comunidade em navy; o resto branco/cinza-claro. Sem faixa verde de números.

## Implementação

- Branch `redesign-identidade`, separado da fase 1 de contratos.
- Novos: `next-race-hero.tsx` (RSC, usa `fetchPublicEvents`, 4 estados), `climb-steps-section.tsx`, `community-section.tsx`, `store-and-partners-section.tsx`.
- Removidos: `highlight-cards-section`, `highlight-card`, `more-than-running-section`, `community-stats-section`, `track-registration-band`, `store-band-section`.
- Atualizar `CLAUDE.md` §2 para a nova estrutura (deixa de mandar espelhar a referência).

## Testes

- Atualizar E2E que verificam textos/seções (`navigation`, `home`, `static-pages`).
- Novos: hero com corrida e hero institucional (sem corridas abertas).
- Verificação: lint, typecheck, test, test:e2e, build + capturas da home em 360px e desktop.
