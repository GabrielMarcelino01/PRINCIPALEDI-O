# SOFIA-1 — QA técnico e revisão por quadros

## Arquivos verificados

- Master: `../entregas/SOFIA-1-EDITADO.mp4`
  - 19.631.717 bytes
  - SHA-256 `b5b3529494f1071727e97091566a386b34d5ca41f3630b36e4c7cb6f60b58056`
- Prévia: `../entregas/SOFIA-1-PREVIA.mp4`
  - 2.879.485 bytes
  - SHA-256 `cc7cef87804aabbbe6920eb0f28df2ad00863f03c477e604f23dc19d5433a969`
- Fonte preservada: SHA-256 `99ddaeacbe8ceffe512c37a54b3633f98672696b385085243476d72a8751a858`

Os checksums dos vídeos correspondem à versão sem o seletor TAPNext++. Se a trajetória for aprovada e incorporada, os arquivos serão renderizados e verificados novamente, e estes valores serão substituídos.

## 1. Projeto, texto e assets

Relatório: `reports/sofia-1-project-qa.json`.

- **22/22 verificações aprovadas**.
- 1080×1920, 60 fps, 1.506 quadros / 25,10 s.
- Fonte íntegra e assets presentes.
- Cinco cenas contíguas por índices inteiros de quadros.
- 14 captions e 66 palavras com timestamps válidos.
- Grafia revisada e SRT correspondente.
- Contraste do vinho corrigido sem alterar sua amostra.
- Movimento derivado de `frame/t`, sem aleatoriedade ou timers.
- Finalização AAC pelo FFmpeg confirmada no código.

A velocidade máxima das captions é **21,92 caracteres/s**, abaixo do limite de 22; nenhum bloco excede duas linhas.

## 2. Master e prévia codificados

Relatórios: `reports/sofia-1-master-qa.json` e `reports/sofia-1-preview-qa.json`.

**14/14 verificações aprovadas em cada arquivo:**

- H.264/yuv420p, BT.709 primários/transferência/matriz e faixa TV.
- Master 1080×1920; prévia 540×960.
- `r_frame_rate=avg_frame_rate=60/1` e 1.506 quadros decodificados.
- Duração de vídeo e áudio: 25,10 s.
- AAC estéreo, 48 kHz.
- **−14,40 LUFS integrados** e **−1,12 dBTP**.
- Nenhum evento de preto ou congelamento detectado pelos filtros configurados.
- Decodificação integral com `-xerror`, sem erros.
- Correlação de fala com a fonte em cinco janelas, uma por cena: deslocamento medido de **0,0 ms**, com correlações de **0,9474–0,9868**.

A correlação verifica alinhamento técnico das janelas analisadas; não equivale a uma avaliação subjetiva de sincronia labial em toda a peça.

## 3. Revisão visual efetivamente realizada

Foram revisados **24 quadros extraídos do master codificado**, não apenas stills do projeto:

`12, 102, 156, 258, 304, 305, 318, 510, 612, 645, 646, 690, 858, 972, 991, 992, 1044, 1212, 1320, 1351, 1352, 1390, 1450 e 1505`.

Folhas locais:

- `out/sofia-1-master-sheet-1.jpg`
- `out/sofia-1-master-sheet-2.jpg`
- Quadros isolados: `out/sofia-1-encoded-master/`

A amostragem cobre:

- os quatro exemplos e todas as **14 captions**;
- as viradas de paleta no “mas”;
- frames imediatamente antes e depois dos cortes `304/305`, `645/646`, `991/992` e `1351/1352`;
- contraste do descritor vinho;
- close final, `Gostou?`, CTA e último quadro.

Também foi revisada uma sobreposição de safe zones. As captions permanecem na região central, fora da faixa inferior de interface; o CTA fica abaixo delas, sem sobreposição.

### Defeitos encontrados e corrigidos durante o QA

1. Pequenas sobreposições de 0,04 s entre captions na primeira timeline — removidas.
2. Dois cortes herdando caption/cabeçalho anterior por arredondamento de tempo — seleção alterada para índices inteiros de quadros e revisada no MP4.
3. Vinho com contraste insuficiente no texto — texto alterado para rosa-claro, mantendo a amostra vinho.
4. Deslocamento uniforme de aproximadamente 42,6 ms introduzido somente na codificação de áudio do Remotion — finalização alterada para AAC pelo FFmpeg; nova medição em 0,0 ms.
5. True peak de −0,98 dBTP no primeiro teste AAC — margem ajustada; master final em −1,12 dBTP.

## 4. TAPNext++

O teste real está no run `40601769423`, com checkpoint efêmero e dois pontos cuja posição inicial foi revisada no frame original. A etapa de inferência foi iniciada; a decisão final de uso e os resultados da trajetória serão acrescentados após a conclusão do job e a revisão visual dos pontos. Nenhum uso de TAPNext++ é declarado na versão atual do master.

## 5. Limites desta revisão

- Revisão visual por **quadros e folhas de contato**, não playback audiovisual integral.
- Não houve escuta subjetiva completa do master.
- A transcrição Whisper foi revisada contextualmente; isso não é apresentado como escuta integral.
- Nem todos os 1.506 quadros foram inspecionados manualmente; a estabilidade integral foi avaliada por código, detectores e amostragem.
- Os MP4 finais ficam fora do Git; código, textos e relatórios pequenos permanecem versionados.
