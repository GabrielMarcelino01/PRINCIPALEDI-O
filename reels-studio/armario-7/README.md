# ARMÁRIO-7 — Vídeo original com superlegendas

Edição minimalista do CLOSET-7, corrigida após a revisão do primeiro corte. O vídeo original ocupa **1080×1920 sem crop, cartão, zoom, filtro ou backdrop**. A única intervenção visual é a mesma superlegenda sincronizada, agora na região central dos joelhos. Não há HUD, intro, CTA, paleta, gráficos ou textos adicionais.

## Direção audiovisual

- **Vídeo:** fonte original reproduzida de ponta a ponta, com os cinco looks e os cortes naturais preservados.
- **Legenda:** mesmos dez grupos, em Inter/860, palavras em branco e termos de ênfase nas cores originais do projeto. Cada bloco é exibido por inteiro e sua única animação é opacidade.
- **Posição:** área de 900×260 px com `top: 1120px`; o conteúdo fica centralizado em **y=1250**, próximo aos joelhos, com espaço livre para os pés e o tênis.
- **Som:** somente o áudio original. Nenhuma trilha, sound design ou efeito adicional. O master recebe normalização para −14 LUFS e true peak de −1,5 dBTP.
- **Formato:** 1080×1920, 60 fps, 1.293 quadros, 21,55 s, H.264 + AAC, MP4 com `faststart`.

## Estrutura

- `composition.js`: timeline determinística, tipografia e desenho do vídeo original.
- `project.json`: resolução, fps, duração, cenas, palavras e grupos de legenda.
- `source-manifest.json`: vídeo original, hashes e fonte normalizada de imagens.
- `index.html`: palco de captura; a timeline principal é controlada por `renderTime(t)`.
- `render.mjs`: captura headless de `t=i/fps`, sem áudio e sem estado acumulado.
- `encode.mjs`: mux do vídeo e áudio original, loudnorm em duas passagens e H.264/AAC.
- `validate.py`: validação do contêiner, integridade dos frames, hashes, legendas e áudio.
- `out/source-frames/`: fonte visual normalizada em 1.293 JPEGs; os efeitos não são rasterizados nela.
- `reports/`: análise da fonte, ASR, determinismo e validação técnica.

## Reproduzir

Requer Node.js 22+, Python 3 e FFmpeg/FFprobe 7.x ou superior. Não há dependências Python externas. O ambiente de captura usa Chromium 153 e Puppeteer 25.16.0 fixados no `package-lock.json`.

```bash
npm ci
python3 prepare_project.py
node normalize-source.mjs
node render.mjs
node encode.mjs
python3 validate.py
```

O render paralelo usa quatro workers por padrão e ordena os frames somente pela fórmula `frameIndex / fps`. Para revisar quadros sem regenerar toda a sequência:

```bash
node render.mjs --output out/review --frames 140,280,730,1278
```

A entrega final é copiada para `entregas/ARMARIO-7-EDITADO.mp4`. O preview usa a porta **3004** e serve esse arquivo por HTTP com suporte a Range; a porta 3001 permanece reservada ao CLOSET-5.
