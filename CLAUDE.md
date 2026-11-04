# Contexto Persistente do Projeto (`PRINCIPALEDI-O`)

Este arquivo funciona como **Folder Context** (padrão Claude-Mem) para que qualquer agente (Arena, Claude Code, Cursor, Codex) recupere imediatamente o estado do projeto em novas sessões.

## Visão geral do repositório

1. **`funil/` — Funil Web "Truque dos Mil Looks" (`descompacto.vercel.app`)**
   - Funil mobile-first de 14 perguntas + ticket raspadinha (88% OFF) + tela de análise + página de resultado com carrossel "Antes & Depois" e oferta (Básico R$ 14,90 / Premium R$ 27,90).
   - **Vercel vinculada:** equipe `Gabriel's projects` (`team_EJgLL58dRGiH3tmrpemV3QW0`), projeto **`truquedosmillooks`** (`prj_ghvzXQaDMHAoioVOCTLgaLycfzsW`), `rootDirectory: "funil"`.
   - **Domínios ativos na Vercel:** `descompacto.vercel.app`, `truquedosmillooks.vercel.app`, `truquedaselegantes.vercel.app`.
   - Detalhes técnicos completos do funil estão em [`funil/CLAUDE.md`](funil/CLAUDE.md).

2. **`skills/` — Catálogo de Skills de Vídeo, Motion e Memória**
   - `video-editing`, `hypit`, `motion-design`, `reels-viral`, `captions`, `video-quality` e `project-memory` (expostas em `.claude/skills`, `.agents/skills` e `.codex/skills`).
   - Documentação de referência do daemon local Claude-Mem em [`skills/CLAUDEMEM.md`](skills/CLAUDEMEM.md).

3. **`recovered/` — Snapshots recuperados de projetos anteriores**
   - Preservar licenças e avisos conforme `recovered/PROVENIENCIA.md` e `AGENTS.md`.

## Histórico recente de decisões e entregas

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

## Como consultar ou atualizar esta memória

```bash
node skills/project-memory/scripts/mem.mjs recent --limit 10
node skills/project-memory/scripts/mem.mjs search "<termo>"
node skills/project-memory/scripts/mem.mjs sync
```
