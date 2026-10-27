# Catálogo e uso das skills

## Resultado da revisão

Foram lidos individualmente os **50 arquivos `SKILL.md`** do repositório. Eles se dividem em **15 skills operacionais para o fluxo de Reels e motion** e **35 referências recuperadas**. Há 45 nomes únicos porque `access` e `configure` aparecem em três canais diferentes e a Hypit aparece duas vezes.

A auditoria reproduzível está em [`skills-audit.json`](skills-audit.json) e pode ser atualizada com:

```bash
python3 scripts/audit_skills.py --strict
```

| Verificação | Resultado |
| --- | ---: |
| Skills catalogadas | 50 |
| Skills operacionais de Reels e motion | 15 |
| Referências recuperadas | 35 |
| Grupos de conteúdo duplicado | 1 — Hypit |
| Links Markdown locais conferidos | 83 |
| Links com variáveis de runtime resolvidos | 6 |
| Links ausentes ou não resolvidos | 0 |
| Symlinks em `.claude`, `.codex` e `.agents` | 45 válidos / 0 inválidos |
| Materiais avulsos organizados separadamente | 19 documentos |

Os materiais avulsos foram classificados na [`biblioteca de skills e referências`](../skills/README.md). O núcleo operacional tem quinze skills: as oito anteriores e as sete skills oficiais do HyperFrames. Documentos de motion, Higgsfield, design, tipos, prompts de sistema e instalação continuam separados como referências.

**Limite da auditoria:** ler e validar uma skill não é executá-la. Na demo de Reels foram aplicados o fluxo de edição, as referências de motion/captions/áudio e os validadores de SRT e vídeo. O Motion Prompt também teve o CLI exercitado, os 68 efeitos selecionados renderizados em Chromium e a galeria local aberta; os detalhes estão em [`skills/motion-prompt/LOCAL.md`](../skills/motion-prompt/LOCAL.md). Não foram executados os plugins de Discord/iMessage/Telegram, MCP, hardware, matemática ou o runtime externo da Hypit. A skill `temporal-reel` foi exercitada de ponta a ponta: 360 PNGs a 60 fps, seis hashes repetidos em ordem inversa e MP4 H.264; o escopo está em [`docs/TEMPORAL-60FPS.md`](TEMPORAL-60FPS.md). O HyperFrames teve CLI, check, snapshots, registry e dois renders validados; os 180 quadros e os MP4s foram idênticos, conforme [`docs/hyperframes-audit.json`](hyperframes-audit.json). A instalação de componentes com `add` depende de rede e não foi executada neste sandbox.

## Fluxo recomendado para Reels

1. **Brief e ingestão — `video-editing`:** definir objetivo, duração, material, cortes, formato e entrega antes de animar.
2. **Direção — `hypit`:** consultar direção visual, voz, sound mix e revisão quando o projeto precisar de um pipeline mais detalhado.
3. **Estrutura vertical — `reels-viral`:** organizar gancho, ritmo, progressão, superlegendas e CTA.
4. **Motion — `motion-design` + `motion-prompt` + `temporal-reel`:** usar movimento para hierarquia e continuidade; quando cada quadro precisar ser função pura do tempo, capturar a 60 fps no Chromium e unir com FFmpeg. Para HTML→MP4, usar `hyperframes` + `hyperframes-cli` + `hyperframes-registry` no ambiente pinado.
5. **Legendas — `captions`:** grupos curtos, sincronia por palavra, contraste, SRT de backup e safe zones conservadoras.
6. **QA — `video-quality` + revisão audiovisual:** medir o MP4 codificado e também assistir aos cortes, à leitura e ao CTA. O relatório automático não substitui a revisão no celular.

## A. Núcleo operacional para Reels e motion — 15

| # | Skill | O que faz | Decisão de uso |
| ---: | --- | --- | --- |
| 01 | [`video-editing`](../skills/video-editing/SKILL.md) | Orquestra ingestão, transcrição, cortes, reenquadramento, áudio, render e entrega. | **Entrada principal** de qualquer edição. |
| 02 | [`hypit`](../skills/hypit/SKILL.md) | Direção e produção detalhadas, componentes, SVML/SVS, voz, captions, mix e review. | **Consulta avançada**; usar somente os módulos pertinentes. |
| 03 | [`motion-design`](../skills/motion-design/SKILL.md) | Motion em Remotion, easing, coreografia, karaokê, split screen e transições. | **Usar na composição** e nos momentos de ênfase. |
| 04 | [`reels-viral`](../skills/reels-viral/SKILL.md) | Estrutura 9:16, ritmo, superlegendas, progresso e CTA. | **Usar no roteiro visual** de Reels/Shorts/TikTok. |
| 05 | [`captions`](../skills/captions/SKILL.md) | SRT/VTT, leitura, sincronia, karaokê e validação. | **Usar em toda entrega falada**, com SRT separado. |
| 06 | [`video-quality`](../skills/video-quality/SKILL.md) | Codec, fps, loudness, true peak, preto/congelamento e folha de contato. | **Usar no MP4 final**, não apenas no projeto. |
| 07 | [`motion-prompt`](../skills/motion-prompt/SKILL.md) | 168 efeitos nomeados, specs, Canvas, prompts, CLI e galeria; curadorias locais de 68 e 96. | **Consultar e testar** conforme o efeito; portar ao runtime do projeto. |
| 08 | [`temporal-reel`](../skills/temporal-reel/SKILL.md) | Funções puras do tempo, câmera, tipografia, máscaras, Chromium headless, 60 fps e FFmpeg. | **Usar no render quadro a quadro determinístico** e na prova reversa de hashes. |
| 09 | [`hyperframes`](../skills/hyperframes/SKILL.md) | Contrato HTML→vídeo, cenas, timelines pausadas, mídia, Studio e revisão. | **Ler primeiro ao usar HyperFrames**; aplicar o perfil local vertical/60 fps. |
| 10 | [`hyperframes-cli`](../skills/hyperframes-cli/SKILL.md) | Init, check, snapshot, preview, render, timeline, histórico e manutenção. | **Usar pelo launcher pinado** em `hyperframes/`. |
| 11 | [`hyperframes-registry`](../skills/hyperframes-registry/SKILL.md) | Blocos e componentes editáveis, busca e instalação pelo registry. | **Consultar antes de recriar visuais**; 448 itens no snapshot local. |
| 12 | [`media-use`](../skills/media-use/SKILL.md) | Mídia, voz, música, transcrição, tratamentos, LUTs e mix. | **Carregar quando houver mídia ou áudio**; revisar custos e credenciais. |
| 13 | [`figma`](../skills/figma/SKILL.md) | Assets, tokens, componentes e frames do Figma para vídeo. | Sob demanda, ao receber design ou link do Figma. |
| 14 | [`slideshow`](../skills/slideshow/SKILL.md) | Decks navegáveis, fragmentos, ramificação e apresentador. | Sob demanda; saída é deck, não MP4. |
| 15 | [`remotion-to-hyperframes`](../skills/remotion-to-hyperframes/SKILL.md) | Migração de Remotion e outras fontes para HyperFrames. | Sob demanda; comparar quadros com a origem. |

## B. Apoio ao fluxo, à qualidade e à manutenção — 10

| # | Skill | Finalidade | Relação com Reels |
| ---: | --- | --- | --- |
| 16 | [`frontend-design`](../recovered/Official/plugins/frontend-design/skills/frontend-design/SKILL.md) | Direção estética, tipografia e escolhas visuais intencionais. | Apoio indireto à hierarquia visual; não é editor de vídeo. |
| 17 | [`claude-automation-recommender`](../recovered/Official/plugins/claude-code-setup/skills/claude-automation-recommender/SKILL.md) | Recomenda automações, hooks, agents, skills, plugins e MCP. | Consultar quando o fluxo de edição precisar de automação. |
| 18 | [`claude-md-improver`](../recovered/Official/plugins/claude-md-management/skills/claude-md-improver/SKILL.md) | Audita e melhora arquivos de memória `CLAUDE.md`. | Manutenção do projeto; sem efeito direto no vídeo. |
| 19 | [`claude-security`](../recovered/Official/plugins/claude-security/skills/claude-security/SKILL.md) | Examina código/diffs e propõe correções verificadas. | Útil antes de executar código recuperado; revisar permissões primeiro. |
| 20 | [`playground`](../recovered/Official/plugins/playground/skills/playground/SKILL.md) | Cria exploradores HTML interativos com preview. | Pode apoiar configuradores de estilo; não necessário na demo. |
| 21 | [`skill-development`](../recovered/Official/plugins/plugin-dev/skills/skill-development/SKILL.md) | Explica estrutura, descrição e progressive disclosure de skills. | Referência para evoluir o núcleo de edição. |
| 22 | [`skill-creator`](../recovered/Official/plugins/skill-creator/skills/skill-creator/SKILL.md) | Cria, melhora e avalia skills e seus gatilhos. | Usar para futuras avaliações do fluxo de Reels. |
| 23 | [`project-artifact`](../recovered/Official/plugins/project-artifact/skills/project-artifact/SKILL.md) | Publica uma página de status de projeto com abas. | Comunicação de projetos grandes; depende de ferramenta específica. |
| 24 | [`session-report`](../recovered/Official/plugins/session-report/skills/session-report/SKILL.md) | Gera relatório HTML de sessões e consumo. | Observabilidade do trabalho, não pós-produção. |
| 25 | [`receipts`](../recovered/Official/plugins/receipts/skills/receipts/SKILL.md) | Resume uso e impacto a partir de transcripts locais. | Prestação de contas; não usar em vídeos sem necessidade. |

## C. Desenvolvimento de plugins e MCP — 9

Estas skills são referências de engenharia. Não devem ser carregadas numa edição comum de Reels.

| # | Skill | Finalidade | Situação |
| ---: | --- | --- | --- |
| 26 | [`agent-development`](../recovered/Official/plugins/plugin-dev/skills/agent-development/SKILL.md) | Estrutura e instruções de subagents. | Sob demanda |
| 27 | [`command-development`](../recovered/Official/plugins/plugin-dev/skills/command-development/SKILL.md) | Criação de slash commands e argumentos. | Sob demanda |
| 28 | [`hook-development`](../recovered/Official/plugins/plugin-dev/skills/hook-development/SKILL.md) | Hooks de eventos e automações de Claude Code. | Sob demanda; revisar comandos |
| 29 | [`mcp-integration`](../recovered/Official/plugins/plugin-dev/skills/mcp-integration/SKILL.md) | Integração MCP em plugins. | Sob demanda |
| 30 | [`plugin-settings`](../recovered/Official/plugins/plugin-dev/skills/plugin-settings/SKILL.md) | Configuração persistente de plugins. | Sob demanda |
| 31 | [`plugin-structure`](../recovered/Official/plugins/plugin-dev/skills/plugin-structure/SKILL.md) | Manifesto e arquitetura de plugins. | Sob demanda |
| 32 | [`build-mcp-app`](../recovered/Official/plugins/mcp-server-dev/skills/build-mcp-app/SKILL.md) | UI e widgets em servidores MCP. | Sob demanda |
| 33 | [`build-mcp-server`](../recovered/Official/plugins/mcp-server-dev/skills/build-mcp-server/SKILL.md) | Planeja e constrói servidores MCP. | Sob demanda |
| 34 | [`build-mcpb`](../recovered/Official/plugins/mcp-server-dev/skills/build-mcpb/SKILL.md) | Empacota servidores MCP para distribuição. | Sob demanda |

## D. Canais externos — 6

Os nomes `access` e `configure` se repetem por canal, mas os arquivos e políticas são distintos. Nenhum foi configurado ou executado nesta tarefa; tokens e credenciais não são necessários para editar a demo.

| # | Skill | Canal / função | Situação |
| ---: | --- | --- | --- |
| 35 | [`discord/access`](../recovered/Official/external_plugins/discord/skills/access/SKILL.md) | Discord: pareamento, allowlist e política de acesso. | Arquivada / sob demanda |
| 36 | [`discord/configure`](../recovered/Official/external_plugins/discord/skills/configure/SKILL.md) | Discord: configuração do canal e do bot. | Arquivada / sob demanda |
| 37 | [`imessage/access`](../recovered/Official/external_plugins/imessage/skills/access/SKILL.md) | iMessage: pareamento e política de acesso. | Arquivada / sob demanda |
| 38 | [`imessage/configure`](../recovered/Official/external_plugins/imessage/skills/configure/SKILL.md) | iMessage: estado e configuração do canal. | Arquivada / sob demanda |
| 39 | [`telegram/access`](../recovered/Official/external_plugins/telegram/skills/access/SKILL.md) | Telegram: pareamento, allowlist e grupos. | Arquivada / sob demanda |
| 40 | [`telegram/configure`](../recovered/Official/external_plugins/telegram/skills/configure/SKILL.md) | Telegram: configuração do canal e do bot. | Arquivada / sob demanda |

## E. Referências especializadas fora do fluxo de Reels — 7

| # | Skill | Finalidade | Decisão |
| ---: | --- | --- | --- |
| 41 | [`reverse-engineer-anything`](../recovered/Descompacto/skills/reverse-engineer-anything/SKILL.md) | Engenharia reversa baseada em evidências de artefatos. | Não usar para análise comum de código ou edição. |
| 42 | [`cardputer-buddy`](../recovered/Official/plugins/cwc-makers/skills/cardputer-buddy/SKILL.md) | Itera apps MicroPython em Cardputer já provisionado. | Hardware específico; fora do escopo. |
| 43 | [`m5-onboard`](../recovered/Official/plugins/cwc-makers/skills/m5-onboard/SKILL.md) | Detecta, grava firmware e provisiona dispositivos M5Stack/ESP32. | Hardware específico; não executar sem pedido explícito. |
| 44 | [`writing-hookify-rules`](../recovered/Official/plugins/hookify/skills/writing-rules/SKILL.md) | Escreve regras para o sistema Hookify. | Automação específica; não relacionada a gancho de vídeo. |
| 45 | [`math-olympiad`](../recovered/Official/plugins/math-olympiad/skills/math-olympiad/SKILL.md) | Resolve problemas de matemática de competição. | Fora do fluxo de vídeo. |
| 46 | [`math-proof/siege`](../recovered/Official/plugins/math-proof/skills/siege/SKILL.md) | Prova matemática em rodadas com workers e juiz. | Fora do fluxo; processo potencialmente longo. |
| 47 | [`math-proof/solo`](../recovered/Official/plugins/math-proof/skills/solo/SKILL.md) | Prova matemática em uma sessão, sem subagents. | Fora do fluxo de vídeo. |

## F. Exemplos de formato — 2

| # | Skill | Finalidade | Decisão |
| ---: | --- | --- | --- |
| 48 | [`example-command`](../recovered/Official/plugins/example-plugin/skills/example-command/SKILL.md) | Demonstra frontmatter e estrutura de skill invocada pelo usuário. | Manter como exemplo, não como ferramenta de edição. |
| 49 | [`example-skill`](../recovered/Official/plugins/example-plugin/skills/example-skill/SKILL.md) | Modelo de documentação e organização de skills. | Manter como referência de formato. |

## G. Duplicidade identificada — 1

| # | Entrada | Resultado | Decisão |
| ---: | --- | --- | --- |
| 50 | [`recovered/MOTION/skills/hypit`](../recovered/MOTION/skills/hypit/SKILL.md) | SHA-256 idêntico ao de `skills/hypit/SKILL.md`. | Preservar para proveniência; **usar apenas a cópia raiz** no fluxo ativo. |

## Regras de organização

- **Carregar por necessidade:** começar com `video-editing`; adicionar captions, motion ou QA conforme a etapa.
- **Evitar contexto duplicado:** não carregar simultaneamente as duas Hypits.
- **Desambiguar pelo caminho:** `access` e `configure` sempre devem incluir o canal.
- **Não confundir catálogo com instalação:** o conteúdo em `recovered/Official` permanece como referência; não está todo habilitado.
- **Revisar antes de executar:** código recuperado, hooks, tokens, downloads e comandos externos exigem avaliação própria.
- **Medir e assistir:** um Reels só está pronto quando o QA técnico passa e a revisão audiovisual confirma leitura, ritmo, áudio e CTA.

## H. Consolidação das referências soltas

A auditoria específica está em [`motion-library-audit.json`](motion-library-audit.json). Três cópias literais já tinham uma versão canônica no Motion Prompt: o README e as seleções de 68 e 96 efeitos. A cópia local redundante do README foi removida; as duas seleções da `main` não foram importadas novamente.

Na biblioteca de 703 registros, 11 grupos continham prompts idênticos. A consolidação resultou em **684 prompts únicos e 19 `alternate_references`**, preservando os 703 slugs e todos os metadados de origem. As 716 regras de `skill/MOVIMENTO.md` têm IDs únicos e nenhuma linha duplicada. Resultado da auditoria: **18/18 verificações aprovadas e nenhuma duplicidade exata entre os 19 documentos soltos**.
