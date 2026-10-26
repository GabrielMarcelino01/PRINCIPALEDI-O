# Reels Pro — demo autoral em Remotion

Demo vertical de **20 segundos, 1080×1920 e 60 fps**, construída a partir do núcleo de skills deste repositório. A composição é independente das reconstruções antigas em `recovered/motion-2`.

## Entrega

| Arquivo | Conteúdo |
| --- | --- |
| `out/reels-pro-demo.mp4` | Vídeo final H.264/AAC, gerado localmente; não versionado |
| `out/capa.jpg` | Capa do frame 55 |
| `out/storyboard.jpg` | Visão dos seis momentos de controle |
| `captions.srt` | Sidecar das legendas queimadas no vídeo |
| `project.json` | Timeline, cenas, palavras e safe zones |
| `public/soundtrack.wav` | Master PCM 24 bits/48 kHz usado no render |
| `public/soundtrack.m4a` | Prévia AAC e medição independente |
| `audio-report.json` | Medição da prévia após AAC e dados do master |
| `reports/caption-qa.json` | Validação do SRT contra a mídia |
| `reports/video-qa.json` | QA técnico do MP4 codificado |

A pasta `out/` é intencionalmente ignorada pelo Git. O MP4 e as imagens são artefatos de entrega; o código, as locuções, a trilha e os relatórios necessários para reproduzir/verificar o trabalho permanecem no projeto.

## Direção

- **01 · Gancho:** contador de três segundos e promessa visual imediata.
- **02 · Leitura:** hierarquia, grupos curtos e palavra ativa.
- **03 · Ritmo:** timeline, playhead, forma de onda e cortes com motivo.
- **04 · Áudio:** voz prioritária, ducking e medições de master.
- **05 · Motion:** trajetória, keyframes e continuidade do movimento.
- **06 · CTA:** composição limpa, botão e respiro final.

A narração PT-BR usa a voz escolhida pelo usuário nesta sessão. Música e efeitos são síntese procedural original, sem samples. A fonte Inter variável é servida localmente; sua licença está em `public/fonts/INTER-LICENSE.txt`.

## Renderizar com os assets incluídos

Requisitos: Node.js, Chromium/Chrome e FFmpeg/ffprobe. Se o navegador não estiver num local padrão, defina `REMOTION_BROWSER`.

```bash
npm ci
npm run render
npm run still
```

Saídas principais:

```text
out/reels-pro-demo.mp4
out/capa.jpg
```

Para abrir o Studio:

```bash
npm run studio
```

Para gerar os seis quadros de controle sem renderizar o vídeo inteiro:

```bash
node render.mjs --storyboard
```

Para revisar o overlay conservador de safe zones:

```bash
node render.mjs --still --frame 250 --safe-zones --output out/safe-zones.jpg
```

O overlay **não** aparece na exportação principal. As zonas são uma margem de trabalho, não uma especificação universal do aplicativo; a revisão no celular continua necessária.

## Reconstruir narração, música, SFX e master

Os MP3 das falas já estão em `assets/voice/`. Para refazer a trilha e a timeline:

```bash
python3 -m pip install -r requirements.txt
npm run audio
```

O script:

1. remove silêncios externos das locuções;
2. mede cada fala limpa e confirma que ela cabe na cena;
3. monta a narração na timeline de 20 s;
4. gera música e SFX originais com NumPy;
5. aplica ducking por sidechain;
6. executa `loudnorm` em duas passagens, com alvo de **−14 LUFS / −1 dBTP**, e salva o master WAV;
7. cria uma prévia AAC 256 kbit/s e mede novamente o M4A;
8. regrava `project.json`, `captions.srt` e `audio-report.json`.

O Remotion recebe o **WAV**, não o M4A: o MP4 final passa por uma única codificação AAC. `work/` contém outros WAVs intermediários e é ignorada pelo Git.

## QA

Com FFmpeg e ffprobe no `PATH`:

```bash
npm run qa:project
npm run qa:captions
npm run qa:video
```

Ou execute os três em sequência com `npm run qa`.

Os comandos verificam a timeline, o SRT e o MP4 em 1080×1920, 60 fps, com alvo de loudness e true peak. Para uma verificação mais granular:

```bash
python3 ../skills/captions/scripts/caption_qa.py captions.srt \
  --video out/reels-pro-demo.mp4 --strict --output reports/caption-qa.json

python3 ../skills/video-quality/scripts/video_qa.py out/reels-pro-demo.mp4 \
  --expected-width 1080 --expected-height 1920 --min-fps 60 \
  --target-loudness -14 --loudness-tolerance 0.5 --max-true-peak -1 \
  --strict --output reports/video-qa.json --contact-sheet out/contact-qa.jpg
```

**QA técnico não é revisão audiovisual.** A revisão visual dos quadros de controle e a inspeção do arquivo final são registradas separadamente em `RELATORIO-QA.md`.
