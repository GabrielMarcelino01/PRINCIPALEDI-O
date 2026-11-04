# Contexto Persistente · Pasta `funil/` (Truque dos Mil Looks)

## Identidade visual & Design System
- **Paleta oficial:**
  - Marfim / Branco base: `#FFFDF9` (`--branco`) e `#FFFFFF` (`--branco-puro`)
  - Creme destaque da 1ª pergunta: `#EDDFC5` (`body.bg-creme`)
  - Bege seda: `#F3EADB` (`--bege`), `#F8F2E7` (`--bege-suave`), borda `#E5D7BE` (`--bege-linha`)
  - Vinho principal: `#6E1423` (`--vinho`), escuro `#52101C`, claro `#8A2334`
  - Ouro champagne (detalhes da logo/header): `#D8B47C` (`--champagne`)
- **Header & Logo:**
  - Header simétrico em 3 colunas (`topbar__inner`) com filete superior vinho/champagne (`topbar__crown`), medalhão vetorial SVG de alta-costura (cabide + estrela dourada) e lockup `Truque dos Mil Looks` com itálico editorial. Permanece visível também na tela de Resultado com selo `✦ Pronto`.

## Arquitetura e Performance Instantânea
- **Fluxo (14 perguntas):** `idade` → `guardaRoupa` → `dificuldade` → `estilo` → `corpo` → **`medidas` (quiz interativo de altura e peso com régua + silhueta dinâmica)** → `promos` → `ocasioes` → `pecas` → `tempoLook` → `sentimento` → `sentir` (abre **Ticket Raspadinha 88% OFF**) → `uso` → `objetivo` → Análise → Resultado + Carrossel Antes & Depois + Planos.
- **Mobile Scratch (`#ticketModal`):** usa `touchstart`/`touchmove` com `{ passive: false }` direto no `<canvas>` e grade leve `16×8` em CPU (sem `getImageData` durante o gesto) para raspar liso em 2 passadas de polegar no iOS Safari e WebViews do Instagram/Facebook.
- **Velocidade:**
  - 1ª pergunta pré-renderizada no HTML (`data-ssr="idade"`) + `<link rel="preconnect">` e `<link rel="preload">`.
  - `preview-server.mjs` entrega HTML + CSS + Config + JS unificados em 1 único pacote Brotli (~32 KB) da RAM e serve imagens locais da memória.
  - Atenção ao publicar na Vercel: `descompacto.vercel.app` hospeda as 22 imagens originais de `assets/img/`. Antes de fazer deploy substitutivo em produção na Vercel, garantir que todas as imagens de `assets/img/` estejam copiadas localmente em `funil/assets/img/` para não gerar 404.
- **Atalhos de teste por URL:** `?step=medidas`, `?step=ticket`, `?step=resultado`.

## Linha do tempo da pasta `funil/`

<!-- AUTO-MEM:START -->
- **[mem-0008] 2026-11-04 · `feature` (funil):** **Adicionada 4ª imagem (94% eficiência) como 1º slide do Carrossel Antes & Depois** — Imagem antes-depois.jpg padronizada em 900x1125 JPEG progressivo (~116KB) e colocada em 1º lugar no carrossel compacto de 4 slides. _(funil/assets/img/antes-depois.jpg, funil/assets/js/quiz.js, funil/index.html)_
- **[mem-0007] 2026-11-04 · `bugfix` (funil):** **Correção definitiva do Carrossel Antes & Depois (compacto, 1 card por vez, zero sobreposição)** — Removido atributo height=1125 que esticava os slides em 1125px no celular e substituído scroll-snap peek por viewport fechado (overflow:hidden + translate3d 100%, max-width 278px mobile / 308px desktop, height:auto !important) com barra de controle abaixo da foto. _(funil/assets/css/style.css, funil/assets/js/quiz.js, funil/index.html)_
- **[mem-0006] 2026-11-04 · `feature` (vercel):** **Ajuste geral mobile + build atômico e publicação na Vercel** — Refinamento mobile completo (header centralizado 320px+, sliders peso/altura pan-x pan-y, carrossel Antes & Depois com alvos de toque ampliados, cards/botões de plano compactos, sticky CTA inteligente) + vercel-build.mjs preservando as 26 imagens e gerando HTML single-packet. _(funil/index.html, funil/assets/css/style.css, funil/assets/js/quiz.js, funil/vercel-build.mjs, funil/vercel.json)_
- **[mem-0005] 2026-11-04 · `feature` (funil):** **Clique na 1ª imagem da página de Resultado direciona ao Plano Premium** — Ao tocar/clicar na primeira imagem da última página (#resultFirstImg / 1º slide), o funil seleciona automaticamente o Plano Premium, rola suavemente direto até o card #planPremium (com margem para o header fixo) e destaca o plano. _(funil/assets/js/quiz.js, funil/assets/css/style.css, funil/index.html)_
- **[mem-0004] 2026-11-04 · `feature` (funil):** **Carrossel Antes e Depois + novo Header editorial e Logo** — Adicionado carrossel com 4 transformações (3 novas imagens otimizadas em ~135KB JPEG Retina + original) abaixo do título 'Quem usa nosso Aplicativo não se arrepende!' com final sublinhado, além de novo header simétrico e medalhão vetorial vinho/ouro champagne. _(funil/index.html, funil/assets/css/style.css, funil/assets/js/quiz.js, funil/assets/img/antes-depois-1.jpg, funil/assets/img/antes-depois-2.jpg, funil/assets/img/antes-depois-3.jpg)_
- **[mem-0003] 2026-11-04 · `bugfix` (funil):** **Raspadinha 100% mobile-first + carregamento instantâneo** — Ticket raspadinha reescrito com touchstart/touchmove passive:false e malha 16x8 sem getImageData (2 passadas de dedo). Página entregue em pacote único Brotli em RAM + preload/decode antecipado das imagens. _(funil/index.html, funil/assets/js/quiz.js, funil/preview-server.mjs)_
- **[mem-0002] 2026-11-04 · `feature` (funil):** **Quiz interativo de Peso e Altura na Pergunta 6** — Adicionada etapa interativa medidas (altura 140-195 cm e peso 40-140 kg) com sliders, botões +/-, régua dinâmica, manequim SVG responsivo e diagnóstico calibrado no resultado. _(funil/assets/js/quiz.js, funil/assets/css/style.css)_
- **[mem-0001] 2026-11-04 · `architecture` (vercel):** **Mapeamento do projeto Vercel truquedosmillooks e recuperação do funil** — Projeto truquedosmillooks (prj_ghvzXQaDMHAoioVOCTLgaLycfzsW) publica nos domínios descompacto.vercel.app, truquedosmillooks.vercel.app e truquedaselegantes.vercel.app. Código recuperado em funil/. _(funil/index.html, funil/assets/css/style.css, funil/assets/js/quiz.js, funil/assets/js/config.js)_
<!-- AUTO-MEM:END -->
