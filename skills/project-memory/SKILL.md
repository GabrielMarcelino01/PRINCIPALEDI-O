---
name: project-memory
description: Memória persistente entre sessões inspirada no Claude-Mem (Folder Context + observações estruturadas no Git). Use no início de novas conversas para recuperar contexto e ao concluir mudanças relevantes para registrar decisões sem expor segredos.
---

# Memória Persistente do Projeto (`project-memory`)

Esta skill implementa no próprio repositório os pilares do [`thedotmack/claude-mem`](../CLAUDEMEM.md) que funcionam **tanto na Arena (nuvem/sandbox) quanto no Claude Code, Cursor e Codex locais**, sem depender de daemon externo, sem instalar binários de terceiros e sem custo de API.

## Regras de segurança

- **Nunca** registre senhas, tokens, chaves de API, cookies ou URLs privadas na memória.
- O utilitário `mem.mjs` remove automaticamente blocos `<private>...</private>` e padrões comuns de credenciais, mas revise sempre antes de salvar.
- Para usar o daemon completo do `claude-mem` em máquina local (Bun + SQLite + hooks do Claude Code), consulte `skills/CLAUDEMEM.md` antes de rodar qualquer instalador.

## 1. Ao iniciar uma sessão

1. Leia `CLAUDE.md` na raiz e, se for editar o funil, `funil/CLAUDE.md`.
2. Consulte o histórico recente ou pesquise um tema específico:

```bash
node skills/project-memory/scripts/mem.mjs recent --limit 10
node skills/project-memory/scripts/mem.mjs search "vercel"
node skills/project-memory/scripts/mem.mjs search "carrossel"
```

## 2. Ao concluir uma entrega ou decisão importante

Registre uma observação enxuta e atualize os arquivos `CLAUDE.md` de contexto:

```bash
node skills/project-memory/scripts/mem.mjs add \
  --type feature \
  --scope funil \
  --title "Resumo curto da entrega" \
  --summary "Explicação objetiva do que mudou, decisões técnicas e cuidados." \
  --files "funil/index.html,funil/assets/js/quiz.js"

node skills/project-memory/scripts/mem.mjs sync
```

Tipos aceitos em `--type`: `architecture`, `feature`, `bugfix`, `decision`, `discovery`.
