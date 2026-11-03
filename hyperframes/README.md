# HyperFrames — ambiente canônico

HyperFrames **0.8.206** instalado localmente para criar composições HTML editáveis no Studio e renderizar MP4. O runtime, as sete skills e os metadados do registry vêm da mesma revisão upstream: tag `v0.8.206`, commit `85fdc9aa888b4d26c8150fd09acae7b23fb392f5`.

## Organização

| Caminho | Função |
| --- | --- |
| [`../skill/hyperframes-1.md`](../skill/hyperframes-1.md) | Documento em português enviado pelo usuário, preservado literalmente como referência. |
| [`../skills/hyperframes`](../skills/hyperframes/SKILL.md) | Contrato de composição e direção de vídeo. |
| [`../skills/hyperframes-cli`](../skills/hyperframes-cli/SKILL.md) | Comandos do CLI. |
| [`../skills/hyperframes-registry`](../skills/hyperframes-registry/SKILL.md) | Descoberta e instalação de blocos/componentes. |
| [`../skills/media-use`](../skills/media-use/SKILL.md) | Mídia, voz, música, transcrição e tratamentos. |
| [`../skills/figma`](../skills/figma/SKILL.md), [`../skills/slideshow`](../skills/slideshow/SKILL.md), [`../skills/remotion-to-hyperframes`](../skills/remotion-to-hyperframes/SKILL.md) | Módulos sob demanda. |
| `package.json` + `package-lock.json` | CLI 0.8.206, Chromium 153, FFmpeg e FFprobe pinados. |
| `scripts/hyperframes.mjs` | Launcher local, sem instalação global, com telemetria desativada. |
| `registry-metadata/` | 456 manifests oficiais para descoberta offline; não contém os componentes em si. |
| `smoke/` | Composição técnica vertical de 3 s, sem áudio e sem mídia de cliente. |
| `reports/` | Evidências dos comandos e da revisão por quadros. |
| [`provenance.json`](provenance.json) | Origem, hashes e escopo de cada importação. |
| [`../recovered/motion-2/hyperframes`](../recovered/motion-2/hyperframes/package.json) | Integração histórica separada, ainda em 0.8.33; não foi alterada. |

As sete skills também estão expostas em `.agents/skills`, `.claude/skills` e `.codex/skills`.

## Instalação reproduzível

Requisito local: **Node.js 22.17 ou superior** (o HyperFrames exige 22+, e o Chromium pinado exige 22.17+). A partir da raiz do repositório:

```bash
npm ci --prefix hyperframes --ignore-scripts --no-audit --no-fund
npm run --prefix hyperframes hf -- --version
npm run --prefix hyperframes doctor
```

Não é necessário instalar `hyperframes` globalmente. O launcher fornece FFmpeg, FFprobe e Chromium do lockfile e define:

- `HYPERFRAMES_NO_TELEMETRY=1`;
- `HYPERFRAMES_SKIP_SKILLS=1`, para não atualizar nem substituir as skills;
- `HYPERFRAMES_NO_UPDATE_CHECK=1`, para manter a execução pinada;
- `HF_NO_BROWSER=1`, para não abrir um navegador do sistema automaticamente.

Variáveis explícitas do ambiente continuam tendo precedência. O `doctor` pode informar `ok: false` por recursos opcionais ausentes. Nesta instalação, Node, FFmpeg, FFprobe e Chrome passaram; Whisper, Kokoro, MusicGen e Docker não são necessários para o smoke test.

## Usar o smoke test ou abrir o Studio

```bash
npm run --prefix hyperframes check:smoke
npm run --prefix hyperframes snapshot:smoke
npm run --prefix hyperframes render:smoke
npm run --prefix hyperframes preview:smoke
```

O Studio abre em `http://localhost:3002/#project/smoke`. O script `preview:smoke` define `HYPERFRAMES_PREVIEW_HOST=0.0.0.0` para a preview da Arena; em uma sessão publicada, usar a URL HTTPS da porta 3002 fornecida pela plataforma. O MP4 técnico vai para `hyperframes/out/HYPERFRAMES-SMOKE.mp4`; `out/`, `node_modules/` e `.hyperframes/` ficam fora do Git.

O smoke tem **1080×1920, 60 fps, 180 quadros e 3 segundos**. Não é um Reel de cliente nem um master de entrega. Seu contrato e seus arquivos estão em [`smoke/README.md`](smoke/README.md).

## Criar um projeto

```bash
cd hyperframes
node scripts/hyperframes.mjs init meu-video --resolution portrait --non-interactive --skip-skills
cd meu-video
node ../scripts/hyperframes.mjs check
node ../scripts/hyperframes.mjs preview --foreground --port 3002 --no-open
node ../scripts/hyperframes.mjs render --fps 60 --workers 1 --no-browser-gpu --strict-all
```

O `init` também cria scripts de projeto com o CLI pinado. Neste repositório, prefira chamar `../scripts/hyperframes.mjs` para reutilizar os binários locais e a política de telemetria do ambiente canônico.

Para Reels deste repositório, manter **1080×1920 a 60 fps**, movimento dirigido por uma timeline pausada/função pura do tempo, captura headless e montagem do MP4 pelo FFmpeg. Os defaults de landscape/30 fps da documentação upstream não substituem esse perfil. Antes da entrega, revisar quadros e usar `video-quality`; para uma entrega falada, incluir também `captions`.

## Registry com descoberta offline

O snapshot contém `registry.json` e os 456 `registry-item.json` da tag 0.8.206: **448 blocos/componentes utilizáveis e 8 exemplos**. Para alimentar o cache de descoberta do CLI sem baixar os 106 MB de fontes do registry:

```bash
npm run --prefix hyperframes registry:seed
cd hyperframes/smoke
node ../scripts/hyperframes.mjs catalog --query "bottom-up-letters" --json
```

A busca lexical é local e não envia a consulta. A instalação é outra operação:

```bash
node ../scripts/hyperframes.mjs add bottom-up-letters --json
```

`hyperframes add` precisa baixar os arquivos do item por HTTPS, mesmo quando o manifesto está em cache. O host `raw.githubusercontent.com` não está liberado neste sandbox, portanto **a instalação pelo `add` não foi validada aqui**; busca, check, snapshots e render local foram validados. Em um ambiente com acesso ao registry upstream, o `add` usa a revisão pinada em `smoke/hyperframes.json`.

A busca semântica `--on-device` não foi instalada: exige um download adicional de aproximadamente 33 MB e decisão explícita do usuário.

## Validação executada

| Verificação | Resultado |
| --- | --- |
| CLI | 0.8.206 pelo launcher local |
| Check estrito no Chromium | `ok: true`; zero erros e zero warnings |
| Layout/contraste/craft | 9 amostras de layout; 35/35 contrastes; 24 amostras de craft |
| Revisão do projeto | 4 instantes; uma seta sem glifo foi detectada, corrigida e recapturada |
| Render | H.264, 1080×1920, 60 fps, 180 quadros, 3 s, sem áudio intencional |
| QA do MP4 | Zero falhas; um aviso intencional de ausência de áudio; sem preto/congelamento |
| Determinismo | Dois renders: 180/180 quadros decodificados idênticos e MP4s byte a byte idênticos |
| SHA-256 de cada MP4 de teste | `63f30eeaa2f139c8876471d2a059c90c66dda5956b6052165eb629ac28d72173` |
| Registry | 448 itens; `bottom-up-letters` retornado na busca local |
| Auditoria da integração | 32/32 verificações aprovadas |

Relatórios: [`smoke-check.json`](reports/smoke-check.json), [`smoke-doctor.json`](reports/smoke-doctor.json), [`registry-search.json`](reports/registry-search.json), [`smoke-probe.json`](reports/smoke-probe.json), [`smoke-video-qa.json`](reports/smoke-video-qa.json), [`smoke-determinism.json`](reports/smoke-determinism.json) e [`smoke-review.json`](reports/smoke-review.json). A [folha de contato codificada](reports/smoke-encoded-contact-sheet.jpg) registra os quadros 0, 30, 90 e 177.

A revisão foi **por quadros e por decodificação**, não por playback ou escuta integral. O vídeo de teste não tem áudio.

## Auditorias

```bash
python3 scripts/audit_hyperframes.py
python3 scripts/audit_skills.py --strict
python3 scripts/audit_motion_library.py
```

A auditoria específica verifica hashes das skills e dos manifests, 21 symlinks, pins, documento original, GSAP local, integração histórica e evidências do render. O resultado está em [`../docs/hyperframes-audit.json`](../docs/hyperframes-audit.json).

## Atualizações, serviços e licenças

Não executar `hyperframes skills update` nem trocar o pin automaticamente. Uma atualização deve ser deliberada e vir acompanhada de novo check/render, revisão de compatibilidade e atualização de `provenance.json`. A integração 0.8.33 em `recovered/motion-2` permanece isolada até um teste específico de compatibilidade.

Nenhuma conta HeyGen, publicação, nuvem, Figma ou credencial é necessária para o fluxo local validado. Esses serviços opcionais não foram configurados ou executados.

- HyperFrames: Apache-2.0; texto em [`LICENSE`](LICENSE).
- GSAP 3.15.0: licença padrão “no charge”, com cabeçalho de copyright preservado em `smoke/assets/gsap.min.js`.
- Origem e hashes completos: [`provenance.json`](provenance.json).
