# PARA EDIÇÃO-2 — mesma melhoria de imagem e superlegendas

## Entrega

- **Arquivo final:** `entregas/PARA-EDICAO-2-EDITADO.mp4`
- **Formato:** 1080×1920, 24 fps, 548 quadros, H.264 High/yuv420p, BT.709 e AAC-LC estéreo a 44,1 kHz.
- **Duração do vídeo/contêiner:** 22,833333 s.
- **Tamanho:** 25.898.624 bytes.
- **SHA-256:** `11c10cd4ae8316cff2e4b09b72662fa2852bd01491b46a029d7532c7a3b9f07d`

## Fonte e escopo

A fonte `PARA EDIÇÃO-2.MOV` foi recuperada do commit `142becb1309f29523250f3e992d292d2101b5c7d`, blob `863c0fbe16cf587a371bdc7680ad5f657ad44508`. O caminho Unicode exato está registrado em `reports/source-metadata.json`.

O original permanece preservado em `assets/original.mov`, com SHA-256 `fccbe853e0220eaf9cd64da0e222022945cf90e9798ea383b85d881de7d714a1`.

A edição contém somente:

1. normalização para a cadência principal de 24 fps e upscale Lanczos de 720×1280 para 1080×1920;
2. conversão com a matriz **BT.709 correta desta fonte**, denoise temporal/espacial leve, contraste e saturação discretos, gamma e sharpen moderados;
3. as mesmas superlegendas do master anterior, na altura dos joelhos e em tamanho padrão.

Todos os cortes, close-ups, enquadramentos, poses e o ritmo da fonte foram preservados. Não foram adicionados cortes, interpolação de movimento, câmera virtual, transições, molduras, logotipos, cabeçalhos, CTA, trilha, efeitos sonoros ou elementos decorativos.

## Legendas

- **11 grupos e 46 palavras**, todos com no máximo duas linhas reais.
- Posição vertical `top=1210` em um quadro de 1920 px.
- Inter para palavras principais, Playfair Display itálico para ênfases e Inter menor para conectores.
- Mesmos tamanhos do anterior: **96/120/50 px**.
- Máximo medido no SRT: **17,65 caracteres/s**, com validação no limite de 22 CPS.
- Revisão de todos os cinco looks, close-ups, cortes e transições já existentes.

Decisões textuais:

- “Fica usado” foi preservado porque quatro passagens de ASR reconheceram essa expressão, apesar da construção incomum.
- “Sofisticado” prevaleceu nas análises isoladas da primeira fala, inclusive a 0,75× apenas para análise; nenhuma alteração de velocidade foi aplicada ao master.
- “Beje” foi normalizado apenas ortograficamente para **“bege”**.
- “Marrom chocolate” foi separado em duas palavras e dois blocos consecutivos para evitar overflow sem reduzir a fonte, seguindo o tratamento já usado em “azul marinho”.

Os detalhes estão em `reports/transcription-review.json` e `para-edicao-2-transcript.json`.

## Áudio

O AAC original a 44,1 kHz é copiado diretamente para o master, **sem recodificação, EQ, compressão, loudnorm ou alteração de velocidade**.

- Loudness da fonte e do master: **-22,8 LUFS integrados e -5,8 dBTP**.
- Hash do fluxo AAC idêntico ao original.
- Correlação de forma de onda **1,0 no deslocamento zero**.
- Duração de áudio decodificada idêntica à fonte: aproximadamente 22,823771 s.

## Verificação

- `reports/para-edicao-2-project-qa.json`: **29/29** checagens de projeto, texto, timeline, assets e escopo.
- `reports/para-edicao-2-caption-qa.json`: **0 erros e 0 avisos** no SRT contra o MP4 final.
- `reports/para-edicao-2-video-qa.json`: **0 falhas e 0 avisos**, sem eventos objetivos ofensivos de preto ou freeze.
- `reports/para-edicao-2-delivery-qa.json`: **17/17** checagens no arquivo entregue, incluindo decodificação integral, 548 quadros, duração, BT.709, áudio idêntico e regiões fora das legendas.
- Comparação fora das captions: MAE máximo de **2,281/255** e PSNR mínimo de **39,09 dB** nos cinco tempos amostrados.
- Foram inspecionados **23 quadros extraídos do próprio MP4**, incluindo início, fim, todos os grupos e os pontos de corte/movimento.

Esses resultados são **QA técnico e revisão visual por quadros**. Não equivalem a escuta humana integral nem a aprovação estética em playback; essa avaliação final deve ser feita pelo usuário no player.

## Reprodução

Com Node.js, FFmpeg/ffprobe e Chromium compatível:

```bash
cd recovered/para-edicao-2
npm ci
npm run validate
node para-edicao-2-render.mjs --storyboard
node para-edicao-2-render.mjs --concurrency 1
python3 scripts/validate_delivery_2.py
```

O script de finalização copia o vídeo renderizado e o AAC da fonte para o contêiner final, aplica os metadados BT.709 sem reencodar o vídeo e grava diretamente em `entregas/PARA-EDICAO-2-EDITADO.mp4`.

`npm run media:prepare` só é necessário para recriar a mídia normalizada a partir de `assets/original.mov`. O original recuperado, intermediários, caches e revisões ficam fora do Git pelas regras locais de `.gitignore`.
