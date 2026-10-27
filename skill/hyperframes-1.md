Hiperquadros

versão npm downloads do npm Licença Node.js Discórdia

Escreva HTML. Renderize vídeo. Desenvolvido para agentes.

Estúdio | Início Rápido | Apresentação | Área de Testes | Catálogo | Documentação | Discord

O aplicativo HyperFrames abre diretamente do Dock: agora disponível nativamente para Mac e Linux.

O HyperFrames é um framework de código aberto para converter HTML, CSS, mídia e animações com busca em vídeos MP4 determinísticos. Use-o localmente com a linha de comando, a partir de agentes de IA com habilidades específicas ou como o núcleo de renderização por trás de fluxos de trabalho de autoria hospedados.

Está usando o Claude Code, Codex, Cursor ou outro agente de codificação? Execute o comando npx hyperframes skills updateuma vez e, em seguida, peça ao seu agente para criar um vídeo.

Início rápido
Com um agente de codificação de IA
Para o Claude Code, instale o plugin versionado:

claude plugin marketplace add heygen-com/hyperframes
claude plugin install hyperframes@hyperframes
Para habilitar a atualização automática do marketplace de hyperframes , execute o seguinte comando claudeem um terminal no seu projeto. Na interface de terminal do Claude Code, execute o comando /plugin, selecione Marketplaces → hyperframes → Enable auto-update . Em seguida, use o comando /hyperframes:hyperframes. Consulte o guia de plugins para obter informações sobre atualizações e migração para Copilot, VS Code, Cursor, Gemini CLI.

Para habilidades independentes (incluindo OpenCode), use:

npx skills add heygen-com/hyperframes
O seletor abre sem nada pré-selecionado — o grupo Core Skills é tudo o que você precisa; /slideshowinstale /remotion-to-hyperframes- /figmao sob demanda. Agentes e execuções não interativas devem usar ` npx hyperframes skills update--enable-set-core-set` em vez de `--enable-set-core-set` — ele instala exatamente o conjunto principal, enquanto ` skills add --all--enable-set-core-set` instala todas as 7 habilidades publicadas. As seis habilidades internas do repositório em .claude/skills`/` .agents/skillssão excluídas por padrão. Para o conjunto completo de habilidades publicadas, use `--enable-set-core-set` npx hyperframes skills.

skills addResolve o blob de registro skills.sh, que pode levar mainhoras para atualizar. npx hyperframes skills updateInstala a partir da versão atual main, então use-o quando precisar da cópia mais recente de uma habilidade.

Execute instalações locais do projeto a partir do diretório do seu projeto de vídeo. A partir de um checkout do HyperFrames, use npx hyperframes skills updatepara uma instalação global: um alvo de instalação local do projeto pode sobrepor-se à skills/origem rastreada e sobrescrever edições não confirmadas. Consulte a configuração do colaborador .

Experimente uma sugestão como:

Utilizando essa ferramenta /hyperframes, crie uma introdução de produto de 10 segundos com um título que aparece gradualmente, um vídeo de fundo e uma música de fundo suave.

As habilidades ensinam aos agentes o ciclo de produção do HyperFrames: planejar o vídeo, escrever HTML válido, integrar animações com busca, adicionar mídia, verificar a sintaxe, visualizar e renderizar. Elas funcionam com Claude Code, Codex, Cursor, Gemini CLI, IBM Bob e outros agentes de codificação que oferecem suporte a habilidades.

Habilidades
O HyperFrames oferece 7 habilidades. Crie qualquer vídeo, basta solicitar; a /hyperframeshabilidade inclui o contrato e as referências (filmagem, legendas, sobreposições, movimento, estilo). Leia tudo primeiro.

Para instalação independente, use o conjunto principal ( /hyperframes, /hyperframes-cli, /hyperframes-registry, /media-use). npx hyperframes skills updateO comando instala exatamente isso de qualquer lugar; o seletor interativo ( npx skills add heygen-com/hyperframes) lista-o como o grupo "Habilidades Essenciais", sem nada pré-selecionado. O seletor é somente interativo — uma execução não interativa ou de agente sem o --skillcomando instala todos os 7 itens. Use o npx skills add heygen-com/hyperframes --allcomando para instalar o conjunto completo publicado deliberadamente (ignora o seletor) ou npx skills add heygen-com/hyperframes --skill <name>para instalar apenas um item (nome simples, sem o prefixo /).

As instalações independentes permanecem enxutas depois disso: npx hyperframes initinstalam o conjunto principal apenas quando ele estiver faltando e nunca alteram uma habilidade que você já possui ( apenas npx hyperframes skills updateas atualizam e nunca removem nenhuma); /figmae instalam sob demanda . Nada baixa novamente o conjunto completo sem o seu conhecimento./slideshow/remotion-to-hyperframesnpx hyperframes skills update <name>

Pacotes de plugins
Os plugins incluem o catálogo completo de habilidades e utilizam o gerenciador de atualizações do agente. O plugin bun run package:agent-plugingera o arquivo ZIP portátil, os metadados de origem e o checksum SHA-256. Consulte a lista de verificação do mantenedor .

Enviar para o Codex
Crie o arquivo de plugin do Codex pronto para upload a partir da HEADversão confirmada do manifesto, dos ativos da marca e das habilidades:

bun run package:codex-plugin
Este método grava dist/hyperframes-plugin.zipa partir de uma hyperframes/pasta raiz e falha se o arquivo exceder o limite de upload de 100 MB do Codex.

Conjunto básico
Habilidade	Use quando
/hyperframes	Leia primeiro este documento para qualquer solicitação de criação, edição, animação ou renderização de vídeo, motion graphics, legendas ou sobreposições com HyperFrames (HTML renderizado em vídeo). Ele contém o contrato de renderização e o fluxo de trabalho, além de indicar as referências para formato, movimento, aparência, legendas, filmes completos e storyboards.
/hyperframes-cli	A CLI do HyperFrames por tarefa — estruturar, verificar, visualizar quadros, editar a linha do tempo, pré-visualizar, renderizar localmente ou na nuvem, publicar, histórico do projeto — além de ler seu JSON e recuperar-se de falhas de compilação ou renderização.
/hyperframes-registry	Aproximadamente 450 blocos e componentes prontos para uso, instalados como código-fonte editável — transições, sobreposições, títulos, texto cinético, legendas, gráficos, mapas, 3D, movimentos de câmera. Use antes de criar manualmente qualquer elemento visual nomeado; também para hyperframes adde catalog.
/media-use	Crie ou obtenha qualquer tipo de mídia para um vídeo — música, efeitos sonoros, imagens, ícones, logotipos, narração, avatar e vídeo gerado automaticamente, transcrições, recortes, correções de cor e efeitos visuais — com o HeyGen ou ferramentas locais gratuitas, e mixe o áudio inserido. Também funciona para filmagens que parecem escuras, sem brilho ou sem vida.
Sob demanda
Habilidade	Use quando
/figma	Integre o Figma a um vídeo — recursos renderizados, tokens de marca, componentes, quadros de storyboard como movimento reconstruído, shaders e movimento assistido por conectores. Use ao colar um link do figma.com.
/slideshow	Uma apresentação, deck de apresentação ou deck interativo — slides discretos, revelação de fragmentos, ramificação, navegação por pontos de interesse, modo apresentador com anotações do orador. A saída é um deck navegável, não um MP4 renderizado.
/remotion-to-hyperframes	Importação de código ou filmagens de vídeo existentes para o HyperFrames (primeiro com Remotion; também com Motion Canvas, Lottie, Three.js, canvas e renderizações de outras ferramentas), verificadas quadro a quadro.
Para fluxos de trabalho de transferência de design visual, consulte o guia Claude Design e o guia Open Design .

Manualmente com a CLI
npx hyperframes init my-video
cd my-video
npx hyperframes preview      # preview in browser with live reload
npx hyperframes render       # render to MP4
Requisitos: Node.js 22+, FFmpeg

O que você pode construir
Precisa de ideias? Navegue pela Vitrine para ver vídeos finalizados que você pode assistir, ler, reproduzir e remixar.

Vídeos de lançamento de produtos e anúncios de recursos
Apresentações passo a passo de RP com diferenças de código animadas, narração e legendas.
Visualizações de dados, corridas de gráficos e animações de mapas.
Vídeos para redes sociais com legendas dinâmicas, sobreposições e música.
Documentos convertidos em vídeo, PDFs convertidos em vídeo e visitas guiadas ao local.
Gráficos em movimento reutilizáveis ​​para fluxos de trabalho de conteúdo automatizados.
Frame.md
frame.md — seu sistema de design, pronto para vídeo.

Toda marca tem um design.md. Nenhum deles foi escrito para uma câmera. frame.mdé a camada de tradução que faltava: pega a especificação de design do seu contexto web e a inverte para o formato frame — os mesmos tokens, as mesmas regras, mas reescritos para que um agente de IA possa compor um vídeo promocional sem ter que adivinhar a escala ou recorrer ao navegador.

O resultado é um DESIGN.mdsuperconjunto que toda a sua cadeia de ferramentas pode ler. Os átomos permanecem sagrados. A composição permanece livre. Os números vêm do script.

Bienal Amarela
Bienal Amarela	Quadro de blocos
Quadro de blocos
Profissional Azul
Profissional Azul	Pôster em negrito
Pôster em negrito
Broadside
Broadside	Cápsula
Cápsula
cartesiano
cartesiano	Grade de Cobalto
Grade de Cobalto
Coral
Coral	Modo Criativo
Modo Criativo
Navegue e remix todos eles em hyperframes.dev/design .

Como funciona
Defina um vídeo como HTML. Adicione atributos de dados para tempo e faixas. Use GSAP, CSS, Lottie, Three.js, Anime.js, WAAPI ou seu próprio adaptador de quadros para animação com busca.

<div id="stage" data-composition-id="launch" data-start="0" data-width="1920" data-height="1080">
  <video
    class="clip"
    data-start="0"
    data-duration="6"
    data-track-index="0"
    src="intro.mp4"
    muted
    playsinline
  ></video>

  <h1 id="title" class="clip" data-start="1" data-duration="4" data-track-index="1">Launch day</h1>

  <audio
    data-start="0"
    data-duration="6"
    data-track-index="2"
    data-volume="0.5"
    src="music.wav"
  ></audio>

  <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.from("#title", { opacity: 0, y: 40, duration: 0.8 }, 1);
    window.__timelines = window.__timelines || {};
    window.__timelines.launch = tl;
  </script>
</div>
Visualize instantaneamente no navegador. Renderize localmente ou em um contêiner Docker. O renderizador busca cada quadro no Chrome sem interface gráfica e codifica o resultado com o FFmpeg, de modo que a mesma entrada produza o mesmo vídeo.

Pilha de HyperFrames
O HyperFrames é um mecanismo de renderização de código aberto, além de um conjunto crescente de ferramentas para criação de vídeos nativos em HTML.

Pedaço	Status	O que faz
CLI	Disponível	Crie estruturas, visualize, verifique erros, inspecione e renderize projetos de vídeo locais.
Núcleo / Motor / Produtor	Disponível	Analise composições, execute o Chrome sem interface gráfica, codifique vídeo e mixe áudio.
Catálogo	Disponível	Blocos e componentes reutilizáveis ​​para transições, sobreposições, legendas, gráficos, mapas e efeitos.
Habilidades do agente	Disponível	Ensine aos agentes de programação os padrões de produção de vídeo que a documentação genérica da web não aborda.
Estúdio	Disponível, em evolução	Interface do navegador para pré-visualizar e editar composições.
Renderização do AWS Lambda	Disponível	Implante uma pilha de renderização distribuída e execute renderizações a partir do seu laptop ou CI.
hyperframes.dev	Disponível	Ambiente comunitário para pré-visualização, iteração, compartilhamento e renderização de projetos de vídeo nativos em HTML.
frame.md	Disponível	Inverta seu sistema de design para a câmera — um superconjunto DESIGN.md a partir do qual um agente pode compor vídeos.
Catálogo
Instale blocos e componentes prontos para uso:

npx hyperframes add flash-through-white   # shader transition
npx hyperframes add instagram-follow      # social overlay
npx hyperframes add data-chart            # animated chart
Consulte o catálogo em hyperframes.heygen.com/catalog .

Por que usar HyperFrames?
HTML nativo: as composições são arquivos HTML com atributos de dados. Sem necessidade de React, sem formato de linha do tempo proprietário.
Amigável ao agente: os agentes já escrevem HTML e a CLI não é interativa por padrão.
Determinístico: mesma entrada, mesmos quadros, mesma saída. Desenvolvido para integração contínua, testes de regressão e renderização automatizada.
Sem etapa de compilação: uma index.htmlcomposição é reproduzida tal como está e pode ser visualizada diretamente no navegador.
Animação baseada em adaptadores: utilize GSAP, animações CSS, Lottie, Three.js, Anime.js, WAAPI ou um ambiente de execução personalizado.
Código aberto: Licença Apache 2.0, sem taxas por renderização ou limites para uso comercial.
HyperFrames vs Remotion
O HyperFrames foi inspirado no Remotion . Ambas as ferramentas renderizam vídeo com Chrome sem interface gráfica e FFmpeg. A principal diferença reside no modelo de autoria: a aposta do Remotion são os componentes React; a do HyperFrames é o HTML puro, que pode ser escrito facilmente tanto por humanos quanto por agentes.

Hiperquadros	Remoção
Autoria	HTML + CSS + animação de busca	Componentes React
Etapa de construção	Nenhum; index.htmlfunciona como está.	É necessário um agrupador.
Transferência de agente	Arquivos HTML simples	Projeto JSX / React
Animações de relógio de biblioteca	Busca possível, com precisão de quadros através de adaptadores.	Os padrões de animação de relógios de parede precisam de cuidado.
Renderização distribuída	Caminhos de renderização locais e do AWS Lambda	Remotion Lambda, renderizador de nuvem maduro
Licença	Apache 2.0	Licença de remoção disponível na fonte
Leia a comparação completa no guia HyperFrames vs Remotion .

Documentação
Documentação completa: hyperframes.heygen.com/introduction

Início rápido
Vitrine
Guias
Referência da API
Catálogo
Exemplos
Renderização do AWS Lambda
Pacotes
Pacote	Descrição
hyperframes	Interface de linha de comando (CLI) para criar, visualizar, verificar e renderizar composições.
@hyperframes/core	Tipos, analisadores sintáticos, geradores, analisador lógico, tempo de execução e adaptadores de quadros.
@hyperframes/engine	Mecanismo de captura de página para vídeo com recurso de busca, utilizando Puppeteer e FFmpeg.
@hyperframes/producer	Pipeline de renderização completo para captura, codificação e mixagem de áudio.
@hyperframes/studio	Interface de usuário do editor de composição baseado em navegador
@hyperframes/player	<hyperframes-player>Componente web incorporável
@hyperframes/shader-transitions	Transições de shader WebGL para composições
@hyperframes/aws-lambda	SDK do AWS Lambda e superfície de implantação para renderizações distribuídas
Comunidade
O HyperFrames é usado em produção na HeyGen , com exemplos da comunidade de equipes como tldraw , TanStack e outras, que podem ser consultados em ADOPTERS.md . Abra um PR se sua equipe estiver usando o HyperFrames.

Perguntas e ideias: Discord
Problemas e solicitações de recursos: Problemas no GitHub
Pesquisa de usuários: Agende uma conversa informal de 30 minutos com a equipe da HyperFrames — sem preparação ou apresentação de vendas.
Relatórios de segurança: SECURITY.md
Contribuições: CONTRIBUTING.md
Nota de Desenvolvimento
O repositório utiliza o Git LFS para as linhas de base de testes de regressão packages/producer/tests/**/output.mp4(cerca de 240 MB de .mp4arquivos). Se você estiver clonando o repositório completo para desenvolvimento, instale o Git LFS primeiro:

# macOS
brew install git-lfs

# Ubuntu / Debian
sudo apt install git-lfs

# Windows
winget install GitHub.GitLFS

# Then, once per machine
git lfs install
Se você precisar apenas dos arquivos de origem, pode ignorar o conteúdo do LFS:

GIT_LFS_SKIP_SMUDGE=1 git clone https://github.com/heygen-com/hyperframes.git
Licença
Apache 2.0
