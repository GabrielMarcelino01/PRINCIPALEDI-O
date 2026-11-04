/* =========================================================================
   TRUQUE DOS MIL LOOKS — MOTOR COMPLETO DO APLICATIVO OFICIAL (PWA)
   Closet IA (IndexedDB + Detecção de Cor) · Provador Virtual · Mala · 15→150 · Aulas
   ========================================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "tml_app_state_v1";
  var DB_NAME = "tml_closet_photos_v1";
  var DB_STORE = "photos";

  var COLORS = {
    offwhite: { label: "Off-White / Branco", hex: "#F7F3EB", stroke: "#D4C9B8", neutral: true, temp: "warm" },
    preto:    { label: "Preto",              hex: "#231F20", stroke: "#484244", neutral: true, temp: "cool" },
    bege:     { label: "Bege / Areia",       hex: "#DFCBB0", stroke: "#BCA382", neutral: true, temp: "warm" },
    vinho:    { label: "Vinho / Bordô",      hex: "#6E1423", stroke: "#470914", neutral: false, temp: "warm" },
    marinho:  { label: "Azul Marinho",       hex: "#1E2D4A", stroke: "#131D33", neutral: true, temp: "cool" },
    jeans:    { label: "Jeans / Azul",       hex: "#3A5A81", stroke: "#284160", neutral: true, temp: "cool" },
    caramelo: { label: "Caramelo / Marrom",  hex: "#A8683B", stroke: "#7E4A25", neutral: true, temp: "warm" },
    oliva:    { label: "Verde Oliva",        hex: "#586646", stroke: "#3E4930", neutral: false, temp: "warm" },
    rose:     { label: "Rosé / Blush",       hex: "#DFA8A6", stroke: "#BC8280", neutral: false, temp: "cool" },
    cinza:    { label: "Cinza / Prata",      hex: "#8E9299", stroke: "#686C73", neutral: true, temp: "cool" }
  };

  var CAT_LABELS = {
    top: "Parte de Cima",
    bottom: "Parte de Baixo",
    outer: "3ª Peça",
    dress: "Peça Única",
    shoes: "Calçado",
    bag: "Bolsa / Acess."
  };

  var STYLE_LABELS = {
    moderna: "Elegante Moderna",
    classica: "Clássica Atemporal",
    casual: "Casual Chic",
    romantica: "Romântica Sofisticada",
    criativa: "Criativa & Fashion"
  };

  var BODY_TIPS = {
    ampulheta: "Valorize sua cintura natural com cós médio/alto e 3ª peça acinturada.",
    retangulo: "Crie curvas elegantes usando 3ª peça aberta, cintos finos e texturas fluidas.",
    triangulo: "Ilumine a parte superior com cores claras/decote V e use tons neutros escuros embaixo.",
    invertido: "Equilibre os ombros com calças pantalonas/retas fluidas e partes de cima limpas.",
    oval: "Aposte em linhas verticais (3ª peça aberta + decote V) e monocromáticos que alongam."
  };

  /* ---------------- Ilustrações Editoriais Vetoriais das Peças ---------------- */
  function makeGarmentSvg(shape, colorKey) {
    var c = COLORS[colorKey] || COLORS.bege;
    var fill = c.hex;
    var st = c.stroke;
    var detail = colorKey === "preto" || colorKey === "marinho" || colorKey === "vinho" ? "rgba(255,255,255,0.28)" : "rgba(40,24,18,0.22)";
    var path = "";

    switch (shape) {
      case "shirt":
        path = '<path d="M72 46 L94 38 L106 52 L118 38 L140 46 L166 78 L148 94 L136 76 L136 162 L76 162 L76 76 L64 94 L46 78 Z" fill="' + fill + '" stroke="' + st + '" stroke-width="3" stroke-linejoin="round"/>' +
               '<path d="M106 52 L106 160" stroke="' + detail + '" stroke-width="2" stroke-dasharray="4 5"/>';
        break;
      case "tank":
        path = '<path d="M82 44 L94 44 C98 62 114 62 118 44 L130 44 L134 86 L136 160 L76 160 L78 86 Z" fill="' + fill + '" stroke="' + st + '" stroke-width="3" stroke-linejoin="round"/>';
        break;
      case "turtleneck":
        path = '<path d="M92 34 L120 34 L122 46 L146 54 L168 128 L150 134 L136 82 L136 160 L76 160 L76 82 L62 134 L44 128 L66 54 L90 46 Z" fill="' + fill + '" stroke="' + st + '" stroke-width="3" stroke-linejoin="round"/>';
        break;
      case "striped":
        path = '<defs><pattern id="stp" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(90)"><rect width="12" height="7" fill="#FBF8F2"/><rect y="7" width="12" height="5" fill="' + fill + '"/></pattern></defs>' +
               '<path d="M72 48 L92 42 C98 54 114 54 120 42 L140 48 L164 78 L146 92 L135 76 L135 158 L77 158 L77 76 L66 92 L48 78 Z" fill="url(#stp)" stroke="' + st + '" stroke-width="3" stroke-linejoin="round"/>';
        break;
      case "blazer":
        path = '<path d="M70 42 L94 36 L106 86 L118 36 L142 42 L166 138 L146 142 L136 82 L138 166 L110 166 L106 112 L102 166 L74 166 L76 82 L66 142 L46 138 Z" fill="' + fill + '" stroke="' + st + '" stroke-width="3" stroke-linejoin="round"/>' +
               '<path d="M94 36 L84 82 L106 94 L128 82 L118 36" fill="none" stroke="' + detail + '" stroke-width="2.4"/>';
        break;
      case "cardigan":
        path = '<path d="M72 42 L94 38 L104 78 L104 168 L72 168 L74 84 L60 144 L42 138 Z M140 42 L118 38 L108 78 L108 168 L140 168 L138 84 L152 144 L170 138 Z" fill="' + fill + '" stroke="' + st + '" stroke-width="3" stroke-linejoin="round"/>';
        break;
      case "pantalona":
        path = '<path d="M76 34 L136 34 L152 172 L114 172 L106 86 L98 172 L60 172 Z" fill="' + fill + '" stroke="' + st + '" stroke-width="3" stroke-linejoin="round"/>' +
               '<path d="M76 46 L136 46" stroke="' + detail + '" stroke-width="2.2"/>';
        break;
      case "jeans":
      case "trousers":
        path = '<path d="M78 34 L134 34 L140 170 L113 170 L106 84 L99 170 L72 170 Z" fill="' + fill + '" stroke="' + st + '" stroke-width="3" stroke-linejoin="round"/>' +
               '<path d="M78 46 L134 46 M106 46 L106 76" stroke="' + detail + '" stroke-width="2.2"/>';
        break;
      case "skirt":
        path = '<path d="M82 38 L130 38 L154 164 C124 172 88 172 58 164 Z" fill="' + fill + '" stroke="' + st + '" stroke-width="3" stroke-linejoin="round"/>' +
               '<path d="M96 50 L84 162 M116 50 L128 162" stroke="' + detail + '" stroke-width="1.8"/>';
        break;
      case "dress":
        path = '<path d="M82 34 L95 34 L106 54 L117 34 L130 34 L126 78 L156 170 C124 176 88 176 56 170 L86 78 Z" fill="' + fill + '" stroke="' + st + '" stroke-width="3" stroke-linejoin="round"/>' +
               '<path d="M86 78 L126 78" stroke="#DDA94B" stroke-width="3"/>';
        break;
      case "heels":
        path = '<path d="M52 118 C72 118 92 142 126 142 L158 142 C162 132 150 124 134 122 L92 92 C82 86 68 92 64 104 Z" fill="' + fill + '" stroke="' + st + '" stroke-width="3" stroke-linejoin="round"/>' +
               '<path d="M62 118 L62 154 L70 154 L74 124" fill="' + st + '"/>';
        break;
      case "sneakers":
        path = '<path d="M48 134 L62 98 L94 102 L134 120 C156 122 164 132 164 144 L48 144 Z" fill="' + fill + '" stroke="' + st + '" stroke-width="3" stroke-linejoin="round"/>' +
               '<rect x="46" y="142" width="120" height="11" rx="5" fill="#FFFFFF" stroke="' + st + '" stroke-width="2.2"/>';
        break;
      case "loafer":
        path = '<path d="M46 130 C54 108 82 106 108 112 L156 124 C166 128 166 144 152 146 L48 146 Z" fill="' + fill + '" stroke="' + st + '" stroke-width="3" stroke-linejoin="round"/>' +
               '<circle cx="104" cy="122" r="5" fill="#DDA94B"/><circle cx="116" cy="124" r="5" fill="#DDA94B"/>';
        break;
      case "bag":
      default:
        path = '<path d="M84 74 C84 48 128 48 128 74" fill="none" stroke="' + st + '" stroke-width="4.5" stroke-linecap="round"/>' +
               '<rect x="60" y="74" width="92" height="82" rx="14" fill="' + fill + '" stroke="' + st + '" stroke-width="3"/>' +
               '<path d="M60 104 L106 118 L152 104" fill="none" stroke="#DDA94B" stroke-width="2.8"/>' +
               '<circle cx="106" cy="118" r="6" fill="#DDA94B"/>';
        break;
    }

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212 200">' +
      '<defs><radialGradient id="bg" cx="50%" cy="45%" r="60%"><stop offset="0%" stop-color="#FFFDF9"/><stop offset="100%" stop-color="#F3E9D8"/></radialGradient></defs>' +
      '<rect width="212" height="200" fill="url(#bg)"/>' +
      path +
      '</svg>';
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  function defaultShapeForCat(cat) {
    if (cat === "top") return "shirt";
    if (cat === "bottom") return "pantalona";
    if (cat === "outer") return "blazer";
    if (cat === "dress") return "dress";
    if (cat === "shoes") return "heels";
    return "bag";
  }

  /* ---------------- As 15 Peças Curingas Iniciais do Closet Cápsula ---------------- */
  var BASE_CAPSULE = [
    { id: "c1",  name: "Camisa Alfaiataria Off-White", cat: "top",    color: "offwhite", shape: "shirt",      occs: ["trabalho", "passeio", "encontro", "evento"], role: "Ilumina o rosto e eleva qualquer jeans ou calça" },
    { id: "c2",  name: "Regata Canelada Creme",        cat: "top",    color: "bege",     shape: "tank",       occs: ["passeio", "trabalho", "encontro"],          role: "Base neutra perfeita para usar sob 3ª peça" },
    { id: "c3",  name: "Blusa Gola Alta Preta",        cat: "top",    color: "preto",    shape: "turtleneck", occs: ["trabalho", "encontro", "evento"],           role: "Sofisticação imediata para noite e dias frescos" },
    { id: "c4",  name: "T-Shirt Listrada Clássica",    cat: "top",    color: "marinho",  shape: "striped",    occs: ["passeio", "trabalho"],                      role: "Toque francês despojado e atemporal" },
    { id: "c5",  name: "Blusa Fluida Vinho",           cat: "top",    color: "vinho",    shape: "shirt",      occs: ["trabalho", "encontro", "evento"],           role: "Ponto de cor nobre que transmite presença" },
    { id: "c6",  name: "Calça Pantalona Preta",        cat: "bottom", color: "preto",    shape: "pantalona",  occs: ["trabalho", "encontro", "evento"],           role: "Alonga as pernas em até 5 cm visualmente" },
    { id: "c7",  name: "Jeans Reto Azul Escuro",       cat: "bottom", color: "jeans",    shape: "jeans",      occs: ["passeio", "trabalho", "encontro"],          role: "Lavagem limpa sem rasgos que vai do dia ao jantar" },
    { id: "c8",  name: "Calça Alfaiataria Areia",      cat: "bottom", color: "bege",     shape: "trousers",   occs: ["trabalho", "passeio", "evento"],            role: "Visual 'old money' leve e fresco" },
    { id: "c9",  name: "Saia Midi Acetinada Vinho",    cat: "bottom", color: "vinho",    shape: "skirt",      occs: ["encontro", "evento", "passeio"],            role: "Feminilidade elegante com tênis ou scarpin" },
    { id: "c10", name: "Vestido Midi Preto Curinga",   cat: "dress",  color: "preto",    shape: "dress",      occs: ["encontro", "evento", "trabalho", "passeio"], role: "1 peça = 10 looks mudando sapato e 3ª peça" },
    { id: "c11", name: "Blazer Estruturado Areia",     cat: "outer",  color: "bege",     shape: "blazer",     occs: ["trabalho", "encontro", "evento", "passeio"], role: "A 3ª peça mágica que deixa qualquer look caro" },
    { id: "c12", name: "Cardigã / Trench Caramelo",    cat: "outer",  color: "caramelo", shape: "cardigan",   occs: ["passeio", "trabalho", "encontro"],          role: "Cria linha vertical alongadora em segundos" },
    { id: "c13", name: "Scarpin / Slingback Nude",     cat: "shoes",  color: "bege",     shape: "heels",      occs: ["trabalho", "encontro", "evento"],           role: "Tom próximo da pele: não corta a silhueta" },
    { id: "c14", name: "Tênis Couro Branco Limpo",     cat: "shoes",  color: "offwhite", shape: "sneakers",   occs: ["passeio", "trabalho"],                      role: "Conforto moderno com alfaiataria ou vestido" },
    { id: "c15", name: "Bolsa Estruturada Vinho",      cat: "bag",    color: "vinho",    shape: "bag",        occs: ["trabalho", "passeio", "encontro", "evento"], role: "Acabamento de consultoria mesmo em look básico" }
  ];

  /* ---------------- Fórmulas Prontas do Método 15 -> 150 ---------------- */
  var FORMULAS = [
    { id: "f1", occ: "trabalho", tag: "Trabalho Elegante", title: "Executiva Leve & Iluminada", eq: "Camisa Off-White + Calça Areia + Blazer Areia + Scarpin Nude", tip: "Monocromático claro transmite autoridade suave e alonga imediatamente.", ids: { top: "c1", bottom: "c8", outer: "c11", shoes: "c13", bag: "c15" } },
    { id: "f2", occ: "trabalho", tag: "Trabalho Moderno", title: "Hi-Lo de Alfaiataria", eq: "T-Shirt Listrada + Pantalona Preta + Blazer Areia + Tênis Branco", tip: "Conforto absoluto o dia inteiro mantendo linhas estruturadas.", ids: { top: "c4", bottom: "c6", outer: "c11", shoes: "c14", bag: "c15" } },
    { id: "f3", occ: "passeio", tag: "Almoço & Passeio", title: "Chique Parisiense de Domingo", eq: "Regata Creme + Jeans Reto Escuro + Cardigã Caramelo + Tênis Branco", tip: "A 3ª peça caramelo aquece o jeans escuro e afina a cintura.", ids: { top: "c2", bottom: "c7", outer: "c12", shoes: "c14", bag: "c15" } },
    { id: "f4", occ: "passeio", tag: "Passeio Sofisticado", title: "Saia Midi Sem Esforço", eq: "Camisa Off-White (amarrada/por dentro) + Saia Midi Vinho + Tênis Branco", tip: "Misturar tecido acetinado com tênis de couro cria estilo moderno instantâneo.", ids: { top: "c1", bottom: "c9", outer: null, shoes: "c14", bag: "c15" } },
    { id: "f5", occ: "encontro", tag: "Noite & Jantar", title: "Magnética em Vinho & Preto", eq: "Blusa Gola Alta Preta + Saia Midi Vinho + Scarpin Nude + Bolsa Vinho", tip: "Contraste profundo que valoriza a pele e alonga as pernas.", ids: { top: "c3", bottom: "c9", outer: null, shoes: "c13", bag: "c15" } },
    { id: "f6", occ: "encontro", tag: "Jantar Especial", title: "Vestido Preto Multiplicado", eq: "Vestido Midi Preto + Blazer Estruturado Areia + Scarpin Nude", tip: "Jogar o blazer claro sobre os ombros transforma o pretinho básico em alta costura.", ids: { dress: "c10", outer: "c11", shoes: "c13", bag: "c15" } },
    { id: "f7", occ: "viagem", tag: "Aeroporto & Viagem", title: "Conforto Primeira Classe", eq: "Blusa Preta + Calça Alfaiataria Areia + Cardigã Caramelo + Tênis Branco", tip: "Não amassa, protege do ar-condicionado e rende fotos impecáveis.", ids: { top: "c3", bottom: "c8", outer: "c12", shoes: "c14", bag: "c15" } },
    { id: "f8", occ: "trabalho", tag: "Reunião Importante", title: "Ponto de Cor Poderoso", eq: "Blusa Fluida Vinho + Pantalona Preta + Blazer Areia + Scarpin Nude", tip: "A Regra das 3 Cores na perfeição: Preto + Areia + Vinho.", ids: { top: "c5", bottom: "c6", outer: "c11", shoes: "c13", bag: "c15" } }
  ];

  /* ---------------- 7 Módulos de Aulas Práticas ---------------- */
  var LESSONS = [
    {
      id: "m1",
      num: "01",
      duration: "3 min · Fundamento",
      title: "O Segredo 80/20: Destravando Peças Paradas",
      subtitle: "Por que você sente que 'não tem roupa' mesmo com o armário cheio.",
      body: [
        "Quase toda mulher usa apenas 20% das roupas nas mesmas combinações automáticas (a mesma blusa sempre com a mesma calça). O problema quase nunca é falta de roupa: é falta de cruzamento entre bases neutras e pontos focais.",
        "No método Truque dos Mil Looks, cada peça de baixo precisa conversar com pelo menos 3 partes de cima e 2 calçados. Só essa regra já transforma 8 peças isoladas em 18 looks diferentes!"
      ],
      rules: [
        "Separe na frente do armário suas 5 peças neutras mais bem cortadas.",
        "Nunca guarde conjuntos juntos no mesmo cabide — separe-os para forçar novas misturas.",
        "Fotografe no Closet IA aquela peça que você ama mas nunca sabe como combinar."
      ],
      challenge: "Escolha hoje 1 peça parada há mais de 30 dias e monte 2 combinações com ela no Provador Virtual."
    },
    {
      id: "m2",
      num: "02",
      duration: "4 min · Cores",
      title: "A Regra das 3 Cores & Neutros Ricos",
      subtitle: "Como parecer elegante sem esforço usando harmonia cromática.",
      body: [
        "Looks que parecem 'caros' raramente têm mais de 3 cores principais. A fórmula infalível das consultoras é: 2 Neutros Elegantes (Off-White, Areia, Marinho, Preto ou Caramelo) + 1 Ponto de Personalidade (Vinho, Verde Oliva, Rosé ou Acessório Dourado).",
        "Trocar o branco óptico puro pelo Off-White/Creme e o preto pesado pelo Marinho ou Caramelo durante o dia suaviza as linhas de expressão e ilumina o rosto na hora."
      ],
      rules: [
        "Base Clara (Off-White + Areia) = visual 'Old Money' fresco e iluminado.",
        "Base Escura (Preto/Marinho + Vinho) = autoridade, presença e alongamento.",
        "Repita a cor da bolsa ou do sapato em algum detalhe superior ('sanduíche de cor')."
      ],
      challenge: "Monte no Provador um look usando exatamente 2 neutros + 1 ponto de cor vinho ou caramelo."
    },
    {
      id: "m3",
      num: "03",
      duration: "4 min · Proporção",
      title: "Proporção 1/3 para 2/3: Alongar Sem Salto",
      subtitle: "O truque visual de milímetros que alonga as pernas instantaneamente.",
      body: [
        "Quando vestimos uma blusa comprida solta por cima da calça, dividimos o corpo ao meio (1/2 + 1/2), o que achata a silhueta. A elegância mora na proporção áurea: 1/3 na parte de cima e 2/3 nas pernas!",
        "Como aplicar em 5 segundos? Faça o 'french tuck' (prenda apenas a pontinha frontal da camisa ou blusa no cós da calça/saia) e use sapatos nude/bege ou da mesma cor da calça."
      ],
      rules: [
        "Peça justa em cima + fluida embaixo (ex.: regata canelada + pantalona).",
        "Peça ampla em cima + reta embaixo (ex.: camisa soltinha + jeans reto escuro).",
        "Mostrar punhos (dobrar levemente a manga do blazer) e tornozelos afina a silhueta."
      ],
      challenge: "Teste amanhã prender levemente a frente da blusa no cós e dobrar 2 voltas na manga da camisa/blazer."
    },
    {
      id: "m4",
      num: "04",
      duration: "3 min · Multiplicação",
      title: "O Poder Mágico da Terceira Peça",
      subtitle: "Como transformar camiseta + jeans em look digno de elogios.",
      body: [
        "Blazer de alfaiataria, cardigã alongado, camisa aberta usada como sobreposição ou colete estruturado: a 3ª peça cria duas linhas verticais no centro do tronco que afinam, alongam e comunicam intenção.",
        "No calor? Use uma camisa de linho/viscose aberta sobre regata ou amarre um tricô fino sobre os ombros — funciona como 3ª peça sem esquentar!"
      ],
      rules: [
        "Blazer Areia/Off-White funciona com 100% do seu armário, do jeans ao vestido preto.",
        "Deixe a 3ª peça aberta para criar a linha vertical central alongadora.",
        "Um cinto fino ou colar dourado também cumpre papel de 3º elemento visual no verão."
      ],
      challenge: "Ative a opção '+ 3ª Peça' no Provador Virtual e compare a nota de harmonia antes e depois."
    },
    {
      id: "m5",
      num: "05",
      duration: "4 min · Acabamento",
      title: "Sapatos & Bolsas que Levantam o Look",
      subtitle: "O detalhe final que separa o look comum da produção impecável.",
      body: [
        "Você pode estar de jeans e camiseta básica: se o sapato estiver bem conservado e a bolsa tiver estrutura (formato firme), o cérebro de quem te vê lê 'mulher elegante'.",
        "Você só precisa de 3 calçados estratégicos para cobrir 99% da sua rotina: 1 Scarpin/Slingback Nude (alonga), 1 Tênis de Couro Branco Limpo (moderniza) e 1 Mule/Loafer Caramelo ou Preto (praticidade chique)."
      ],
      rules: [
        "Calça pantalona pede ponta do pé levemente aparente (bico fino ou amendoado).",
        "Saia midi fica ultra moderna com tênis branco limpo ou sofisticada com slingback nude.",
        "Bolsas estruturadas em vinho, caramelo ou preto elevam até looks esportivos."
      ],
      challenge: "Confira na aba 15→150 como o mesmo vestido ou calça muda totalmente só trocando tênis por scarpin."
    },
    {
      id: "m6",
      num: "06",
      duration: "3 min · Rotina",
      title: "Ritual dos 5 Minutos: Manhãs Sem Estresse",
      subtitle: "Nunca mais se atrase nem deixe roupas espalhadas em cima da cama.",
      body: [
        "A fadiga de decisão acontece quando tentamos escolher roupa com pressa de manhã. O segredo das mulheres sempre bem-vestidas é separar 2 minutos na noite anterior usando o celular.",
        "Abra a tela inicial deste App, clique na ocasião de amanhã e no clima previsto, salve o look nos Favoritos e deixe as peças no primeiro cabide."
      ],
      rules: [
        "Olhe a previsão do tempo em 10 segundos antes de gerar o Look do Dia.",
        "Salve seus looks campeões em 'Meus Looks Favoritos' para dias corridos.",
        "Vai viajar ou ter semana intensa? Gere os 5 dias de uma vez no Montador de Mala!"
      ],
      challenge: "Gere e salve hoje mesmo 2 looks prontos na aba Início para usar nos próximos dias."
    },
    {
      id: "m7",
      num: "07",
      duration: "4 min · Economia",
      title: "Regra dos 3 Looks: Fim das Compras por Impulso",
      subtitle: "Como economizar centenas de reais por mês comprando só o que multiplica.",
      body: [
        "Peça cara não é a da etiqueta alta — peça cara é aquela que você compra na promoção, usa uma única vez e deixa parada porque não combina com nada ('peça órfã').",
        "Antes de comprar qualquer roupa nova, abra seu Closet Digital aqui no App e faça o teste de ouro: ela combina imediatamente com pelo menos 3 peças que você JÁ tem em casa? Se a resposta for menos que 3, não leve!"
      ],
      rules: [
        "Priorize tecidos que respiram e duram: algodão, viscose encorpada, linho misto e boa alfaiataria.",
        "Invista 70% em bases neutras atemporais e 30% em cores/modelagens de destaque.",
        "Use a checklist 15→150 para identificar qual peça curinga realmente falta no seu armário."
      ],
      challenge: "Marque na aba 15→150 todas as peças que você já tem antes da sua próxima compra."
    }
  ];

  /* ---------------- IndexedDB para Fotos Reais das Roupas ---------------- */
  var photoMemCache = {};

  function openPhotoDb() {
    return new Promise(function (resolve) {
      if (!window.indexedDB) { resolve(null); return; }
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE);
        }
      };
      req.onsuccess = function (e) { resolve(e.target.result); };
      req.onerror = function () { resolve(null); };
    });
  }

  function savePhotoToDb(id, dataUrl) {
    photoMemCache[id] = dataUrl;
    return openPhotoDb().then(function (db) {
      if (!db) return;
      return new Promise(function (resolve) {
        var tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).put(dataUrl, id);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { resolve(); };
      });
    });
  }

  function deletePhotoFromDb(id) {
    delete photoMemCache[id];
    return openPhotoDb().then(function (db) {
      if (!db) return;
      var tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).delete(id);
    });
  }

  function loadAllPhotosFromDb() {
    return openPhotoDb().then(function (db) {
      if (!db) return;
      return new Promise(function (resolve) {
        var tx = db.transaction(DB_STORE, "readonly");
        var st = tx.objectStore(DB_STORE);
        var keysReq = st.getAllKeys();
        keysReq.onsuccess = function () {
          var keys = keysReq.result || [];
          if (!keys.length) { resolve(); return; }
          var left = keys.length;
          keys.forEach(function (k) {
            var r = st.get(k);
            r.onsuccess = function () {
              if (r.result) photoMemCache[k] = r.result;
              if (--left === 0) resolve();
            };
            r.onerror = function () { if (--left === 0) resolve(); };
          });
        };
        keysReq.onerror = function () { resolve(); };
      });
    });
  }

  /* ---------------- Estado Persistente ---------------- */
  function createDefaultState() {
    var ownedMap = {};
    BASE_CAPSULE.forEach(function (c) { ownedMap[c.id] = true; });
    return {
      user: null,
      closet: BASE_CAPSULE.map(function (c) { return Object.assign({}, c); }),
      capsuleOwned: ownedMap,
      savedLooks: [],
      completedLessons: {},
      chatHistory: []
    };
  }

  var state = createDefaultState();

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        state = Object.assign(createDefaultState(), parsed);
        if (!Array.isArray(state.closet) || !state.closet.length) {
          state.closet = BASE_CAPSULE.map(function (c) { return Object.assign({}, c); });
        }
      }
    } catch (e) {}
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function getPieceImg(piece) {
    if (!piece) return makeGarmentSvg("shirt", "offwhite");
    if (piece.hasPhoto && photoMemCache[piece.id]) return photoMemCache[piece.id];
    return makeGarmentSvg(piece.shape || defaultShapeForCat(piece.cat), piece.color || "bege");
  }

  /* ---------------- Helpers DOM & Toast ---------------- */
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var toastTimer = null;
  function showToast(msg) {
    var el = $("#appToast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2600);
  }

  function openModal(id) {
    var m = document.getElementById(id);
    if (m) m.hidden = false;
  }
  function closeModal(id) {
    var m = document.getElementById(id);
    if (m) m.hidden = true;
  }

  /* ---------------- Motor de Harmonia Cromática & Proporção ---------------- */
  function scoreOutfit(items) {
    var valid = items.filter(Boolean);
    if (!valid.length) return { score: 85, title: "Selecione suas peças", desc: "Adicione peças para calcular a harmonia." };

    var colors = valid.map(function (p) { return COLORS[p.color] || COLORS.bege; });
    var uniqueColors = {};
    valid.forEach(function (p) { uniqueColors[p.color] = true; });
    var colorCount = Object.keys(uniqueColors).length;
    var accentCount = colors.filter(function (c) { return !c.neutral; }).length;
    var hasOuter = valid.some(function (p) { return p.cat === "outer"; });

    var score = 91;
    var title = "✦ Harmonia Clássica Sofisticada";
    var desc = "";

    if (colorCount <= 3 && accentCount <= 2) {
      score += 5;
      title = accentCount >= 1
        ? "✦ Regra das 3 Cores Perfeita"
        : "✦ Elegância Monocromática / Neutra";
    } else if (colorCount >= 4) {
      score -= 4;
      title = "✦ Mix Criativo de Cores";
    }
    if (hasOuter) score += 2;
    score = Math.max(84, Math.min(99, score));

    var h = (state.user && state.user.height) || 163;
    var bodyKey = (state.user && state.user.body) || "ampulheta";
    var hTip = h <= 160
      ? "Para " + (h / 100).toFixed(2).replace(".", ",") + "m, prenda levemente a frente da blusa para alongar."
      : "Caimento calibrado para " + (h / 100).toFixed(2).replace(".", ",") + "m — " + (BODY_TIPS[bodyKey] || "");

    desc = (hasOuter ? "A 3ª peça cria linha vertical que afina e traz acabamento imediato. " : "") + hTip;
    return { score: score, title: title, desc: desc };
  }

  /* ---------------- Gerador Inteligente de Combinação ---------------- */
  var dailyOcc = "trabalho";
  var dailyWeather = "ameno";
  var currentDailyLook = null;

  function pickByCat(cat, occ) {
    var all = state.closet.filter(function (p) { return p.cat === cat; });
    if (!all.length) return null;
    var matching = all.filter(function (p) { return !occ || (p.occs || []).indexOf(occ) !== -1; });
    var pool = matching.length ? matching : all;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function generateSmartLook(occ, weather) {
    var dresses = state.closet.filter(function (p) { return p.cat === "dress"; });
    var useDress = dresses.length > 0 && (occ === "evento" || occ === "encontro") && Math.random() < 0.36;

    var chosen = [];
    if (useDress) {
      var dr = pickByCat("dress", occ);
      if (dr) chosen.push(dr);
    } else {
      var top = pickByCat("top", occ);
      var bot = pickByCat("bottom", occ);
      if (top) chosen.push(top);
      if (bot) chosen.push(bot);
    }

    if (weather === "frio" || (weather === "ameno" && occ !== "passeio") || Math.random() < 0.55) {
      if (weather !== "quente") {
        var out = pickByCat("outer", occ);
        if (out) chosen.push(out);
      }
    }

    var sh = pickByCat("shoes", occ);
    var bg = pickByCat("bag", occ);
    if (sh) chosen.push(sh);
    if (bg) chosen.push(bg);

    return {
      occ: occ,
      weather: weather,
      pieces: chosen,
      harmony: scoreOutfit(chosen)
    };
  }

  function renderDailyLook() {
    var box = $("#dailyLookBox");
    if (!box) return;
    if (!currentDailyLook) currentDailyLook = generateSmartLook(dailyOcc, dailyWeather);
    var lk = currentDailyLook;

    box.innerHTML =
      '<div class="look-strip">' +
        lk.pieces.map(function (p) {
          return '<div class="look-mini">' +
            '<div class="look-mini__thumb"><img src="' + getPieceImg(p) + '" alt="' + escapeHtml(p.name) + '"></div>' +
            '<strong>' + escapeHtml(p.name) + '</strong>' +
            '<span>' + (CAT_LABELS[p.cat] || "") + '</span>' +
          '</div>';
        }).join("") +
      '</div>' +
      '<div class="daily-look__note">' +
        '<strong>' + lk.harmony.score + '% Harmonia · ' + lk.harmony.title.replace("✦ ", "") + ':</strong> ' +
        escapeHtml(lk.harmony.desc) +
      '</div>';
  }

  /* ---------------- Provador Virtual ---------------- */
  var fitterState = {
    mode: "separates", // separates | dress
    useOuter: true,
    idx: { outer: 0, top: 0, bottom: 0, dress: 0, shoes: 0, bag: 0 }
  };

  function getListByCat(cat) {
    return state.closet.filter(function (p) { return p.cat === cat; });
  }

  function getFitterActivePieces() {
    var list = [];
    if (fitterState.useOuter) {
      var outs = getListByCat("outer");
      if (outs.length) list.push(outs[((fitterState.idx.outer % outs.length) + outs.length) % outs.length]);
    }
    if (fitterState.mode === "dress") {
      var drs = getListByCat("dress");
      if (drs.length) list.push(drs[((fitterState.idx.dress % drs.length) + drs.length) % drs.length]);
    } else {
      var tops = getListByCat("top");
      var bots = getListByCat("bottom");
      if (tops.length) list.push(tops[((fitterState.idx.top % tops.length) + tops.length) % tops.length]);
      if (bots.length) list.push(bots[((fitterState.idx.bottom % bots.length) + bots.length) % bots.length]);
    }
    var shs = getListByCat("shoes");
    var bgs = getListByCat("bag");
    if (shs.length) list.push(shs[((fitterState.idx.shoes % shs.length) + shs.length) % shs.length]);
    if (bgs.length) list.push(bgs[((fitterState.idx.bag % bgs.length) + bgs.length) % bgs.length]);
    return list;
  }

  function renderFitter() {
    var stage = $("#fitterStage");
    if (!stage) return;

    $("#fitTypeSeparates").classList.toggle("active", fitterState.mode === "separates");
    $("#fitTypeDress").classList.toggle("active", fitterState.mode === "dress");
    $("#chkThirdPiece").checked = fitterState.useOuter;

    var slots = [];
    if (fitterState.useOuter) slots.push({ cat: "outer", label: "3ª Peça / Sobreposição" });
    if (fitterState.mode === "dress") {
      slots.push({ cat: "dress", label: "Peça Única / Vestido" });
    } else {
      slots.push({ cat: "top", label: "Parte de Cima" });
      slots.push({ cat: "bottom", label: "Parte de Baixo" });
    }
    slots.push({ cat: "shoes", label: "Calçado" });
    slots.push({ cat: "bag", label: "Bolsa / Acessório" });

    stage.innerHTML = slots.map(function (sl) {
      var items = getListByCat(sl.cat);
      if (!items.length) {
        return '<div class="fit-slot">' +
          '<span></span><div class="fit-slot__thumb">👗</div>' +
          '<div class="fit-slot__meta"><small>' + sl.label + '</small><strong>Nenhuma peça cadastrada</strong><span>Adicione na aba Closet</span></div>' +
          '<span></span></div>';
      }
      var pos = ((fitterState.idx[sl.cat] % items.length) + items.length) % items.length;
      var p = items[pos];
      var col = COLORS[p.color] || COLORS.bege;
      return '<div class="fit-slot" data-slot="' + sl.cat + '">' +
        '<button type="button" class="fit-slot__arrow" data-step-cat="' + sl.cat + '" data-dir="-1" aria-label="Peça anterior">‹</button>' +
        '<div class="fit-slot__thumb"><img src="' + getPieceImg(p) + '" alt="' + escapeHtml(p.name) + '"></div>' +
        '<div class="fit-slot__meta">' +
          '<small>' + sl.label + ' (' + (pos + 1) + '/' + items.length + ')</small>' +
          '<strong>' + escapeHtml(p.name) + '</strong>' +
          '<span>' + col.label + '</span>' +
        '</div>' +
        '<button type="button" class="fit-slot__arrow" data-step-cat="' + sl.cat + '" data-dir="1" aria-label="Próxima peça">›</button>' +
      '</div>';
    }).join("");

    var activePieces = getFitterActivePieces();
    var h = scoreOutfit(activePieces);
    $("#harmonyPct").textContent = h.score + "%";
    $("#harmonyTitle").textContent = h.title;
    $("#harmonyDesc").textContent = h.desc;
  }

  function loadPiecesIntoFitter(pieces) {
    var hasDress = pieces.some(function (p) { return p.cat === "dress"; });
    var hasOuter = pieces.some(function (p) { return p.cat === "outer"; });
    fitterState.mode = hasDress ? "dress" : "separates";
    fitterState.useOuter = hasOuter;

    pieces.forEach(function (p) {
      var list = getListByCat(p.cat);
      var i = list.findIndex(function (x) { return x.id === p.id; });
      if (i !== -1) fitterState.idx[p.cat] = i;
    });
    switchTab("provador", "provador");
    renderFitter();
  }

  /* ---------------- Exportar Card PNG do Look (Canvas Alta Resolução) ---------------- */
  function exportCurrentLookPng() {
    var pieces = getFitterActivePieces();
    if (!pieces.length) return;
    showToast("Gerando card em alta resolução… ✨");

    var W = 900, H = 1125;
    var cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    var ctx = cv.getContext("2d");

    // Fundo creme editorial + moldura vinho & ouro
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#3D0A16");
    grad.addColorStop(0.19, "#6E1423");
    grad.addColorStop(0.191, "#FFFDF9");
    grad.addColorStop(1, "#F7EFE2");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "#DDA94B";
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, W - 48, H - 48);

    ctx.fillStyle = "#FCE8B8";
    ctx.font = "bold 22px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("✦ TRUQUE DOS MIL LOOKS · MEU LOOK ESCOLHIDO ✦", W / 2, 86);

    var uName = (state.user && state.user.name) ? state.user.name : "Aluna VIP";
    var hm = scoreOutfit(pieces);
    ctx.fillStyle = "#FFF8F0";
    ctx.font = "bold 36px Georgia, serif";
    ctx.fillText("Produção de " + uName + " (" + hm.score + "% Harmonia)", W / 2, 146);

    var imgsLoaded = pieces.map(function (p) {
      return new Promise(function (resolve) {
        var im = new Image();
        im.onload = function () { resolve({ piece: p, img: im }); };
        im.onerror = function () { resolve({ piece: p, img: null }); };
        im.src = getPieceImg(p);
      });
    });

    Promise.all(imgsLoaded).then(function (entries) {
      var cols = entries.length <= 4 ? 2 : 3;
      var cardW = cols === 2 ? 360 : 250;
      var cardH = cols === 2 ? 340 : 290;
      var gap = 26;

      entries.forEach(function (en, idx) {
        var row = Math.floor(idx / cols);
        var itemsInRow = Math.min(cols, entries.length - row * cols);
        var rowWidth = itemsInRow * cardW + (itemsInRow - 1) * gap;
        var startX = (W - rowWidth) / 2;
        var col = idx % cols;
        var x = startX + col * (cardW + gap);
        var y = 248 + row * (cardH + gap);

        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#E6D8C2";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 20);
        ctx.fill();
        ctx.stroke();

        if (en.img) {
          var ih = cardH - 76;
          ctx.drawImage(en.img, x + 16, y + 12, cardW - 32, ih);
        }
        ctx.fillStyle = "#6E1423";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText((CAT_LABELS[en.piece.cat] || "").toUpperCase(), x + cardW / 2, y + cardH - 38);

        ctx.fillStyle = "#261A16";
        ctx.font = "bold 19px Georgia, serif";
        var nm = en.piece.name.length > 26 ? en.piece.name.slice(0, 25) + "…" : en.piece.name;
        ctx.fillText(nm, x + cardW / 2, y + cardH - 14);
      });

      ctx.fillStyle = "#6E1423";
      ctx.font = "italic bold 23px Georgia, serif";
      ctx.fillText(hm.title, W / 2, H - 64);

      var link = document.createElement("a");
      link.download = "meu-look-truque-dos-mil-looks.png";
      link.href = cv.toDataURL("image/png");
      link.click();
      showToast("Card do Look salvo na sua galeria! 📸");
    });
  }

  /* ---------------- Montador de Mala & Semana ---------------- */
  var currentTrip = null;

  function buildTripPlan() {
    var occ = $("#tripOccasion").value;
    var days = parseInt($("#tripDays").value, 10) || 5;
    var weather = $("#tripWeather").value;

    var dayPlans = [];
    var usedMap = {};

    for (var d = 1; d <= days; d++) {
      var lk = generateSmartLook(occ, weather);
      lk.pieces.forEach(function (p) { usedMap[p.id] = p; });
      dayPlans.push({ day: d, look: lk });
    }

    currentTrip = {
      occ: occ,
      days: days,
      weather: weather,
      capsuleCount: Object.keys(usedMap).length,
      dayPlans: dayPlans
    };
    renderTripPlan();
  }

  function renderTripPlan() {
    var box = $("#tripResultBox");
    if (!box || !currentTrip) return;

    box.innerHTML =
      '<div class="trip-capsule-box">' +
        '<h4>✨ Mala Inteligente Pronta: apenas ' + currentTrip.capsuleCount + ' peças para ' + currentTrip.days + ' dias!</h4>' +
        '<p>Zero peso extra na mala: todas as peças abaixo conversam entre si sem repetir o mesmo visual.</p>' +
        '<button type="button" class="btn-gold btn-full" id="btnSaveAllTrip">💾 Salvar Roteiro nos Meus Favoritos</button>' +
      '</div>' +
      '<div class="trip-days-grid">' +
        currentTrip.dayPlans.map(function (dp, idx) {
          return '<div class="trip-day">' +
            '<div class="trip-day__head">' +
              '<span class="trip-day__badge">DIA ' + dp.day + ' · ' + dp.look.harmony.score + '% Harmonia</span>' +
              '<button type="button" class="trip-day__swap" data-swap-day="' + idx + '">🔄 Trocar Dia ' + dp.day + '</button>' +
            '</div>' +
            '<div class="look-strip">' +
              dp.look.pieces.map(function (p) {
                return '<div class="look-mini">' +
                  '<div class="look-mini__thumb"><img src="' + getPieceImg(p) + '" alt="' + escapeHtml(p.name) + '"></div>' +
                  '<strong>' + escapeHtml(p.name) + '</strong>' +
                  '<span>' + (CAT_LABELS[p.cat] || "") + '</span>' +
                '</div>';
              }).join("") +
            '</div>' +
          '</div>';
        }).join("") +
      '</div>';

    var btnSaveTrip = $("#btnSaveAllTrip");
    if (btnSaveTrip) {
      btnSaveTrip.addEventListener("click", function () {
        if (!currentTrip || !currentTrip.dayPlans.length) return;
        currentTrip.dayPlans.slice(0, 3).forEach(function (dp) {
          saveLookItem("Mala Dia " + dp.day, dp.look.pieces);
        });
        renderSavedLooks();
        showToast("Looks da viagem salvos nos seus Favoritos! 🧳✨");
      });
    }

    $$("[data-swap-day]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = parseInt(b.dataset.swapDay, 10);
        if (currentTrip && currentTrip.dayPlans[i]) {
          currentTrip.dayPlans[i].look = generateSmartLook(currentTrip.occ, currentTrip.weather);
          renderTripPlan();
          showToast("Look do Dia " + (i + 1) + " atualizado!");
        }
      });
    });
  }

  /* ---------------- Closet Digital + Detecção IA de Cor na Foto ---------------- */
  var activeClosetFilter = "all";
  var pendingPhotoDataUrl = null;

  function detectDominantColorKey(canvas) {
    var ctx = canvas.getContext("2d");
    var w = canvas.width, h = canvas.height;
    var sx = Math.floor(w * 0.25), sy = Math.floor(h * 0.25);
    var sw = Math.max(1, Math.floor(w * 0.5)), sh = Math.max(1, Math.floor(h * 0.5));
    var data = ctx.getImageData(sx, sy, sw, sh).data;

    var rSum = 0, gSum = 0, bSum = 0, count = 0;
    for (var i = 0; i < data.length; i += 16) {
      if (data[i + 3] < 128) continue;
      rSum += data[i]; gSum += data[i + 1]; bSum += data[i + 2];
      count++;
    }
    if (!count) return "bege";
    var r = rSum / count, g = gSum / count, b = bSum / count;

    var palette = [
      { key: "offwhite", rgb: [242, 238, 230] },
      { key: "preto",    rgb: [36, 34, 36] },
      { key: "bege",     rgb: [215, 194, 166] },
      { key: "vinho",    rgb: [115, 28, 42] },
      { key: "marinho",  rgb: [32, 48, 82] },
      { key: "jeans",    rgb: [68, 102, 145] },
      { key: "caramelo", rgb: [164, 102, 58] },
      { key: "oliva",    rgb: [92, 108, 72] },
      { key: "rose",     rgb: [218, 162, 162] },
      { key: "cinza",    rgb: [142, 146, 152] }
    ];

    var bestKey = "bege", bestDist = Infinity;
    palette.forEach(function (p) {
      var d = Math.hypot(r - p.rgb[0], g - p.rgb[1], b - p.rgb[2]);
      if (d < bestDist) { bestDist = d; bestKey = p.key; }
    });
    return bestKey;
  }

  function processUploadedImage(file) {
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onload = function (ev) {
        var img = new Image();
        img.onload = function () {
          var maxSide = 680;
          var scale = Math.min(1, maxSide / Math.max(img.width, img.height));
          var w = Math.max(1, Math.round(img.width * scale));
          var h = Math.max(1, Math.round(img.height * scale));
          var cv = document.createElement("canvas");
          cv.width = w; cv.height = h;
          var ctx = cv.getContext("2d");
          ctx.fillStyle = "#FFFDF9";
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          var detectedColor = detectDominantColorKey(cv);
          var dataUrl = cv.toDataURL("image/jpeg", 0.82);
          resolve({ dataUrl: dataUrl, colorKey: detectedColor });
        };
        img.onerror = function () { resolve(null); };
        img.src = ev.target.result;
      };
      reader.onerror = function () { resolve(null); };
      reader.readAsDataURL(file);
    });
  }

  function renderCloset() {
    var grid = $("#closetGrid");
    if (!grid) return;

    var total = state.closet.length;
    var tops = getListByCat("top").length;
    var bots = getListByCat("bottom").length;
    var drs = getListByCat("dress").length;
    var outs = Math.max(1, getListByCat("outer").length + 1);
    var shs = Math.max(1, getListByCat("shoes").length);
    var combos = Math.max(12, (tops * bots + drs * 2) * outs * Math.min(3, shs));

    $("#kpiPieces").textContent = String(total);
    $("#kpiPotential").textContent = combos + "+";
    $("#closetSummaryTxt").textContent = total + " peças no seu Closet Digital";
    var eff = Math.min(98, 76 + Math.min(22, total));
    $("#closetEfficiencyTxt").textContent = "⚡ " + eff + "% de aproveitamento";
    $("#closetMeterFill").style.width = eff + "%";

    var filtered = activeClosetFilter === "all"
      ? state.closet
      : state.closet.filter(function (p) { return p.cat === activeClosetFilter; });

    grid.innerHTML = filtered.map(function (p) {
      var col = COLORS[p.color] || COLORS.bege;
      return '<article class="piece-card">' +
        '<div class="piece-card__img"><img src="' + getPieceImg(p) + '" alt="' + escapeHtml(p.name) + '"></div>' +
        '<div class="piece-card__body">' +
          '<span class="piece-card__cat">' + (CAT_LABELS[p.cat] || "") + '</span>' +
          '<h4 class="piece-card__name">' + escapeHtml(p.name) + '</h4>' +
          '<div class="piece-card__foot">' +
            '<span class="color-dot"><i style="background:' + col.hex + '"></i>' + col.label.split(" / ")[0] + '</span>' +
            '<button type="button" class="piece-card__del" data-del-piece="' + p.id + '" title="Remover peça">🗑️</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join("");
  }

  /* ---------------- Meus Looks Salvos ---------------- */
  function saveLookItem(title, pieces) {
    var entry = {
      id: "lk_" + Date.now() + "_" + Math.floor(Math.random() * 999),
      title: title,
      pieceIds: pieces.map(function (p) { return p.id; }),
      score: scoreOutfit(pieces).score
    };
    state.savedLooks.unshift(entry);
    if (state.savedLooks.length > 30) state.savedLooks.length = 30;
    saveState();
  }

  function renderSavedLooks() {
    var box = $("#savedLooksList");
    var cnt = $("#savedLooksCount");
    if (!box || !cnt) return;
    cnt.textContent = String(state.savedLooks.length);

    if (!state.savedLooks.length) {
      box.innerHTML = '<div class="saved-empty">Seus looks salvos no Início, no Provador ou na Mala aparecerão aqui para você consultar em segundos! ✨</div>';
      return;
    }

    box.innerHTML = state.savedLooks.map(function (lk) {
      var pcs = lk.pieceIds.map(function (id) {
        return state.closet.find(function (c) { return c.id === id; });
      }).filter(Boolean);
      if (!pcs.length) return "";
      return '<div class="saved-card">' +
        '<div class="saved-card__head">' +
          '<strong>✦ ' + escapeHtml(lk.title) + ' (' + lk.score + '%)</strong>' +
          '<div>' +
            '<button type="button" class="saved-card__del" data-open-saved="' + lk.id + '" style="color:#6E1423">🪞 Provador</button>' +
            '<button type="button" class="saved-card__del" data-del-saved="' + lk.id + '">Excluir</button>' +
          '</div>' +
        '</div>' +
        '<div class="look-strip">' +
          pcs.map(function (p) {
            return '<div class="look-mini">' +
              '<div class="look-mini__thumb"><img src="' + getPieceImg(p) + '" alt="' + escapeHtml(p.name) + '"></div>' +
              '<strong>' + escapeHtml(p.name) + '</strong>' +
            '</div>';
          }).join("") +
        '</div>' +
      '</div>';
    }).join("");
  }

  /* ---------------- Aba 15 Peças -> 150 Looks ---------------- */
  var activeFormulaFilter = "all";

  function renderCapsule150() {
    var listEl = $("#capsuleChecklist");
    if (!listEl) return;

    var owned = 0;
    BASE_CAPSULE.forEach(function (c) { if (state.capsuleOwned[c.id]) owned++; });
    var unlocked = owned === 15 ? 150 : Math.max(4, Math.round(Math.pow(owned / 15, 1.55) * 150));

    $("#capOwnedCount").textContent = owned + " / 15 peças";
    $("#capUnlockedLooks").textContent = unlocked + " looks";
    $("#capMeterFill").style.width = Math.round((owned / 15) * 100) + "%";

    listEl.innerHTML = BASE_CAPSULE.map(function (c) {
      var chk = !!state.capsuleOwned[c.id];
      return '<label class="cap-item' + (chk ? " checked" : "") + '">' +
        '<input type="checkbox" data-cap-check="' + c.id + '"' + (chk ? " checked" : "") + '>' +
        '<div>' +
          '<strong>' + escapeHtml(c.name) + '</strong>' +
          '<small>' + escapeHtml(c.role) + '</small>' +
        '</div>' +
      '</label>';
    }).join("");

    renderFormulas();
  }

  function renderFormulas() {
    var fBox = $("#formulaList");
    if (!fBox) return;
    var items = activeFormulaFilter === "all"
      ? FORMULAS
      : FORMULAS.filter(function (f) { return f.occ === activeFormulaFilter; });

    fBox.innerHTML = items.map(function (f) {
      return '<div class="formula-card">' +
        '<div class="formula-card__top">' +
          '<span class="formula-card__tag">' + f.tag + '</span>' +
        '</div>' +
        '<h4>' + f.title + '</h4>' +
        '<div class="formula-card__eq">' + f.eq + '</div>' +
        '<p>💡 ' + f.tip + '</p>' +
        '<button type="button" class="btn-outline btn-full" data-try-formula="' + f.id + '">🪞 Testar esta Fórmula no Provador</button>' +
      '</div>';
    }).join("");
  }

  /* ---------------- Aba Aulas ---------------- */
  function renderLessons() {
    var box = $("#lessonsList");
    if (!box) return;
    var doneCount = LESSONS.filter(function (l) { return !!state.completedLessons[l.id]; }).length;
    var pct = Math.round((doneCount / LESSONS.length) * 100);

    $("#kpiLessons").textContent = doneCount + "/" + LESSONS.length;
    $("#lessonsProgressPct").textContent = pct + "% concluído (" + doneCount + "/" + LESSONS.length + ")";
    $("#lessonsMeterFill").style.width = pct + "%";

    box.innerHTML = LESSONS.map(function (l) {
      var isDone = !!state.completedLessons[l.id];
      return '<button type="button" class="lesson-card' + (isDone ? " done" : "") + '" data-open-lesson="' + l.id + '">' +
        '<span class="lesson-card__num">' + (isDone ? "✓" : l.num) + '</span>' +
        '<div>' +
          '<small>' + l.duration + (isDone ? " · CONCLUÍDA" : "") + '</small>' +
          '<strong>' + l.title + '</strong>' +
          '<span>' + l.subtitle + '</span>' +
        '</div>' +
      '</button>';
    }).join("");
  }

  function openLessonReader(id) {
    var l = LESSONS.find(function (x) { return x.id === id; });
    if (!l) return;
    var isDone = !!state.completedLessons[l.id];
    $("#lessonModalMod").textContent = "Aula " + l.num + " · " + l.duration.split(" · ")[0];
    $("#lessonModalBody").innerHTML =
      '<div class="lesson-reader">' +
        '<h4>' + l.title + '</h4>' +
        l.body.map(function (p) { return '<p>' + p + '</p>'; }).join("") +
        '<div class="lesson-box">' +
          '<strong>✦ Regras de Ouro desta Aula:</strong>' +
          '<ul>' + l.rules.map(function (r) { return '<li>' + r + '</li>'; }).join("") + '</ul>' +
        '</div>' +
        '<div class="lesson-box" style="background:#EEFBF3;border-color:rgba(18,128,69,.3)">' +
          '<strong style="color:#128045">⚡ Desafio Prático de 2 Minutos:</strong>' +
          '<p style="margin:0;font-size:13.5px">' + l.challenge + '</p>' +
        '</div>' +
        '<button type="button" class="btn-gold btn-full" id="btnToggleLessonDone">' +
          (isDone ? "✓ Aula Concluída! (Fechar)" : "✓ Marcar Aula como Concluída") +
        '</button>' +
      '</div>';

    $("#btnToggleLessonDone").addEventListener("click", function () {
      state.completedLessons[l.id] = true;
      saveState();
      renderLessons();
      closeModal("modalLesson");
      showToast("Parabéns! Aula " + l.num + " concluída! 🎓✨");
    });
    openModal("modalLesson");
  }

  /* ---------------- Assistente Virtual de Estilo (Chat Inteligente) ---------------- */
  function answerStylistQuestion(qRaw) {
    var q = qRaw.toLowerCase();
    var uName = (state.user && state.user.name) ? state.user.name.split(" ")[0] : "Querida";
    var h = (state.user && state.user.height) || 163;
    var hFmt = (h / 100).toFixed(2).replace(".", ",") + "m";

    if (q.indexOf("preta") !== -1 || q.indexOf("preto") !== -1) {
      return uName + ", para deixar uma peça **preta** muito mais chique e iluminada, fuja do tudo-escuro pesado durante o dia: combine com **Off-White/Creme** perto do rosto + uma **3ª peça Areia ou Caramelo** e bolsa Vinho! Já deixei essa fórmula pronta pra você testar no Provador. ✨";
    }
    if (q.indexOf("alongar") !== -1 || q.indexOf("salto") !== -1 || q.indexOf("baixa") !== -1 || q.indexOf("altura") !== -1) {
      return "Para a sua estatura de **" + hFmt + "**, os 3 segredos que alongam sem precisar de salto são: 1) Cós alto com a frente da blusa levemente presa (proporção 1/3 a 2/3); 2) Calçado nude/areia próximo ao tom da pele ou da mesma cor da calça; 3) 3ª peça aberta criando uma linha vertical no centro! 💃";
    }
    if (q.indexOf("jantar") !== -1 || q.indexOf("noite") !== -1 || q.indexOf("encontro") !== -1) {
      var lk = generateSmartLook("encontro", "ameno");
      var names = lk.pieces.map(function (p) { return p.name; }).join(" + ");
      return "Montei agora uma produção magnética com peças do seu Closet para jantar: **" + names + "** (" + lk.harmony.score + "% de harmonia!). Mistura sofisticação e presença sem esforço. 🍷✨";
    }
    if (q.indexOf("3 cores") !== -1 || q.indexOf("cor") !== -1 || q.indexOf("vinho") !== -1) {
      return "A **Regra das 3 Cores** que nunca erra é: **2 Neutros Ricos + 1 Cor de Presença**. Exemplo campeão: **Off-White + Areia + Vinho** (ou **Jeans Escuro + Creme + Caramelo**). Fica digno de revista em 30 segundos! 🎨";
    }
    if (q.indexOf("viagem") !== -1 || q.indexOf("mala") !== -1) {
      return "Para viajar leve, leve sempre **2 partes de cima para cada 1 parte de baixo**, apenas **2 calçados** (1 tênis branco limpo + 1 scarpin/loafer) e vá vestindo a 3ª peça mais encorpada no trajeto. Use a aba **Provador → Mala & Semana** que eu monto os dias completos pra você! 🧳";
    }
    var customLk = generateSmartLook("trabalho", "ameno");
    return uName + ", analisando seu perfil **" + (STYLE_LABELS[(state.user && state.user.style) || "moderna"]) + "** (" + hFmt + "), minha sugestão curinga no seu Closet é combinar **" +
      customLk.pieces.map(function (p) { return p.name; }).join(" + ") +
      "**. Toque na aba **Provador** para visualizar e ajustar cada peça! ✨";
  }

  function renderChat() {
    var box = $("#stylistChat");
    if (!box) return;
    if (!state.chatHistory.length) {
      var uName = (state.user && state.user.name) ? state.user.name.split(" ")[0] : "linda";
      state.chatHistory.push({
        role: "ai",
        text: "Olá, " + uName + "! ✨ Sou sua Consultora Virtual Truque dos Mil Looks. Já calibrei seu perfil. Me pergunte sobre qualquer roupa, cor ou ocasião!"
      });
    }
    box.innerHTML = state.chatHistory.map(function (m) {
      var formatted = escapeHtml(m.text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      return '<div class="msg msg--' + m.role + '">' + formatted + '</div>';
    }).join("");
    box.scrollTop = box.scrollHeight;
  }

  /* ---------------- Cabeçalho do Perfil & Abas ---------------- */
  function renderProfileHeader() {
    if (!state.user) return;
    var first = (state.user.name || "Aluna").trim().split(/\s+/)[0];
    $("#userInitial").textContent = first.charAt(0).toUpperCase();
    $("#homeGreeting").textContent = "Olá, " + first + "! ✨";
    $("#homeStyleBadge").textContent = "✦ " + (STYLE_LABELS[state.user.style] || "Elegante Moderna");
    var hFmt = ((state.user.height || 163) / 100).toFixed(2).replace(".", ",") + "m";
    $("#homeProportionTip").textContent = "Proporção calibrada para " + hFmt + ": " + (BODY_TIPS[state.user.body] || BODY_TIPS.ampulheta);
  }

  function switchTab(tabName, subMode) {
    $$(".tab-view").forEach(function (v) {
      v.classList.toggle("active", v.dataset.view === tabName);
    });
    $$(".tabbar__btn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.tab === tabName);
    });
    if (tabName === "provador" && subMode) {
      setProvadorSubmode(subMode);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setProvadorSubmode(mode) {
    var isFitter = mode !== "mala";
    $("#modeBtnFitter").classList.toggle("active", isFitter);
    $("#modeBtnSuitcase").classList.toggle("active", !isFitter);
    $("#subviewProvador").hidden = !isFitter;
    $("#subviewMala").hidden = isFitter;
    if (!isFitter && !currentTrip) buildTripPlan();
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---------------- PWA Install & Eventos ---------------- */
  var deferredInstallPrompt = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredInstallPrompt = e;
  });

  function renderAll() {
    renderProfileHeader();
    renderCloset();
    renderDailyLook();
    renderSavedLooks();
    renderFitter();
    renderCapsule150();
    renderLessons();
    renderChat();
  }

  function bindEvents() {
    // Login / Onboarding inicial
    $("#authForm").addEventListener("submit", function (e) {
      e.preventDefault();
      state.user = {
        name: ($("#inpName").value || "Aluna").trim(),
        email: ($("#inpEmail").value || "").trim(),
        height: Math.max(140, Math.min(195, parseInt($("#inpHeight").value, 10) || 163)),
        style: $("#inpStyle").value || "moderna",
        body: $("#inpBody").value || "ampulheta"
      };
      state.chatHistory = [];
      saveState();
      $("#authScreen").hidden = true;
      $("#appShell").hidden = false;
      currentDailyLook = generateSmartLook(dailyOcc, dailyWeather);
      renderAll();
      showToast("Bem-vinda ao seu App Oficial! 🎉");
    });

    // Barra inferior e atalhos de abas
    $$(".tabbar__btn").forEach(function (btn) {
      btn.addEventListener("click", function () { switchTab(btn.dataset.tab); });
    });
    $$("[data-goto-tab]").forEach(function (el) {
      el.addEventListener("click", function () {
        switchTab(el.dataset.gotoTab, el.dataset.submode);
      });
    });

    // Instalar App PWA
    $("#btnInstallTop").addEventListener("click", function () {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.finally(function () { deferredInstallPrompt = null; });
      } else {
        openModal("modalInstall");
      }
    });

    // Fechar qualquer modal
    document.addEventListener("click", function (e) {
      var closeEl = e.target.closest("[data-close-modal]");
      if (closeEl) closeModal(closeEl.dataset.closeModal);
    });

    // Editar Perfil
    $("#btnOpenProfile").addEventListener("click", function () {
      if (state.user) {
        $("#editName").value = state.user.name || "";
        $("#editHeight").value = state.user.height || 163;
        $("#editStyle").value = state.user.style || "moderna";
        $("#editBody").value = state.user.body || "ampulheta";
      }
      openModal("modalProfile");
    });
    $("#formEditProfile").addEventListener("submit", function (e) {
      e.preventDefault();
      state.user = Object.assign({}, state.user || {}, {
        name: ($("#editName").value || "Aluna").trim(),
        height: Math.max(140, Math.min(195, parseInt($("#editHeight").value, 10) || 163)),
        style: $("#editStyle").value,
        body: $("#editBody").value
      });
      saveState();
      closeModal("modalProfile");
      currentDailyLook = generateSmartLook(dailyOcc, dailyWeather);
      renderAll();
      showToast("Perfil atualizado com sucesso! ✨");
    });
    $("#btnRestoreDemoCloset").addEventListener("click", function () {
      BASE_CAPSULE.forEach(function (baseItem) {
        if (!state.closet.some(function (x) { return x.id === baseItem.id; })) {
          state.closet.push(Object.assign({}, baseItem));
        }
      });
      saveState();
      renderAll();
      closeModal("modalProfile");
      showToast("15 peças curingas restauradas no Closet!");
    });

    // Gerador Look do Dia (Home)
    $("#dailyOccasionRow").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-occ]");
      if (!btn) return;
      dailyOcc = btn.dataset.occ;
      $$("#dailyOccasionRow .chip").forEach(function (c) { c.classList.toggle("active", c === btn); });
      currentDailyLook = generateSmartLook(dailyOcc, dailyWeather);
      renderDailyLook();
    });
    $("#dailyWeatherRow").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-weather]");
      if (!btn) return;
      dailyWeather = btn.dataset.weather;
      $$("#dailyWeatherRow .chip").forEach(function (c) { c.classList.toggle("active", c === btn); });
      currentDailyLook = generateSmartLook(dailyOcc, dailyWeather);
      renderDailyLook();
    });
    $("#btnNewDailyLook").addEventListener("click", function () {
      currentDailyLook = generateSmartLook(dailyOcc, dailyWeather);
      renderDailyLook();
      showToast("Nova combinação gerada! ✨");
    });
    $("#btnSaveDailyLook").addEventListener("click", function () {
      if (!currentDailyLook) return;
      var occTitles = { trabalho: "Look Trabalho", passeio: "Look Passeio", encontro: "Look Jantar", evento: "Look Evento" };
      saveLookItem(occTitles[dailyOcc] || "Look do Dia", currentDailyLook.pieces);
      renderSavedLooks();
      showToast("Look salvo nos seus Favoritos! 💖");
    });
    $("#btnOpenDailyInFitter").addEventListener("click", function () {
      if (currentDailyLook) loadPiecesIntoFitter(currentDailyLook.pieces);
    });

    // Ações em Looks Salvos
    $("#savedLooksList").addEventListener("click", function (e) {
      var delBtn = e.target.closest("[data-del-saved]");
      if (delBtn) {
        var id = delBtn.dataset.delSaved;
        state.savedLooks = state.savedLooks.filter(function (x) { return x.id !== id; });
        saveState();
        renderSavedLooks();
        showToast("Look removido dos favoritos.");
        return;
      }
      var openBtn = e.target.closest("[data-open-saved]");
      if (openBtn) {
        var found = state.savedLooks.find(function (x) { return x.id === openBtn.dataset.openSaved; });
        if (found) {
          var pcs = found.pieceIds.map(function (pid) {
            return state.closet.find(function (c) { return c.id === pid; });
          }).filter(Boolean);
          if (pcs.length) loadPiecesIntoFitter(pcs);
        }
      }
    });

    // Chat Consultora Virtual
    $("#stylistPrompts").addEventListener("click", function (e) {
      var p = e.target.closest("[data-ask]");
      if (!p) return;
      $("#stylistInput").value = p.dataset.ask;
      $("#stylistForm").dispatchEvent(new Event("submit"));
    });
    $("#stylistForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var txt = ($("#stylistInput").value || "").trim();
      if (!txt) return;
      $("#stylistInput").value = "";
      state.chatHistory.push({ role: "user", text: txt });
      var reply = answerStylistQuestion(txt);
      state.chatHistory.push({ role: "ai", text: reply });
      if (state.chatHistory.length > 24) state.chatHistory = state.chatHistory.slice(-24);
      saveState();
      renderChat();
    });

    // Closet: filtros, adicionar peça por foto e excluir
    $("#closetCatFilter").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-cat]");
      if (!btn) return;
      activeClosetFilter = btn.dataset.cat;
      $$("#closetCatFilter .chip").forEach(function (c) { c.classList.toggle("active", c === btn); });
      renderCloset();
    });

    $("#btnOpenAddPiece").addEventListener("click", function () {
      pendingPhotoDataUrl = null;
      $("#formAddPiece").reset();
      $("#photoPreviewImg").hidden = true;
      $("#photoPreviewEmpty").hidden = false;
      $("#aiColorHint").hidden = true;
      openModal("modalAddPiece");
    });

    $("#inpPiecePhoto").addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      processUploadedImage(f).then(function (res) {
        if (!res) return;
        pendingPhotoDataUrl = res.dataUrl;
        $("#photoPreviewImg").src = res.dataUrl;
        $("#photoPreviewImg").hidden = false;
        $("#photoPreviewEmpty").hidden = true;
        $("#inpPieceColor").value = res.colorKey;
        $("#aiColorHint").hidden = false;
      });
    });

    $("#newPieceOccs").addEventListener("click", function (e) {
      var ch = e.target.closest("[data-pocc]");
      if (ch) ch.classList.toggle("active");
    });

    $("#formAddPiece").addEventListener("submit", function (e) {
      e.preventDefault();
      var name = ($("#inpPieceName").value || "").trim();
      var cat = $("#inpPieceCat").value;
      var color = $("#inpPieceColor").value;
      var occs = $$("#newPieceOccs .chip.active").map(function (c) { return c.dataset.pocc; });
      if (!occs.length) occs = ["passeio", "trabalho"];

      var newId = "u_" + Date.now();
      var newPiece = {
        id: newId,
        name: name,
        cat: cat,
        color: color,
        shape: defaultShapeForCat(cat),
        occs: occs,
        hasPhoto: !!pendingPhotoDataUrl
      };

      var finalize = function () {
        state.closet.unshift(newPiece);
        saveState();
        closeModal("modalAddPiece");
        renderCloset();
        renderFitter();
        showToast("Peça adicionada ao seu Closet! 👗✨");
      };

      if (pendingPhotoDataUrl) {
        savePhotoToDb(newId, pendingPhotoDataUrl).then(finalize);
      } else {
        finalize();
      }
    });

    $("#closetGrid").addEventListener("click", function (e) {
      var del = e.target.closest("[data-del-piece]");
      if (!del) return;
      if (state.closet.length <= 3) {
        showToast("Mantenha pelo menos 3 peças no Closet!");
        return;
      }
      var pid = del.dataset.delPiece;
      state.closet = state.closet.filter(function (p) { return p.id !== pid; });
      deletePhotoFromDb(pid);
      saveState();
      renderCloset();
      renderFitter();
      showToast("Peça removida do Closet.");
    });

    // Provador & Mala
    $("#modeBtnFitter").addEventListener("click", function () { setProvadorSubmode("provador"); });
    $("#modeBtnSuitcase").addEventListener("click", function () { setProvadorSubmode("mala"); });
    $("#fitTypeSeparates").addEventListener("click", function () { fitterState.mode = "separates"; renderFitter(); });
    $("#fitTypeDress").addEventListener("click", function () { fitterState.mode = "dress"; renderFitter(); });
    $("#chkThirdPiece").addEventListener("change", function (e) { fitterState.useOuter = e.target.checked; renderFitter(); });

    $("#fitterStage").addEventListener("click", function (e) {
      var arrow = e.target.closest("[data-step-cat]");
      if (!arrow) return;
      var cat = arrow.dataset.stepCat;
      var dir = parseInt(arrow.dataset.dir, 10) || 1;
      fitterState.idx[cat] = (fitterState.idx[cat] || 0) + dir;
      renderFitter();
    });

    $("#btnShuffleFitter").addEventListener("click", function () {
      ["outer", "top", "bottom", "dress", "shoes", "bag"].forEach(function (cat) {
        var list = getListByCat(cat);
        if (list.length) fitterState.idx[cat] = Math.floor(Math.random() * list.length);
      });
      renderFitter();
      showToast("Combinação sorteada no Provador! 🪞✨");
    });

    $("#btnSaveFitterLook").addEventListener("click", function () {
      var pcs = getFitterActivePieces();
      saveLookItem("Look do Provador", pcs);
      renderSavedLooks();
      showToast("Salvo em Meus Looks Favoritos! 💖");
    });

    $("#btnExportLookCard").addEventListener("click", exportCurrentLookPng);
    $("#btnBuildTrip").addEventListener("click", function () {
      buildTripPlan();
      showToast("Roteiro de mala criado com sucesso! 🧳✨");
    });

    // Aba 15 -> 150
    $("#capsuleChecklist").addEventListener("change", function (e) {
      var chk = e.target.closest("[data-cap-check]");
      if (!chk) return;
      state.capsuleOwned[chk.dataset.capCheck] = chk.checked;
      saveState();
      renderCapsule150();
    });
    $("#formulaFilterRow").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-focc]");
      if (!btn) return;
      activeFormulaFilter = btn.dataset.focc;
      $$("#formulaFilterRow .chip").forEach(function (c) { c.classList.toggle("active", c === btn); });
      renderFormulas();
    });
    $("#formulaList").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-try-formula]");
      if (!btn) return;
      var f = FORMULAS.find(function (x) { return x.id === btn.dataset.tryFormula; });
      if (!f) return;
      // Garante que as peças base da fórmula existam no closet
      Object.keys(f.ids).forEach(function (k) {
        var cid = f.ids[k];
        if (!cid) return;
        if (!state.closet.some(function (x) { return x.id === cid; })) {
          var baseObj = BASE_CAPSULE.find(function (b) { return b.id === cid; });
          if (baseObj) state.closet.push(Object.assign({}, baseObj));
        }
      });
      fitterState.mode = f.ids.dress ? "dress" : "separates";
      fitterState.useOuter = !!f.ids.outer;
      Object.keys(f.ids).forEach(function (cat) {
        var cid = f.ids[cat];
        if (!cid) return;
        var list = getListByCat(cat);
        var idx = list.findIndex(function (x) { return x.id === cid; });
        if (idx !== -1) fitterState.idx[cat] = idx;
      });
      switchTab("provador", "provador");
      renderFitter();
      showToast("Fórmula aberta no Provador Virtual! 🪞");
    });

    // Aba Aulas
    $("#lessonsList").addEventListener("click", function (e) {
      var card = e.target.closest("[data-open-lesson]");
      if (card) openLessonReader(card.dataset.openLesson);
    });
  }

  /* ---------------- Inicialização ---------------- */
  function init() {
    loadState();
    loadAllPhotosFromDb().then(function () {
      bindEvents();
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/app/sw.js").catch(function () {});
      }
      if (state.user && state.user.name) {
        $("#authScreen").hidden = true;
        $("#appShell").hidden = false;
        currentDailyLook = generateSmartLook(dailyOcc, dailyWeather);
        renderAll();
      } else {
        $("#authScreen").hidden = false;
        $("#appShell").hidden = true;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
