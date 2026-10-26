# CLOSET-3 — captions centrais e edição estática

## Entregas

- **Master:** `../entregas/CLOSET-3-EDITADO.mp4`
- **Prévia leve:** `../entregas/CLOSET-3-PREVIA.mp4`
- **Timeline:** `closet-3-project.json`
- **Transcrição:** `closet-3-transcript.json`
- **Captions:** `closet-3-captions.srt`
- **Relatório de preparação:** `closet-3-prepare-report.json`
- **QA técnico:** `reports/closet-3-*.json`
- **Revisão visual e limitações:** `CLOSET-3-QA.md`

CLOSET-2 e ARMÁRIO-2 permanecem preservados em `../entregas/`. Os exemplos originais estão em `../referencias/`.

## Fonte confirmada

O vídeo usado é o upload original `Untitled_Scene_10-25_20_12_37_20261025171936.mp4`, recuperado do commit `729b718d0e61dcb9b9b5dcca12e6c54bfdcfdee0`. Não foi usado o placeholder de 2 bytes nem um MP4 já editado.

- Fonte local: `assets/closet-3/CLOSET-3.mp4`
- SHA-256: `db9c93382b7d05b152a3dd9dce13c72c1634b74e5ba4125f79811ba98ed9bbc8`
- Formato: 720×1280, 24 fps, H.264/AAC, 20,467 s
- Timeline final: **1080×1920, 30 fps, 614 frames / 20,4667 s**

## Texto e cortes

A transcrição histórica foi recuperada de `d4d6e80:reels-studio/fashion-transcript.json` e vinculada novamente à fonte pelo SHA-256. São seis segmentos, **13 grupos e 45 palavras com timestamps**. A correção contextual de “beijo” para **“bege”** foi preservada e documentada.

| Corte | Tempo | Mudança |
| --- | ---: | --- |
| 01 | 4,417643 s | Neon/laranja → verde/preto |
| 02 | 8,366667 s | Verde/preto → bege/branco |
| 03 | 11,613021 s | Bege/branco → azul/branco |
| 04 | 15,716667 s | Azul/branco → vermelho/branco |

Os cortes são os do material original. Não foram adicionados flashes, dissolves, whip pans ou transições aleatórias.

## Design e estabilidade

O acabamento segue o ARMÁRIO-2:

- Inter para sans serif e Playfair Display itálica para ênfases;
- 106 px na sans, 132 px na serifada e 48 px nos conectores;
- cores ligadas às combinações de roupa, sublinhados discretos e sombra de leitura;
- header `ARMÁRIO • COLOR EDIT`, indicador de cena e paleta;
- vinheta e grão monocromático sutis;
- CTA `+ SEGUIR` no final, dentro da safe zone.

Nesta versão, a instrução de estabilidade prevalece sobre qualquer preset cinético anterior:

- captions ancoradas no centro geométrico (`top: 50%` + `translateY(-50%)`);
- todos os 13 grupos usam a mesma posição;
- nenhuma entrada elástica, onda de letras, pulso, zoom ou punch-in;
- câmera com escala fixa 1,02 e deslocamento zero;
- grão, header e CTA sem animação;
- apenas a troca editorial de texto/cena e o movimento já existente no vídeo original permanecem.

## Imagem e áudio

- Upscale Lanczos para 1080×1920 e conversão BT.601 → BT.709.
- Contraste, saturação e sharpen discretos; sem interpolação sintética de movimento.
- H.264 High, `yuv420p`, BT.709/TV, CRF 16 e preset slow no master.
- Voz original com EQ, compressão e presença.
- Música procedural original, 112 BPM, sem samples.
- Ducking por sidechain e loudnorm em duas passagens.
- Master de áudio PCM 24 bits/48 kHz e uma única codificação AAC no MP4.
- Medição da prévia AAC de preparação: **−14,0 LUFS e −1,0 dBTP**.
- Sem efeitos sonoros de transição.

## Arquivos independentes

- `src/Closet3Reel.jsx` e `src/Closet3Root.jsx`: composição estática.
- `closet3-render.mjs`: bundle, storyboard, master e prévia.
- `scripts/prepare_closet3.py`: normalização, grão, áudio e SRT.
- `scripts/validate_closet3.py`: 27 verificações de timeline, assets, texto e estabilidade.
- `public/closet-3-*` e `work/closet-3/`: assets locais ignorados pelo Git.

## Reproduzir

Com Python/NumPy/Pillow, FFmpeg/ffprobe e Chromium disponíveis:

```bash
npm ci
python3 scripts/prepare_closet3.py
node closet3-render.mjs --storyboard
node closet3-render.mjs
node closet3-render.mjs --preview --output out/closet-3-preview.mp4
bash scripts/qa_closet3.sh
```

Se necessário, configurar `FFMPEG_PATH`, `FFPROBE_PATH` e `REMOTION_BROWSER`. A pipeline também aceita esses executáveis no `PATH`.

## Escopo do QA

`bash scripts/qa_closet3.sh` separa timeline/assets, SRT e MP4 codificado. A revisão visual por quadros e suas limitações são registradas em `CLOSET-3-QA.md`; um relatório técnico aprovado não é apresentado como playback ou escuta subjetiva.
