# Relatório de verificação — Reels Pro

- **Data:** 2026-10-26
- **Arquivo verificado:** `out/reels-pro-demo.mp4`
- **SHA-256:** `d00be93c81f27149cdc280402a15906c7105ac7951d2448239a69de9695c1762`

## Resultado por escopo

| Escopo | Resultado | Evidência |
| --- | --- | --- |
| Timeline e assets | **PASS — 18/18 checks** | [`reports/project-qa.json`](reports/project-qa.json) |
| SRT contra a duração da mídia | **PASS — 0 erros, 0 avisos** | [`reports/caption-qa.json`](reports/caption-qa.json) |
| MP4 codificado | **PASS — 0 falhas, 0 avisos** | [`reports/video-qa.json`](reports/video-qa.json) |
| Metadados e contagem de frames | **Confirmados por ffprobe** | [`reports/ffprobe-final.json`](reports/ffprobe-final.json) |
| Dependências npm | **0 vulnerabilidades reportadas** | [`reports/npm-audit.json`](reports/npm-audit.json) |
| Revisão visual por amostragem | **Realizada; problemas encontrados foram corrigidos** | `out/capa.jpg`, `out/storyboard.jpg`, `out/final-contact.jpg` |
| Playback integral, escuta subjetiva e celular | **Não realizados** | Ver limitações abaixo |

## 1. Testes automatizados e QA técnico

### Estrutura

O validador independente confirmou:

- 1080×1920, 60 fps e 1.200 frames na timeline;
- 6 cenas contíguas, sem lacunas;
- 13 grupos de captions e 29 palavras com intervalos positivos e ordenados;
- locuções limpas dentro das respectivas cenas;
- fonte, licença, master de áudio e SRT presentes;
- loudness da trilha dentro do alvo configurado.

Comando:

```bash
npm run qa:project
```

### Arquivo final

| Propriedade | Resultado medido |
| --- | --- |
| Duração do container | 20,054 s; 20,000 s de imagem |
| Tamanho | 6.229.856 bytes |
| Vídeo | H.264 High, nível 4.2 |
| Dimensões / fps / frames | 1080×1920 / 60 fps / 1.200 frames decodificados |
| Cor e pixels | `yuv420p`, faixa limitada (`tv`), BT.709 |
| Áudio | AAC-LC, estéreo, 48 kHz, aproximadamente 253 kbit/s |
| Fonte do áudio no render | WAV PCM 24 bits/48 kHz; **uma única codificação AAC** no MP4 |
| Loudness integrado | **−13,9 LUFS** — alvo −14 ± 0,5 |
| True peak | **−1,0 dBTP** — máximo −1 |
| Eventos de preto detectados | Nenhum |
| Eventos de congelamento detectados | Nenhum |
| Faststart | Sim: `ftyp`, `moov`, `free`, `mdat` |

Comandos:

```bash
npm run qa:captions
npm run qa:video
```

O SRT tem 13 blocos, sem sobreposição e sem aviso de velocidade/leitura no validador. A medição de loudness foi feita no **MP4 após AAC**, não apenas no master.

Os relatórios `audio-report.json` e `reports/delivery-manifest.json` preservam, respectivamente, os dados do master e o hash/escopo da entrega.

### Reprodutibilidade e dependências

- Remotion 4.0.522; composição `ReelsPro` carregada e renderizada com Chromium.
- `npm ci --ignore-scripts` concluído no ambiente da sandbox.
- Bundle e still repetidos após a instalação limpa.
- Override de Zod para 4.6.6; `npm audit` final reportou zero vulnerabilidades.
- Scripts Python compilados; `render.mjs` passou em `node --check`; `git diff --check` passou.
- Auditoria das skills: 41 entradas, 64 links locais válidos, 18 symlinks válidos e uma duplicidade exata documentada.

## 2. Revisão audiovisual efetivamente realizada

### Inspeção visual

Foram inspecionados quadros em resolução cheia das seis cenas — frames **55, 250, 430, 620, 850 e 1100** — e uma folha de contato com **20 amostras do MP4 codificado**.

A revisão encontrou e levou às seguintes correções:

1. o anel do contador atravessava “SEGUNDOS” → o texto foi reposicionado;
2. os cartões de loudness invadiam a legenda → o bloco foi reduzido e subido;
3. setas apareceram como `NO GLYPH` → foram substituídas por SVG vetorial;
4. a entrada da segunda caption do CTA estava lenta/esmaecida → a mola foi ajustada para uma microanimação curta;
5. o primeiro MP4 usava `yuvj420p`/faixa completa → o render foi padronizado diretamente para `yuv420p` limitado/BT.709;
6. a trilha recebia um AAC intermediário → o render passou a usar o master WAV, evitando dupla codificação com perda.

Na inspeção final por amostragem, não foram encontrados texto cortado, glyph ausente ou CTA encoberto. O overlay `out/safe-zones.jpg` também foi examinado: captions e CTA permanecem dentro da margem conservadora. Metadados secundários podem ocupar regiões mais externas e repetem informação presente no conteúdo principal.

### Limite desta revisão

**Não foi realizado playback integral em tempo real, escuta subjetiva em caixas/fones, teste em celular ou upload no Instagram.** Portanto:

- o relatório não afirma que o vídeo foi assistido de ponta a ponta em velocidade normal;
- loudness/true peak são medições objetivas, não uma avaliação subjetiva da mixagem;
- a cobertura real pela interface do Reels e o conforto de leitura precisam ser confirmados no dispositivo;
- os tempos por palavra são gerados a partir das durações das locuções limpas e do texto; não houve forced alignment/ASR nem revisão humana de sincronia em playback.

## 3. Auditoria das 41 skills

O catálogo legível está em [`../docs/CATALOGO-SKILLS.md`](../docs/CATALOGO-SKILLS.md), e o inventário reproduzível em [`../docs/skills-audit.json`](../docs/skills-audit.json).

A auditoria foi estática e individual. Ela **não** declara que as 41 skills foram executadas. Foram aplicadas ao demo as referências pertinentes de edição, motion, estrutura vertical, captions e QA; plugins de canais, MCP, hardware e matemática não foram executados.

## 4. Repetir a verificação

```bash
cd reels-studio
npm ci
npm run qa
python3 ../scripts/audit_skills.py --strict
```

Para reconstruir áudio e vídeo, consulte [`README.md`](README.md). A revisão no celular continua sendo uma etapa separada e necessária antes de publicar.
