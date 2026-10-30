# Motion Prompt — instalação local

Esta pasta contém uma cópia autocontida do **Motion Prompt**, com a skill, o CLI, a galeria e os dados dos **168 efeitos**. O CLI e a galeria funcionam sem baixar o catálogo novamente.

As curadorias recebidas estão em [`references/selections/68-picks.md`](references/selections/68-picks.md) e [`references/selections/96-picks.md`](references/selections/96-picks.md). Juntas, elas reúnem **164 efeitos únicos**, sem sobreposição; somente `#009`–`#012` ficam fora das duas seleções. A biblioteca completa continua disponível.

## Uso a partir da raiz do repositório

```bash
# Ver a instalação e a procedência dos dados
node skills/motion-prompt/scripts/motion-prompt.mjs info

# Listar, buscar e obter especificação + código
node skills/motion-prompt/scripts/motion-prompt.mjs list --pack motion
node skills/motion-prompt/scripts/motion-prompt.mjs search typewriter text
node skills/motion-prompt/scripts/motion-prompt.mjs get 1 45 72

# Prompt curto para orientar um gerador
node skills/motion-prompt/scripts/motion-prompt.mjs prompt 1

# Abrir a galeria local e selecionar efeitos
node skills/motion-prompt/scripts/motion-prompt.mjs pick --local
```

Os IDs da seleção são os mesmos do catálogo. Por exemplo, `#001` é Pop-in, `#006` é Typewriter e `#025` é Pan.

## Estrutura

- `SKILL.md`: instruções operacionais originais da skill.
- `scripts/motion-prompt.mjs`: CLI sem dependências npm, para Node 20+.
- `api/v1/`: catálogo, especificações, prompts e kits executáveis.
- `index.html`, `found.html`, `assets/`: galeria local.
- `packs/`: fontes originais dos sete pacotes.
- `references/porting.md`: guia de portabilidade para outros runtimes.
- `references/selections/68-picks.md` e `96-picks.md`: curadorias organizadas nesta tarefa.
- `scripts/validate_selection.py` e `scripts/run_canvas_smoke.cjs`: validação estática e smoke test dos Canvas.
- `reports/`: resultados das validações locais.

## Validação

Checagem estática, sem dependências externas:

```bash
python3 skills/motion-prompt/scripts/validate_selection.py
```

Teste real dos 68 Canvas, com Chromium e `puppeteer-core` disponíveis:

```bash
# Dependência apenas de QA; não é necessária para usar a skill ou a galeria.
npm install --prefix /tmp/motion-qa puppeteer-core@24.37.5
PUPPETEER_CORE=/tmp/motion-qa/node_modules/puppeteer-core \
  python3 skills/motion-prompt/scripts/validate_selection.py \
  --chromium /caminho/para/chromium
```

Resultados de 26/10/2026:

- seleção principal com 68 IDs únicos e catálogo com 168 elementos;
- segunda seleção com 96 IDs únicos; 164 IDs combinados, sem sobreposição ou arquivos ausentes;
- nenhum ID, prompt, especificação ou kit ausente na seleção principal;
- CLI validado com `info`, `list`, `search`, `get`, `prompt` e `kit`;
- **68/68 efeitos executados em Chromium**, cinco tempos por efeito, todos com quadros visíveis e determinismo confirmado;
- galeria local aberta com **168 cartões**, 169 Canvas e nenhum erro de página;
- auditoria geral: zero links locais ausentes e zero symlinks inválidos.

Os testes comprovam integridade e execução. Não constituem uma revisão estética individual de todos os efeitos nem certificam o resultado em outros runtimes sem adaptação.

Consulte [`reports/validation.json`](reports/validation.json), [`reports/gallery.json`](reports/gallery.json) e [`references/PROVENIENCIA.md`](references/PROVENIENCIA.md).
