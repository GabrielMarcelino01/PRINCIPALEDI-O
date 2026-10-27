---
name: temporal-reel
description: Compor e renderizar Reels verticais determinísticos em que câmera, tipografia cinética, transições e elementos gráficos são funções puras do tempo; capturar cada quadro em Chromium headless a 60 fps e unir PNGs com FFmpeg.
---

# Temporal Reel

Use esta skill quando o pedido exigir **animação quadro a quadro, 60 fps, ausência de aleatoriedade, captura em navegador headless e MP4 final via FFmpeg**. Para edição de fontes faladas, combinar com `video-editing`, `captions`, `reels-viral`, `motion-design` e `video-quality`.

## Contrato temporal

1. Defina primeiro `width`, `height`, `fps`, `durationInFrames`, `durationSeconds`, cenas e quadros de revisão em uma timeline JSON. A referência executada está em [`demo/timeline.json`](demo/timeline.json).
2. Para cada quadro inteiro `f`, calcule `t = f / fps`. Toda propriedade visual precisa ser recalculada dentro de `window.seek(t)`.
3. Não use `Math.random()`, relógio do sistema, timers, `requestAnimationFrame` como fonte de tempo, transições/animações CSS ou estado acumulado entre quadros.
4. Springs, easings, máscaras, câmera, playheads, rotações e entradas de texto devem ser funções fechadas de `t`. Um quadro precisa produzir a mesma imagem mesmo quando solicitado fora de ordem.
5. Texturas eventualmente aleatórias devem ser assets estáticos previamente gerados e versionados; nunca sortear durante o render.

A implementação de referência está em [`demo/timeline.js`](demo/timeline.js). A página correspondente é [`demo/index.html`](demo/index.html).

## Direção para Reels verticais

- Abrir com uma ideia legível já no primeiro quadro; não desperdiçar o gancho com uma tela vazia.
- Usar uma ideia dominante por cena e fazer cada transição nascer de um elemento, máscara ou movimento já estabelecido.
- Manter texto dentro de margens seguras mesmo depois do deslocamento e da escala da câmera.
- Aplicar tipografia cinética para hierarquia e sincronia, não para mover todas as palavras o tempo todo.
- Alternar progressão e respiro; encerrar com um lockup legível e tempo de leitura.
- Orientar a estrutura para retenção sem prometer uma métrica que depende do público e da plataforma.

## Pipeline obrigatório

1. **Validação estática:** conferir timeline e proibir fontes paralelas de tempo.
2. **Storyboard:** capturar primeiro, último e quadros representativos das entradas e transições; revisar antes do render completo.
3. **Captura:** abrir Chromium sem tela no tamanho exato da composição, aguardar fontes/assets e chamar `seek(f / fps)` para cada quadro. Salvar PNGs numerados continuamente.
4. **Prova de determinismo:** recapturar quadros selecionados em ordem inversa e comparar SHA-256 com os PNGs originais. Qualquer divergência interrompe o render.
5. **FFmpeg:** unir a sequência com `-framerate 60`, preservando o número exato de quadros; codificar H.264 High, `yuv420p`, BT.709 e faststart.
6. **QA do MP4:** confirmar codec, dimensões, fps, quadros, duração e decodificação; revisar quadros extraídos do arquivo codificado. Não apresentar revisão por quadros como playback ou escuta integral.

O renderizador completo está em [`scripts/render.mjs`](scripts/render.mjs) e o validador em [`scripts/validate_temporal.py`](scripts/validate_temporal.py).

## Instalação reproduzível

A partir da raiz do repositório:

```bash
npm ci --prefix skills/temporal-reel --ignore-scripts --no-audit --no-fund
```

Use **Node.js 22.17 ou superior**. As versões estão pinadas no `package-lock.json`. O Chromium empacotado é usado por padrão; para usar outro binário, definir `CHROMIUM_PATH`. Os pacotes FFmpeg/ffprobe já fornecem os binários por plataforma, sem download de release durante o render.

## Demonstração executada

```bash
# QA estático: 28 verificações
python3 skills/temporal-reel/scripts/validate_temporal.py \
  --config skills/temporal-reel/demo/timeline.json \
  --page skills/temporal-reel/demo/timeline.js \
  --html skills/temporal-reel/demo/index.html \
  --output skills/temporal-reel/reports/temporal-60fps-project-qa.json

# Storyboard
node skills/temporal-reel/scripts/render.mjs \
  --root . --page skills/temporal-reel/demo/index.html \
  --config skills/temporal-reel/demo/timeline.json \
  --work skills/temporal-reel/out --storyboard \
  --report skills/temporal-reel/reports/temporal-60fps-storyboard.json

# 360 PNGs a 60 fps + verificação reversa + MP4
node skills/temporal-reel/scripts/render.mjs \
  --root . --page skills/temporal-reel/demo/index.html \
  --config skills/temporal-reel/demo/timeline.json \
  --work skills/temporal-reel/out \
  --output entregas/TEMPORAL-60FPS.mp4 \
  --report skills/temporal-reel/reports/temporal-60fps-render.json
```

Resultado: [`TEMPORAL-60FPS.mp4`](../../entregas/TEMPORAL-60FPS.mp4), 1080×1920, 60 fps, 360 quadros e 6 segundos. É uma **demonstração visual sem áudio**, não um master com mix final. Os relatórios estão em [`reports/temporal-60fps-project-qa.json`](reports/temporal-60fps-project-qa.json), [`reports/temporal-60fps-render.json`](reports/temporal-60fps-render.json) e [`reports/temporal-60fps-video-qa.json`](reports/temporal-60fps-video-qa.json). O escopo da revisão está documentado em [`docs/TEMPORAL-60FPS.md`](../../docs/TEMPORAL-60FPS.md).

## O que ainda é necessário para um Reel de cliente

A demo comprova o sistema visual. Para aplicá-lo a um Reel específico, usar o vídeo-fonte, o objetivo, a duração e as decisões de voz/música desse projeto. Não reutilizar uma fonte editada como se fosse original nem adicionar uma trilha genérica sem brief.
