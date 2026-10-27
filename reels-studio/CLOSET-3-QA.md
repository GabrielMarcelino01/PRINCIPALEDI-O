# CLOSET-3 — QA técnico e revisão visual

## Resultado

**PASS no escopo verificado para a versão com captions inferiores, animadas e tipografia discretamente reduzida.** O master e a prévia foram renderizados novamente; os resultados das versões anteriores não foram reutilizados como aprovação desta revisão.

- Master: `../entregas/CLOSET-3-EDITADO.mp4`
- Prévia: `../entregas/CLOSET-3-PREVIA.mp4`
- Checksums e probes: `reports/closet-3-delivery.json`, `reports/closet-3-final-probe.json` e `reports/closet-3-preview-probe.json`

## 1. QA automatizado/técnico

### Projeto, assets, posição e movimento

Relatório: `reports/closet-3-project-qa.json`

- **27/27 verificações aprovadas**;
- 1080×1920, 30 fps, 614 frames;
- cinco cenas alinhadas aos quatro cortes;
- 13 grupos e 45 palavras com timestamps válidos;
- seis segmentos correspondentes à transcrição revisada;
- SHA-256 da fonte confirmado;
- todos os grupos na mesma baseline inferior de **1320 px**;
- tipografia reduzida para **96 px sans, 120 px serifada e 44 px nos conectores**, sem alterar o container;
- bloco estimado dentro da safe zone e pelo menos 80 px de separação para o CTA;
- escala de câmera fixa 1,02 e deslocamento zero;
- springs, onda curta e sublinhados presentes, sem transições artificiais ou movimento de grão;
- quatro motions documentados: `001`, `122`, `125` e `130`;
- áudio de preparação em −14,0 LUFS e −1,0 dBTP, sem SFX de transição.

Essas verificações analisam código, timeline e assets; não são, por si só, uma revisão audiovisual.

### Captions/SRT

Relatório: `reports/closet-3-caption-qa.json`

- **13 blocos; 0 erros e 0 avisos**;
- limite de duas linhas no SRT;
- maior velocidade medida: **15,91 caracteres/s**, abaixo do limite de 22;
- duração e ordenação aprovadas.

### MP4 master

Relatório: `reports/closet-3-video-qa.json`

- **9/9 verificações aprovadas; 0 falhas e 0 avisos**;
- H.264 High, 1080×1920, 30 fps, 614 frames, `yuv420p`;
- BT.709, faixa TV;
- AAC estéreo, 48 kHz;
- **−14,0 LUFS integrados e −1,0 dBTP**;
- nenhum evento de preto ou congelamento detectado;
- vídeo: 20,467 s; contêiner: 20,523 s pela granularidade/padding do AAC.

### Decodificação e prévia

- Master decodificado integralmente com FFmpeg, sem erros.
- Prévia decodificada integralmente com FFmpeg, sem erros.
- Prévia: H.264 High, 540×960, 30 fps, 614 frames, AAC estéreo 48 kHz.
- Master: 22.232.707 bytes; SHA-256 `ae2c70be48faeb09bc2ffe1b9a1d01092e84fa8d66c0d1aa38eae9785e4ca611`.
- Prévia: 2.860.590 bytes; SHA-256 `f5b1b6d4be7b406859bccb51fab66f6fe52ea4d04c8156b9cab3e45e60343a34`.

## 2. Revisão visual efetivamente realizada

Foram gerados e revisados **20 quadros de controle** em `out/closet-3-review/`:

`30, 45, 75, 105, 192, 202, 246, 302, 313, 342, 390, 420, 465, 510, 540, 555, 560, 578, 590 e 613`.

Também foram revisadas as duas folhas que reúnem todos esses quadros:

- `out/closet-3-review-sheet-1.jpg`
- `out/closet-3-review-sheet-2.jpg`

A amostragem cobriu:

- todos os **13 grupos de captions**, incluindo um momento com cada frase completa;
- entradas de palavras nos frames 45, 202, 313 e 555;
- entrada do CTA no frame 578 e estado assentado nos frames 590 e 613;
- cinco cenas, quatro mudanças de look e último frame;
- serifas, conectores, acentos, sublinhados e quebras de linha;
- baseline inferior, espaçamento e separação do CTA.

Os tempos de controle foram ajustados para não confundir uma palavra ainda em fade de entrada com uma legenda incompleta. Na rodada final, as frases completas estavam legíveis, sem cortes de texto ou sobreposição com o CTA. A redução tipográfica preservou a baseline inferior e manteve mais do torso e das combinações visível.

Também foram revisados o contact sheet extraído do **MP4 codificado** em `out/closet-3-contact-qa.jpg` e a comparação antes/depois em `out/closet-3-size-comparison.jpg`, nos mesmos tempos da versão anterior e da versão reduzida.

## Limites desta revisão

- A revisão visual foi feita **por quadros, folhas de contato e contact sheet**, não por playback audiovisual integral.
- Não houve escuta subjetiva completa do master; loudness, true peak, canais e decodificação são medições/testes técnicos.
- A estabilidade do container foi verificada pela implementação e pelos quadros amostrados. Isso não é apresentado como inspeção manual de cada um dos 614 frames.

## Preservação e organização

- CLOSET-2, ARMÁRIO-2 e a prévia do ARMÁRIO-2 mantiveram seus SHA-256 anteriores.
- Masters e prévias estão em `../entregas/`.
- Os dois exemplos originais permanecem em `../referencias/`.
- Fonte bruta, assets e temporários do CLOSET-3 permanecem separados e ignorados pelo Git.
