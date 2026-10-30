# REVIEW — Truque dos Mil Looks

Data da revisão: 2026-10-28.

## Entrega

- Arquivo: `entregas/truque-dos-mil-looks-87s-9x16.mp4`.
- Duração: 87,000 s; 5.220 quadros; 60 fps; vertical 1080×1920.
- Vídeo: H.264 High, yuv420p, BT.709, SDR.
- Áudio: AAC-LC, 48 kHz, estéreo.
- Tamanho: 87.696.070 bytes (83,6 MiB).
- SHA-256: `3ccd05eb98f35d8b80a776142cded4d5383bf1b129d50ed57b295be7e8ffba21`.
- O MP4 fica em `entregas/`; o commit de código-fonte não inclui esse binário.

## Escopo produzido

Composição original inspirada na estrutura e no ritmo de EXEMPLO-4, sem recortar ou reutilizar o MP4 de referência como fonte. A narrativa vai da insegurança ao se vestir à descoberta do aplicativo, demonstração das funções, payoff e CTA.

Foram usadas as duas modelos fornecidas e as três artes reais do aplicativo. Ana e Clara são nomes fictícios para o diálogo off; não há lip-sync nem deformação facial. As telas apresentadas são as artes fornecidas e recortes delas, sem dashboard, botão ou interface de outro produto.

A copy comunica looks com roupas já existentes, organização inteligente do closet, sugestões, favoritos, ofertas e descontos de até 50%, com a condição de disponibilidade visível. A CTA final é “Clique no link. Conheça o Truque dos Mil Looks.”

## QA executado

### Composição e assets

- `build/validate_project.py`: **331 checagens**, todas aprovadas.
- 19 falas, oito mundos, 51 blocos de legenda e timeline contígua.
- Voz termina em 85,00 s; os últimos 2,00 s ficam sem locução e sem legenda.
- Assets locais; nenhuma rede, relógio, timer, CSS keyframes ou aleatoriedade no HTML renderizado.
- Todas as timelines GSAP estão pausadas, registradas e buscáveis em `t`.

### HyperFrames

`build/qa-report.json` registra `ok: true`:

- Runtime: 0 erros e 0 warnings.
- Layout: 0 erros e 0 warnings.
- Contraste: **20/20** verificações aprovadas, sem warnings.
- Craft: **599 amostras**, sem erros ou warnings.
- Áudio: sem erros ou warnings.

Restaram 12 warnings de lint organizacional: um arquivo de captions extenso, oito avisos de densidade de tracks e três avisos de risco de descoberta de mídia repetida. Eles foram revisados e aceitos neste projeto gerado: as falas compartilham um sistema de captions e as mesmas fotos aparecem intencionalmente em shots diferentes. Não são erros de execução ou layout.

### Revisão visual

- Todos os **51 blocos de legenda** foram capturados no ponto médio e inspecionados.
- Foram revisados os estados de entrada e saída das cenas, as três categorias de looks, os quatro estados de ferramentas, as ofertas, o payoff e o endcard.
- As artes do app foram verificadas sem corte dos títulos; as rolagens e os recortes usam somente as telas fornecidas.
- Depois do render, **16 quadros extraídos do próprio MP4** foram inspecionados, incluindo 85,2 s e 86,8 s.
- Esses dois quadros finais têm apenas diferença média mínima de compressão; não há mudança visual de conteúdo no hold.

### Arquivo e áudio

`build/validate_delivery.py` e `build/delivery-qa.json` registram:

- H.264/AAC, 1080×1920, 60 fps, 5.220 quadros e 87 s confirmados por `ffprobe`.
- Decodificação integral do MP4 sem erros.
- Loudness do MP4: **−14,11 LUFS**, true peak **−1,20 dBTP**, LRA 2,0 LU.
- A locução integral foi submetida a Whisper; a transcrição está em `build/transcription-qa.json`.
- A CTA foi reconhecida como “Clique no link, conheça o truque dos meu looks”. A grafia do ASR “meu” corresponde à pronúncia de “mil” em PT-BR; a marca permanece escrita corretamente na tela.

## Limites desta revisão

A revisão técnica e por quadros **não equivale** a playback estético em tempo real, escuta humana integral ou aprovação de marketing. A naturalidade das vozes sintéticas e o julgamento estético final devem ser avaliados no MP4 pelo usuário. Não há promessa de conversão ou de desempenho publicitário.

## Reprodução

Os fontes estão neste diretório. Os pipelines principais são:

1. `build/generate_audio.py`: vozes, trilha original, mixagem e `build/timeline.json`.
2. `build/build_project.py`: cenas, captions, `index.html`, `SPEC.md` e `STORYBOARD.md` a partir da timeline.
3. `build/validate_project.py`: validação estática.
4. `hyperframes check .`: validação de runtime, layout, contraste, craft e áudio.
5. `hyperframes render .`: captura headless a 60 fps e MP4 via FFmpeg.
6. `build/validate_delivery.py`: validação do arquivo final em `entregas/`.
