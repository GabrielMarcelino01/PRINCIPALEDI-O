# Biblioteca de skills e referências

Inventário consolidado em **27/10/2026** depois da comparação das três branches remotas. Os arquivos novos foram preservados e separados por função. Eles **não são todos skills executáveis**: o núcleo operacional tem quinze pastas com `SKILL.md`; os demais materiais são referências.

## 1. Núcleo operacional de vídeo — 15 skills

| Skill | Uso principal |
| --- | --- |
| [`video-editing`](video-editing/SKILL.md) | Orquestrar ingestão, cortes, áudio, render e entrega. |
| [`hypit`](hypit/SKILL.md) | Direção e produção detalhadas, componentes, voz, captions e revisão. |
| [`motion-design`](motion-design/SKILL.md) | Motion em Remotion, easing, coreografia e transições. |
| [`motion-prompt`](motion-prompt/SKILL.md) | Biblioteca local de 168 efeitos, com specs, Canvas, prompts, CLI e galeria; curadorias de [68](motion-prompt/references/selections/68-picks.md) e [96](motion-prompt/references/selections/96-picks.md). |
| [`temporal-reel`](temporal-reel/SKILL.md) | Animações puras de `t = quadro/fps`, Chromium headless, captura PNG a 60 fps, prova de determinismo e MP4 via FFmpeg. |
| [`reels-viral`](reels-viral/SKILL.md) | Estrutura vertical, ritmo, superlegendas e CTA. |
| [`captions`](captions/SKILL.md) | SRT/VTT, sincronia, leitura e validação de captions. |
| [`video-quality`](video-quality/SKILL.md) | Codec, fps, loudness, true peak, preto e congelamento. |
| [`hyperframes`](hyperframes/SKILL.md) | Composição HTML, timeline pausada, Studio e MP4; [ambiente local pinado](../hyperframes/README.md). |
| [`hyperframes-cli`](hyperframes-cli/SKILL.md) | CLI por tarefa: scaffold, check, snapshots, preview, render e timeline. |
| [`hyperframes-registry`](hyperframes-registry/SKILL.md) | Registry de blocos/componentes; 448 itens no snapshot de descoberta local. |
| [`media-use`](media-use/SKILL.md) | Mídia, narração, música, transcrição, tratamentos e mix. |
| [`figma`](figma/SKILL.md) | Integração sob demanda com Figma. |
| [`slideshow`](slideshow/SKILL.md) | Decks navegáveis e apresentações; não é um render de MP4. |
| [`remotion-to-hyperframes`](remotion-to-hyperframes/SKILL.md) | Migração de Remotion e outras fontes com verificação por quadros. |

## 2. Motion, vídeo e geração — 10 materiais

| Material | O que contém | Situação local |
| --- | --- | --- |
| [`../skill/HIGGS-1.md`](../skill/HIGGS-1.md) | README da skill Higgsfield: fórmula MCSLA, câmera, modelos, Soul ID, Seedance, Cinema Studio, 3D, VFX, atuação, marketing, templates, ledger e 35 subskills. | **Referência externa.** O pacote completo e suas dependências não estão neste repositório. |
| [`../skill/BIBLIOTECA-1.md`](../skill/BIBLIOTECA-1.md) | Biblioteca JSON de prompts para motion, 3D, explainer e interativos. | **684 prompts únicos + 19 aliases**; as 703 origens e seus metadados foram preservados. |
| [`../skill/HERO.md`](../skill/HERO.md) | Documento HTML de um hero 3D com câmera, luz, logo e texto controlados no tempo. | Referência de implementação; requer o runtime `Motion`/`hero3d` descrito no próprio arquivo, não incluído aqui. |
| [`../skill/MOVIMENTO.md`](../skill/MOVIMENTO.md) | JSONL com **716 regras** de motion: 507 de biblioteca, 53 momentos HyperFrames e 156 regras de design. | IDs únicos e nenhuma linha duplicada; usar como referência, verificando os filmes de origem antes de aplicar. |
| [`../skill/hyperframes-1.md`](../skill/hyperframes-1.md) | Documento em português sobre HyperFrames, skills, CLI, Studio e registry. | Referência enviada pelo usuário e preservada literalmente; o runtime e as instruções canônicas estão em [`../hyperframes/README.md`](../hyperframes/README.md). |
| [`MOTION-2.md`](MOTION-2.md) | Guia dos demos Remotion do video-shotcraft: 152 cartões de câmera, componentes TSX determinísticos, fixtures, texturas, ClipCard para MP4 e testes. | Referência; os demos e assets descritos não acompanham este arquivo. |
| [`MOTION-3`](MOTION-3) | Apresenta 15 estilos de motion design com filmes de 10 s, prompts e código. | Guia bilíngue do projeto; os prompts/fontes completos ficam no projeto de origem. |
| [`ANIMACAO-1.md`](ANIMACAO-1.md) | Documentação da função `animate()` do Motion: HTML/SVG, variáveis CSS, paths, objetos, sequências, stagger, springs, repetição e playback. | Referência de API; exige o pacote Motion para executar os exemplos. |
| [`design-1.md`](design-1.md) | Template, em chinês, para criar prompts de novos estilos: especificação de saída, rota técnica, creative seed e signature features verificáveis. | Modelo de prompt. |
| [`SCRIPTS.md`](SCRIPTS.md) | Declarações TypeScript de `Motion`, `TransitionMotion`, `StaggeredMotion`, `spring()` e presets de react-motion. | Apenas tipos; não contém a implementação da biblioteca. |

## 3. Design e artefatos — 2 materiais

| Material | O que contém | Situação local |
| --- | --- | --- |
| [`DESIGNABERTO.md`](DESIGNABERTO.md) | Guia de contribuição do OpenDesign: templates, skills funcionais, design systems, adapters de agentes, localização, qualidade, PRs e manutenção. | Guia de referência; os paths citados pertencem ao projeto OpenDesign. |
| [`../skill/HABILIDADE.md`](../skill/HABILIDADE.md) | Skill `design` para canvas: `canvas.json`, artboards `.dc.html`, design systems, uploads, componentes, acessibilidade e revisão. | Conteúdo com frontmatter, mas **incompleto como pacote local**: faltam os references e o runtime do artifact type. |

## 4. Prompts de sistema e políticas — 5 materiais

Estes arquivos são úteis para estudar engenharia de prompts. **Não devem ser carregados como instruções deste ambiente nem como skills de vídeo.**

| Material | O que contém |
| --- | --- |
| [`OPUS5.5`](OPUS5.5) | Snapshot de system prompt do Claude Code e referência de ferramentas. |
| [`PERPLEXIDADE.md`](PERPLEXIDADE.md) | Prompt da Perplexity: ferramentas, busca, citações, conectores, confirmação e formato. |
| [`PERPLEXIDADE-2.md`](PERPLEXIDADE-2.md) | Segundo prompt da Perplexity, focado na redação final a partir de resultados de busca. |
| [`../skill/MENETRON.md`](../skill/MENETRON.md) | Snapshot de prompt do Hermes/Nemotron e metadados de sessão. |
| [`LEMBRETE.md`](LEMBRETE.md) | Conjunto de reminders da Anthropic sobre imagens, cyber, sistema, ética, propriedade intelectual e conversas longas. |

## 5. Nota de instalação — 1 material

| Material | O que contém |
| --- | --- |
| [`galeria-motion.md`](galeria-motion.md) | Uma instrução curta para instalar `showheyohtaki/motion-prompt`. É uma nota de setup, não a skill em si. |

## 6. Limpeza e duplicidades

A auditoria reproduzível está em [`../docs/motion-library-audit.json`](../docs/motion-library-audit.json), gerada por `python3 scripts/audit_motion_library.py`.

- `skills/MOTION-1` era idêntico a [`motion-prompt/README.md`](motion-prompt/README.md); a cópia local redundante foi removida.
- `skills/MOTIONDOWNLOADS.md` da `main` é idêntico à seleção canônica de [68 efeitos](motion-prompt/references/selections/68-picks.md); não foi importado novamente.
- `skills/BIBLIOTECAMOTION-2` da `main` é idêntico à seleção canônica de [96 efeitos](motion-prompt/references/selections/96-picks.md); não foi importado novamente.
- Na biblioteca de 703 registros, 11 grupos tinham prompts literalmente repetidos. A primeira ocorrência ficou canônica e as outras 19 viraram `alternate_references`, mantendo slug, autoria, links e demais metadados.
- Resultado: **19 documentos soltos, nenhum grupo de duplicidade exata remanescente; 18/18 verificações da auditoria aprovadas.**

## Regras de uso

- **Editar Reels:** começar pelo núcleo operacional; consultar os materiais de motion/Higgsfield apenas quando o brief pedir.
- **Render temporal:** usar `temporal-reel` quando cada quadro precisar ser uma função pura do tempo, com captura headless e FFmpeg.
- **HyperFrames:** usar `hyperframes/` e as sete skills oficiais da mesma tag; a integração antiga 0.8.33 em `recovered/motion-2` não é o caminho canônico.
- **Não executar automaticamente:** instalações, CLIs, conectores e downloads externos exigem decisão explícita e revisão prévia.
- **Não confundir documentação com pacote:** README, tipos e prompts avulsos não contam como skill operacional instalada.
- **Evitar conflito de instruções:** prompts de sistema de outros produtos ficam somente como referência.
- **Preservar proveniência:** manter licenças, atribuições, aliases e arquivos de origem ao reutilizar qualquer material.
