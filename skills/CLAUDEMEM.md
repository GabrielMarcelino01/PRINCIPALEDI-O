> ## Documentation Index
> Fetch the complete documentation index at: https://docs.claude-mem.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Introduction

> Persistent memory compression system for Claude Code

# Claude-Mem

**Persistent memory compression system for Claude Code**

Claude-Mem seamlessly preserves context across sessions by automatically capturing tool usage observations, generating semantic summaries, and making them available to future sessions. This enables Claude to maintain continuity of knowledge about projects even after sessions end or reconnect.

## Quick Start

Install with a single command:

```bash theme={null}
npx claude-mem install
```

Or install from the plugin marketplace inside Claude Code:

```bash theme={null}
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
```

Restart Claude Code. Context from previous sessions will automatically appear in new sessions.

## Key Features

* 🧠 **Persistent Memory** - Context survives across sessions
* 📁 **Folder Context Files** - Auto-generated `CLAUDE.md` in project folders with activity timelines
* 🌐 **Multilingual Modes** - Supports 28 languages (Spanish, Chinese, French, Japanese, etc.)
* 🎭 **Mode System** - Switch between workflows (Code, Email Investigation, Chill)
* 🔍 **MCP Search Tools** - Query your project history with natural language
* 🧠 **Knowledge Agents** - Build queryable "brains" from your observation history
* 🌐 **Web Viewer UI** - Real-time memory stream visualization served by the local worker
* 🔒 **Privacy Control** - Use [`<private>` tags](https://docs.claude-mem.ai/usage/private-tags) for manual blocks, or enable [auto-redaction](https://docs.claude-mem.ai/usage/auto-redaction.md) for regex-based secret detection.
* ⚙️ **Context Configuration** - Fine-grained control over what context gets injected
* 🤖 **Automatic Operation** - No manual intervention required
* 📊 **FTS5 Search** - Fast full-text search across observations
* 🔗 **Citations** - Reference past observations with IDs

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│ Session Start → Inject context from last 10 sessions       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ User Prompts → Create session, save user prompts           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Tool Executions → Capture observations (Read, Write, etc.)  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Worker Processes → Extract learnings via Claude Agent SDK   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Session Ends → Generate summary, ready for next session     │
└─────────────────────────────────────────────────────────────┘
```

**Core Components:**

1. **5 Lifecycle Hooks** - SessionStart, UserPromptSubmit, PostToolUse, Summary (Stop), SessionEnd
2. **Worker Service** - Express HTTP API managed by Bun on a per-user port (default `37700 + (uid % 100)`)
3. **SQLite Database** - Stores sessions, observations, summaries with FTS5 search
4. **Chroma Vector Index** - Optional embedding-based semantic search
5. **MCP / Skill Search Tools** - Query historical context with natural language
6. **Web Viewer UI** - Real-time visualization with SSE and infinite scroll

See [Architecture Overview](https://docs.claude-mem.ai/architecture/overview.md) for details.

## System Requirements

* **Node.js**: 20.0.0 or higher
* **Bun** ≥ 1.0 (auto-installed by `npx claude-mem install` if missing)
* **uv** (auto-installed if missing — provides Python for Chroma)
* **Claude Code** (or another supported IDE: Cursor, Windsurf, OpenCode, Codex CLI, Antigravity CLI, OpenClaw)
* **SQLite 3** — bundled via `bun:sqlite`

## Next Steps

> [card] [Installation](https://docs.claude-mem.ai/installation.md)
>
> Quick start & advanced installation

> [card] [Getting Started](https://docs.claude-mem.ai/usage/getting-started.md)
>
> Learn how Claude-Mem works automatically

> [card] [Folder Context](https://docs.claude-mem.ai/usage/folder-context.md)
>
> Auto-generated folder CLAUDE.md files

> [card] [Search Tools](https://docs.claude-mem.ai/usage/search-tools.md)
>
> Query your project history

> [card] [Knowledge Agents](https://docs.claude-mem.ai/usage/knowledge-agents.md)
>
> Build queryable corpora from your history


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.
