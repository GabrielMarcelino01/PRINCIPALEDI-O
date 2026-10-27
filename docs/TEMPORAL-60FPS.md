# TEMPORAL-60FPS — demonstração e QA

## Entrega

- **MP4:** `entregas/TEMPORAL-60FPS.mp4`
- **Formato:** 1080×1920, 60 fps, 360 quadros, 6,000 s
- **Codec:** H.264 High, `yuv420p`, BT.709/TV, faststart
- **Tamanho:** 2.987.886 bytes
- **SHA-256:** `c4cd18a287e4e6a0edc185e4e71256a6555e81a5941913ccf1451e7c39a2d2bd`
- **Áudio:** nenhum; esta é uma demonstração visual do pipeline, não um master com mix.

## Composição

Três cenas verticais compartilham um único relógio:

1. **O tempo move tudo:** gancho já presente no primeiro quadro, tipografia com springs, órbitas e câmera contínua.
2. **Ritmo que prende:** entrada por máscara horizontal, tipografia cinética e barras gráficas.
3. **60 quadros por segundo:** entrada por máscara circular, câmera, timeline gráfica e lockup final.

Não há sorteio, timer, relógio do sistema, animação CSS ou estado acumulado entre quadros. Para cada quadro `f`, a página recebe `t = f / 60` e recalcula todos os valores em `window.seek(t)`.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| Timeline e código | **28/28 PASS** — `skills/temporal-reel/reports/temporal-60fps-project-qa.json` |
| Storyboard no Chromium | 12 quadros; 3 repetições idênticas — `temporal-60fps-storyboard.json` |
| Captura completa | **360/360 PNGs**, 1080×1920, 60 fps |
| Determinismo | **6/6 hashes idênticos**, recaptura em ordem inversa: frames 359, 315, 240, 180, 99 e 0 |
| Erros da página | 0 erros de JavaScript e 0 erros de console |
| Fontes | Inter e Playfair carregadas |
| FFmpeg | 360 PNGs unidos com `-framerate 60`; H.264 High / CRF 16 |
| MP4 | 1080×1920, 60/1 fps, 360 frames, 6 s, `yuv420p` |
| Decodificação | Master decodificado integralmente sem erros |
| QA de vídeo | **0 falhas**; 1 aviso intencional por não haver áudio |
| Preto/congelamento | Nenhum evento detectado |

O relatório de render, com os hashes antes/depois, está em `skills/temporal-reel/reports/temporal-60fps-render.json`. O probe está em `temporal-60fps-probe.json` e o QA de vídeo em `temporal-60fps-video-qa.json`.

## Revisão visual efetivamente realizada

Foram revisados os 12 quadros do storyboard e, depois, os mesmos tempos extraídos do **MP4 codificado**:

`0, 24, 60, 99, 108, 150, 180, 216, 240, 285, 315 e 359`.

A revisão cobriu primeiro e último quadro, entradas tipográficas, duas transições, câmera, barras, timeline e lockup. O primeiro storyboard revelou margem reduzida pela câmera e gancho tardio; ambos foram corrigidos antes do master. As folhas locais ficam em:

- `skills/temporal-reel/out/temporal-storyboard-sheet.jpg`
- `skills/temporal-reel/out/temporal-encoded-sheet.jpg`

## Limites

- A revisão foi feita por quadros e folhas de contato, não por playback audiovisual integral.
- A ausência de áudio é intencional nesta prova visual; loudness e mix não se aplicam.
- O teste de seis quadros comprova repetibilidade nessas amostras; a ausência de fontes de não determinismo também é verificada estaticamente no código.
- A estrutura é orientada à retenção, mas não garante retenção de público ou desempenho de plataforma.
