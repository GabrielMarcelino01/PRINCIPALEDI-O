# QA — EDITE-ESSE | formato completo

**Data:** 2026-10-26  
**Resultado técnico:** PASS — 0 falhas e 0 avisos nos validadores.  
**Revisão audiovisual:** inspeção visual por amostragem; sem playback integral ou escuta subjetiva.

## Arquivo verificado

| Campo | Resultado |
| --- | --- |
| Caminho | `out/edite-esse-final.mp4` |
| Tamanho | 19.266.952 bytes |
| SHA-256 | `f487f22df02ccfa6655844d872a68647b0a5281c4dd0408e1b96419aefb991b4` |
| Duração do contêiner | 20,523 s |
| Vídeo | H.264 High, 1080×1920, 30 fps, 614 frames, 20,467 s |
| Cor | `yuv420p`, faixa TV, primárias/transferência/matriz BT.709 |
| Áudio | AAC-LC, estéreo, 48 kHz |
| Loudness | **−14,0 LUFS** |
| True peak | **−1,0 dBTP** |
| Faststart | `moov` no offset 32, antes de `mdat` |

O master de render é WAV PCM 24 bits/48 kHz, convertido uma única vez para AAC. Os metadados BT.709 são aplicados por stream copy, sem reencodificação adicional.

## Formato desta versão

- Sem cabeçalhos, barra de progresso, flashes, swipes ou efeitos sonoros de transição.
- Legenda ampliada para **76 px sans / 96 px serifada / 42 px conectores**.
- Entrada palavra por palavra nos timestamps, sublinhado progressivo e ênfase cromática.
- “Horrível” com shake curto; “minimalista” com entrada contida; “vivo” com pulso maior.
- Legendas distribuídas em **sete regiões seguras**, com alinhamento à esquerda, centro ou direita conforme o enquadramento.
- Cinco movimentos de câmera suaves, com escala entre 1,020 e 1,050 e deslocamentos máximos de 5px.
- Botão **+ SEGUIR** a partir de 18,65s, com entrada spring, pulso discreto e brilho; sem inventar handle do perfil.
- Trilha sem whooshes/impactos de transição; somente voz e música.
- Animações implementadas com `spring`/`interpolate` do Remotion.
- Preset para próximos vídeos documentado em `FASHION.md`.

## Validações executadas

### 1. Projeto, estilo e fidelidade textual

Comando: `npm run qa:fashion:project`

- **25/25 checagens passaram**;
- 13 grupos de captions e 45 palavras com timestamps válidos;
- todos os seis segmentos conferem com a transcrição revisada;
- tamanhos 76/96/42 confirmados;
- sete regiões de captions e seus limites confirmados;
- cinco movimentos dentro dos limites de escala/deslocamento;
- botão de seguir no final e dentro da safe zone;
- ausência de cabeçalhos e efeitos de transição confirmada no código;
- trilha sem SFX de transição, assets, fontes e hash do original confirmados.

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

- storyboard Remotion com 12 quadros e as novas regiões de captions;
- abertura superior, legenda central e CTA final em resolução cheia;
- botão conferido novamente em frame extraído do MP4 codificado;
- 12 amostras do arquivo final;
- revisão anterior das frases completas e da sequência de oito quadros de “horrível” mantida para o formato de captions;
- cortes sem flashes/swipes verificados na versão anterior e ausência desses componentes confirmada nesta por código.

Foram verificados nas amostras: enquadramento, rostos livres, posição das captions, ausência de corte de texto, contraste, acentos e dimensão/localização do botão.

## Limites desta revisão

- **Não houve playback integral do MP4 nem escuta subjetiva da mixagem.** As medições de áudio são técnicas, não uma avaliação estética por escuta.
- Os movimentos foram validados por código e frames amostrados; não houve avaliação de playback integral em tempo real.
- A sincronia usa timestamps do Whisper e revisão visual amostrada; não houve forced alignment independente ou conferência de cada palavra por escuta.
- As safe zones foram calculadas e conferidas nos renders, **não em um celular físico**.
- A ausência de alertas de preto/congelamento não substitui assistir a todos os frames em tempo real.
- A correção de “beijo” para “bege” foi feita pelo contexto da frase e do look, não por uma segunda transcrição independente.
