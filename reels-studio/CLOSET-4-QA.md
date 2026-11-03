# CLOSET-4 — QA técnico e revisão visual

## Resultado

**PASS no escopo verificado para a versão com captions inferiores, animadas e reduzidas em aproximadamente 15%.** Master e prévia foram renderizados da nova timeline e verificados novamente.

- Master: `../entregas/CLOSET-4-EDITADO.mp4`
- Prévia: `../entregas/CLOSET-4-PREVIA.mp4`
- Checksums e probes: `reports/closet-4-delivery.json`, `reports/closet-4-final-probe.json` e `reports/closet-4-preview-probe.json`

## 1. QA automatizado/técnico

### Projeto, assets, posição e movimento

Relatório: `reports/closet-4-project-qa.json`

- **27/27 verificações aprovadas**;
- 1080×1920, 30 fps, 687 frames;
- cinco cenas alinhadas aos quatro cortes;
- 13 grupos e 45 palavras com timestamps válidos;
- cinco segmentos correspondentes à transcrição nova;
- SHA-256 da fonte confirmado;
- todos os grupos na baseline inferior de **1320 px**;
- tipografia **82 px sans, 102 px serifada e 37 px nos conectores**;
- bloco dentro da safe zone e pelo menos 80 px de separação para o CTA;
- escala de câmera fixa 1,02 e deslocamento zero;
- quatro motions documentados: `001`, `122`, `125` e `130`;
- áudio de preparação em −14,0 LUFS e −1,0 dBTP, sem SFX de transição.

Essas verificações analisam código, timeline e assets; não são, por si só, uma revisão audiovisual.

### Captions/SRT

Relatório: `reports/closet-4-caption-qa.json`

- **13 blocos; 0 erros e 0 avisos**;
- limite de duas linhas no SRT;
- maior velocidade medida: **14,79 caracteres/s**, abaixo do limite de 22;
- duração e ordenação aprovadas.

### MP4 master

Relatório: `reports/closet-4-video-qa.json`

- **9/9 verificações aprovadas; 0 falhas e 0 avisos**;
- H.264 High, 1080×1920, 30 fps, 687 frames, `yuv420p`;
- BT.709, faixa TV;
- AAC estéreo, 48 kHz;
- **−14,0 LUFS integrados e −1,0 dBTP**;
- nenhum evento de preto ou congelamento detectado;
- vídeo: 22,9 s; contêiner: 22,954667 s pela granularidade/padding do AAC.

### Decodificação e prévia

- Master decodificado integralmente com FFmpeg, sem erros.
- Prévia decodificada integralmente com FFmpeg, sem erros.
- Prévia: H.264 High, 540×960, 30 fps, 687 frames, AAC estéreo 48 kHz.
- Master: 23.703.853 bytes; SHA-256 `1b6a95803228663b85fdff8b930a22db956a6a57f6505f203520eda79549b7d1`.
- Prévia: 2.939.744 bytes; SHA-256 `781bc3adc7a308a09c3270f04aae70f9e79f5bf124367c798a09dd25d1dfe5b8`.

## 2. Revisão visual efetivamente realizada

Foram gerados e revisados **20 quadros do MP4 codificado** em `out/closet-4-review/`:

`20, 43, 75, 111, 126, 163, 193, 235, 246, 294, 358, 387, 445, 508, 535, 592, 624, 633, 663 e 686`.

Folhas revisadas:

- `out/closet-4-review-sheet-1.jpg`
- `out/closet-4-review-sheet-2.jpg`
- `out/closet-4-contact-qa.jpg`

A amostragem cobriu:

- todos os **13 grupos de captions**, incluindo um momento com cada frase completa;
- entradas de palavras nos frames 20 e 75;
- entrada do CTA no frame 633 e estado assentado no frame 686;
- cinco cenas, quatro mudanças de look e último frame;
- serifas, conectores, acentos, sublinhados e quebras de linha;
- baseline inferior, redução tipográfica e separação do CTA.

As frases completas estavam legíveis, sem cortes de texto ou sobreposição com o CTA. A redução de aproximadamente 15% manteve a posição e a hierarquia da edição de referência.

## Limites desta revisão

- A revisão visual foi feita **por quadros, folhas de contato e contact sheet**, não por playback audiovisual integral.
- Não houve escuta subjetiva completa do master; loudness, true peak, canais e decodificação são medições/testes técnicos.
- A transcrição automática foi comparada em duas passagens; a grafia de “champanhe” recebeu revisão contextual.
- A estabilidade do container foi verificada pela implementação e pelos quadros amostrados, não por inspeção manual de cada um dos 687 frames.

## Preservação e organização

- CLOSET-2, ARMÁRIO-2 e a prévia do ARMÁRIO-2 mantiveram seus SHA-256 anteriores.
- Masters e prévias estão em `../entregas/`.
- Fonte bruta, assets e temporários do CLOSET-4 permanecem separados e ignorados pelo Git.
