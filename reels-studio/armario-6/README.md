# ARMÁRIO-6 — O código das cores

Reels editorial de moda criado a partir do upload original `CLOSET-6.mp4`. A composição trata as cinco combinações como capítulos de um mesmo código visual, sem inserir imagens de outras pessoas ou usar um MP4 editado como fonte.

## Entrega

- **Vídeo:** `../../entregas/ARMARIO-6-EDITADO.mp4`
- **Formato:** 1080×1920, 60 fps, 1.246 quadros, H.264/yuv420p, BT.709
- **Áudio:** voz original, trilha/sound design próprios, AAC estéreo 48 kHz
- **Legendas separadas:** `armario-6-captions.srt`
- **Preview:** porta 3003, com MP4 e SRT para download

## Fonte verificada

| Campo | Valor |
| --- | --- |
| Origem | `origin/main:CLOSET-6.mp4` |
| Commit | `6c16b4828cdaf314bfd7dcd585cf3de57769db34` |
| Cópia bruta | `../assets/armario-6/ARMARIO-6.mp4` |
| Bytes | 19.647.837 |
| SHA-256 | `55010ad5a20333c661a2dec1348235bcf22a466f60fa5e67da6f54e2aedd6f1d` |
| Mídia | 720×1280, H.264/AAC, 20,760 s, 496 quadros |

A mídia bruta fica fora do Git. `out/`, `node_modules/` e as capturas também são ignorados.

## Direção de edição

- Hook inicial “O código das cores” e promessa de cinco combinações.
- Superlegendas karaokê sincronizadas por palavra, com palavras-chave em cor e serifada itálica.
- Paleta, contador de look e progresso por capítulo.
- Camera push/pan discreto e função pura do tempo; os dois rostos permanecem livres.
- Luz direcional, contraste, vinheta e grão fixo; nenhum flash branco longo.
- Wipe de luz, impacto de câmera e sound design nos quatro cortes naturais.
- CTA “Qual look é o seu?” e números para comentários no encerramento.
- Trilha sintetizada a 112 BPM, sem música ou samples externos.

## Transcrição

A fala foi transcrita localmente com **faster-whisper 1.2.1 / Whisper small CT2 int8**. Duas decodificações independentes produziram o mesmo texto; a ortografia de “bege” foi revista. A repetição de “riqueza” apareceu nas duas passagens e foi preservada.

O hash do modelo é `ca732cb1379efc49417d028465f543d83a39de2c61f3027678de103dc404ce73`. O modelo e o ambiente ASR não são necessários para renderizar: `transcript.json` já contém os tempos revisados.

## Pipeline reproduzível

Requer Node 22+, Python 3 e NumPy (`requirements.txt`). O NPM instala Chromium, FFmpeg e FFprobe pinados.

```bash
npm ci --ignore-scripts --no-audit --no-fund
python3 -m pip install -r requirements.txt
python3 prepare_project.py
node normalize-source.mjs
python3 audio-design.py
node render.mjs --output out/frames --skip-existing
node encode.mjs
```

Cada quadro é calculado por `t = quadro / 60` e o Chromium fotografa a composição. Como o upload tem taxa variável, `normalize-source.mjs` extrai diretamente do original uma sequência de 1.246 JPEGs a 60 fps. A composição lê o arquivo de mesmo índice do quadro de saída e o desenha em canvas: não há seek de vídeo, escolha de quadro pelo decodificador, relógio de animação, sorteio ou estado acumulado. O FFmpeg monta os 1.246 JPEGs finais e faz o mux com o áudio do upload original.

A tipografia cinética usa revelação por opacidade, cor, sublinhado e brilho sincronizados. Textos não recebem `transform`: essa restrição evita rasterização dependente do histórico do Chromium. Os movimentos de câmera, progresso e wipes continuam sendo funções puras de `t`.

## Determinismo, QA e preview

```bash
node render.mjs --output out/determinism --frames 1230,120,738,30,990,500,1164,250
python3 compare_determinism.py
python3 validate.py
node preview-server.mjs
```

A validação cobre fonte, sequência de quadros, codec, dimensões, fps, cor, áudio, decodificação, preto/congelamento, silêncio longo, loudness, true peak, SRT, recapturas fora de ordem e folha do MP4 codificado. Os relatórios ficam em `reports/`.

**Escopo da revisão:** verificações técnicas e inspeção de quadros não equivalem a playback/escuta integral. O preview abre o projeto correto em `http://localhost:3003` localmente; na Arena, usar o endereço HTTPS da porta 3003.
