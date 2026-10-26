# Proveniência e limites da recuperação

Data da recuperação: **26 de outubro de 2026**.

## Método

1. A conta `GabrielMarques181920` e os URLs antigos foram consultados no GitHub e já retornavam `404 / Repository not found`.
2. O índice público de busca ainda preservava nomes, descrições, partes dos READMEs, a estrutura de `motion-2` e o PR da Arena `motion-2#2`.
3. As descrições foram comparadas com projetos públicos para localizar as origens.
4. Os arquivos foram exportados diretamente de commits Git das origens identificadas, sem executar seus instaladores.
5. Licenças, avisos de terceiros, documentação e links simbólicos dos snapshots foram preservados.

## Fontes e commits

| Destino | URL antiga identificada | Fonte usada | Commit |
| --- | --- | --- | --- |
| `MOTION/` | `GabrielMarques181920/MOTION` | https://github.com/hypit-ai/hypit | `e26d9142fd8a6f78bf4f3cdb800d6205f4ecca16` |
| `motion-2/` | `GabrielMarques181920/motion-2` | https://github.com/blixvip/MotionClone | `9fba71f5bad421513a1afc94d2ffecc595928f94` |
| `Official/` | `GabrielMarques181920/Official` | https://github.com/anthropics/claude-plugins-official | `58267944f92187b7d6a1c822165c96c81c864806` |
| `COMPLETO/` | `GabrielMarques181920/COMPLETO` | https://github.com/tashfeenahmed/freellmapi | `22b7ec74a09892d3efdb9107ec3e74c764dd71a1` |
| `Descompacto/` | `GabrielMarques181920/Descompacto` | https://github.com/morluto/rea | `76e7e510bb2d7d37728ca50749d524beb5890cf8` |

O commit do REA pertence ao repositório canônico `morluto/rea`; uma cópia pública desse mesmo snapshot ajudou a confirmar a estrutura. O conteúdo importado foi exportado do repositório canônico.

## Reconstruções da Arena

O PR público indexado `GabrielMarques181920/motion-2#2`, da branch `arena/e942898a-motion-2`, mostrava:

- commit curto `2e8078c`: skill/composição de motion design;
- merge curto `2e169ac`;
- uma segunda alteração de Reels vertical com superlegenda;
- nomes de arquivos, resolução, fps e recursos das composições.

Como o repositório e os objetos desses commits não estão mais disponíveis, os seguintes arquivos foram **reimplementados a partir dessas descrições**:

- `motion-2/remotion/src/MotionDesignComposition.jsx`;
- `motion-2/remotion/src/ReelsViralComposition.jsx`;
- `motion-2/remotion/src/design.jsx` e `design-utils.mjs`;
- opções autônomas em `motion-2/remotion/render.mjs`;
- documentação em português, testes e skills na pasta raiz `/skills`.

Esses arquivos não devem ser apresentados como o código exato produzido na conversa anterior.

## O que não foi possível recuperar

- o histórico Git completo e os metadados da conta excluída;
- arquivos privados, anexos e repositórios que não deixaram rastro público;
- o vídeo `Untitled_Scene_10-25_20_12_37_20261025171936.mp4`, cujo nome aparecia no antigo `motion-2`, mas cujo conteúdo não estava acessível;
- eventuais modificações locais feitas na outra conversa que não foram mencionadas no PR indexado;
- garantia de que os snapshots upstream são byte a byte iguais aos das cópias antigas.

A Arena não disponibilizou nesta sessão uma ferramenta para abrir outro bate-papo. Se houver um link compartilhável ou ZIP da sessão antiga, ele poderá ser usado para uma comparação posterior.

## Licenças e segurança

Cada projeto permanece sujeito à sua própria licença e avisos. A agregação neste repositório não substitui essas condições nem concede direitos adicionais. O MotionClone não apresentava uma licença raiz no snapshot importado; seu `THIRD_PARTY.md` foi mantido e a redistribuição deve ser avaliada antes de uso público ou comercial.

Nenhum código recuperado foi executado durante a importação. Por segurança, `COMPLETO/.claude/settings.local.json` foi omitido: o arquivo continha permissões locais de terminal do autor upstream e não é necessário ao projeto. O hook opcional e seu teste foram preservados, sem serem ativados.

Antes de instalar ou executar, revise scripts, dependências, permissões e serviços externos. Não armazene credenciais no Git nem as envie em chat.
