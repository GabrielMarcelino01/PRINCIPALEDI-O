# CLOSET-4 — mesma edição editorial, captions 15% menores

## Entregas

- **Master:** `../entregas/CLOSET-4-EDITADO.mp4`
- **Prévia leve:** `../entregas/CLOSET-4-PREVIA.mp4`
- **Timeline:** `closet-4-project.json`
- **Transcrição:** `closet-4-transcript.json`
- **Captions:** `closet-4-captions.srt`
- **Preparação:** `closet-4-prepare-report.json`
- **QA técnico:** `reports/closet-4-*.json`
- **Revisão visual e limitações:** `CLOSET-4-QA.md`

CLOSET-2, ARMÁRIO-2 e a prévia do ARMÁRIO-2 permanecem preservados em `../entregas/`.

## Fonte confirmada

O original é `Untitled_Scene_10-27_01_25_58_20261026223117.mp4`, recuperado diretamente do commit `53636c41aa69626668424c0aa597d77fbb5d95c7` (`CLOSET-4`). Não foi usado placeholder nem um MP4 já editado como fonte.

- Fonte local: `assets/closet-4/CLOSET-4.mp4`
- Blob Git: `7f3b8c454d5d07c3d1a0b588a6f2fb9905bf5985`
- SHA-256: `f2d30a24055c413f15f2424ab5891a700164df66e11be24421fbf0360178e12f`
- Formato original: 720×1280, H.264/AAC, 22,901693 s
- Timeline final: **1080×1920, 30 fps, 687 frames / 22,9 s**

## Transcrição nova

A fala foi transcrita localmente com **OpenAI Whisper small / CTranslate2 int8**, em duas passagens comparadas. Não foi reutilizado o texto do CLOSET-3. A saída “cor-champão” foi revista contextualmente para a grafia **“champanhe”**; as demais frases foram consistentes entre as passagens. Esse processo não é apresentado como escuta subjetiva integral.

São cinco segmentos, **13 grupos e 45 palavras com timestamps**:

1. Usem cor champanhe e fiquem românticos e vibrantes.
2. Preto com vinho é um clássico para casamento à noite.
3. Marrom com cobre, elegância perfeita para um casamento.
4. Lembre-se, azul marinho com azul claro fica elegante e irresistível.
5. Grafite com verde sálvia, uma combinação discreta e sofisticada.

## Cortes

| Corte | Tempo | Mudança |
| --- | ---: | --- |
| 01 | 4,174023 s | Champanhe/dourado → preto/vinho |
| 02 | 8,182031 s | Preto/vinho → marrom/cobre |
| 03 | 12,385352 s | Marrom/cobre → azul marinho/azul claro |
| 04 | 17,818359 s | Azul → grafite/verde sálvia |

Os cortes são os do material original. Não foram adicionados flashes, dissolves, whip pans ou transições aleatórias.

## Posição, escala e design

A referência foi a edição CLOSET-3 publicada em `d2becdfaa6bc9177485d1bd2afa8a58682bdd619`. Foram preservados:

- Inter para sans serif e Playfair Display itálica para ênfases;
- captions na **baseline inferior fixa de 1320 px**, com container estável;
- cores ligadas aos looks, sublinhados discretos e sombra de leitura;
- header `ARMÁRIO • COLOR EDIT`, indicador de cena e paleta;
- vinheta e grão monocromático estático;
- CTA `+ SEGUIR` a partir de 20,9 s;
- câmera com escala fixa 1,02 e deslocamento zero.

A única redução adicional pedida foi aplicada à tipografia das captions, com arredondamento para pixels inteiros:

| Estilo | Referência | CLOSET-4 |
| --- | ---: | ---: |
| Sans | 96 px | **82 px** |
| Serifada | 120 px | **102 px** |
| Conectores | 44 px | **37 px** |

A redução é de aproximadamente **15%** em relação à última edição, sem alterar a baseline ou a posição do CTA.

## Movimentação estabilizada

- **Pop-in por palavra:** entrada sincronizada à fala, com spring, elevação de 16 px e escala inicial 0,92;
- **ênfase ativa:** pulso único de 0,45 s e no máximo 2,5%, excluindo conectores;
- **serifa interativa:** onda única de 0,8 s e até 3,2 px por letra;
- **sublinhados:** abertura por `scaleX` com spring;
- **CTA:** uma única entrada elástica, permanecendo fixo depois.

Os motions documentados são `001`, `122`, `125` e `130`. O container não se desloca, as palavras conservam seu espaço durante a entrada e não há reflow do bloco.

## Imagem e áudio

- Upscale Lanczos para 1080×1920 e conversão de matriz BT.601 → BT.709.
- Contraste, saturação e sharpen discretos; sem interpolação sintética de movimento.
- H.264 High, `yuv420p`, BT.709/TV, CRF 16 e preset slow no master.
- Voz original com EQ, compressão e presença.
- Música procedural original, 112 BPM, sem samples.
- Ducking por sidechain e loudnorm em duas passagens.
- Master de áudio PCM 24 bits/48 kHz e uma única codificação AAC no MP4.
- Prévia AAC de preparação: **−14,0 LUFS e −1,0 dBTP**.
- Sem efeitos sonoros de transição.

## Arquivos independentes

- `src/Closet4Reel.jsx` e `src/Closet4Root.jsx`: composição e movimentos.
- `closet4-render.mjs`: bundle, storyboard, master e prévia.
- `scripts/prepare_closet4.py`: normalização, grão, áudio e SRT.
- `scripts/validate_closet4.py`: 27 verificações de timeline, assets, texto, posição e movimento.
- `public/closet-4-*` e `work/closet-4/`: assets locais ignorados pelo Git.

## Reproduzir

Com as dependências do Studio, Python/NumPy/Pillow, FFmpeg/ffprobe e Chromium disponíveis:

```bash
python3 scripts/prepare_closet4.py
node closet4-render.mjs --storyboard
node closet4-render.mjs
node closet4-render.mjs --preview --output out/closet-4-preview.mp4
bash scripts/qa_closet4.sh
```

Se necessário, configurar `FFMPEG_PATH`, `FFPROBE_PATH` e `REMOTION_BROWSER`.

## Escopo do QA

`bash scripts/qa_closet4.sh` separa timeline/assets, SRT e MP4 codificado. A revisão visual por quadros e suas limitações estão em `CLOSET-4-QA.md`; relatório técnico aprovado não é apresentado como playback ou escuta subjetiva integral.
