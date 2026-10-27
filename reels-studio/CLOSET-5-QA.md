# CLOSET-5 — QA técnico e revisão visual

## Resultado

**PASS no escopo verificado.** Master e prévia foram renderizados da timeline própria do CLOSET-5, copiados para `entregas/` e decodificados integralmente sem erros.

- Master: `../entregas/CLOSET-5-EDITADO.mp4`
- Prévia: `../entregas/CLOSET-5-PREVIA.mp4`
- Checksums e probes: `reports/closet-5-delivery.json`, `reports/closet-5-final-probe.json` e `reports/closet-5-preview-probe.json`

## 1. QA automatizado/técnico

### Projeto, assets, posição e movimento

Relatório: `reports/closet-5-project-qa.json`

- **27/27 verificações aprovadas**;
- 1080×1920, 30 fps, 734 frames;
- cinco cenas alinhadas aos quatro cortes;
- 18 grupos e 49 palavras com timestamps válidos;
- cinco segmentos correspondentes à transcrição nova;
- SHA-256 da fonte confirmado;
- todos os grupos na baseline inferior de **1320 px**;
- tipografia **82 px sans, 102 px serifada e 37 px nos conectores**;
- bloco dentro da safe zone e separação para o CTA;
- escala de câmera fixa 1,02 e deslocamento zero;
- quatro motions documentados: `001`, `122`, `125` e `130`;
- áudio de preparação em −13,9 LUFS e −1,1 dBTP, sem SFX de transição.

Essas verificações analisam código, timeline e assets; não são, por si só, uma revisão audiovisual.

### Captions/SRT

Relatório: `reports/closet-5-caption-qa.json`

- **18 blocos; 0 erros e 0 avisos**;
- limite de duas linhas no SRT;
- maior velocidade medida: **16,10 caracteres/s**, abaixo do limite de 22;
- duração e ordenação aprovadas.

### MP4 master

Relatório: `reports/closet-5-video-qa.json`

- **9/9 verificações aprovadas; 0 falhas e 0 avisos**;
- H.264 High, 1080×1920, 30 fps, 734 frames, `yuv420p`;
- BT.709, faixa TV;
- AAC estéreo, 48 kHz;
- **−13,9 LUFS integrados e −1,1 dBTP**;
- nenhum evento de preto ou congelamento detectado;
- vídeo: 24,466667 s; contêiner: 24,512 s pela granularidade/padding do AAC.

### Decodificação, master e prévia

- Master decodificado integralmente com FFmpeg, sem erros.
- Prévia decodificada integralmente com FFmpeg, sem erros.
- Prévia: H.264 High, 540×960, 30 fps, 734 frames, AAC estéreo 48 kHz.
- Master: 25.258.817 bytes; SHA-256 `87ef0e1cf20878d7f0d13d4e6b8da939cb219db66da3b65d0e671594c3d5a824`.
- Prévia: 3.041.100 bytes; SHA-256 `21b46ab9f81627b8dd932e93fa711b187077bf6052c6e909ded447b2f628d8cd`.

## 2. Revisão visual efetivamente realizada

Foram gerados e revisados **22 quadros do MP4 master codificado** em `out/closet-5-encoded-review/`:

`27, 75, 118, 159, 187, 225, 264, 291, 327, 375, 411, 441, 483, 537, 571, 585, 621, 650, 674, 676, 714 e 733`.

Folhas revisadas:

- `out/closet-5-encoded-sheet-1.jpg`
- `out/closet-5-encoded-sheet-2.jpg`
- `out/closet-5-encoded-sheet-3.jpg`

A amostragem cobriu:

- todos os **18 grupos de captions**, incluindo um momento com cada frase completa;
- cinco cenas, quatro mudanças de look e último frame;
- serifas, conectores, acentos, sublinhados e quebras de linha;
- baseline inferior, hierarquia tipográfica e separação do CTA;
- verificação específica do CTA: ausente nos frames 621 e 650, entrada configurada no frame 674 e visível no frame 676.

As frases completas estavam legíveis, sem cortes de texto ou sobreposição com o CTA. A suspeita de CTA antecipado foi descartada pela inspeção dos quadros isolados e do MP4 codificado.

## Limites desta revisão

- A revisão visual foi feita **por quadros e folhas de contato**, não por playback audiovisual integral.
- Não houve escuta subjetiva completa do master; loudness, true peak, canais e decodificação são medições/testes técnicos.
- A transcrição automática foi comparada em duas passagens; “verde-oliva” foi normalizado contextualmente para “verde oliva”.
- A estabilidade do container foi verificada pela implementação e pelos quadros amostrados, não por inspeção manual de cada um dos 734 frames.

## Preservação e organização

- Os SHA-256 do master e da prévia do CLOSET-4 permaneceram `1b6a95803228663b85fdff8b930a22db956a6a57f6505f203520eda79549b7d1` e `781bc3adc7a308a09c3270f04aae70f9e79f5bf124367c798a09dd25d1dfe5b8`.
- Masters e prévias estão em `../entregas/`.
- Fonte bruta, assets e temporários do CLOSET-5 permanecem separados e ignorados pelo Git.
