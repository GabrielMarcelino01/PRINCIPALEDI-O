# PARA EDIÇÃO — master com melhoria de imagem e superlegendas

## Entrega

- **Arquivo final:** `entregas/PARA-EDICAO-EDITADO.mp4`
- **Formato:** 1080×1920, 24 fps, 616 quadros, H.264 High/yuv420p, BT.709 e AAC-LC estéreo a 48 kHz.
- **Duração do vídeo/contêiner:** 25,666667 s.
- **Tamanho:** 27.882.800 bytes.
- **SHA-256:** `f02f9d7664b5e463c4ad01763836e7aaf8facb24968f1c90ab7fbf2e17c512ec`

## Fonte e escopo

A fonte foi recuperada do commit `4b7b033914b8a7eac356d964bcef19ffa68a0b95` e permanece preservada em `assets/original.mp4`, com SHA-256 `8f53940d41227dc7ff0d2921980acc94c340e68805217534c4dd7a2d3edd6043`.

A edição contém somente:

1. normalização para 24 fps e upscale Lanczos de 720×1280 para 1080×1920;
2. denoise temporal/espacial leve, contraste e saturação discretos, gamma e sharpen moderados;
3. superlegendas animadas na altura dos joelhos, em tamanho padrão, seguindo o repertório Inter + Playfair já aprovado.

Não foram adicionados cortes, câmera virtual, transições de cena, molduras, logotipos, cabeçalhos, CTA, trilha, efeitos sonoros ou elementos decorativos. Os quatro cortes da fonte foram preservados. Não houve interpolação de movimento nem mudança de velocidade.

A cadeia de imagem está registrada em `para-edicao-prepare-report.json` e em `scripts/prepare_para_edicao.py`.

## Legendas

- **17 grupos, 64 palavras**, com no máximo duas linhas reais.
- Posição vertical `top=1210` em um quadro de 1920 px; área central reservada para as roupas e rostos.
- Inter para as palavras principais, Playfair Display itálico para ênfases e Inter menor para conectivos.
- Tamanhos principais de 96/120/50 px, sem reduzir a fonte para contornar quebras.
- Revisão por quadros em todos os cinco looks e nos pontos próximos aos cortes.
- Máximo medido no SRT: **21,7 caracteres/s**; validação com limite de 22 CPS.

Decisões textuais mantidas após as passagens de ASR: “Relembre”, “vocês virarem” e “azul marinho gelo”, sem inserir uma preposição presumida. Apenas “Verdimenta” foi normalizado para “verde-menta”, além de caixa e pontuação.

## Áudio

O AAC original é copiado diretamente para o master, **sem recodificação, EQ, compressão, loudnorm ou alteração de velocidade**. O loudness permanece em **-23,5 LUFS integrados e -6,3 dBTP**, como na fonte.

A primeira mux da composição introduziu 2.048 amostras de padding antes do áudio. A finalização foi corrigida para usar o fluxo AAC da fonte. O master final tem:

- hash do fluxo de áudio idêntico ao original;
- correlação de forma de onda **1,0 no deslocamento zero**;
- mesmas 1.227.776 amostras decodificadas da fonte;
- nenhum padding extra de 42,7 ms.

## Verificação

- `reports/para-edicao-project-qa.json`: **28/28** checagens de projeto, texto, timeline, assets e escopo.
- `reports/para-edicao-caption-qa.json`: **0 erros e 0 avisos** no SRT contra o MP4 final.
- `reports/para-edicao-video-qa.json`: **0 falhas e 0 avisos**; sem eventos objetivos ofensivos de preto ou freeze.
- `reports/para-edicao-delivery-qa.json`: **17/17** checagens no arquivo entregue, incluindo decodificação integral, 616 quadros, duração, BT.709, áudio idêntico e regiões fora das legendas.
- A comparação fora das captions obteve MAE máximo de **2,802/255** e PSNR mínimo de **36,04 dB** nos cinco tempos amostrados.
- Foram inspecionados quadros extraídos do próprio MP4 no início, nos 17 grupos e no último quadro.

Esses resultados são **QA técnico e revisão visual por quadros**. Não equivalem a uma escuta humana integral nem a uma aprovação estética em playback; essa avaliação final deve ser feita pelo usuário no player.

## Reprodução

Com Node.js, FFmpeg/ffprobe e um Chromium compatível disponíveis:

```bash
cd recovered/para-edicao
npm ci
npm run validate
node para-edicao-render.mjs --storyboard
node para-edicao-render.mjs --concurrency 1
python3 scripts/validate_delivery.py
```

O script de finalização copia o vídeo renderizado e o AAC da fonte para o contêiner final, aplica os metadados BT.709 sem reencodar o vídeo e grava diretamente em `entregas/PARA-EDICAO-EDITADO.mp4`.

`npm run media:prepare` só é necessário para recriar a mídia normalizada a partir de `assets/original.mp4`; esse processamento não é repetido a cada render. Os arquivos de mídia intermediários, o original recuperado, caches e revisões ficam fora do Git pelas regras locais de `.gitignore`.
