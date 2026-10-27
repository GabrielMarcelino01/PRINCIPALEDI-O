# ARMÁRIO-7 — Match Lab

Reels editorial de moda criado a partir do upload original `CLOSET-7.mp4`. A direção “5 looks. 1 match.” transforma as cinco combinações de casal em capítulos de um laboratório de estilo, com imagem em cartão, fundo cinematográfico e votação final.

## Entrega

- **Vídeo:** `../../entregas/ARMARIO-7-EDITADO.mp4`
- **Formato:** 1080×1920, 60 fps, 1.293 quadros, H.264/yuv420p, BT.709
- **Áudio:** voz original, trilha/sound design próprios, AAC estéreo 48 kHz
- **Legendas separadas:** `armario-7-captions.srt`
- **Preview:** porta 3004, com MP4 e SRT para download

## Fonte verificada

| Campo | Valor |
| --- | --- |
| Origem | `origin/main:CLOSET-7.mp4` |
| Commit | `a9f47235ffd08ea0263d09bac198783e37c6d776` |
| Cópia bruta | `../assets/armario-7/ARMARIO-7.mp4` |
| Bytes | 20.431.960 |
| SHA-256 | `cae26c943b49b427e36b63d83f1430cf4d47fc38b74dd1294c2a8b11d9f0cc21` |
| Mídia | 720×1280, H.264/AAC, 21,537 s, 516 quadros |

A mídia bruta fica fora do Git. `out/`, `node_modules/` e as capturas também são ignorados.

## Direção de edição

- Hook “5 looks. 1 match.” e cinco capítulos com progresso.
- Cartão de vídeo com corpo inteiro preservado; backdrop ampliado e desfocado, sem deformar a fonte.
- Zona inferior própria para dez blocos de superlegenda, sem esconder os looks.
- Revelação por palavra, cores das combinações, serifada nos adjetivos finais, brilho e sublinhado.
- Movimento de câmera discreto, luz direcional, contraste, vinheta e grão.
- Wipes e impactos de câmera nos cortes naturais: 4,99499 / 8,76966 / 12,5684 / 16,4527 s.
- CTA “Qual match é o seu?” e números para comentários.
- Trilha sintetizada a 120 BPM, sem música ou samples externos.

## Transcrição

A fala foi transcrita localmente com **faster-whisper 1.2.1 / Whisper small CT2 int8**. Duas decodificações completas independentes produziram o mesmo texto. O primeiro trecho recebeu ainda três decodificações isoladas, que mantiveram a mesma palavra. Nenhuma fala foi reescrita; somente “Lembre” + “-se” foram unidos para exibição.

O hash do modelo é `ca732cb1379efc49417d028465f543d83a39de2c61f3027678de103dc404ce73`. O modelo e o ambiente ASR não são necessários para renderizar: `transcript.json` já contém os tempos revisados, com 42 palavras e cinco segmentos.

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

Cada quadro é calculado por `t = quadro / 60`. Como o upload tem taxa variável, `normalize-source.mjs` extrai diretamente do original uma sequência de 1.293 JPEGs a 60 fps. A composição lê o arquivo de mesmo índice do quadro de saída e o desenha em dois canvas: cartão principal e backdrop. Não há seek de vídeo, relógio de animação, sorteio ou estado acumulado.

Textos não recebem `transform`, evitando rasterização dependente do histórico do Chromium. Câmera, backdrop, barras e wipes são funções puras de `t`. O FFmpeg monta os JPEGs finais e faz o mux com o áudio do upload original.

## Determinismo, QA e preview

```bash
node render.mjs --output out/determinism --frames 1278,180,755,30,1080,360,1210,300,900,630
python3 compare_determinism.py
python3 validate.py
node preview-server.mjs
```

A validação cobre fonte, sequências de 1.293 quadros, codec, dimensões, fps, cor, áudio, decodificação, preto/congelamento, silêncio longo, loudness, true peak, SRT, dez recapturas fora de ordem e folha do MP4 codificado. Os relatórios ficam em `reports/`.

**Escopo da revisão:** verificações técnicas e inspeção de quadros não equivalem a playback/escuta integral. O preview abre o projeto correto em `http://localhost:3004` localmente; na Arena, usar o endereço HTTPS da porta 3004.
