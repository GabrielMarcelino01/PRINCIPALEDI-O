# CLOSET-3 — QA técnico e revisão visual

## Resultado

**PASS no escopo verificado.** O master e a prévia foram gerados do original confirmado, sem usar o placeholder de 2 bytes ou um MP4 anteriormente editado.

- Master: `../entregas/CLOSET-3-EDITADO.mp4`
- Prévia: `../entregas/CLOSET-3-PREVIA.mp4`
- Checksums e probes: `reports/closet-3-delivery.json`, `reports/closet-3-final-probe.json` e `reports/closet-3-preview-probe.json`

## 1. QA automatizado/técnico

### Projeto, assets e transcrição

Relatório: `reports/closet-3-project-qa.json`

- **27/27 verificações aprovadas**;
- 1080×1920, 30 fps, 614 frames;
- cinco cenas alinhadas aos quatro cortes;
- 13 grupos e 45 palavras com timestamps válidos;
- seis segmentos correspondentes à transcrição revisada;
- SHA-256 da fonte confirmado;
- captions em uma única posição central;
- escala de câmera fixa 1,02 e deslocamento zero;
- ausência de `spring`, `interpolate`, onda, pulso, transições e movimento de grão no componente;
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
- Master: 21.374.234 bytes; SHA-256 `4f0e452a8d1e84ad1d56df952ccaca993fcc1561c91dec727965f85c2b517445`.
- Prévia: 2.725.519 bytes; SHA-256 `4148355b01b84b06908e128d64cdd43bc7f370ef41f2cb0b42077466a2a04aaa`.

## 2. Revisão visual efetivamente realizada

Foram gerados e revisados **16 quadros finais** em `out/closet-3-review/`:

`30, 75, 105, 160, 210, 270, 330, 390, 410, 450, 510, 530, 560, 590, 610 e 613`.

A amostragem cobriu:

- todos os **13 grupos de captions**;
- as cinco cenas e as quatro mudanças de look;
- serifas, conectores, acentos e sublinhados;
- centralização, espaçamento e quebra de linhas;
- CTA final e último frame da composição.

Na primeira rodada, algumas palavras da mesma linha estavam próximas demais. O espaçamento horizontal foi corrigido e o storyboard foi refeito antes do render. Na rodada final não foram observados textos cortados, sobreposição entre caption e CTA ou deslocamento da posição central.

Também foi revisado o contact sheet extraído do **MP4 codificado** em `out/closet-3-contact-qa.jpg`, confirmando que o design chegou ao master.

## Limites desta revisão

- A revisão visual foi feita **por quadros e contact sheet**, não por playback audiovisual integral.
- Não houve escuta subjetiva completa do master; loudness, true peak, canais e decodificação são medições/testes técnicos.
- A estabilidade foi verificada pela timeline/componente e pelos quadros amostrados. Isso não é apresentado como uma inspeção manual de cada um dos 614 frames.

## Preservação e organização

- CLOSET-2, ARMÁRIO-2 e a prévia do ARMÁRIO-2 mantiveram seus SHA-256 anteriores.
- Masters e prévias estão em `../entregas/`.
- Os dois exemplos originais estão em `../referencias/`, com hashes documentados.
- Fonte bruta, assets e temporários do CLOSET-3 permanecem separados e ignorados pelo Git.
