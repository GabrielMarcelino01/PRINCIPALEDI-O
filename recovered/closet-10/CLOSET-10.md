# CLOSET-10 — mesma melhoria de imagem e superlegendas

## Entrega

- **Arquivo final:** `entregas/CLOSET-10-EDITADO.mp4`
- **Formato:** 1080×1920, 24 fps, 576 quadros, H.264 High/yuv420p, BT.709 e AAC-LC estéreo a 48 kHz.
- **Duração do vídeo/contêiner:** 24,000000 s.
- **Tamanho:** 24.453.099 bytes.
- **SHA-256:** `2c87f8fe7718321c473e151bd53e5ea500de174855b1c4ba40e8fa1b1683192b`

## Fonte e escopo

A fonte `CLOSET-10.mp4` foi recuperada do commit `7389515924d3fc3b7b4f32371cc2e31f77b2524e`, blob `a36f40bd357c03e0d1ed499c7a59516e400b8af3`.

O original permanece preservado em `assets/original.mp4`, com SHA-256 `a781c0cca15bfbeaebde73f473154990e7069a04272bb9a80ffdc9f59232b978`.

A edição contém somente:

1. upscale Lanczos de 720×1280 para 1080×1920, mantendo os 24 fps e os 576 quadros, sem interpolação de movimento;
2. conversão da matriz **BT.601 da fonte para BT.709**, denoise temporal/espacial leve, contraste e saturação discretos, gamma e sharpen moderados;
3. superlegendas no estilo dos masters anteriores, na altura dos joelhos e em tamanho padrão.

Todos os cortes, enquadramentos, movimentos, poses e o ritmo da fonte foram preservados. Os cortes detectados permanecem em **6, 12 e 18 s**. Não foram adicionados cortes, câmera virtual, transições, molduras, logotipos, cabeçalhos, CTA, trilha, efeitos sonoros ou elementos decorativos.

## Legendas

- **14 grupos e 53 palavras**, todos com no máximo duas linhas reais.
- Posição vertical `top=1210` em um quadro de 1920 px.
- Inter para palavras principais, Playfair Display itálico para ênfases e Inter menor para conectores.
- Mesmos tamanhos dos masters anteriores: **96/120/50 px**.
- Máximo medido no SRT: **18,18 caracteres/s**, com validação no limite de 22 CPS.
- Revisão dos quatro looks, dos três cortes e de quadros intermediários da revelação por palavra.

Decisões textuais:

- **“Relembre”** prevaleceu nas análises isoladas normal e a 0,75×; as passagens integrais haviam omitido o prefixo.
- **“Verde-sálvia”** recebeu somente normalização ortográfica.
- No último look, o ASR divergiu entre “cerejo” e “sereja/cereja”. Duas passagens isoladas em velocidade normal favoreceram **“cereja”**. **“Escuro”** foi consistente e não foi trocado por “escura”. A divergência e o limite dessa revisão estão documentados, sem alegar confirmação por escuta humana.

Os detalhes estão em `reports/transcription-review.json` e `closet-10-transcript.json`.

## Áudio

O AAC original a 48 kHz é copiado diretamente para o master, **sem recodificação, EQ, compressão, loudnorm ou alteração de velocidade**.

- Loudness da fonte e do master: **-22,7 LUFS integrados e -7,5 dBTP**.
- Hash do fluxo AAC idêntico ao original: `748043245f374f09b731cd0404c85b7af734b8923c5a5e5c18f6a2246d67552d`.
- Correlação de forma de onda **1,0 no deslocamento zero** e RMS 1,0.
- Duração de áudio decodificada: **24,000000 s** na fonte e no master.

## Verificação

- `reports/closet-10-project-qa.json`: **29/29** checagens de projeto, texto, timeline, assets e escopo.
- `reports/closet-10-caption-qa.json`: **0 erros e 0 avisos** no SRT contra o MP4 final.
- `reports/closet-10-video-qa.json`: **0 falhas e 0 avisos**, sem eventos objetivos ofensivos de preto ou freeze.
- `reports/closet-10-delivery-qa.json`: **17/17** checagens no arquivo entregue, incluindo decodificação integral, 576 quadros, duração, BT.709, áudio idêntico e regiões fora das legendas.
- Comparação fora das captions: MAE máximo de **2,832/255** e PSNR mínimo de **35,67 dB** nos cinco tempos amostrados.
- `reports/storyboard-review.json`: **19 quadros** do projeto revisados antes do render.
- `reports/delivery-frame-review.json`: **23 quadros extraídos do próprio MP4** revisados após o render, incluindo início, fim, todos os grupos, cortes e revelação intermediária.

Esses resultados são **QA técnico e revisão visual por quadros**. Não equivalem a escuta humana integral, playback completo nem aprovação estética; essa avaliação final deve ser feita pelo usuário no player.

## Reprodução

Com o original recuperado em `assets/original.mp4`, Node.js, FFmpeg/ffprobe, Chromium compatível e as dependências Python dos validadores:

```bash
cd recovered/closet-10
npm ci
npm run media:prepare
npm run validate
node closet-10-render.mjs --storyboard
node closet-10-render.mjs --concurrency 1
python3 scripts/validate_delivery_10.py
```

O script de finalização copia o vídeo renderizado e o AAC da fonte para o contêiner final, aplica os metadados BT.709 sem reencodar o vídeo e grava diretamente em `entregas/CLOSET-10-EDITADO.mp4`.

O original recuperado, intermediários, caches e revisões ficam fora do Git pelas regras locais de `.gitignore`.
