# QA — EDITE-ESSE | legenda interativa

**Data:** 2026-10-26  
**Resultado técnico:** PASS — 0 falhas e 0 avisos nos validadores.  
**Revisão audiovisual:** inspeção visual por amostragem; sem playback integral ou escuta subjetiva.

## Arquivo verificado

| Campo | Resultado |
| --- | --- |
| Caminho | `out/edite-esse-final.mp4` |
| Tamanho | 21.647.654 bytes |
| SHA-256 | `27e94a3d6592f405b12a9ffefc819d2c8edd2abbe8f1ac9d11e57a5a1b32ea6e` |
| Duração do contêiner | 20,523 s |
| Vídeo | H.264 High, 1080×1920, 30 fps, 614 frames, 20,467 s |
| Cor | `yuv420p`, faixa TV, primárias/transferência/matriz BT.709 |
| Áudio | AAC-LC, estéreo, 48 kHz |
| Loudness | **−14,0 LUFS** |
| True peak | **−1,0 dBTP** |
| Faststart | `moov` no offset 32, antes de `mdat` |

O master de render é WAV PCM 24 bits/48 kHz, convertido uma única vez para AAC. Os metadados BT.709 são aplicados por stream copy, sem reencodificação adicional.

## Revisão visual desta versão

- Somente vídeo e legenda; sem cabeçalhos, CTA ou barra de progresso.
- Sem zoom, punch-in, flash, swipe ou outros efeitos nos quatro cortes.
- Trilha sem whooshes/impactos de transição; somente voz e música.
- Legenda ampliada para **76 px sans / 96 px serifada / 42 px conectores**.
- Entrada palavra por palavra nos timestamps da fala.
- Sublinhado progressivo nas palavras-chave e ênfase cromática.
- “Horrível” com shake curto; “minimalista” com entrada contida; “vivo” com pulso maior.
- Animações implementadas com `spring`/`interpolate` do Remotion, sem dependência adicional de animação.

## Validações executadas

### 1. Projeto, estilo e fidelidade textual

Comando: `npm run qa:fashion:project`

- **22/22 checagens passaram**;
- 13 grupos de captions e 45 palavras com timestamps válidos;
- todos os seis segmentos conferem com a transcrição revisada;
- tamanhos 76/96/42 confirmados;
- ausência de cabeçalho, CTA e efeitos de transição confirmada no código;
- trilha sem SFX de transição confirmada;
- assets, fontes, loudness da prévia e hash do original confirmados.

Relatório: `reports/fashion-project-qa.json`.

### 2. Legendas

Comando: `npm run qa:fashion:captions`

- 13 blocos válidos;
- 0 erros e 0 avisos em modo estrito;
- sem sobreposição;
- máximo de duas linhas;
- maior velocidade: **15,91 caracteres/s**, abaixo do limite de 22;
- duração compatível com o MP4 final.

Relatório: `reports/fashion-caption-qa.json`.

### 3. MP4 codificado

Comando: `npm run qa:fashion:video`

- **9/9 checagens passaram**;
- codec, resolução, fps e duração aprovados;
- loudness e true peak dentro dos limites;
- nenhum evento de preto ou congelamento detectado pelas heurísticas;
- 0 falhas e 0 avisos em modo estrito.

Relatório: `reports/fashion-video-qa.json`.

### 4. Integridade

- decode completo de vídeo e áudio pelo FFmpeg sem erros;
- `ftyp` → `moov` → `free` → `mdat`, confirmando faststart;
- H.264 contém explicitamente `bt709/bt709/bt709` e faixa `tv`;
- sintaxe Python, sintaxe dos renderizadores Node e JSONs validados;
- `git diff --check` sem erros;
- `npm audit`: 0 vulnerabilidades.

## Revisão visual efetivamente realizada

- storyboard Remotion com 12 quadros;
- quatro frases completas em resolução cheia, incluindo as serifadas mais longas;
- 12 amostras extraídas do MP4 codificado;
- sequência de oito quadros da entrada/animação de “horrível”;
- oito quadros exatos nos quatro cortes para confirmar a ausência de flashes/swipes.

Foram verificados nessas amostras: enquadramento, tamanho das captions, ausência de corte de texto, contraste, acentos, entrada progressiva das palavras e ausência dos elementos removidos.

## Limites desta revisão

- **Não houve playback integral do MP4 nem escuta subjetiva da mixagem.** As medições de áudio são técnicas, não uma avaliação estética por escuta.
- A sincronia usa timestamps do Whisper e revisão visual amostrada; não houve forced alignment independente ou conferência de cada palavra por escuta.
- As safe zones foram calculadas e conferidas nos renders, **não em um celular físico**.
- A ausência de alertas de preto/congelamento não substitui assistir a todos os frames em tempo real.
- A correção de “beijo” para “bege” foi feita pelo contexto da frase e do look, não por uma segunda transcrição independente.
