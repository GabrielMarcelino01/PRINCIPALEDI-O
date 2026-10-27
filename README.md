# PRINCIPAL EDIÇÃO

Repositório de recuperação e organização das skills e projetos associados à conta excluída `GabrielMarques181920`.

## O que está pronto para usar

| Skill | Finalidade |
| --- | --- |
| [`video-editing`](skills/video-editing/SKILL.md) | Orquestrar ingestão, cortes, reenquadramento, áudio, render e entrega |
| [`hypit`](skills/hypit/SKILL.md) | Produção completa, referências, SVML/SVS, captions, B-roll, motion e revisão |
| [`motion-design`](skills/motion-design/SKILL.md) | Motion graphics em Remotion, easing, karaokê, split screen, líquido, CSS 3D e vox |
| [`motion-prompt`](skills/motion-prompt/SKILL.md) | 168 efeitos com specs, Canvas, prompts, CLI, galeria e curadorias locais |
| [`temporal-reel`](skills/temporal-reel/SKILL.md) | Animação pura do tempo, Chromium headless, captura a 60 fps, prova de determinismo e FFmpeg |
| [`reels-viral`](skills/reels-viral/SKILL.md) | Reels/Shorts/TikToks 9:16 com superlegendas, seis cortes e CTA |
| [`captions`](skills/captions/SKILL.md) | SRT/VTT, karaokê, sincronia, leitura e safe zones |
| [`video-quality`](skills/video-quality/SKILL.md) | ffprobe, EBU R128, true peak, preto/congelamento e folha de contato |

As skills também são expostas em `.claude/skills`, `.codex/skills` e `.agents/skills` por links simbólicos.

## Catálogo completo e demo de Reels

- O [`catálogo das 43 skills`](docs/CATALOGO-SKILLS.md) organiza cada entrada por finalidade, prioridade e relação com o fluxo de vídeo. A auditoria reproduzível está em [`docs/skills-audit.json`](docs/skills-audit.json).
- A [`demo Reels Pro`](reels-studio/README.md) reúne composição Remotion própria, narração PT-BR, trilha original, captions queimadas + SRT e comandos de render/QA em 1080×1920 a 60 fps.
- A [`demo Temporal 60 fps`](docs/TEMPORAL-60FPS.md) comprova o render por `t = quadro/fps`: 360 PNGs capturados em Chromium, hashes reversos idênticos e MP4 unido pelo FFmpeg.
- A [`biblioteca de skills e referências`](skills/README.md) separa o núcleo operacional dos materiais de motion, Higgsfield, design e engenharia de prompts; a limpeza de duplicatas está em [`docs/motion-library-audit.json`](docs/motion-library-audit.json).

## Projetos recuperados

| Pasta antiga | Origem pública identificada | Conteúdo |
| --- | --- | --- |
| `recovered/MOTION` | [`hypit-ai/hypit`](https://github.com/hypit-ai/hypit) | Projeto completo e skill Hypit |
| `recovered/motion-2` | [`blixvip/MotionClone`](https://github.com/blixvip/MotionClone) | MotionClone, HyperFrames, Remotion e composições da Arena |
| `recovered/Official` | [`anthropics/claude-plugins-official`](https://github.com/anthropics/claude-plugins-official) | Diretório oficial de plugins e skills |
| `recovered/COMPLETO` | [`tashfeenahmed/freellmapi`](https://github.com/tashfeenahmed/freellmapi) | FreeLLMAPI |
| `recovered/Descompacto` | [`morluto/rea`](https://github.com/morluto/rea) | Reverse Engineer Anything, em snapshot compatível |

Os commits exatos usados em cada importação estão em [`recovered/manifest.json`](recovered/manifest.json). As licenças e os avisos de terceiros foram mantidos dentro de cada projeto.

### Recuperado versus reconstruído

- **Recuperado:** snapshots dos projetos públicos acima, copiados diretamente do Git por commit.
- **Reconstruído:** as composições `MotionDesign` e `ReelsViral`, pois o PR antigo preservou descrições e hashes, mas o código não está mais acessível.
- **Não recuperado:** histórico completo da conta, eventuais repositórios privados/não indexados e o MP4 solto que aparecia na listagem antiga de `motion-2`.

Leia [`recovered/PROVENIENCIA.md`](recovered/PROVENIENCIA.md) para o relatório completo e as limitações.

## Começar

### Motion Design e Reels

```bash
cd recovered/motion-2/remotion
npm ci
npm run studio:design
```

No Studio, selecione `MotionDesign` ou `ReelsViral`.

```bash
npm run render:design
npm run render:reels
```

Documentação:

- [Motion Design em português](recovered/motion-2/docs/MOTION-DESIGN-PT-BR.md)
- [Reels Viral em português](recovered/motion-2/docs/REELS-VIRAL-PT-BR.md)

### Render temporal a 60 fps

```bash
npm ci --prefix skills/temporal-reel --ignore-scripts --no-audit --no-fund
npm run --prefix skills/temporal-reel qa:demo
npm run --prefix skills/temporal-reel storyboard:demo
npm run --prefix skills/temporal-reel render:demo
```

A animação está em `skills/temporal-reel/demo/timeline.js`: câmera, texto, máscaras e elementos gráficos são recalculados a cada chamada de `seek(t)`, sem sorteio nem estado acumulado. O render só avança se os quadros recapturados fora de ordem tiverem hashes idênticos.

### QA de um vídeo

```bash
python3 skills/video-quality/scripts/video_qa.py final.mp4 \
  --expected-width 1080 --expected-height 1920 --min-fps 30 \
  --target-loudness -14 --max-true-peak -1 \
  --contact-sheet final-contact.jpg --output final-qa.json
```

### Validar legendas

```bash
python3 skills/captions/scripts/caption_qa.py legendas.srt \
  --video final.mp4 --output legendas-qa.json
```

Os scripts usam apenas a biblioteca padrão do Python; o QA de vídeo também precisa de FFmpeg/ffprobe. Eles não instalam dependências nem enviam arquivos para serviços externos.

## Hypit e demais projetos

Cada pasta em `recovered/` mantém seu próprio README, dependências, licença e modo de instalação. O diretório `Official` é um catálogo: importá-lo não significa instalar ou confiar automaticamente em todos os plugins. Revise código, permissões, custos e credenciais antes de executar qualquer projeto.
