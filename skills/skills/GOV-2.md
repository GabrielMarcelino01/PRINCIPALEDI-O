⚠️ Projeto independente. mcp-brasil NÃO é serviço oficial do governo brasileiro nem de nenhuma das instituições cujos dados ele torna acessível. A licença MIT cobre apenas o código — cada fonte de dado tem sua própria licença ( SOURCES.md ) e o uso do servidor está sujeito à Política de Uso Aceitável . Antes de uso comercial, jornalístico ou decisório, leia ambos .

Características
533 ferramentas em 70 funcionalidades abrangendo 15 áreas — economia, legislativa, transparência, judiciário, eleitoral, ambiental, saúde, educação, segurança pública, compras públicas, fiscal subnacional, aviação, energia e mais
Datasets grandes com cache local — SIAPA (~813k imóveis), TSE 2014-2024 (candidatos, bens, votação, redes sociais, FEFC), ANP preços de combustíveis, INEP Censo Escolar e ENEM, ISP-RJ segurança pública, ANAC aeronaves e voos regulares — SQL via DuckDB incorporado, opt-in via env
Referência cruzada com planejar_consulta— cria planos de execução combinando múltiplas APIs (ex: gastos de um deputado + votações + proposições)
Execução em lote com executar_lote— diferentes consultas em paralelo numa única chamada
Descoberta inteligente — BM25 search transform filtra 533 ferramentas para só mostrar os relevantes ao contexto
Registro automático — adicionar um recurso é criar uma pasta; manual de configuração zero
Assíncrono em todos os lugares — httpx async + Pydantic v2 + limitação de taxa com backoff
Início rápido
instalar
pip install mcp-brasil
uv add mcp-brasil
Antigravidade do Google
Adicione o bloco abaixo ao seu mcp_config.json— acessível em MCP Servers → Manage MCP Servers → View raw config , ou editando direto ~/.gemini/config/mcp_config.json(global) / .agents/mcp_config.json(workspace):

{
  "mcpServers": {
    "mcp-brasil": {
      "command": "uvx",
      "args": ["--from", "mcp-brasil", "python", "-m", "mcp_brasil.server"],
      "env": {
        "TRANSPARENCIA_API_KEY": "sua-chave-aqui",
        "DATAJUD_API_KEY": "sua-chave-aqui",
        "META_ACCESS_TOKEN": "seu-token-aqui"
      }
    }
  }
}
Claude Desktop
ao claude_desktop_config.json:

{
  "mcpServers": {
    "mcp-brasil": {
      "command": "uvx",
      "args": ["--from", "mcp-brasil", "python", "-m", "mcp_brasil.server"],
      "env": {
        "TRANSPARENCIA_API_KEY": "sua-chave-aqui",
        "DATAJUD_API_KEY": "sua-chave-aqui",
        "META_ACCESS_TOKEN": "seu-token-aqui"
      }
    }
  }
}
As chaves são propostas — sem elas, as 36 APIs permanecem funcionando normalmente.

VS Code / Cursor
Crie .vscode/mcp.jsonna raiz do projeto:

{
  "servers": {
    "mcp-brasil": {
      "command": "uvx",
      "args": ["--from", "mcp-brasil", "python", "-m", "mcp_brasil.server"],
      "env": {
        "TRANSPARENCIA_API_KEY": "sua-chave-aqui",
        "DATAJUD_API_KEY": "sua-chave-aqui",
        "META_ACCESS_TOKEN": "seu-token-aqui"
      }
    }
  }
}
Código Claude
claude mcp add mcp-brasil -- uvx --from mcp-brasil python -m mcp_brasil.server
HTTP (outros clientes)
fastmcp run mcp_brasil.server:mcp --transport http --port 8000
# Server disponível em http://localhost:8000/mcp
exemplos
Conecte o servidor e faça perguntas em linguagem natural:

Legislativo: "Quais projetos de lei sobre inteligência artificial tramitaram na Câmara em 2024? Quem foram os autores?"

Econômico: "Qual a tendência da taxa Selic nos últimos 12 meses? Compare com a inflação (IPCA) no mesmo período."

Transparência: "Quais os 10 maiores contratos do governo federal em 2024? Quem são os fornecedores?"

Referência cruzada: "Compare os gastos per capita com saúde em São Paulo e Minas Gerais cruzando dados do TCE-SP e IBGE."

Judiciário: "Busque processos sobre licitação irregular no TCU. Quais foram as deliberações aplicadas?"

Eleitoral: "Quais os maiores doadores da campanha do candidato X? Qual o total arrecadado?"

Fontes de dados
Economia e Finanças
Recurso	Fonte	Ferramentas
bacen	Banco Central — Selic, IPCA, câmbio, PIB e +190 séries temporais (SGS)	9
bcb_olinda	Banco Central — PTAX (câmbio oficial), Expectativas Focus, taxas de juros bancários	8
bndes	BNDES — operações de financiamento, desembolsos, instituições credenciadas	4
ipeadata	IPEADATA/Ipea — séries macro, regionais e sociais históricas (OData)	5
Geografia e Estatística
Recurso	Fonte	Ferramentas
ibge	IBGE — estados, municípios, nomes, agregados estatísticos	9
Legislativo e Executivo
Recurso	Fonte	Ferramentas
camara	Câmara dos Deputados — deputados, proposições, votações, despesas	11
senado	Senado Federal — senadores, matérias, votações, comissões	26
governadores	Governadores de todos os estados em exercício (nome, partido, mandato)	4
Transparência e Fiscalização
Recurso	Fonte	Ferramentas
transparencia	Portal da Transparência — contratos, despesas, servidores, avaliações, imóveis funcionais, renúncias fiscais, órgãos, COVID-19	54
tcu	Tribunal de Contas da União — acórdãos, inidôneos, subsídios, pautas	9
tce_sp	TCE-SP — despesas e receitas de 645 municípios paulistas	3
tce_rj	TCE-RJ — licitações, contratos, obras, deliberações, concessões	7
tce_rs	TCE-RS — educação, saúde, gestão fiscal (LRF)	5
tce_pe	TCE-PE — licitações, contratos, despesas, fornecedores	5
tce_ce	TCE-CE — licitações, contratos, compromissos	4
tce_es	TCE-ES — licitações, contratos, obras públicas	4
tce_rn	TCE-RN — jurisdicionados, licitações, contratos	5
tce_pi	TCE-PI — prefeituras, despesas, receitas	5
tce_sc	TCE-SC — municípios e unidades gestoras	2
tce_to	TCE-TO — processos, pautas de sessões	3
tce_pa	TCE-PA — Diário Oficial, sessões plenárias, jurisdição (acórdãos, resoluções, portarias, prejulgados) e conteúdo informativo	4
spu_geo	SPU GeoPortal — terrenos de marinha, acrescidos, marginais, ilhas federais, praias, manguezais e localização de imóveis da União	4
spu_imoveis	Imóveis da União (Raio-X APF / Gov360) — busca por órgão, UF, município, regime e agregações institucionais	4
siconfi	SICONFI/Tesouro Nacional — RREO, RGF, DCA e MSC de municípios/estados (LRF, LC 101)	7
mj	MJSP (CKAN) — SINESP, INFOPEN, PROCONs/Sindec, armas, sistema prisional	4
Judiciário
Recurso	Fonte	Ferramentas
datajud	DataJud/CNJ — processos judiciais, movimentações	7
jurisprudencia	STF, STJ e TST — acórdãos, súmulas, decisões	6
Eleitoral
Recurso	Fonte	Ferramentas
tse	TSE — eleições, candidatos, prestação de contas	15
anuncios_eleitorais	Biblioteca de Anúncios da Meta — propaganda eleitoral na internet	6
Meio Ambiente
Recurso	Fonte	Ferramentas
inpe	INPE — focos de queimadas, desmatamento DETER/PRODES	4
ana	ANA — estações hidrológicas, telemetria, reservatórios	3
ibama	IBAMA (CKAN) — autos de infração, CTF/APP, TCFA, biomas	4
Energia e Infraestrutura
Recurso	Fonte	Ferramentas
aneel	ANEEL (CKAN) — SIGA, geração distribuída, tarifas, bandeiras	4
antt	ANTT (CKAN) — rodovias concedidas, acidentes, cargas, passageiros	4
Aviação
Recurso	Fonte	Ferramentas
opensky	OpenSky Network — voos ao vivo via ADS-B (rastreamento, trilhas)	6
Saúde
Recurso	Fonte	Ferramentas
saude	CNES/DataSUS — estabelecimentos, profissionais, leitos	10
opendatasus	OpenDataSUS — conjuntos de dados de saúde pública (CKAN)	7
anvisa	ANVISA — bulário, medicamentos, preços CMED, registros	10
denasus	DENASUS — auditórios do SUS	5
imunizacao	SI-PNI — vacinação, calendário, cobertura vacinal, SRAG	10
bps	BPS — preços de medicamentos e dispositivos médicos no SUS	3
farmacia_popular	Farmácia Popular — medicamentos gratuitos, farmácias credenciadas	8
rename	RENAME — medicamentos essenciais do SUS por princípio ativo	5
Segurança Pública
Recurso	Fonte	Ferramentas
atlas_violencia	Atlas da Violência (IPEA/FBSP) — homicídios, violência por gênero/raça, armas de fogo	7
sinesp	SINESP/MJSP — conjuntos de dados de segurança pública, sistema penitenciário	6
forum_seguranca	Fórum Brasileiro de Segurança Pública — publicações, Anuário	4
Educação
Recurso	Fonte	Ferramentas
inep	INEP — índices educacionais (IDEB, indicadores) e pesquisas	4
fnde	FNDE — repasses, merenda escolar, PNATE, transporte	4
Compras Públicas
Recurso	Fonte	Ferramentas
compras	PNCP + ComprasNet/SIASG — licitações, contratos, preços, CATMAT	29
transferegov	TransfereGov — emendas parlamentares PIX	5
Mercado Financeiro e Notícias
Recurso	Fonte	Ferramentas
b3	Bolsa B3 (brapi.dev) — cotações ações/FIIs/BDRs, históricos, índices	6
noticias	RSS agregado — Câmara, Senado, Agência Brasil, BCB	4
Dados Abertos e Utilidades
Recurso	Fonte	Ferramentas
brasilapi	BrasilAPI — CEP, CNPJ, DDD, bancos, câmbio, FIPE, PIX	16
dados_abertos	Dados Abertos (dados.gov.br) — catálogo de conjuntos de dados federais	4
diario_oficial	Querido Diário + DOU — diários oficiais de mais de 5.000 cidades e da União	11
tabua_mares	Tábua de Marés — previsão de marés para portos do litoral	7
Conjuntos de dados locais (ativação via variáveis ​​de ambiente)
Recursos que baixam CSVs/ZIPs grandes (~100MB–1,6GB) para DuckDB incorporado local e expõem SQL por meio de ferramentas enlatadas. Ativadas apenas quando ligadas em MCP_BRASIL_DATASETS. Primeira carga: minutos (download + ingestão); subsequentes: ms.

Recurso	Fonte	Período	Ferramentas
spu_siapa	SPU — imóveis da União (SIAPA completo, 813k imóveis com dominiais + uso especial)	Visão geral de 2026	8
tse_candidatos	TSE — candidatos de todas as eleições (~4 milhões de registros)	2014-2024	8
tse_bens	TSE — bens declarados pelos candidatos, aderir viasq_candidato	2014-2024	5
tse_votacao	TSE — votos por candidato × município × zona	2014-2024	6
tse_redes_sociais	TSE — URLs Instagram/Facebook/Twitter dos candidatos	2018-2024	4
tse_fefc	TSE — Fundo Eleitoral Especial (distribuição partido × gênero)	2020, 2024	4
anp_precos	ANP — preços semanais de combustíveis (gasolina/etanol, diesel/GNV, GLP) em postos	2024 integral	7
inep_censo_escolar	INEP — Censo Escolar da Educação Básica (~180 mil escolas, infraestrutura, matrículas)	2023	7
inep_enem	INEP — Microdados ENEM (~3,9M inscritos, notas, perfil socioeconômico)	2023	6
isp_rj	ISP-RJ — estatísticas criminais mensais do CISP do Rio de Janeiro	1991-presente	6
anac_rab	ANAC — Registro Aeronáutico Brasileiro (~75 mil aeronaves civis)	instantâneo semanal	6
anac_vra	ANAC — Voos Regulares Ativos (pontualidade, atrasos, origem/destino)	2020-presente	—
cvm_fundos	CVM — Cadastro de Fundos de Investimento (~40 mil fundos, PL, taxa adm, gestor)	instantâneo	6
Ativo com:

# .env
MCP_BRASIL_DATASETS=tse_candidatos,tse_bens,tse_votacao
Consulte o guia de conjuntos de dados locais para detalhes de uso.

O servidor raiz também expõe 5 meta-ferramentas: listar_features, recomendar_tools, planejar_consulta, executar_lotee listar_datasets_disponiveis.

Chaves de API
API	Obrigatória?	Como obter
Portal da Transparência	Opcional	Cadastro gratuito
DataJud/CNJ	Opcional	Cadastro gratuito
Anúncios Eleitorais (Meta)	Opcional	API da Biblioteca de Meta Anúncios
brapi.dev (B3)	Opcional	Token gratuito para índices e múltiplas ações
Todas as outras (62)	Nenhuma chave	—
Configure via variáveis ​​de ambiente ou .env:

TRANSPARENCIA_API_KEY=sua-chave
DATAJUD_API_KEY=sua-chave
META_ACCESS_TOKEN=seu-token
Configuração
Variável	Padrão	Descrição
TRANSPARENCIA_API_KEY	—	Chave do Portal da Transparência
DATAJUD_API_KEY	—	Chave do DataJud/CNJ
META_ACCESS_TOKEN	—	Token da API da Biblioteca de Anúncios Meta
MCP_BRASIL_TOOL_SEARCH	bm25	Modo de descoberta: bm25, code_modeounone
MCP_BRASIL_HTTP_TIMEOUT	30.0	Tempo limite HTTP em segundos
MCP_BRASIL_HTTP_MAX_RETRIES	3	Máximo de retentativas HTTP
MCP_BRASIL_DATASETS	—	Lista CSV de conjuntos de dados locais para ativar. Ex:tse_candidatos,tse_bens
MCP_BRASIL_DATASET_CACHE_DIR	~/.cache/mcp-brasil	Diretório raiz do cache DuckDB
MCP_BRASIL_DATASET_REFRESH	auto	auto(TTL), never(só cache) ou force(sempre baixar)
MCP_BRASIL_DATASET_TIMEOUT	600	Tempo limite (s) para download de conjuntos de dados grandes
MCP_BRASIL_LGPD_ALLOW_PII	—	Lista CSV de conjuntos de dados com PII liberada (ex: tse_candidatos)
Documentação
Página	Descrição
Início rápido	Instalação e configuração em 2 minutos
Arquitetura	Como o projeto funciona por dentro
catálogo de Recursos	Todas as 69 funcionalidades e 525 ferramentas
Conjuntos de dados locais (DuckDB)	SIAPA + TSE 2014-2024 via SQL embarcado
Ferramentas inteligentes	Metaferramentas: planejador, lote, descoberta
recursos do regardndo	Guia para contribuir com novas APIs
Configuração	Variáveis ​​de ambiente e
API da Biblioteca de Meta Anúncios	Referência da API de anúncios eleitorais da Meta
Modo de código	Discovery programático + sandbox Python (experimental)
Desenvolvimento	Configuração de dev, testes, lint, CI
Implantar Azure (conjuntos de dados)	Aplicativos de contêiner + Arquivos do Azure + aquecimento automático dos conjuntos de dados
Desenvolvimento
git clone https://github.com/Mcp-Brasil/mcp-brasil.git
cd mcp-brasil
make dev              # Instalar dependências (prod + dev)
make test             # Rodar todos os testes
make test-feature F=ibge  # Testes de uma feature
make lint             # Lint + format check
make ruff             # Auto-fix lint + format
make types            # mypy strict
make ci               # lint + types + test
make run              # Server stdio
make serve            # Server HTTP :8000
make inspect          # Listar tools/resources/prompts
Arquitetura
O projeto usa Package by Feature com Auto-Registry — cada feature é uma pasta auto-contida:

src/mcp_brasil/
├── server.py              # Auto-registry (nunca editado manualmente)
├── _shared/               # Utilitários compartilhados
│   └── datasets/          # Infra DuckDB local
├── data/                  # 51 features — REST passthrough
│   ├── ibge/
│   │   ├── __init__.py    # FEATURE_META
│   │   ├── server.py      # FastMCP instance
│   │   ├── tools.py       # Lógica das tools
│   │   ├── client.py      # HTTP async
│   │   ├── schemas.py     # Pydantic models
│   │   └── constants.py   # URLs, códigos
│   ├── bacen/
│   └── ...
├── datasets/              # 12 features — cache local DuckDB (opt-in via env)
│   ├── spu_siapa/         # SIAPA 813k imóveis
│   ├── tse_candidatos/    # TSE candidatos 2014-2024
│   └── ...
└── agentes/               # 1 feature — agentes inteligentes
    └── redator/
Três modalidades de recurso coexistem:

data/— Passagem REST: HTTP assíncrono → Pydantic → formatação da ferramenta
datasets/— DuckDB incorporado local: CSVs/ZIPs grandes com SQL, gated por MCP_BRASIL_DATASETS, cache em~/.cache/mcp-brasil/
agentes/— Agentes inteligentes: ferramentas + prompts + recursos compondo fluxos complexos (ex: redação oficial)
Para adicionar um novo recurso, basta criar o diretório seguindo a convenção — o registro aparece automaticamente.

Contribuindo
Garfo o
Crie uma feature em src/mcp_brasil/data/{feature}/ouagentes/{feature}/
Exporte FEATURE_METAnão __init__.pye mcp: FastMCPnãoserver.py
testes de patente emtests/data/{feature}/
Rode make cie abra um PR
Isenção de responsabilidade
Este projeto integra um número significativo de APIs governamentais brasileiras, muitas com documentação inconsistente ou incompleta. Embora tudo tenha sido feito para garantir soluções, alguns endpoints podem retornar resultados inesperados ou ter cobertura parcial de parâmetros.

Este é um projeto open-source da comunidade — se encontrar algo quebrado ou que possa ser melhorado, abra uma edição ou envie um PR . O objetivo é tornar dados públicos brasileiros acessíveis via IA, juntos.

Todos os dados vêm de APIs oficiais do governo brasileiro — o servidor não gera, modifica ou editorializa nenhum dado. No entanto, os modelos de IA que consomem este servidor podem alucinar, distorcer ou interpretar incorretamente respostas — VERIFIQUE NA FONTE OFICIAL antes de uso jornalístico, judicial, médico ou decisório.

Não-oficial
mcp-brasilé projeto independente . NÃO é serviço, programa ou parceria do Governo Federal, Ministérios, Agências, Tribunais ou de qualquer das instituições cujos dados acessados. Tampouco é endossado pela Anthropic, OpenAI, GitHub ou pelos modelos de clientes de IA. A palavra "Brasil" não se refere a objeto (dados públicos brasileiros) e não a vinculação institucional.

Conformidade legal
Antes de operar este servidor — especialmente em cenários comerciais, com volume, em período eleitoral, ou envolvendo dados sensíveis (saúde, judicial, eleitoral) — leia obrigatoriamente :

FONTES.md — licença e isenção de responsabilidade de cada uma das 70 fontes
ACCEPTABLE_USE.md — Política de Uso Aceitável (vedações sob LGPD art. 11 §4º, Lei 9.504/97, Res. CNJ 446/2022, etc.)
AVISO — escopo da licença MIT e atribuições
licença
Código deste repositório: MIT
Dados retornados pelas APIs: licenças variadas — ver SOURCES.md
Uso do servidor: sujeito à Política de Uso Aceitável
Atribuições e isenções de responsabilidade: AVISO
