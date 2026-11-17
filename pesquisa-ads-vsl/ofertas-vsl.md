# Biblioteca de anúncios — ofertas de VSL, advertorial e quiz escaladas

Snapshot: **13/11/2026** · Fonte primária: contagens de anúncios **ativos** na Biblioteca de Anúncios da Meta (Facebook + Instagram), país = **Todos**, lidas página por página no AdManage.ai em 13/11/2026. Fonte secundária (só para ampliar o universo): índice do AdLibrarySpy (mesma base Meta + SimilarWeb), usado apenas para os registros marcados `adlibraryspy` no CSV.

Este é o levantamento complementar ao `pesquisa-ads/ofertas-escaladas.md`. Lá o filtro era **+5.000 anúncios ativos** e o resultado foram 12 operações de catálogo/DTC. Aqui o filtro é outro: **funil de resposta direta** — VSL, advertorial ou quiz — com volume real de criativo. É o que dá para clonar em vídeo.

---

## Por que este recorte é diferente do primeiro

Volume de anúncios ativos, sozinho, premia catálogo automatizado. Temu com 17 mil anúncios não ensina nada sobre copy: é feed de produto. O que interessa para modelagem é **a oferta que precisa de um vídeo para vender** — e essas operações aparecem com números menores, mas com um padrão de funil muito mais copiável.

Três sinais separam as duas coisas:

1. **Proporção vídeo.** Acima de ~60% de vídeo com milhares de ativos = a operação testa hook e roteiro em volume, não só troca imagem de produto.
2. **Domínio de destino do anúncio.** Se o anúncio manda para `secure.`, `track.`, `try.`, `get.`, `le.` ou `shop.` em vez do domínio raiz, há uma **página intermediária** — advertorial, VSL ou quiz. É exatamente o ativo que você quer ver.
3. **Razão ativos/total.** Total próximo do ativo (ex.: Penrose 9.133/9.353, O Positiv 2.525/2.533) significa que quase nada foi desligado: a oferta paga o CPA há meses e o anunciante só empilha variação.

---

## Ranking — 85 ofertas de funil de resposta direta

Score 0–100 = `0,35 × volume de criativo + 0,25 × longevidade + 0,20 × histórico + 0,10 × taxa de ativos + 0,10 × densidade de criador`. Tabela completa com todas as 85 em `pesquisa-ads-vsl/ofertas-vsl.csv`.

### Tier 1 — núcleo de modelagem (score ≥ 74, ≥ 2.500 ativos)

| # | Marca | Ativos | Total | Vídeo | Parcerias | Público | Funil | Score |
|---|---|---|---|---|---|---|---|---|
| 1 | **IM8 Health** | **6.852** | 23.342 | 48% | 11.133 | homens 35-44 · UK | DTC premium + criador em massa | 79,1 |
| 2 | **O Positiv** | 2.525 | 2.533 | 32% | 419 | mulheres 18-24 · EUA | DTC + retail (Target) | 79,0 |
| 3 | **Penrose Skin** | **9.133** | 9.353 | 70% | 3.419 | homens 25-34 · EUA | DTC + UGC em volume | 78,9 |
| 4 | **Froya Organics** | 6.936 | n/d | n/d | n/d | n/d · EUA | Skincare natural DTC | 76,2 |
| 5 | **Smooche** | 2.922 | 16.043 | 82% | 732 | mulheres 45-54 · EUA | DTC + UGC | 75,1 |
| 6 | **RYZE** | 4.617 | n/d | n/d | n/d | n/d · EUA | Assinatura (café de cogumelo) | 74,9 |
| 7 | **GODA** | 4.567 | n/d | n/d | n/d | n/d · EUA | DTC (matcha/energia) | 74,9 |
| 8 | **Kind Patches** | 2.624 | 13.905 | **83%** | 702 | mulheres 35-44 · UK | DTC + criador | 74,5 |
| 9 | **Glov Beauty** | 4.141 | 9.335 | 45% | — | mulheres 45-54 · EUA | DTC + oferta sazonal | 74,1 |
| 10 | **Primal Queen** | 5.916 | 6.467 | 66% | 422 | mulheres 35-44 · EUA | Advertorial + DTC | 73,6* |

\* Primal Queen cai para a faixa 73 por longevidade curta (no ar desde out/2025), apesar de 5.916 ativos.

### Tier 2 — as que realmente usam VSL/advertorial (score 60–74)

Aqui está o material mais útil, porque o funil é explicitamente uma página de venda longa:

| Marca | Ativos | Total | Vídeo | Público | Funil | Sinal |
|---|---|---|---|---|---|---|
| **Koriderm** | **4.029** | 5.945 | 65% | mulheres 65+ · EUA | **Quiz de 2 min → DTC** | 4.029 ativos com **1** parceria: mídia própria pura |
| **Resilia** | 1.514 | 2.144 | **85%** | mulheres 45-54 · EUA | Advertorial VSL | 85% vídeo, zero parceria |
| **Rosabella** | 1.959 | 7.483 | 30% | homens 65+ · EUA | Advertorial (`track.`) | 531 parcerias + LP de rastreio |
| **Aurivita** | 913 | 3.104 | 21% | homens 55-64 · UK | **Advertorial VSL puro** | copy de ED/circulação, zero marca |
| **Forge Men** | 783 | 1.147 | 67% | homens 55-64 · EUA | `secure.` + `/lstc-` | melhor copy de história longa do lote |
| **Metabolae** | **16.272** | n/d | n/d | n/d · EUA | DTC + criador | maior volume do estudo em nutra |
| **noverly** | 9.386 | n/d | n/d | n/d · EUA | DTC | 9,4 mil ativos em 4 meses de vida |
| **Auniva** | 8.638 | n/d | n/d | n/d · EUA | DTC | 8,6 mil ativos em 2 meses |
| **Nutrition Geeks** | 1.582 | 11.322 | 47% | mulheres 45-54 · UK | DTC + criador | 662,7M de alcance declarado |
| **Huel** | 1.347 | 1.765 | 55% | homens 35-44 · UK | DTC marca | 148,7M de alcance |

---

## O padrão que se repete (e o que copiar)

### 1. A história em primeira pessoa, contada por um "homem comum"

O anúncio da Forge Men é o melhor exemplo do lote inteiro. Copy real, veiculado, com página de destino `secure.try-forge.com/lstc-fatty-liver`:

> *"I waited twenty-five years to sit across from that woman again. She ended it before the food came. She looked at me and said: 'Your photos stopped at the shoulders, Roy. You let the rest go. I mind. I'm sorry.' Then she laid her half of the bill by the water glass and walked out on her heels..."*

Estrutura: cena de humilhação específica → detalhe físico pequeno (a conta pela metade) → promessa temporal ("let me tell you exactly what happened in those thirty days") → três marcos em bullets → gancho aberto ("what she said isn't what I braced for"). Isso vende **skincare masculina** — o produto é irrelevante, a história carrega.

### 2. O mecanismo único com nome e número

- Aurivita: *"Capsaicin is nature's most powerful circulatory activator — the only natural compound that activates TRPV1 receptors... restarts nitric oxide production from the inside."*
- Rosabella: *"10 out of 16 essential nutrients your aging skin needs"* (Forge usa a mesma fórmula: 12 de 16).
- Orgatics: *"Week 1: the compounds reach the nail bed for the first time in years. Week 2: carvacrol from oregano oil is..."*

O padrão é **mecanismo nomeado + cronograma semana a semana**. Nunca "é bom para X"; sempre "acontece Y no dia Z".

### 3. O quiz como isca, com a dor nomeada antes da pergunta

Koriderm, 4.029 ativos e uma única parceria:

> *"Nobody has ever asked you about your skin. Not the woman at the counter. Not the brand. Not the ad. They just handed you the next jar. This quiz actually asks."*

Vedix e Noom usam a mesma lógica em outro registro ("Take this FREE 5min quiz"). O quiz só converte quando a **acusação vem antes**: você foi ignorada, o mercado te empurrou produto sem perguntar.

### 4. Perfil de público como decisão de produto, não de mídia

O dado mais subestimado do levantamento. Compare:

- **homens 65+** → Rosabella (beterraba/moringa), Orgatics (unha), Purely Nutrient (0 ativos hoje, 1.020 no histórico)
- **homens 55-64** → Aurivita, Forge Men, Uvola
- **mulheres 65+** → Koriderm
- **mulheres 45-54** → Smooche, Glov, Resilia, Nutrition Geeks
- **homens 25-34** → Penrose Skin

A faixa 55-65+ masculina é a mais **sub-atendida e mais barata** de alcançar, e é onde o advertorial longo ainda funciona sem saturação. É o oposto do que a maioria dos media buyers brasileiros testa.

### 5. Zero parceria com criador = mídia própria

Koriderm (4.029 ativos e **1** parceria), Resilia (1.514 e zero), Aurivita (913 e zero), Forge Men (783 e zero). Quatro operações de advertorial puro, sem depender de criador. Isso é o cenário mais fácil de transplantar: você não precisa de rede de UGC, precisa de uma VSL boa e verba de teste.

---

## O teste de clonabilidade — o que foi descartado e por quê

O levantamento cruzou ~40 candidatos que passavam no gate de volume e foram **rejeitados por funil**, não por tamanho:

| Descartado | Ativos | Motivo |
|---|---|---|
| Honeybalm (2.950) | 2.950 | Anúncios apontam para `laceandlush.com` — lingerie de catálogo, sem funil |
| Lymphoria | 62 (de 2.155) | 99% imagem, operação esfriou no mês |
| Holior | 87 (de 87) | 100% imagem, 40 dias de vida — não provou nada |
| Orgatics | 0 (de 782) | 782 anúncios desligados: o ângulo de unha saturou |
| Primal Storm | 0 (de 500) | 500 desligados em bloco |
| ALT. Fragrances (5.390) | 5.390 | Perfumaria dupe, catálogo |
| PiPi Tea, Cheers, Liquid I.V. | 932 / 2.045 / — | Marca de bebida, sem LP intermediária |
| Huel, Noom | 1.347 / 559 | Marca estabelecida: o anúncio vende marca, não mecanismo |
| BetterMe, Impulse, V Shred | 4.552 / 1.912 / 1.335 | Já cobertos na Tarefa A |

**Regra prática:** se o anúncio manda para o domínio raiz e a copy é "compre X com 30% off", não é funil de resposta direta — é varejo. Se manda para um subdomínio de captura e a copy conta uma história ou faz uma pergunta, é.

---

## Recomendação — as 5 para minerar primeiro

1. **Forge Men** (783 ativos, 67% vídeo, zero parceria). Melhor copy do lote. Uma VSL, um produto (sebo bovino), público homens 55-64. É a operação mais barata de replicar em qualquer mercado: troca-se o produto, mantém-se a estrutura de história.
2. **Aurivita** (913 ativos, 21% vídeo, zero parceria). Advertorial de saúde masculina com mecanismo nomeado (TRPV1/capsaicina). O ângulo "apology ad" ("I lied about Aurivita") rodou 160 dias — hook de confissão é raro e funciona.
3. **Resilia** (1.514 ativos, **85% vídeo**, zero parceria). O único caso do lote com vídeo dominante, volume decente e nenhuma dependência de criador. Melhor referência de produção de VSL.
4. **Koriderm** (4.029 ativos, 1 parceria). Quiz de 2 minutos com 4 mil ativos é a prova de que quiz escala sem criador. Público mulheres 65+, praticamente ignorado no Brasil.
5. **Penrose Skin** (9.133 ativos, 3.419 parcerias). Contraexemplo deliberado: mostra o teto do modelo **com** criador. Serve para decidir se você quer construir rede de UGC ou mídia própria — as duas rotas estão representadas na lista.

### O que eu faria diferente da Tarefa A

Lá o critério era volume absoluto e o resultado foi um mapa de mercado. Aqui o critério é **estrutura de funil**, e o achado acionável é outro: as operações mais copiáveis do mundo hoje são pequenas e médias (700–1.500 ativos), com advertorial próprio, público 55+, e **sem criador**. Volume gigante em nutra é quase sempre rede de parceria (IM8 com 11.133 parcerias, Penrose com 3.419) — isso é um modelo de negócio diferente, que exige gestão de criador, não copy.

---

## Limites deste levantamento

- Contagem de anúncios ativos **não é** gasto nem faturamento. A Meta não publica isso para anúncios comerciais.
- Alcance declarado só existe para anúncios da UE; para os EUA a biblioteca mostra pouco.
- Os números mudam diariamente (a Meta pausa e religa criativo o tempo todo). Snapshot de 13/11/2026.
- As 60 linhas marcadas `adlibraryspy` no CSV vêm do índice secundário: ativos e tráfego são medidos, mas **vídeo, parcerias e público não foram confirmados** individualmente — estão como `n/d`. Confirme antes de usar como referência de produção.
- AdManage e AdLibrarySpy discordam entre si: Forge Men aparece com 783 ativos (AdManage, 13/11) e 4.369 (AdLibrarySpy, mesma data). A diferença é o que cada um indexa como "página" — a contagem do AdManage é por página de anunciante, a do AdLibrarySpy soma variações. **Para o filtro, use sempre a contagem do AdManage**, que foi a mesma base da Tarefa A e é a que bate com a Biblioteca aberta no navegador.

## Arquivos

- `pesquisa-ads-vsl/ofertas-vsl.csv` — as 85 ofertas, ordenadas por score, com link direto para a Biblioteca da Meta de cada uma.
- `pesquisa-ads/ofertas-escaladas.md` + `.csv` — Tarefa A (12 operações com +5.000 ativos).
