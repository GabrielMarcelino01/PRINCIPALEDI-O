# QA — EDITE-ESSE final

**Data:** 2026-10-26  
**Resultado técnico:** PASS — 0 falhas e 0 avisos nos validadores.  
**Revisão audiovisual:** inspeção visual por amostragem; sem playback integral ou escuta subjetiva.

## Arquivo verificado

| Campo | Resultado |
| --- | --- |
| Caminho | `out/edite-esse-final.mp4` |
| Tamanho | 19.649.437 bytes |
| SHA-256 | `8b7a50c8f0205ca5912c030ca9ac97d5201197403d24f5c2be4ee505009520fa` |
| Duração do contêiner | 20,523 s |
| Vídeo | H.264 High, 1080×1920, 30 fps, 614 frames, 20,467 s |
| Cor | `yuv420p`, faixa TV, primárias/transferência/matriz BT.709 |
| Áudio | AAC-LC, estéreo, 48 kHz, aproximadamente 253 kb/s |
| Loudness | **−14,0 LUFS** |
| True peak | **−1,0 dBTP** |
| Faststart | `moov` no offset 32, antes de `mdat` |

A diferença entre a duração do contêiner e a do stream de vídeo decorre do enquadramento/padding do AAC. O master de render é WAV PCM 24 bits/48 kHz, convertido uma única vez para AAC.

## Validações executadas

### 1. Projeto e fidelidade textual

Comando: `npm run qa:fashion:project`

- **19/19 checagens passaram**;
- 13 grupos de captions e 45 palavras com timestamps válidos;
- quatro cortes e cinco blocos visuais coerentes;
- grupos sem sobreposição e dentro da duração;
- todos os seis segmentos conferem com a transcrição revisada;
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

### 4. Integridade e metadados

- decode completo de vídeo e áudio pelo FFmpeg sem erros;
- `ftyp` → `moov` → `free` → `mdat`, confirmando faststart;
- H.264 contém explicitamente `bt709/bt709/bt709` e faixa `tv`;
- os metadados finais foram aplicados por bitstream filter/stream copy, **sem reencodificar imagem ou áudio**;
- sintaxe Python, sintaxe do renderizador Node e JSONs validados;
- `git diff --check` sem erros.

## Revisão visual efetivamente realizada

- folhas de contato do original e das duas referências;
- comparação de frame antes/depois do tratamento de imagem;
- storyboard Remotion com 12 quadros;
- inspeção em resolução cheia de “horrível”, “sofisticado” e “elegante”;
- 12 amostras extraídas do MP4 codificado;
- pares antes/depois e quadros exatos dos quatro cortes;
- overlay de safe zones em 1080×1920.

Foram verificados nessas amostras: enquadramento dos cinco looks, rostos livres, hierarquia das captions, acentos, ausência de corte de texto, contraste, CTA e flashes curtos. O overlay de debug **não aparece no MP4 final**.

## Limites desta revisão

- **Não houve playback integral do MP4 nem escuta subjetiva da mixagem.** As medições de áudio são técnicas, não uma avaliação estética por escuta.
- A sincronia usa timestamps do Whisper e revisão visual amostrada; não houve forced alignment independente ou conferência de cada palavra por escuta.
- As safe zones são conservadoras e foram verificadas no render, **não em um celular físico**.
- A ausência de alertas de preto/congelamento não substitui assistir a todos os frames em tempo real.
- A correção de “beijo” para “bege” foi feita pelo contexto da frase e do look, não por uma segunda transcrição independente.
