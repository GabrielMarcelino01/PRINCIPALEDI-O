# Proveniência do Motion Prompt

- **Projeto:** Motion Prompt, de Shohei Ohtaki.
- **Repositório upstream:** https://github.com/showheyohtaki/motion-prompt
- **Commit copiado:** `bd6bf08d8d412cc82c1bbc8f1a81638617a45cfb`.
- **Data da integração:** 26/10/2026.
- **Licença:** MIT; o arquivo original está em [`../LICENSE`](../LICENSE).
- **Avisos de terceiros:** preservados em [`../THIRD-PARTY-NOTICES.md`](../THIRD-PARTY-NOTICES.md).

## Conteúdo integrado

Foram preservados `SKILL.md`, o CLI, `api/v1`, `packs`, a galeria (`index.html`, `found.html` e `assets`), o guia de portabilidade, o README, o formato e os avisos de licença. A cópia tem 168 efeitos em sete pacotes.

Não foram integrados o diretório `.git`, o gerador `make-your-own` nem as ferramentas de desenvolvimento do upstream. Eles não são necessários para consultar, executar ou portar os efeitos publicados.

## Adaptações locais

1. `scripts/motion-prompt.mjs` procura `api/v1`, `index.html` e `assets` também na raiz desta skill. A busca compatível com a estrutura original foi mantida como alternativa.
2. A mensagem de erro de `pick --local` passou a aceitar a instalação autocontida.
3. A curadoria `68-picks.md`, estes documentos, os scripts de QA e os relatórios são adições locais.
4. Não foram alterados os códigos dos efeitos, os prompts ou o catálogo upstream.

As seleções foram fornecidas nos materiais do usuário e preservadas sem renumeração: 68 picks no commit `bda0cdf650ae15c2322deb64f68c69b3a61ac5ef` e 96 picks no commit `c048f6b6c21ec28c485516df6425c49447602e21`. Juntas, elas cobrem 164 IDs únicos; a validação de execução em `reports/validation.json` continua referente à seleção inicial de 68.
