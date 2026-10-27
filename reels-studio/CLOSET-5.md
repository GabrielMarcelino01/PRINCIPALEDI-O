# CLOSET-5 — edição editorial profissional

## Entregas

- **Master:** `../entregas/CLOSET-5-EDITADO.mp4`
- **Prévia leve:** `../entregas/CLOSET-5-PREVIA.mp4`
- **Timeline:** `closet-5-project.json`
- **Transcrição:** `closet-5-transcript.json`
- **Captions:** `closet-5-captions.srt`
- **Preparação:** `closet-5-prepare-report.json`
- **QA técnico:** `reports/closet-5-*.json`
- **Revisão visual e limitações:** `CLOSET-5-QA.md`

CLOSET-2, CLOSET-3, CLOSET-4, ARMÁRIO-2 e suas prévias permanecem preservados em `../entregas/`.

## Fonte confirmada

O original é `Untitled_Scene_10-27_02_36_48_20261026234440.mp4`, recuperado diretamente do commit `0634452a1785e4bad6971dbefcb8d981607fc642` (`CLOSET-5`). Não foi usado placeholder nem um MP4 já editado como fonte.

- Fonte local: `assets/closet-5/CLOSET-5.mp4`
- Blob Git: `480b89b9a23c59f58bb6914e2369f8f9f01bdfe6`
- Tamanho: 24.055.519 bytes
- SHA-256: `bc129692a791a8c222d2239ddd3030ec34212eb52c4610baf6d75f180853b3ef`
- Formato original: 720×1280, H.264/AAC, 24,452995 s
- Timeline final: **1080×1920, 30 fps, 734 frames / 24,466667 s**

## Transcrição nova

A fala foi transcrita localmente com **OpenAI Whisper small / CTranslate2 int8**, em duas passagens comparadas. Não foi reutilizado texto de outra fonte. As cinco frases foram consistentes; a grafia automática “verde-oliva” foi normalizada para **“verde oliva”**. Esse processo não é apresentado como escuta subjetiva integral.

São cinco segmentos, **18 grupos e 49 palavras com timestamps**:

1. Lembre-se, vestido azul petróleo com terno cinza claro fica elegante.
2. Lembre-se, vestido vermelho rubi com terno azul noite é puro charme.
3. Vestido roxo ametista com terno cinza chumbo transmite luxo.
4. Lembre-se, vestido rosa antigo com terno verde oliva fica chique.
5. Vestido verde esmeralda com terno marrom tabaco é sofisticado.

## Cortes e looks

| Corte | Tempo | Mudança |
| --- | ---: | --- |
| 01 | 5,552344 s | Azul petróleo/cinza claro → vermelho rubi/azul noite |
| 02 | 9,807357 s | Vermelho/azul → roxo ametista/cinza chumbo |
| 03 | 13,861654 s | Roxo/cinza → rosa antigo/verde oliva |
| 04 | 19,244661 s | Rosa/verde → verde esmeralda/marrom tabaco |

Os cortes são os do material original. Não foram adicionados flashes, dissolves, whip pans ou transições aleatórias.

## Posição, escala e design

A referência foi o CLOSET-4 publicado em `aacbeff454b4597f71def77824299a5a7d54238a`. Foram preservados:

- Inter para sans serif e Playfair Display itálica para ênfases;
- captions na **baseline inferior fixa de 1320 px**, com container estável;
- tipografia **82 px sans, 102 px serifada e 37 px nos conectores**, sem nova redução de 15%;
- cores ligadas aos cinco looks, sublinhados discretos e sombra de leitura;
- header `ARMÁRIO • COLOR EDIT`, indicador de cena e paleta;
- vinheta e grão monocromático estático;
- CTA `+ SEGUIR` com entrada em **22,47 s**, posicionado no topo de 1400 px;
- câmera com escala fixa 1,02 e deslocamento zero.

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
- Áudio medido no MP4: **−13,9 LUFS e −1,1 dBTP**.
- Sem efeitos sonoros de transição.

## Arquivos independentes

- `src/Closet5Reel.jsx` e `src/Closet5Root.jsx`: composição e movimentos.
- `closet5-render.mjs`: bundle, storyboard, master e prévia.
- `scripts/prepare_closet5.py`: normalização, grão, áudio e SRT.
- `scripts/validate_closet5.py`: 27 verificações de timeline, assets, texto, posição e movimento.
- `public/closet-5-*` e `work/closet-5/`: assets locais ignorados pelo Git.

## Reproduzir

Com as dependências do Studio, Python/NumPy/Pillow, FFmpeg/ffprobe e Chromium disponíveis:

```bash
python3 scripts/prepare_closet5.py
node closet5-render.mjs --storyboard
node closet5-render.mjs
node closet5-render.mjs --preview --output out/closet-5-preview.mp4
bash scripts/qa_closet5.sh
```

Se necessário, configurar `FFMPEG_PATH`, `FFPROBE_PATH` e `REMOTION_BROWSER`.

## Escopo do QA

`bash scripts/qa_closet5.sh` separa timeline/assets, SRT e MP4 codificado. A revisão visual por quadros e suas limitações estão em `CLOSET-5-QA.md`; relatório técnico aprovado não é apresentado como playback ou escuta subjetiva integral.
