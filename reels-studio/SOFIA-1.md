# SOFIA-1 — COLOR NOTES

## Entregas

- **Master:** `../entregas/SOFIA-1-EDITADO.mp4`
- **Prévia leve:** `../entregas/SOFIA-1-PREVIA.mp4`
- **Timeline editável:** `sofia-1-project.json`
- **Transcrição automática:** `sofia-1-transcript-auto.json`
- **Texto/timestamps revisados:** `sofia-1-transcript-reviewed.json`
- **Captions:** `sofia-1-captions.srt`
- **QA técnico:** `reports/sofia-1-project-qa.json`, `reports/sofia-1-master-qa.json` e `reports/sofia-1-preview-qa.json`
- **Escopo da revisão:** `SOFIA-1-QA.md`

Os MP4 são locais e ignorados pelo Git. O original e todas as outras entregas são preservados.

## Fonte confirmada

- Original: `../SOFIA-1 (1).mp4`
- SHA-256: `99ddaeacbe8ceffe512c37a54b3633f98672696b385085243476d72a8751a858`
- 720×1280, H.264 Main/yuv420p/BT.709, 23,960 fps, AAC 44,1 kHz estéreo
- Duração original: 28,329 s; 14.409.661 bytes
- Cópia de trabalho: `assets/source/SOFIA-1.mp4`; cópia do bundle: `public/sofia-1-source.mp4`

Não foram usados placeholders, outro vídeo ou um MP4 editado como fonte.

## Pesquisa e texto

Foram gerados probe, WAV, estatísticas de silêncio, folha de contato e keyframes antes da composição. A fala foi transcrita localmente com **OpenAI Whisper small / CTranslate2 int8**, idioma `pt` (probabilidade do modelo 0,9838). A revisão contextual corrigiu “Bordou” → **“Bordô”**, “excreto” → **“discreto”** e “temporal” → **“atemporal”**, além da capitalização de “mas rosa”. Isso não é apresentado como escuta integral.

São quatro comparações:

1. bordô/cinza → bordô/pistache;
2. marinho/branco → marinho/amarelo-manteiga;
3. marrom-café/bege → marrom-café/azul-claro;
4. rosa-claro/azul-bebê → rosa-claro/vinho;
5. CTA: “Gostou? Me segue para mais dicas de moda.”

## Corte editorial

Foram removidas somente pausas entre os blocos, sem acelerar a voz e sem eliminar falas. O close final já existente foi preservado.

| Cena | Fonte | Início na timeline | Conteúdo |
| --- | ---: | ---: | --- |
| Bordô | 0,00–5,08 s | 0,00 s | cinza → pistache |
| Marinho | 5,46–11,14 s | 5,08 s | branco → manteiga |
| Marrom | 11,86–17,64 s | 10,76 s | bege → azul claro |
| Rosa | 18,02–24,02 s | 16,54 s | azul bebê → vinho |
| CTA | 24,64–27,20 s | 22,54 s | pergunta e follow |

Timeline final: **25,10 s, 1.506 quadros, 60 fps**. As cenas são contíguas por índices inteiros de quadros.

## Design e movimento

- Header `SOFIA / COLOR NOTES`, indicador `01–04 / 04` e progresso discreto.
- Painel editorial superior com amostras reais das cores e descritores.
- Virada de paleta sincronizada ao **“mas”** de cada exemplo.
- Inter para informação/captions e Playfair Display itálica para os descritores de virada.
- Captions na região central, fonte de 52 px, no máximo duas linhas e ênfase pela palavra falada.
- Vinho preservado na amostra; rosa-claro correspondente nos textos para manter contraste.
- Punch-ins e deriva discretos por cena, sem cortar o rosto ou substituir o close final.
- CTA `+ SEGUIR PARA MAIS`, separado das captions e dentro da margem inferior segura.
- Todas as animações são funções puras de `frame/t`; não há sorteio, timers ou estado acumulado imprevisível.

São **14 grupos de captions e 66 palavras com timestamps**. O maior valor calculado é **21,92 caracteres/s**, abaixo do limite de 22.

## Imagem e áudio

- Render de cada quadro pelo Chromium/Remotion a 60 fps.
- Master H.264/yuv420p, BT.709/TV, CRF 16, preset slow, 1080×1920.
- Voz original com high-pass de 65 Hz, low-pass de 15,5 kHz e masterização loudnorm em dois estágios.
- Acentos sonoros procedurais muito discretos nas viradas e no CTA; sem música ou samples externos.
- WAV master PCM 24 bits/48 kHz estéreo.
- O vídeo renderizado é copiado sem reencode na finalização; o WAV recebe uma única codificação AAC 256 kbps pelo FFmpeg.
- Essa finalização eliminou o deslocamento de dois quadros AAC observado no teste do áudio interno do Remotion.

## Reproduzir

Com Node/Remotion, Python/NumPy/Pillow, FFmpeg/ffprobe e Chromium disponíveis:

```bash
python3 scripts/prepare_sofia1.py
python3 scripts/build_sofia1_audio.py
python3 scripts/validate_sofia1.py
node sofia1-render.mjs --storyboard
node sofia1-render.mjs --output ../entregas/SOFIA-1-EDITADO.mp4
python3 scripts/qa_sofia1.py ../entregas/SOFIA-1-EDITADO.mp4 --report reports/sofia-1-master-qa.json
```

Configurar `FFMPEG_PATH`, `FFPROBE_PATH` e `REMOTION_BROWSER` quando os binários não estiverem no PATH. No ambiente desta produção, o Chromium também exigiu `LD_LIBRARY_PATH=/tmp/al2023/lib`.

## TAPNext++

O teste de tracking real usa o wrapper oficial, checkpoint efêmero e os pontos revisados `index_fingertip=(228,535)` e `nose_reference=(369,527)` no trecho inicial. Workflow/run: `sofia-tapnext-track.yml` / `40601769423`. O resultado, a revisão da trajetória e a decisão de uso são registrados em `SOFIA-1-QA.md`; carregamento de checkpoint não é tratado como tracking concluído.

## Limites do QA

Os relatórios automáticos verificam projeto e MP4 codificado. A revisão visual foi feita por fotogramas e folhas de contato, não por playback audiovisual integral. Não houve escuta subjetiva integral; loudness, true peak, decodificação e correlação de fala são medições técnicas.
