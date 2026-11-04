/* =========================================================
   TRUQUE DOS MIL LOOKS · Motor do quiz (Instant-Load + Mobile Scratch)
   Fluxo: hook → 14 perguntas (incl. peso e altura) → análise → resultado + oferta
   ========================================================= */
(function () {
  "use strict";

  var CFG = window.FUNIL_CONFIG || {};
  var CDN_ORIGIN = (CFG.cdnAssetOrigin || "https://descompacto.vercel.app").replace(/\/$/, "");
  var ON_VERCEL_DOMAIN = /\.vercel\.app$/i.test(window.location.hostname);

  /* Imagens otimizadas salvas localmente neste repositório */
  var LOCAL_ASSETS = {
    "assets/img/antes-depois-capa.jpg": true,
    "assets/img/antes-depois.jpg": true,
    "assets/img/antes-depois-1.jpg": true,
    "assets/img/antes-depois-2.jpg": true,
    "assets/img/antes-depois-3.jpg": true,
    "assets/img/bonus-montador-looks.jpg": true,
    "assets/img/bonus-closet-inteligente.jpg": true,
    "assets/img/bonus-provador-virtual.jpg": true
  };

  /* Resolve direto para a CDN na borda quando fora da Vercel (exceto assets novos locais),
     eliminando redirecionamento 302 e mantendo carregamento instantâneo */
  function assetUrl(relPath) {
    if (!relPath) return "";
    if (/^https?:\/\//i.test(relPath)) return relPath;
    var clean = relPath.replace(/^\//, "").split("?")[0];
    if (LOCAL_ASSETS[clean]) return relPath;
    if (ON_VERCEL_DOMAIN && !CFG.forceRemoteAssets) return relPath;
    return CDN_ORIGIN + "/" + relPath.replace(/^\//, "");
  }

  /* Fallback extra caso alguma imagem relativa remota falhe em qualquer ambiente */
  document.addEventListener("error", function (e) {
    var img = e.target;
    if (!img || img.tagName !== "IMG" || img.dataset.fbTried) return;
    var rawSrc = img.getAttribute("src") || "";
    if (rawSrc.indexOf("assets/img/") !== -1 && rawSrc.indexOf(CDN_ORIGIN) === -1) {
      var clean = rawSrc.slice(rawSrc.indexOf("assets/img/")).split("?")[0];
      if (LOCAL_ASSETS[clean]) return;
      img.dataset.fbTried = "1";
      img.src = CDN_ORIGIN + "/" + rawSrc.slice(rawSrc.indexOf("assets/img/"));
    }
  }, true);

  /* ---------------- Perguntas ---------------- */
  var QUESTIONS = [
    {
      id: "idade",
      kicker: "",
      title: "Qual é a sua faixa de idade?",
      hint: "",
      type: "single",
      layout: "grid-img",
      options: [
        { id: "18-24", img: "assets/img/idade-18-24.jpg", label: "18 a 24 anos" },
        { id: "25-34", img: "assets/img/idade-25-34.jpg", label: "25 a 34 anos" },
        { id: "35-44", img: "assets/img/idade-35-44.jpg", label: "35 a 44 anos" },
        { id: "45+", img: "assets/img/idade-45.jpg", label: "45 anos ou mais" }
      ]
    },
    {
      id: "guardaRoupa",
      kicker: "Seu ponto de partida",
      title: "Seja sincera: como está o seu guarda-roupa hoje?",
      type: "single",
      layout: "duo-img",
      options: [
        { id: "caos", img: "assets/img/guarda-roupa-caos.jpg", label: "Cheio de peças que não combinam entre si", small: "Abro, olho tudo… e fico angustiada." },
        { id: "repete", img: "assets/img/guarda-roupa-cheio.jpg", label: "Tenho bastante roupa, mas repito sempre os mesmos looks", small: "Uso uns 3 “uniformes” a semana inteira." }
      ]
    },
    {
      id: "dificuldade",
      kicker: "O que dói hoje",
      title: "Qual é a sua maior dificuldade com o guarda-roupa?",
      type: "single",
      layout: "list",
      options: [
        { id: "combinar", ico: "🧩", label: "Combinar as peças que eu já tenho" },
        { id: "valoriza", ico: "🪞", label: "Saber o que realmente valoriza meu corpo e meu estilo" },
        { id: "comprar", ico: "💸", label: "Parar de comprar errado e desperdiçar dinheiro" },
        { id: "tempo", ico: "⏰", label: "Montar looks bonitos em pouco tempo" }
      ]
    },
    {
      id: "estilo",
      kicker: "Sua identidade",
      title: "Qual desses estilos é mais a sua cara?",
      hint: "Toque no que faz seu olho brilhar — não no que “deveria” ser.",
      type: "single",
      layout: "grid-img",
      options: [
        { id: "classica", img: "assets/img/perfil-classica.jpg?v=2", label: "Clássica elegante", small: "Alfaiataria, neutros, joias discretas" },
        { id: "moderna", img: "assets/img/perfil-moderna.jpg?v=2", label: "Moderna minimalista", small: "Linhas limpas, básico bem cortado" },
        { id: "romantica", img: "assets/img/perfil-romantica.jpg?v=3", label: "Romântica sofisticada", small: "Fluidez, tons suaves, delicadeza" },
        { id: "criativa", img: "assets/img/perfil-criativa.jpg?v=2", label: "Criativa autêntica", small: "Sobreposições, cor, personalidade" },
        { id: "fitness", img: "assets/img/perfil-fitness.jpg", label: "Fitness", small: "Sneaker, conforto e sobreposições" },
        { id: "naosei", ico: "🧭", label: "Não sei meu estilo", small: "Estou aqui para descobrir" }
      ]
    },
    {
      id: "corpo",
      kicker: "Sua silhueta",
      title: "Qual é o seu tipo de corpo predominante?",
      hint: "Deslize e toque na silhueta mais parecida com a sua — é só para sugerir modelagens que valorizam você.",
      type: "single",
      layout: "corpo",
      options: [
        { id: "ampulheta", img: "assets/img/corpo-ampulheta.png", label: "Ampulheta", small: "Cintura bem marcada" },
        { id: "tinvertido", img: "assets/img/corpo-triangulo-invertido.png", label: "Triângulo invertido", small: "Ombros mais largos" },
        { id: "oval", img: "assets/img/corpo-oval.png", label: "Oval", small: "Volume no centro" },
        { id: "retangular", img: "assets/img/corpo-retangulo.png", label: "Retangular", small: "Linhas retas" },
        { id: "triangulo", img: "assets/img/corpo-triangulo.png", label: "Triângulo", small: "Quadril mais largo" },
        { id: "naosei", ico: "🤔", label: "Não sei identificar", small: "O app te ajuda" }
      ]
    },
    {
      id: "medidas",
      kicker: "Suas proporções",
      title: "Qual é a sua altura e o seu peso atual?",
      hint: "Deslize os controles ou toque nos números — usamos suas medidas para ajustar caimento, barras e proporção visual dos seus looks.",
      type: "medidas",
      layout: "medidas",
      options: []
    },
    {
      id: "promos",
      kicker: "Bastidor dos mil looks",
      banner: "assets/img/conjunto-5-looks.png?v=2",
      bannerAlt: "Um conjunto preto de colete e calça ampla rendendo 5 looks: casual chic, trabalho elegante, leve e moderno e noite elegante — de 179,90 por 66,90 no site secreto",
      title: "Você gostaria de receber links exclusivos de sites que estão em promoções especiais?",
      hint: "Você receberá tudo no WhatsApp: hoje temos 971 pessoas no grupo! (Quase esgotando as vagas 🚨)",
      type: "single",
      layout: "list",
      options: [
        { id: "sim", ico: "🤩", label: "Sim, quero entrar!", small: "Me manda as promoções no WhatsApp" },
        { id: "curadoria", ico: "👀", label: "Sim, só as que valem muito a pena", small: "Curadoria boa, sem spam" },
        { id: "agoranao", ico: "🙅‍♀️", label: "Agora não, obrigada", small: "Quero focar no meu plano de looks" }
      ]
    },
    {
      id: "ocasioes",
      kicker: "Sua vida real",
      title: "Para quais ocasiões você mais precisa de looks?",
      hint: "Pode marcar mais de uma.",
      type: "multi",
      layout: "chips",
      options: [
        { id: "trabalho", ico: "💼", label: "Trabalho" },
        { id: "passeio", ico: "🌿", label: "Passeios e fim de semana" },
        { id: "eventos", ico: "🥂", label: "Eventos e festas" },
        { id: "encontros", ico: "❤️", label: "Encontros" },
        { id: "viagens", ico: "✈️", label: "Viagens" }
      ]
    },
    {
      id: "pecas",
      kicker: "A pergunta de ouro",
      title: "Você tem quantas roupas no seu guarda-roupa?",
      hint: "Chute sem medo — o cálculo é por estimativa mesmo.",
      type: "single",
      layout: "list",
      options: [
        { id: "p15", ico: "🤏", label: "Menos de 20 peças", small: "Armário enxuto (ou quase vazio)" },
        { id: "p30", ico: "👚", label: "De 20 a 40 peças" },
        { id: "p55", ico: "🧥", label: "De 40 a 70 peças" },
        { id: "p80", ico: "🤯", label: "70 peças ou mais", small: "Nem sei contar direito 😅" }
      ]
    },
    {
      id: "tempoLook",
      kicker: "Sua manhã",
      title: "Quanto tempo você leva hoje para escolher um look?",
      type: "single",
      layout: "list",
      options: [
        { id: "t5", ico: "⚡", label: "Até 5 minutos", small: "Pego a primeira coisa que vejo" },
        { id: "t15", ico: "🕐", label: "De 5 a 15 minutos" },
        { id: "t30", ico: "🕰️", label: "De 15 a 30 minutos" },
        { id: "t30m", ico: "😵‍💫", label: "Mais de 30 minutos", small: "E mesmo assim saio insatisfeita" }
      ]
    },
    {
      id: "sentimento",
      kicker: "Sem julgamento",
      title: "O que você sente quando abre o guarda-roupa de manhã?",
      type: "single",
      layout: "list",
      options: [
        { id: "ansiedade", ico: "😮‍💨", label: "Ansiedade — tanta roupa e “nada” pra vestir" },
        { id: "tedio", ico: "😐", label: "Tédio — nada me empolga mais" },
        { id: "culpa", ico: "😔", label: "Culpa — gastei tanto e uso tão pouco" },
        { id: "indiferenca", ico: "🤷‍♀️", label: "Indiferença — visto qualquer coisa e pronto" }
      ]
    },
    {
      id: "sentir",
      kicker: "O truque na prática",
      banner: "assets/img/triptico-looks.jpg",
      bannerAlt: "Uma mesma camisa branca montando 3 looks: casual com jeans, chique com alfaiataria bege e luxo com saia de cetim preta",
      bannerCap: "1 camisa, 3 looks estilosos!",
      title: "Como você quer se sentir ao montar seus novos looks?",
      type: "single",
      layout: "list",
      ticket: true,
      options: [
        { id: "poderosa", ico: "💃", label: "Poderosa e confiante", small: "Um look que impõe presença onde eu chegar" },
        { id: "elegante", ico: "✨", label: "Elegante sem esforço", small: "Chique na medida, sem tentar demais" },
        { id: "leve", ico: "😌", label: "Leve e decidida", small: "Abrir o armário e saber na hora o que vestir" }
      ]
    },
    {
      id: "uso",
      kicker: "Honestidade total",
      title: "E quanto do seu guarda-roupa você usa de verdade?",
      type: "single",
      layout: "list",
      options: [
        { id: "u15", ico: "🕳️", label: "Menos de 20%", small: "O resto é “um dia eu uso”" },
        { id: "u30", ico: "🌗", label: "De 20% a 40%" },
        { id: "u50", ico: "⚖️", label: "De 40% a 60%" },
        { id: "u85", ico: "💪", label: "Quase tudo!", small: "Sou organizada mesmo" }
      ]
    },
    {
      id: "objetivo",
      kicker: "Última pergunta",
      title: "Qual é o seu maior objetivo com o seu estilo?",
      type: "single",
      layout: "list",
      options: [
        { id: "autoestima", ico: "💖", label: "Autoestima — me sentir confiante todos os dias" },
        { id: "elegancia", ico: "🕊️", label: "Elegância sem esforço — ser chique sem tentar" },
        { id: "praticidade", ico: "⚡", label: "Praticidade — decidir o look em minutos" },
        { id: "economia", ico: "🎯", label: "Economia inteligente — comprar certo, uma vez só" }
      ]
    }
  ];

  var PERFIS = {
    classica: {
      nome: "Elegância Atemporal",
      tag: "Base neutra, alfaiataria e um toque de vinho.",
      desc: "Você passa segurança sem precisar forçar nada. O seu armário rende muito quando apoia em cores neutras (off-white e bege) e uma cor só pra marcar presença — e é assim que a gente monta as suas combinações.",
      img: "assets/img/perfil-classica.jpg?v=2"
    },
    moderna: {
      nome: "Minimalismo Moderno",
      tag: "Menos peças, mais efeito.",
      desc: "Você não precisa de quantidade, precisa de ordem. Com poucas peças bem conectadas entre si, o seu armário vira uma máquina de looks — e o app faz essa conta por você, todo dia.",
      img: "assets/img/perfil-moderna.jpg?v=2"
    },
    romantica: {
      nome: "Romântica Contemporânea",
      tag: "Movimento e delicadeza, sem parecer fantasiada.",
      desc: "O seu estilo conquista no detalhe. O segredo é equilibrar peças leves com bases mais estruturadas: assim os seus looks se multiplicam sem perder a sua essência.",
      img: "assets/img/perfil-romantica.jpg?v=3"
    },
    criativa: {
      nome: "Criativa Autêntica",
      tag: "Cor e sobreposição com a sua cara.",
      desc: "Você enxerga combinações que ninguém vê — só falta organização pra isso virar repertório. O app cataloga esse seu olhar e devolve looks prontos, do trabalho à festa..",
      img: "assets/img/perfil-criativa.jpg?v=2"
    },
    fitness: {
      nome: "Fitness Sofisticada",
      tag: "Conforto que vira look — do treino à rua.",
      desc: "O seu estilo nasce do movimento: peças que acompanham o seu ritmo sem parecer que você saiu da academia pro compromisso. O app mistura sneaker, sobreposições e bases confortáveis pra montar looks que funcionam o dia inteiro.",
      img: "assets/img/perfil-fitness.jpg"
    },
    naosei: {
      nome: "Estilo em Descoberta",
      tag: "Você não precisa saber agora — o app descobre com você.",
      desc: "Perfeito: você não precisa chegar com o estilo pronto. Com as suas respostas e as peças que você já tem, o app revela o seu padrão de combinações favorito e transforma isso em looks diários — descobrir faz parte do truque.",
      img: "assets/img/estilo-novo.jpg"
    }
  };

  /* ---------------- Preloader Inteligente com Decodificação em Memória ---------------- */
  /* Mantém referências vivas dos bitmaps decodificados para pintura em 0ms sem flash branco */
  var DECODED_CACHE = {};

  function preloadOne(relPath, priority) {
    var url = assetUrl(relPath);
    if (!url || DECODED_CACHE[url]) return Promise.resolve();
    return new Promise(function (resolve) {
      var img = new Image();
      if (priority && "fetchPriority" in img) {
        try { img.fetchPriority = priority; } catch (e) {}
      }
      img.decoding = "async";
      img.onload = function () {
        if (typeof img.decode === "function") {
          img.decode().catch(function () {}).then(resolve);
        } else {
          resolve();
        }
      };
      img.onerror = function () { resolve(); };
      img.src = url;
      DECODED_CACHE[url] = img;
    });
  }

  function collectQuestionImages(idx) {
    var q = QUESTIONS[idx];
    if (!q) return [];
    var list = [];
    if (idx === 0) list.push("assets/img/colagem-looks.png");
    if (q.banner) list.push(q.banner);
    (q.options || []).forEach(function (o) {
      if (o.img) list.push(o.img);
    });
    return list;
  }

  function warmNextSteps(fromIdx) {
    /* Prioridade máxima para as próximas 3 etapas imediatas */
    for (var k = fromIdx + 1; k <= Math.min(QUESTIONS.length - 1, fromIdx + 3); k++) {
      collectQuestionImages(k).forEach(function (src) {
        preloadOne(src, k === fromIdx + 1 ? "high" : "low");
      });
    }
  }

  function startBackgroundWarmup() {
    var allOrdered = [];
    for (var i = 1; i < QUESTIONS.length; i++) {
      collectQuestionImages(i).forEach(function (src) {
        if (allOrdered.indexOf(src) === -1) allOrdered.push(src);
      });
    }
    [
      "assets/img/app-preview.jpg",
      "assets/img/antes-depois-capa.jpg",
      "assets/img/antes-depois-2.jpg",
      "assets/img/antes-depois-3.jpg",
      "assets/img/antes-depois-1.jpg",
      "assets/img/bonus-montador-looks.jpg",
      "assets/img/bonus-closet-inteligente.jpg",
      "assets/img/bonus-provador-virtual.jpg",
      "assets/img/mockup-premium.jpg"
    ].forEach(function (src) {
      if (allOrdered.indexOf(src) === -1) allOrdered.push(src);
    });

    /* Baixa em lotes paralelos de 4 para encher o cache antes da usuária chegar lá */
    var cursor = 0;
    function pump() {
      if (cursor >= allOrdered.length) return;
      var batch = allOrdered.slice(cursor, cursor + 4);
      cursor += 4;
      Promise.all(batch.map(function (s) { return preloadOne(s, cursor <= 4 ? "high" : "low"); }))
        .then(function () { setTimeout(pump, 30); });
    }
    setTimeout(pump, 120);
  }

  var PECAS_VALOR = { p15: 15, p30: 30, p55: 55, p80: 80 };
  var USO_VALOR = { u15: 0.15, u30: 0.3, u50: 0.5, u85: 0.85 };
  var USO_ROTULO = { u15: "20%", u30: "30%", u50: "50%", u85: "90%" };
  var TEMPO_ROTULO = { t5: "até 5 min", t15: "5–15 min", t30: "15–30 min", t30m: "mais de 30 min" };
  var OCASAO_ROTULO = { trabalho: "trabalho", passeio: "passeios", eventos: "eventos", encontros: "encontros", viagens: "viagens" };
  var CORPO_ROTULO = {
    ampulheta: "ampulheta (cintura marcada)",
    tinvertido: "triângulo invertido (ombros marcados)",
    retangular: "retangular (linhas retas)",
    oval: "oval (volume no centro)",
    triangulo: "triângulo (quadril marcado)",
    naosei: "silhueta a descobrir juntas"
  };

  var ALTURA_MIN = 140, ALTURA_MAX = 195, ALTURA_PADRAO = 163;
  var PESO_MIN = 40, PESO_MAX = 140, PESO_PADRAO = 65;

  /* ---------------- Estado ---------------- */
  var state = { i: 0, answers: {}, locked: false, plan: "premium" };

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var screens = {
    quiz: $("#screen-quiz"),
    analyzing: $("#screen-analyzing"),
    result: $("#screen-result")
  };

  function show(name) {
    Object.keys(screens).forEach(function (k) { screens[k].classList.remove("active"); });
    screens[name].classList.add("active");
    goToTop();
  }

  /* ---------------- Pixel / eventos Meta Ads (todas as páginas/etapas) ---------------- */
  var STANDARD_FB_EVENTS = {
    PageView: 1,
    ViewContent: 1,
    Lead: 1,
    InitiateCheckout: 1,
    AddToCart: 1,
    CompleteRegistration: 1,
    Purchase: 1
  };

  function initPixel() {
    var pid = String(CFG.metaPixelId || window.__META_PIXEL_ID__ || "").trim();
    if (!pid) { window.fbq = window.fbq || function () {}; return; }
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    if (window.__META_PIXEL_ID__ !== pid) {
      window.fbq("init", pid);
      window.fbq("track", "PageView");
      window.__META_PIXEL_ID__ = pid;
    }
  }

  function track(event, params) {
    if (!window.fbq) return;
    var payload = (params && typeof params === "object") ? params : undefined;
    if (STANDARD_FB_EVENTS[event] && params !== true) {
      if (payload) window.fbq("track", event, payload);
      else window.fbq("track", event);
    } else {
      if (payload) window.fbq("trackCustom", event, payload);
      else window.fbq("trackCustom", event);
    }
  }

  function readCookie(name) {
    var m = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : "";
  }

  /* ---------------- UTM + fbclid/_fbp/_fbc passthrough ---------------- */
  var UTM = window.location.search || "";
  function offerUrl() {
    var base = CFG.offerUrl || "#";
    var extra = [];
    if (UTM) extra.push(UTM.replace(/^\?/, ""));
    var fbp = readCookie("_fbp");
    var fbc = readCookie("_fbc");
    if (fbp && base.indexOf("fbp=") === -1 && UTM.indexOf("fbp=") === -1) extra.push("fbp=" + encodeURIComponent(fbp));
    if (fbc && base.indexOf("fbc=") === -1 && UTM.indexOf("fbc=") === -1) extra.push("fbc=" + encodeURIComponent(fbc));
    if (!extra.length) return base;
    return base + (base.indexOf("?") === -1 ? "?" : "&") + extra.join("&");
  }

  /* ---------------- Progresso & Header ---------------- */
  function setHeaderMode(mode) {
    var isResult = mode === "result";
    $("#topbar").hidden = false;
    var quizMeta = $("#topbarQuizMeta");
    var doneBadge = $("#topbarDoneBadge");
    var progTrack = $("#progressTrack");
    if (quizMeta) quizMeta.hidden = isResult;
    if (doneBadge) doneBadge.hidden = !isResult;
    if (progTrack) progTrack.hidden = isResult;
    if (isResult) $("#btnBack").style.visibility = "hidden";
  }

  function setProgress(answered) {
    var pct = Math.round((answered / QUESTIONS.length) * 100);
    $("#progressFill").style.width = pct + "%";
    $("#pctLabel").textContent = pct + "%";
    $("#stepLabel").textContent = Math.min(answered + 1, QUESTIONS.length) + "/" + QUESTIONS.length;
  }

  function goToTop() {
    try { window.scrollTo({ top: 0, behavior: "instant" }); }
    catch (e) { window.scrollTo(0, 0); }
  }

  /* ---------------- Helpers de Peso e Altura ---------------- */
  function clamp(val, min, max) {
    var n = parseInt(val, 10);
    if (isNaN(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  function formatAlturaM(cm) {
    var m = (cm / 100).toFixed(2).replace(".", ",");
    return m + " m";
  }

  function describeMedidas(altura, peso) {
    var hM = altura / 100;
    var ratio = peso / (hM * hM);
    var estaturaBadge = "";
    var dica = "";

    if (altura <= 159) {
      estaturaBadge = "✦ Caimento Petite";
      dica = "Para <strong>" + formatAlturaM(altura) + "</strong>, priorizamos cintura levemente mais alta, linhas verticais e comprimentos midi/curtos na altura exata para <strong>alongar a silhueta sem exigir salto</strong>.";
    } else if (altura <= 169) {
      estaturaBadge = "✦ Proporção Equilibrada";
      dica = "Com <strong>" + formatAlturaM(altura) + "</strong>, a regra de ouro <strong>1/3 + 2/3</strong>, terceira peça estruturada e comprimentos midi funcionam com caimento natural no dia a dia.";
    } else {
      estaturaBadge = "✦ Linhas Longilíneas";
      dica = "Com <strong>" + formatAlturaM(altura) + "</strong>, pantalonas fluidas, maxicoletes, cintos marcantes e contrastes de cor entre topo e base vestem com <strong>elegância imediata</strong>.";
    }

    var modelagem = "Modelagem fluida & acinturada";
    if (ratio < 20.5) modelagem = "Texturas & camadas leves";
    else if (ratio > 27.5) modelagem = "Tecidos com caimento & decote V";

    return { badge: estaturaBadge, dica: dica, modelagem: modelagem };
  }

  function updateRangeFill(input) {
    var min = parseFloat(input.min) || 0;
    var max = parseFloat(input.max) || 100;
    var val = parseFloat(input.value) || min;
    var pct = ((val - min) / (max - min)) * 100;
    input.style.background = "linear-gradient(90deg, var(--vinho) " + pct + "%, var(--bege) " + pct + "%)";
  }

  function renderMedidasHTML(saved) {
    var altura = saved ? saved.altura : ALTURA_PADRAO;
    var peso = saved ? saved.peso : PESO_PADRAO;
    var info = describeMedidas(altura, peso);

    var rulerTicks = "";
    for (var t = 0; t <= 10; t++) {
      rulerTicks += '<i class="' + (t % 5 === 0 ? "major" : "") + '"></i>';
    }

    return (
      '<div class="medidas" id="medidasWidget">' +
        '<div class="medidas-preview">' +
          '<div class="medidas-stage" aria-hidden="true">' +
            '<div class="medidas-ruler">' + rulerTicks + '</div>' +
            '<div class="medidas-marker" id="medidasMarker"><span id="medidasMarkerTxt">' + formatAlturaM(altura) + '</span></div>' +
            '<svg class="medidas-figure" id="medidasFigure" viewBox="0 0 80 180" fill="none" xmlns="http://www.w3.org/2000/svg">' +
              '<circle cx="40" cy="20" r="11" fill="#6E1423" fill-opacity="0.9"/>' +
              '<path d="M27 42C27 37.5 32.5 35 40 35C47.5 35 53 37.5 53 42L56 70C56 73 51 75 49 75L47 64L45 78L54 128C54.5 131 51.5 133 48.5 133H43L40 98L37 133H31.5C28.5 133 25.5 131 26 128L35 78L33 64L31 75C29 75 24 73 24 70L27 42Z" fill="#6E1423"/>' +
              '<path d="M33 133H38L37 172C37 174 35.5 175.5 34 175.5C32.5 175.5 31.5 174 31.5 172L33 133Z" fill="#8A2334"/>' +
              '<path d="M42 133H47L48.5 172C48.5 174 47.5 175.5 46 175.5C44.5 175.5 43 174 43 172L42 133Z" fill="#8A2334"/>' +
              '<path d="M34.5 78H45.5" stroke="#F3EADB" stroke-width="2.2" stroke-linecap="round"/>' +
            '</svg>' +
          '</div>' +
          '<div class="medidas-info">' +
            '<span class="medidas-badge" id="medidasBadge">' + info.badge + '</span>' +
            '<div class="medidas-pills">' +
              '<span class="medidas-pill">Altura: <strong id="pillAltura">' + formatAlturaM(altura) + '</strong></span>' +
              '<span class="medidas-pill">Peso: <strong id="pillPeso">' + peso + ' kg</strong></span>' +
            '</div>' +
            '<p class="medidas-tip" id="medidasTip">' + info.dica + '</p>' +
          '</div>' +
        '</div>' +

        '<div class="medidas-grid">' +
          '<div class="medidas-card">' +
            '<div class="medidas-card__top">' +
              '<span class="medidas-card__label"><span class="medidas-card__ico">📏</span>Sua altura</span>' +
              '<div class="medidas-stepper">' +
                '<button type="button" class="medidas-step" data-step-target="altura" data-delta="-1" aria-label="Diminuir altura">−</button>' +
                '<label class="medidas-val" aria-label="Altura em centímetros">' +
                  '<input type="number" class="medidas-num" id="numAltura" min="' + ALTURA_MIN + '" max="' + ALTURA_MAX + '" value="' + altura + '" inputmode="numeric">' +
                  '<span class="medidas-unit">cm</span>' +
                '</label>' +
                '<button type="button" class="medidas-step" data-step-target="altura" data-delta="1" aria-label="Aumentar altura">+</button>' +
              '</div>' +
            '</div>' +
            '<input type="range" class="medidas-range" id="rangeAltura" min="' + ALTURA_MIN + '" max="' + ALTURA_MAX + '" step="1" value="' + altura + '" aria-label="Controle deslizante de altura">' +
            '<div class="medidas-ticks"><span>1,40 m</span><span>1,68 m</span><span>1,95 m</span></div>' +
          '</div>' +

          '<div class="medidas-card">' +
            '<div class="medidas-card__top">' +
              '<span class="medidas-card__label"><span class="medidas-card__ico">⚖️</span>Seu peso</span>' +
              '<div class="medidas-stepper">' +
                '<button type="button" class="medidas-step" data-step-target="peso" data-delta="-1" aria-label="Diminuir peso">−</button>' +
                '<label class="medidas-val" aria-label="Peso em quilogramas">' +
                  '<input type="number" class="medidas-num" id="numPeso" min="' + PESO_MIN + '" max="' + PESO_MAX + '" value="' + peso + '" inputmode="numeric">' +
                  '<span class="medidas-unit">kg</span>' +
                '</label>' +
                '<button type="button" class="medidas-step" data-step-target="peso" data-delta="1" aria-label="Aumentar peso">+</button>' +
              '</div>' +
            '</div>' +
            '<input type="range" class="medidas-range" id="rangePeso" min="' + PESO_MIN + '" max="' + PESO_MAX + '" step="1" value="' + peso + '" aria-label="Controle deslizante de peso">' +
            '<div class="medidas-ticks"><span>40 kg</span><span>90 kg</span><span>140 kg</span></div>' +
          '</div>' +
        '</div>' +

        '<p class="medidas-note">🔒 Seus dados são privados e usados somente para ajustar o caimento dos seus looks.</p>' +
        '<button type="button" class="btn btn--primary btn--lg medidas__next" id="btnMedidasNext">Confirmar medidas e continuar →</button>' +
      '</div>'
    );
  }

  function bindMedidas(q) {
    var current = state.answers[q.id] || { altura: ALTURA_PADRAO, peso: PESO_PADRAO };
    var rangeAltura = $("#rangeAltura");
    var rangePeso = $("#rangePeso");
    var numAltura = $("#numAltura");
    var numPeso = $("#numPeso");
    var marker = $("#medidasMarker");
    var markerTxt = $("#medidasMarkerTxt");
    var figure = $("#medidasFigure");
    var badge = $("#medidasBadge");
    var pillAltura = $("#pillAltura");
    var pillPeso = $("#pillPeso");
    var tip = $("#medidasTip");

    function syncVisuals() {
      var a = current.altura;
      var p = current.peso;
      state.answers[q.id] = { altura: a, peso: p };

      rangeAltura.value = a;
      rangePeso.value = p;
      if (document.activeElement !== numAltura) numAltura.value = a;
      if (document.activeElement !== numPeso) numPeso.value = p;

      updateRangeFill(rangeAltura);
      updateRangeFill(rangePeso);

      var hNorm = (a - ALTURA_MIN) / (ALTURA_MAX - ALTURA_MIN);
      var wNorm = (p - PESO_MIN) / (PESO_MAX - PESO_MIN);

      var bottomPct = Math.round(62 + hNorm * 28);
      marker.style.bottom = bottomPct + "%";
      markerTxt.textContent = formatAlturaM(a);

      var scaleY = (0.82 + hNorm * 0.22).toFixed(3);
      var scaleX = (0.88 + wNorm * 0.28).toFixed(3);
      figure.style.transform = "scale(" + scaleX + ", " + scaleY + ")";

      var info = describeMedidas(a, p);
      badge.textContent = info.badge;
      pillAltura.textContent = formatAlturaM(a);
      pillPeso.textContent = p + " kg";
      tip.innerHTML = info.dica;
    }

    rangeAltura.addEventListener("input", function () {
      current.altura = clamp(rangeAltura.value, ALTURA_MIN, ALTURA_MAX);
      numAltura.value = current.altura;
      syncVisuals();
    });

    rangePeso.addEventListener("input", function () {
      current.peso = clamp(rangePeso.value, PESO_MIN, PESO_MAX);
      numPeso.value = current.peso;
      syncVisuals();
    });

    numAltura.addEventListener("input", function () {
      var v = parseInt(numAltura.value, 10);
      if (!isNaN(v) && v >= ALTURA_MIN && v <= ALTURA_MAX) {
        current.altura = v;
        syncVisuals();
      }
    });
    numAltura.addEventListener("blur", function () {
      current.altura = clamp(numAltura.value || current.altura, ALTURA_MIN, ALTURA_MAX);
      numAltura.value = current.altura;
      syncVisuals();
    });

    numPeso.addEventListener("input", function () {
      var v = parseInt(numPeso.value, 10);
      if (!isNaN(v) && v >= PESO_MIN && v <= PESO_MAX) {
        current.peso = v;
        syncVisuals();
      }
    });
    numPeso.addEventListener("blur", function () {
      current.peso = clamp(numPeso.value || current.peso, PESO_MIN, PESO_MAX);
      numPeso.value = current.peso;
      syncVisuals();
    });

    $$("#medidasWidget .medidas-step").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.dataset.stepTarget;
        var delta = parseInt(btn.dataset.delta, 10) || 0;
        if (target === "altura") {
          current.altura = clamp(current.altura + delta, ALTURA_MIN, ALTURA_MAX);
          numAltura.value = current.altura;
        } else {
          current.peso = clamp(current.peso + delta, PESO_MIN, PESO_MAX);
          numPeso.value = current.peso;
        }
        syncVisuals();
      });
    });

    $("#btnMedidasNext").addEventListener("click", function () {
      current.altura = clamp(numAltura.value || current.altura, ALTURA_MIN, ALTURA_MAX);
      current.peso = clamp(numPeso.value || current.peso, PESO_MIN, PESO_MAX);
      state.answers[q.id] = { altura: current.altura, peso: current.peso };
      track("QuizMedidasSaved", { altura_cm: current.altura, peso_kg: current.peso });
      advance();
    });

    syncVisuals();
  }

  /* ---------------- Render perguntas ---------------- */
  function hydrateOrRenderQuestion(allowSSR) {
    var q = QUESTIONS[state.i];
    goToTop();
    state.locked = false;
    setHeaderMode("quiz");
    setProgress(state.i);
    $("#stickyCta").hidden = true;
    warmNextSteps(state.i);

    var first = state.i === 0;
    document.body.classList.toggle("bg-creme", first);

    var box = $("#quizBox");
    /* Se a 1ª pergunta já veio pré-renderizada no HTML, apenas hidrata os cliques sem repintar DOM! */
    if (allowSSR && first && box.dataset.ssr === "idade" && !state.answers.idade) {
      box.removeAttribute("data-ssr");
      applyConfig();
      $("#btnBack").style.visibility = "hidden";
      $$("#quizBox .opt").forEach(function (el) {
        el.addEventListener("click", function () { onOption(q, el); });
      });
      return;
    }
    box.removeAttribute("data-ssr");

    var layoutClass = {
      "list": "opts",
      "grid": "opts opts--grid",
      "duo-img": "opts opts--duo",
      "grid-img": "opts opts--gridimg",
      "corpo": "opts opts--corpo",
      "chips": "opts opts--chips"
    }[q.layout] || "opts";

    var html = "";

    var milestoneMsgs = {
      3: "✨ Ótimo! Já mapeamos como funciona o seu armário hoje…",
      6: "🎯 Proporções de altura e peso calibradas com sucesso!",
      9: "🔥 Quase lá! Cruzando combinações de cores para o seu perfil…",
      12: "🎟️ 88% OFF garantido no seu ticket! Faltam só 2 respostas…"
    };

    if (milestoneMsgs[state.i]) {
      html += '<div class="quiz__milestone">' + milestoneMsgs[state.i] + '</div>';
    }

    if (first) {
      html += '<div class="quiz__mosaic"><img src="' + assetUrl("assets/img/colagem-looks.png") + '" alt="Descubra o truque dos mil looks para gastar menos e montar muito mais looks: +120 mil mulheres usam nosso APP! Responda o Quiz e faça parte" fetchpriority="high" decoding="sync"></div>';
    }
    if (q.banner) {
      html += '<div class="quiz__banner"><img src="' + assetUrl(q.banner) + '" alt="' + (q.bannerAlt || "") + '" fetchpriority="high" decoding="sync">' +
        (q.bannerCap ? '<p class="quiz__banner__cap">' + q.bannerCap + '</p>' : '') +
        '</div>';
    }

    html += '<div class="quiz__head">' +
      (first ? '<div class="quiz__livepill"><span class="quiz__livedot" aria-hidden="true"></span>+120 mil mulheres já descobriram seus looks · Leva 45s</div>' : '') +
      (q.kicker ? '<p class="quiz__kicker">' + q.kicker + '</p>' : '') +
      '<h2 class="quiz__title">' + q.title + '</h2>' +
      (q.hint ? '<p class="quiz__hint">' + q.hint + '</p>' : '') +
      '</div>';

    if (q.type === "medidas") {
      html += renderMedidasHTML(state.answers[q.id]);
      box.innerHTML = '<div class="quiz__step">' + html + '</div>';
      applyConfig();
      $("#btnBack").style.visibility = first ? "hidden" : "visible";
      bindMedidas(q);
      return;
    }

    var prevAns = state.answers[q.id];
    html += '<div class="' + layoutClass + '">';

    q.options.forEach(function (o) {
      var isImg = !!o.img;
      var isChip = q.layout === "chips";
      var isCorpo = q.layout === "corpo";
      var imgClass = isCorpo ? " opt--corpo" : (isImg ? " opt--img" : "");
      var isSel = q.type === "multi"
        ? (Array.isArray(prevAns) && prevAns.indexOf(o.id) !== -1)
        : (prevAns === o.id);

      html += '<button type="button" class="opt' + imgClass + (isChip ? " opt--chip" : "") + (isSel ? " selected" : "") + '" data-id="' + o.id + '">' +
        (isImg
          ? '<img src="' + assetUrl(o.img) + '" alt="' + o.label + '" decoding="sync">'
          : '<span class="opt__ico">' + (o.ico || "•") + '</span>') +
        '<span class="opt__txt">' + o.label + (o.small ? '<small>' + o.small + '</small>' : '') + '</span>' +
        '<span class="opt__mark">✓</span>' +
        '</button>';
    });

    html += '</div>';

    if (q.layout === "corpo") {
      html += '<p class="quiz__swipe">Deslize para o lado para ver todas as silhuetas ⇢</p>';
    }
    if (q.type === "multi") {
      var hasMulti = Array.isArray(prevAns) && prevAns.length > 0;
      html += '<button type="button" class="btn btn--primary quiz__next' + (hasMulti ? " show" : "") + '" id="btnNext">Continuar →</button>';
    }
    if (first) {
      html += '<p class="quiz__consent">Ao continuar, você concorda com nossos <a href="#" data-config-link="termsUrl">Termos de Uso</a> e nossa <a href="#" data-config-link="privacyUrl">Política de Privacidade</a>.</p>';
    }

    box.innerHTML = '<div class="quiz__step">' + html + '</div>';
    applyConfig();
    $("#btnBack").style.visibility = first ? "hidden" : "visible";

    $$("#quizBox .opt").forEach(function (el) {
      el.addEventListener("click", function () { onOption(q, el); });
    });
    if (q.type === "multi") {
      $("#btnNext").addEventListener("click", function () {
        if ((state.answers[q.id] || []).length) advance();
      });
    }
  }

  function renderQuestion() {
    hydrateOrRenderQuestion(false);
  }

  function onOption(q, el) {
    if (state.locked) return;

    if (q.type === "multi") {
      el.classList.toggle("selected");
      var ids = $$("#quizBox .opt.selected").map(function (n) { return n.dataset.id; });
      state.answers[q.id] = ids;
      $("#btnNext").classList.toggle("show", ids.length > 0);
      return;
    }

    state.locked = true;
    $$("#quizBox .opt").forEach(function (n) { n.classList.remove("selected"); });
    el.classList.add("selected");
    state.answers[q.id] = el.dataset.id;
    if (q.ticket) { openTicket(); return; }
    setTimeout(advance, 160);
  }

  /* ---------------- Ticket raspadinha (100% Mobile-First · Zero-Lag) ---------------- */
  var scratchDone = false;
  var cleanupScratch = null;

  function openTicket() {
    if (cleanupScratch) { cleanupScratch(); cleanupScratch = null; }
    var modal = $("#ticketModal");
    modal.hidden = false;
    document.body.classList.add("no-scroll");
    $("#ticketNext").hidden = true;
    $("#scratchHint").textContent = "Passe o dedo para raspar 👆";
    $("#scratchHint").classList.remove("ok");
    $("#scratchProgWrap").hidden = false;
    $("#scratchProgFill").style.width = "0%";
    var cv = $("#scratchCanvas");
    cv.style.transition = "none";
    cv.style.opacity = "1";
    scratchDone = false;

    /* Aguarda 1 frame para garantir dimensões exatas do container visível no mobile */
    requestAnimationFrame(function () {
      initScratch();
    });
  }

  function closeTicket() {
    if (cleanupScratch) { cleanupScratch(); cleanupScratch = null; }
    $("#ticketModal").hidden = true;
    document.body.classList.remove("no-scroll");
  }

  function initScratch() {
    var modal = $("#ticketModal");
    var wrap = $("#scratchWrap");
    var cv = $("#scratchCanvas");
    var hint = $("#scratchHint");
    var progFill = $("#scratchProgFill");
    var progWrap = $("#scratchProgWrap");
    var ctx = cv.getContext("2d");

    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = Math.max(240, wrap.offsetWidth || 320);
    var h = Math.max(150, wrap.offsetHeight || 176);

    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* Pintura da folha prateada */
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);
    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#F0F0F5");
    g.addColorStop(0.45, "#CFCFD8");
    g.addColorStop(1, "#B0B1BC");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    /* Brilhos metálicos sutis */
    ctx.fillStyle = "rgba(255,255,255,.68)";
    for (var i = 0; i < 28; i++) {
      ctx.beginPath();
      ctx.arc(((i * 73) % 97) / 97 * w, ((i * 41) % 89) / 89 * h, (i % 3) + 1.2, 0, 7);
      ctx.fill();
    }

    /* Texto central convidativo */
    ctx.fillStyle = "#6E1423";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "800 " + Math.max(20, Math.round(w * 0.082)) + "px -apple-system, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("RASPE AQUI", w / 2, h / 2 - 12);
    ctx.font = "700 " + Math.max(13, Math.round(w * 0.046)) + "px -apple-system, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "rgba(110,20,35,.82)";
    ctx.fillText("passe o dedo para revelar 🎟️", w / 2, h / 2 + 16);

    /* Pincel largo e macio calibrado para o polegar no celular */
    var brushRadius = Math.max(25, Math.round(w * 0.08));
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushRadius * 2;

    /* Grade leve em CPU (16x8 = 128 células na zona central) -> ZERO lag de getImageData no mobile! */
    var COLS = 16, ROWS = 8;
    var TOTAL_CELLS = COLS * ROWS;
    var scratchedCells = new Uint8Array(TOTAL_CELLS);
    var scratchedCount = 0;
    var GOAL_RATIO = 0.48; /* 2 passadas naturais de dedo: 1ª abre ~70%, 2ª revela com confete */
    var totalDist = 0;
    var tapCount = 0;

    var zx0 = w * 0.10, zw = w * 0.80;
    var zy0 = h * 0.12, zh = h * 0.76;

    function markCircle(px, py, rad) {
      var r2 = rad * rad;
      for (var r = 0; r < ROWS; r++) {
        var cy = zy0 + ((r + 0.5) / ROWS) * zh;
        var dy = cy - py;
        if (Math.abs(dy) > rad) continue;
        for (var c = 0; c < COLS; c++) {
          var idx = r * COLS + c;
          if (scratchedCells[idx]) continue;
          var cx = zx0 + ((c + 0.5) / COLS) * zw;
          var dx = cx - px;
          if (dx * dx + dy * dy <= r2) {
            scratchedCells[idx] = 1;
            scratchedCount++;
          }
        }
      }
    }

    function updateProgress() {
      if (scratchDone) return;
      var ratioByGrid = scratchedCount / TOTAL_CELLS;
      var ratioByDist = totalDist / (w * 1.35);
      var ratioByTap = tapCount / 5;
      var progress = Math.min(1, Math.max(ratioByGrid / GOAL_RATIO, ratioByDist, ratioByTap));
      progFill.style.width = Math.round(progress * 100) + "%";
      if (progress >= 1) reveal();
    }

    function clientToCanvas(clientX, clientY) {
      var rect = cv.getBoundingClientRect();
      var scaleX = rect.width > 0 ? w / rect.width : 1;
      var scaleY = rect.height > 0 ? h / rect.height : 1;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    var drawing = false;
    var last = null;
    var usingTouch = false;

    function beginStroke(p) {
      if (scratchDone) return;
      drawing = true;
      last = p;
      tapCount += 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, brushRadius, 0, Math.PI * 2);
      ctx.fill();
      markCircle(p.x, p.y, brushRadius * 1.05);
      updateProgress();
    }

    function moveStroke(p) {
      if (!drawing || scratchDone || !last) return;
      var dx = p.x - last.x;
      var dy = p.y - last.y;
      var seg = Math.hypot(dx, dy);
      if (seg < 1.5) return;

      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      totalDist += seg;
      var steps = Math.max(1, Math.ceil(seg / 10));
      for (var s = 1; s <= steps; s++) {
        var t = s / steps;
        markCircle(last.x + dx * t, last.y + dy * t, brushRadius);
      }
      last = p;
      updateProgress();
    }

    function endStroke() {
      drawing = false;
      last = null;
    }

    function reveal() {
      if (scratchDone) return;
      scratchDone = true;
      drawing = false;
      progFill.style.width = "100%";
      setTimeout(function () { progWrap.hidden = true; }, 260);
      cv.style.transition = "opacity .42s ease";
      cv.style.opacity = "0";
      cv.style.pointerEvents = "none";
      hint.textContent = "Desconto de 88% liberado! 🎉";
      hint.classList.add("ok");
      if (navigator.vibrate) {
        try { navigator.vibrate(22); } catch (e) {}
      }
      confetti();
      $("#ticketNext").hidden = false;
      if (cleanupScratch) { cleanupScratch(); cleanupScratch = null; }
    }

    /* Listeners Touch nativos com { passive: false } — funciona em iOS Safari, Chrome Android e WebView Instagram/FB */
    function onTouchStart(e) {
      if (scratchDone) return;
      usingTouch = true;
      if (e.cancelable) e.preventDefault();
      var t = e.touches[0];
      if (t) beginStroke(clientToCanvas(t.clientX, t.clientY));
    }
    function onTouchMove(e) {
      if (scratchDone) return;
      if (e.cancelable) e.preventDefault();
      var t = e.touches[0];
      if (t) moveStroke(clientToCanvas(t.clientX, t.clientY));
    }
    function onTouchEnd() {
      endStroke();
    }
    function blockModalBounce(e) {
      if (!scratchDone && e.target === modal && e.cancelable) e.preventDefault();
    }

    /* Listeners Mouse para desktop */
    function onMouseDown(e) {
      if (usingTouch || scratchDone || e.button !== 0) return;
      e.preventDefault();
      beginStroke(clientToCanvas(e.clientX, e.clientY));
    }
    function onMouseMove(e) {
      if (usingTouch || !drawing || scratchDone) return;
      moveStroke(clientToCanvas(e.clientX, e.clientY));
    }
    function onMouseUp() {
      if (usingTouch) return;
      endStroke();
    }

    cv.style.pointerEvents = "auto";
    cv.addEventListener("touchstart", onTouchStart, { passive: false });
    cv.addEventListener("touchmove", onTouchMove, { passive: false });
    cv.addEventListener("touchend", onTouchEnd, { passive: true });
    cv.addEventListener("touchcancel", onTouchEnd, { passive: true });
    modal.addEventListener("touchmove", blockModalBounce, { passive: false });

    cv.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    cleanupScratch = function () {
      cv.removeEventListener("touchstart", onTouchStart);
      cv.removeEventListener("touchmove", onTouchMove);
      cv.removeEventListener("touchend", onTouchEnd);
      cv.removeEventListener("touchcancel", onTouchEnd);
      modal.removeEventListener("touchmove", blockModalBounce);
      cv.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }

  function confetti() {
    var box = $("#confettiBox");
    box.innerHTML = "";
    var colors = ["#6E1423", "#8A2334", "#C9B491", "#E5D7BE", "#FFFDF9", "#D9A441"];
    for (var i = 0; i < 72; i++) {
      var s = document.createElement("span");
      s.className = "cf";
      s.style.left = (Math.random() * 100) + "%";
      s.style.background = colors[i % colors.length];
      s.style.setProperty("--dx", (Math.random() * 160 - 80) + "px");
      s.style.animationDelay = (Math.random() * .4) + "s";
      s.style.animationDuration = (1.5 + Math.random() * 1.2) + "s";
      if (i % 3 === 0) s.style.borderRadius = "50%";
      box.appendChild(s);
    }
    setTimeout(function () { box.innerHTML = ""; }, 3200);
  }

  function advance() {
    if (state.i < QUESTIONS.length - 1) {
      state.i += 1;
      var nextQ = QUESTIONS[state.i];
      track("PageView");
      track("QuizStep", {
        step: state.i + 1,
        step_id: nextQ ? nextQ.id : String(state.i + 1),
        total_steps: QUESTIONS.length
      });
      renderQuestion();
    } else {
      startAnalyzing();
    }
  }

  /* ---------------- Analisando (ágil e sem espera desnecessária) ---------------- */
  function startAnalyzing() {
    document.body.classList.remove("bg-creme");
    goToTop();
    show("analyzing");
    setHeaderMode("quiz");
    setProgress(QUESTIONS.length);
    $("#btnBack").style.visibility = "hidden";
    track("QuizComplete", true);

    var steps = $$("#analyzingSteps li");
    steps.forEach(function (li) { li.classList.remove("done"); });
    var pctEl = $("#analyzingPct");
    var pct = 0;
    var timer = setInterval(function () {
      pct = Math.min(100, pct + 4);
      pctEl.textContent = pct + "%";
      if (pct >= 100) clearInterval(timer);
    }, 45);

    steps.forEach(function (li, idx) {
      setTimeout(function () { li.classList.add("done"); }, 220 + idx * 320);
    });

    setTimeout(function () { showResult(true); }, 220 + steps.length * 320 + 320);
  }

  /* ---------------- Resultado ---------------- */
  function calc() {
    var a = state.answers;
    var pecas = PECAS_VALOR[a.pecas] || 30;
    var uso = USO_VALOR[a.uso] || 0.3;
    var looks = Math.min(150, pecas * 5);
    var esquecidas = Math.max(3, Math.round(pecas * (1 - uso)));
    return { pecas: pecas, uso: uso, looks: looks, esquecidas: esquecidas };
  }

  function showResult(fromQuiz) {
    var a = state.answers;
    var c = calc();
    var perfil = PERFIS[a.estilo] || PERFIS.moderna;
    var ocasoes = (a.ocasioes || []).map(function (id) { return OCASAO_ROTULO[id]; }).join(", ") || "dia a dia";
    var med = a.medidas || { altura: ALTURA_PADRAO, peso: PESO_PADRAO };
    var usoTxt = USO_ROTULO[a.uso] || "30%";
    var tempoTxt = TEMPO_ROTULO[a.tempoLook] || "15–30 min";

    var insights = [
      { ico: "✓", txt: "Você tem umas <strong>~" + c.pecas + " peças</strong> no armário. Com elas dá pra montar <strong>até " + c.looks + " looks</strong> — sem comprar nada novo." },
      { ico: "✓", txt: "Hoje você usa só cerca de <strong>" + usoTxt + "</strong> do que tem: outras <strong>" + c.esquecidas + " peças</strong> estão paradas lá, esperando vez." },
      { ico: "✓", txt: "Proporção calibrada para <strong>" + formatAlturaM(med.altura) + " e " + med.peso + " kg</strong> + corpo <strong>" + (CORPO_ROTULO[a.corpo] || "do seu jeito") + "</strong> — comprimentos e caimentos ajustados sem regra de certo ou errado." },
      { ico: "✓", txt: "Seus looks vão priorizar o que você vive de verdade: <strong>" + ocasoes + "</strong>." },
      { ico: "✓", txt: "Escolher look hoje te toma <strong>" + tempoTxt + "</strong>. A meta é cair pra menos de 5 minutos por manhã." }
    ];

    var baSlides = [
      {
        src: "assets/img/antes-depois-capa.jpg",
        alt: "Antes e depois: guarda-roupa com desperdício de 70% passando para 94% de eficiência e combinação perfeita",
        quote: "“Eu desperdiçava 70% das minhas roupas. Em uma semana o app transformou meu armário!” — Camila R., 29 anos"
      },
      {
        src: "assets/img/antes-depois-2.jpg",
        alt: "Antes e depois: looks básicos virando produção elegante em vinho e blazer off-white que valoriza o corpo",
        quote: "“Saí do jeans sem graça para looks elegantes usando peças que já estavam na gaveta.” — Renata S., 35 anos"
      },
      {
        src: "assets/img/antes-depois-3.jpg",
        alt: "Antes e depois: rotina sem tempo virando estilo elegante, versátil e cheio de presença em azul royal e alfaiataria",
        quote: "“Não tinha tempo pra nada de manhã. Agora abro o app e estou pronta em 4 minutos!” — Vanessa M., 38 anos"
      },
      {
        src: "assets/img/antes-depois-1.jpg",
        alt: "Antes e depois: guarda-roupa com 68% sem aproveitamento passando para 91% de aproveitamento e harmonia elegante",
        quote: "“Parei de comprar por impulso e hoje aproveito 91% do meu guarda-roupa com harmonia.” — Helena P., 46 anos"
      }
    ];

    var bonusItems = [
      {
        num: "01",
        tag: "PRESENTE #1 · LIBERADO NO APP",
        title: "Montador Automático de Looks & Mala de Viagem",
        oldPrice: 77,
        img: "assets/img/bonus-montador-looks.jpg",
        alt: "Montador de Looks Truque dos Mil Looks: crie combinações incríveis com as peças que você já tem, inclusive para viagem",
        desc: "Vai trabalhar, sair no fim de semana ou montar mala de 5 dias? O app cruza suas blusas, calças, calçados e acessórios e entrega o look pronto Dia a Dia.",
        perks: [
          "Roteiro completo Dia 1 ao Dia 5 para viagens sem mala pesada",
          "Combinações prontas com as peças que você já tem em casa",
          "Sugestão até dos sapatos, óculos, brincos e bolsa certos"
        ]
      },
      {
        num: "02",
        tag: "PRESENTE #2 · LIBERADO NO APP",
        title: "Meu Closet Inteligente (IA: 15 Peças → 150 Looks) + VIP",
        oldPrice: 107,
        img: "assets/img/bonus-closet-inteligente.jpg",
        alt: "Meu Closet Virtual com IA: 15 peças rendem 150 looks, inspirações, cupons exclusivos e Grupo VIP",
        desc: "Seu armário inteiro organizado na palma da mão com Inteligência Artificial, somado ao guia prático que multiplica 15 peças em 150 combinações elegantes.",
        perks: [
          "Closet Virtual inteligente que cataloga suas roupas por foto",
          "Método 15 peças → 150 looks + vitrine diária de inspirações",
          "Acesso a Cupons Exclusivos + Grupo VIP com dicas todos os dias"
        ]
      },
      {
        num: "03",
        tag: "PRESENTE #3 · LIBERADO NO APP",
        title: "Provador Virtual Realista na Tela do Celular",
        oldPrice: 97,
        img: "assets/img/bonus-provador-virtual.jpg",
        alt: "Provador Virtual Truque dos Mil Looks: teste combinações completas antes de vestir",
        desc: "Chega de tirar 10 roupas do cabide e deixar a cama bagunçada! Teste blusa, terceira peça, calça e sapato direto na tela e veja o caimento antes de vestir.",
        perks: [
          "Visualize o look completo antes mesmo de abrir o armário",
          "Compare 3 opções lado a lado e escolha a mais elegante em segundos",
          "Zero arrependimento antes de sair para o trabalho ou evento"
        ]
      }
    ];

    var html = "";
    html += '<div class="result__unlocked">' +
      '<span class="result__unlocked-badge">🎉 Diagnóstico Concluído</span>' +
      '<span class="result__unlocked-txt"><strong>88% OFF</strong> + <strong>3 Presentes VIP</strong> liberados pra você!</span>' +
      '</div>';

    html += '<div class="result__top result__top--cta" id="resultFirstImg" role="button" tabindex="0" aria-label="Ver Plano Premium com 88% de desconto e 3 bônus grátis">' +
      '<img src="' + assetUrl("assets/img/app-preview.jpg") + '" alt="Aplicativo Truque dos Mil Looks com a sua cara: toque para ir ao Plano Premium" decoding="sync">' +
      '<span class="result__tapbadge">👆 Toque para liberar App + 3 Bônus Grátis</span>' +
      '</div>';
    html += '<button type="button" class="btn btn--primary btn--lg result__appbtn pulse" id="btnApp">Liberar meu App + 3 Bônus Grátis →</button>';

    /* Carrossel Antes & Depois ampliado, 1 card por vez (zero sobreposição) + depoimento vivo */
    html += '<section class="ba-sec" aria-label="Transformações reais de quem usa o aplicativo">' +
      '<div class="ba-head">' +
        '<span class="ba-kicker">✦ Transformações Reais</span>' +
        '<h3 class="ba-title">Quem usa nosso Aplicativo <span class="ba-hl">não se arrepende!</span></h3>' +
      '</div>' +
      '<div class="ba-stage">' +
        '<div class="ba-viewport" id="baViewport">' +
          '<div class="ba-track" id="baTrack">' +
            baSlides.map(function (s, idx) {
              return '<div class="ba-slide' + (idx === 0 ? ' is-active' : '') + '" data-ba-idx="' + idx + '">' +
                '<img src="' + assetUrl(s.src) + '" alt="' + s.alt + '" decoding="sync" fetchpriority="' + (idx < 2 ? "high" : "auto") + '">' +
                '</div>';
            }).join("") +
          '</div>' +
        '</div>' +
        '<p class="ba-quote" id="baQuote">' + baSlides[0].quote + '</p>' +
        '<div class="ba-bar">' +
          '<button type="button" class="ba-btn" id="baPrev" aria-label="Transformação anterior">' +
            '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>' +
          '</button>' +
          '<div class="ba-meta">' +
            '<div class="ba-dots" id="baDots" role="tablist" aria-label="Selecionar transformação">' +
              baSlides.map(function (_, idx) {
                return '<button type="button" class="ba-dot' + (idx === 0 ? ' active' : '') + '" data-ba-dot="' + idx + '" aria-label="Ir para transformação ' + (idx + 1) + '"></button>';
              }).join("") +
            '</div>' +
            '<span class="ba-count" id="baCount">1 de ' + baSlides.length + '</span>' +
          '</div>' +
          '<button type="button" class="ba-btn" id="baNext" aria-label="Próxima transformação">' +
            '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '</section>';

    html += '<div class="result__hero">' +
      '<span class="result__eyebrow">✦ Seu resultado chegou</span>' +
      '<h2 class="result__title">Seu estilo tem nome: <em>' + perfil.nome + '</em>.</h2>' +
      '<p class="result__tag">' + perfil.tag + '</p>' +
      '</div>';

    html += '<div class="profile-card">' +
      '<img src="' + assetUrl(perfil.img) + '" alt="Perfil de estilo ' + perfil.nome + '" decoding="sync">' +
      '<div class="profile-card__body">' +
        '<h3 class="profile-card__name">Perfil ' + perfil.nome + '</h3>' +
        '<p class="profile-card__desc">' + perfil.desc + '</p>' +
      '</div>' +
      '</div>';

    html += '<div class="stats">' +
      '<div class="stat"><div class="stat__num" data-count="' + c.pecas + '">0</div><div class="stat__label">peças no seu armário</div></div>' +
      '<div class="stat"><div class="stat__num" data-count="' + c.esquecidas + '">0</div><div class="stat__label">peças paradas sem uso</div></div>' +
      '<div class="stat stat--hero"><div class="stat__num" data-count="' + c.looks + '">0</div><div class="stat__label">looks pra montar com o que você tem</div></div>' +
      '</div>';

    html += '<section class="how">' +
      '<p class="how__kicker">Como o app trabalha por você</p>' +
      '<h3 class="how__title">Uma assistente virtual que <em>realmente</em> monta o seu look</h3>' +
      '<p class="how__copy">Dentro do aplicativo, basta <strong>bater uma foto do look ou da peça</strong> que você quer usar. A assistente virtual analisa na hora as <strong>cores, os tons e a sua proporção (' + formatAlturaM(med.altura) + ')</strong>, cruza tudo com o seu perfil ' + perfil.nome + ' e devolve a combinação certa: <strong>look pronto em 5 minutos</strong>, sem teste e erro na frente do espelho.</p>' +
      '<div class="how__steps">' +
        '<div class="how__step"><span>1</span><b>Bata a foto</b><small>da peça ou do look dentro do app</small></div>' +
        '<div class="how__step"><span>2</span><b>A assistente analisa</b><small>cores, tons e modelagens do seu perfil</small></div>' +
        '<div class="how__step"><span>3</span><b>Look pronto em 5 min</b><small>salvo no planejador, pronto pra sair</small></div>' +
      '</div>' +
      '<div class="chat" id="chatDemo">' +
        '<div class="chat__head"><i></i>Assistente Truque dos Mil Looks<span>online agora</span></div>' +
        '<div class="chat__msg chat__msg--user">Bati a foto da minha saia vinho. O que uso com ela?</div>' +
        '<div class="chat__msg chat__msg--ai">Analisando… essa saia vinho pede um topo em off-white e um terceiro ponto em bege areia. Montei 3 looks com peças que você já tem. ✨</div>' +
        '<div class="chat__msg chat__msg--ai">Pronto: look completo em 4 minutos. Já salvei no seu planejador de hoje. 💃</div>' +
      '</div>' +
      '</section>';

    html += '<div class="insights">';
    insights.forEach(function (ins) {
      html += '<div class="insight"><span class="ico">' + ins.ico + '</span><span>' + ins.txt + '</span></div>';
    });
    html += '</div>';

    /* ==============================================================
       STACK DE 3 BÔNUS BRILHANTES & INTERATIVOS ANTES DO CHECKOUT
       (Substitui o vídeo — Ancoragem R$ 281,00 -> R$ 0,00 GRÁTIS)
       ============================================================== */
    html += '<section class="bstack" id="bonusStack" aria-label="Bônus exclusivos liberados gratuitamente">' +
      '<div class="bstack__glow" aria-hidden="true"></div>' +
      '<div class="bstack__head">' +
        '<span class="bstack__pill shimmer-badge">🎁 3 PRESENTES VIP LIBERADOS PRA VOCÊ</span>' +
        '<h3 class="bstack__title">Ao garantir seu App hoje, você <em>ganha de graça</em> estes 3 Bônus!</h3>' +
        '<p class="bstack__sub">Vendidos separadamente por <strong><s>R$ 281,00</s></strong> — mas ativando seu acesso agora, todos os 3 já vêm <strong>100% liberados por R$ 0,00</strong> dentro do seu aplicativo:</p>' +
        '<div class="bstack__meter">' +
          '<div class="bstack__meter-top">' +
            '<span>✨ <b>3 de 3 presentes</b> adicionados ao seu acesso</span>' +
            '<strong class="bstack__saved">Economia: R$ 281,00</strong>' +
          '</div>' +
          '<div class="bstack__meter-bar"><div class="bstack__meter-fill"></div></div>' +
        '</div>' +
      '</div>' +

      '<div class="bstack__list">' +
        bonusItems.map(function (b, idx) {
          return '<article class="bcard" data-bonus-card="' + idx + '">' +
            '<div class="bcard__ribbon">' +
              '<span class="bcard__tag">✦ ' + b.tag + '</span>' +
              '<span class="bcard__free shimmer-badge">GRÁTIS HOJE</span>' +
            '</div>' +
            '<div class="bcard__body">' +
              '<div class="bcard__media" data-zoom-src="' + assetUrl(b.img) + '" data-zoom-title="' + b.title + '" role="button" tabindex="0" aria-label="Ampliar imagem do bônus ' + b.title + '">' +
                '<img src="' + assetUrl(b.img) + '" alt="' + b.alt + '" decoding="sync">' +
                '<span class="bcard__zoom">🔍 Toque para ampliar</span>' +
              '</div>' +
              '<div class="bcard__content">' +
                '<h4 class="bcard__title">' + b.title + '</h4>' +
                '<p class="bcard__desc">' + b.desc + '</p>' +
                '<div class="bcard__pricebox">' +
                  '<div class="bcard__old">Você pagaria: <s>R$ ' + b.oldPrice + ',00</s></div>' +
                  '<div class="bcard__now">Hoje com o App: <strong>R$ 0,00 <span>(DE GRAÇA)</span></strong></div>' +
                '</div>' +
                '<button type="button" class="bcard__toggle" data-bonus-toggle="' + idx + '" aria-expanded="' + (idx === 0 ? "true" : "false") + '">' +
                  '<span>' + (idx === 0 ? "O que você ganha neste presente" : "Toque para ver tudo que vem incluso") + '</span>' +
                  '<i>▾</i>' +
                '</button>' +
                '<ul class="bcard__perks"' + (idx === 0 ? '' : ' hidden') + '>' +
                  b.perks.map(function (p) { return '<li>' + p + '</li>'; }).join("") +
                '</ul>' +
                '<div class="bcard__status"><span>✓</span> Presente garantido automaticamente na sua compra</div>' +
              '</div>' +
            '</div>' +
          '</article>';
        }).join("") +
      '</div>' +

      '<div class="bstack__summary shimmer-card">' +
        '<div class="bstack__sum-eyebrow">🎉 RESUMO DO QUE VOCÊ ESTÁ GANHANDO HOJE</div>' +
        '<div class="bstack__sum-rows">' +
          '<div class="bstack__sum-row"><span>🎁 Montador de Looks &amp; Viagem</span><b><s>R$ 77,00</s> → GRÁTIS</b></div>' +
          '<div class="bstack__sum-row"><span>🎁 Closet Inteligente IA + VIP</span><b><s>R$ 107,00</s> → GRÁTIS</b></div>' +
          '<div class="bstack__sum-row"><span>🎁 Provador Virtual no Celular</span><b><s>R$ 97,00</s> → GRÁTIS</b></div>' +
        '</div>' +
        '<div class="bstack__sum-total">' +
          '<div><small>Valor real dos 3 Bônus:</small><s>R$ 281,00</s></div>' +
          '<div class="bstack__sum-zero"><small>Você paga pelos bônus:</small><strong>R$ 0,00</strong></div>' +
        '</div>' +
        '<button type="button" class="btn btn--gold btn--lg bstack__cta" id="btnClaimBonuses">Resgatar App + R$ 281 em Bônus Grátis →</button>' +
      '</div>' +
      '</section>';

    html += '<section class="offer" id="planos">' +
      '<p class="offer__kicker">✦ Oferta Especial Desbloqueada</p>' +
      '<h3 class="offer__title">Seus ' + c.looks + ' looks + R$ 281 em Bônus esperando por você</h3>' +
      '<p class="offer__copy">Ative agora o seu aplicativo personalizado para <strong>' + ocasoes + '</strong> e receba acesso imediato à plataforma + os <strong>3 presentes VIP de graça</strong>.</p>' +
      '<div class="plans" id="plansBox">' +
        '<div class="plan" data-plan="basico" tabindex="0" role="button" aria-pressed="false">' +
          '<span class="plan__radio"></span>' +
          '<h4 class="plan__name">Básico</h4>' +
          '<p class="plan__for">Acesso inicial sem pacote VIP</p>' +
          '<div class="plan__price">' +
            '<span class="plan__from">De <s>R$ 97,00</s> por</span>' +
            '<div><strong>R$ 14,90</strong><span>/mês</span></div>' +
            '<small>cerca de R$ 0,49 por dia</small>' +
          '</div>' +
          '<ul class="plan__list">' +
            '<li style="--i:0">Aplicativo Truque dos Mil Looks</li>' +
            '<li style="--i:1">Aulas de como se vestir melhor</li>' +
          '</ul>' +
          '<button type="button" class="btn btn--ghost plan__btn" data-cta data-plan="basico">Começar no Básico por R$ 14,90/mês</button>' +
        '</div>' +

        '<div class="plan plan--premium plan--sel" id="planPremium" data-plan="premium" tabindex="0" role="button" aria-pressed="true">' +
          '<span class="plan__flag shimmer-badge">⭐ Mais Escolhido · 88% OFF + 3 Bônus</span>' +
          '<div class="plan__shot"><img src="' + assetUrl("assets/img/mockup-premium.jpg") + '" alt="Aplicativo Truque dos Mil Looks aberto no celular e no tablet, ao lado do livro-guia do método" decoding="sync"></div>' +
          '<span class="plan__radio"></span>' +
          '<h4 class="plan__name">Premium Completo</h4>' +
          '<p class="plan__for">App Completo + Todos os 3 Bônus VIP Grátis</p>' +
          '<div class="plan__price">' +
            '<span class="plan__from">De <s>R$ 197,00</s> por apenas</span>' +
            '<div><strong>R$ 27,90</strong><span>/mês</span></div>' +
            '<small>☕ Menos de R$ 0,93 por dia · Cancele quando quiser</small>' +
          '</div>' +
          '<div class="plan__bonus-pill">🎁 <strong>+ R$ 281,00 em Bônus GRÁTIS</strong> (Montador + Closet IA + Provador)</div>' +
          '<ul class="plan__list">' +
            '<li style="--i:0">Tudo do Básico: App + Aulas práticas</li>' +
            '<li style="--i:1"><strong>Bônus #1:</strong> Montador de Looks &amp; Viagem <em>(Grátis)</em></li>' +
            '<li style="--i:2"><strong>Bônus #2:</strong> Closet IA 15→150 Looks <em>(Grátis)</em></li>' +
            '<li style="--i:3"><strong>Bônus #3:</strong> Provador Virtual Realista <em>(Grátis)</em></li>' +
            '<li style="--i:4">Cupons de looks baratos + Grupo VIP WhatsApp</li>' +
          '</ul>' +
          '<button type="button" class="btn btn--cta plan__btn" data-cta data-plan="premium">Quero o Premium + 3 Bônus por R$ 27,90/mês →</button>' +
        '</div>' +
      '</div>' +

      '<div class="plan-loss" id="planLossNote" hidden>' +
        '<p>⚠️ <strong>Tem certeza?</strong> No plano Básico você deixa de ganhar os <strong>R$ 281,00 em Bônus VIP</strong> (Closet 15→150 Looks, Cupons &amp; Grupo VIP) por uma diferença de apenas <strong>R$ 0,43 por dia</strong>.</p>' +
        '<button type="button" class="plan-loss__btn" id="btnRestorePremium">Voltar para o Premium Completo + 3 Bônus Grátis ✨</button>' +
      '</div>' +

      '<button type="button" class="cmp__toggle" id="cmpToggle" aria-expanded="false">Comparar os dois planos, item por item <span>▾</span></button>' +
      '<div class="cmp" id="cmpBox" hidden>' +
        '<div class="cmp__row cmp__head"><span>O que você recebe</span><b>Básico</b><b>Premium</b></div>' +
        '<div class="cmp__row"><span>Aplicativo Truque dos Mil Looks</span><b class="ok">✓</b><b class="ok">✓</b></div>' +
        '<div class="cmp__row"><span>Aulas de como se vestir melhor</span><b class="ok">✓</b><b class="ok">✓</b></div>' +
        '<div class="cmp__row"><span>🎁 Montador de Looks &amp; Viagem (R$ 77)</span><b class="na">—</b><b class="ok">GRÁTIS</b></div>' +
        '<div class="cmp__row"><span>🎁 Closet IA 15→150 Looks (R$ 107)</span><b class="na">—</b><b class="ok">GRÁTIS</b></div>' +
        '<div class="cmp__row"><span>🎁 Provador Virtual no Celular (R$ 97)</span><b class="na">—</b><b class="ok">GRÁTIS</b></div>' +
        '<div class="cmp__row"><span>Links de achadinhos + Grupo VIP</span><b class="na">—</b><b class="ok">✓</b></div>' +
      '</div>' +

      '<div class="offer__timer">⏳ Desconto de 88% + 3 Bônus Grátis expiram em <strong id="offerClock">15:00</strong></div>' +

      '<div class="offer__guarantee">' +
        '<span class="offer__g-ico">🛡️</span>' +
        '<div>' +
          '<strong>Garantia Blindada de 7 Dias · Risco Zero</strong>' +
          '<p>Entre no App, teste o Provador Virtual, o Closet IA e os looks montados com suas roupas. Se não amar, devolvemos 100% do valor com 1 clique.</p>' +
        '</div>' +
      '</div>' +

      '<div class="offer__badges">' + (CFG.trustBadges || []).map(function (b) { return '<span>' + b + '</span>'; }).join("") + '</div>' +
      '</section>';

    var tsmList = CFG.testimonials || [];
    if (tsmList.length) {
      html += '<section class="social">' +
        '<h3 class="social__title">Quem já destravou o armário</h3>' +
        '<div class="social__grid">' +
        tsmList.map(function (t) {
          return '<blockquote class="tsm">' +
            '<span class="stars">★★★★★</span>' +
            '<p>' + t.text + '</p>' +
            '<footer>' + t.name + '<small>' + t.context + '</small></footer>' +
            '</blockquote>';
        }).join("") +
        '</div></section>';
    }

    $("#resultBox").innerHTML = html;

    /* Rastreamento completo da Página de Resultado/Oferta no Meta Pixel */
    if (fromQuiz) track("PageView");
    track("Lead", {
      content_name: "Diagnóstico Concluído - Perfil " + perfil.nome,
      content_category: "Quiz Truque dos Mil Looks"
    });
    track("ViewContent", {
      content_name: "Oferta Truque dos Mil Looks - " + perfil.nome,
      content_ids: ["premium", "basico"],
      content_type: "product",
      value: 27.90,
      currency: "BRL"
    });

    $$("#resultBox [data-cta]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var pl = btn.dataset.plan || state.plan || "premium";
        track("InitiateCheckout", {
          content_name: pl === "basico" ? "Plano Básico Truque dos Mil Looks" : "Plano Premium + 3 Bônus Truque dos Mil Looks",
          content_ids: [pl],
          content_type: "product",
          value: pl === "basico" ? 14.90 : 27.90,
          currency: "BRL"
        });
        var u = offerUrl();
        if (pl) u += (u.indexOf("?") === -1 ? "?" : "&") + "plano=" + pl;
        window.location.href = u;
      });
    });

    var plansBox = $("#plansBox");
    var planLossNote = $("#planLossNote");
    var selectPlan = function () {};
    if (plansBox) {
      var syncSticky = function (id) {
        var s = $("#stickyCta [data-cta]");
        if (s) s.innerHTML = id === "premium" ? "Quero App + 3 Bônus · R$ 27,90/mês →" : "Básico (sem bônus) · R$ 14,90/mês →";
        if (planLossNote) planLossNote.hidden = (id === "premium");
      };
      selectPlan = function (id) {
        state.plan = id;
        $$("#plansBox .plan").forEach(function (p) {
          var on = p.dataset.plan === id;
          p.classList.toggle("plan--sel", on);
          p.setAttribute("aria-pressed", on ? "true" : "false");
        });
        syncSticky(id);
      };
      plansBox.addEventListener("click", function (e) {
        if (e.target.closest("[data-cta]")) return;
        var p = e.target.closest(".plan");
        if (p) selectPlan(p.dataset.plan);
      });
      plansBox.addEventListener("keydown", function (e) {
        if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("plan")) {
          e.preventDefault();
          selectPlan(e.target.dataset.plan);
        }
      });
      var btnRestorePrem = $("#btnRestorePremium");
      if (btnRestorePrem) {
        btnRestorePrem.addEventListener("click", function () {
          selectPlan("premium");
          var premEl = $("#planPremium");
          if (premEl) premEl.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
      selectPlan("premium");

      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (en) {
            if (en.isIntersecting) { plansBox.classList.add("inview"); io.unobserve(en.target); }
          });
        }, { threshold: 0.2 });
        io.observe(plansBox);
      } else {
        plansBox.classList.add("inview");
      }

      var ct = $("#cmpToggle"), cb = $("#cmpBox");
      if (ct && cb) ct.addEventListener("click", function () {
        var abrir = cb.hidden;
        cb.hidden = !abrir;
        ct.classList.toggle("open", abrir);
        ct.setAttribute("aria-expanded", abrir ? "true" : "false");
      });

      var clock = $("#offerClock");
      if (clock) {
        var fim = Date.now() + 15 * 60 * 1000;
        var tick = setInterval(function () {
          var s = Math.max(0, Math.floor((fim - Date.now()) / 1000));
          clock.textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
          if (s <= 0) { clearInterval(tick); clock.textContent = "00:00"; }
        }, 1000);
      }
    }

    var goToPremiumPlan = function () {
      selectPlan("premium");
      if (plansBox) plansBox.classList.add("inview");
      var premCard = $("#planPremium") || $("#planos");
      if (premCard) {
        premCard.scrollIntoView({ behavior: "smooth", block: "start" });
        premCard.classList.remove("plan--focus-pulse");
        void premCard.offsetWidth;
        premCard.classList.add("plan--focus-pulse");
        setTimeout(function () { premCard.classList.remove("plan--focus-pulse"); }, 1900);
      }
    };

    var firstImg = $("#resultFirstImg");
    if (firstImg) {
      firstImg.addEventListener("click", goToPremiumPlan);
      firstImg.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToPremiumPlan();
        }
      });
    }

    var chat = $("#chatDemo");
    if (chat) {
      if ("IntersectionObserver" in window) {
        var io2 = new IntersectionObserver(function (es) {
          es.forEach(function (en) {
            if (en.isIntersecting) { en.target.classList.add("inview"); io2.unobserve(en.target); }
          });
        }, { threshold: 0.3 });
        io2.observe(chat);
      } else {
        chat.classList.add("inview");
      }
    }

    var btnApp = $("#btnApp");
    if (btnApp) btnApp.addEventListener("click", goToPremiumPlan);

    /* Carrossel Antes & Depois: 1 slide por vez via translate3d (zero sobreposição, swipe suave) */
    var baViewport = $("#baViewport");
    var baTrack = $("#baTrack");
    if (baViewport && baTrack) {
      var slideEls = $$("#baTrack .ba-slide");
      var dotEls = $$("#baDots .ba-dot");
      var countEl = $("#baCount");
      var totalBa = slideEls.length;
      var activeBa = 0;
      var autoBaTimer = null;
      var userTouchedBa = false;

      var quoteEl = $("#baQuote");
      var goToBa = function (idx, animate) {
        activeBa = ((idx % totalBa) + totalBa) % totalBa;
        baTrack.style.transition = animate === false ? "none" : "transform .36s cubic-bezier(.22, 1, .36, 1)";
        baTrack.style.transform = "translate3d(-" + (activeBa * 100) + "%, 0, 0)";
        slideEls.forEach(function (el, i) { el.classList.toggle("is-active", i === activeBa); });
        dotEls.forEach(function (el, i) { el.classList.toggle("active", i === activeBa); });
        if (countEl) countEl.textContent = (activeBa + 1) + " de " + totalBa;
        if (quoteEl && baSlides[activeBa]) quoteEl.textContent = baSlides[activeBa].quote;
      };

      var stopAutoBa = function () {
        userTouchedBa = true;
        if (autoBaTimer) { clearInterval(autoBaTimer); autoBaTimer = null; }
      };

      /* Swipe tátil horizontal com arraste fluido no celular */
      var startX = 0, startY = 0, deltaX = 0, draggingBa = false, horizLock = null, startTime = 0;
      baViewport.addEventListener("touchstart", function (e) {
        var t = e.touches[0];
        if (!t) return;
        stopAutoBa();
        startX = t.clientX;
        startY = t.clientY;
        deltaX = 0;
        draggingBa = true;
        horizLock = null;
        startTime = Date.now();
        baTrack.style.transition = "none";
      }, { passive: true });

      baViewport.addEventListener("touchmove", function (e) {
        if (!draggingBa) return;
        var t = e.touches[0];
        if (!t) return;
        var dx = t.clientX - startX;
        var dy = t.clientY - startY;
        if (horizLock === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
          horizLock = Math.abs(dx) > Math.abs(dy);
        }
        if (!horizLock) return;
        if (e.cancelable) e.preventDefault();
        deltaX = dx;
        var vw = baViewport.clientWidth || 300;
        var pctOffset = (-activeBa * 100) + ((dx / vw) * 100);
        baTrack.style.transform = "translate3d(" + pctOffset.toFixed(2) + "%, 0, 0)";
      }, { passive: false });

      var finishSwipe = function () {
        if (!draggingBa) return;
        draggingBa = false;
        var vw = baViewport.clientWidth || 300;
        var threshold = Math.min(48, vw * 0.16);
        if (horizLock && Math.abs(deltaX) > threshold) {
          goToBa(deltaX < 0 ? activeBa + 1 : activeBa - 1, true);
        } else {
          goToBa(activeBa, true);
        }
      };
      baViewport.addEventListener("touchend", finishSwipe, { passive: true });
      baViewport.addEventListener("touchcancel", finishSwipe, { passive: true });

      /* Clique limpo (sem arrastar) na 1ª imagem do carrossel leva ao Plano Premium */
      var firstSlide = slideEls[0];
      if (firstSlide) {
        var ptrX = 0, ptrY = 0, ptrT = 0;
        firstSlide.addEventListener("pointerdown", function (e) {
          ptrX = e.clientX;
          ptrY = e.clientY;
          ptrT = Date.now();
        }, { passive: true });
        firstSlide.addEventListener("click", function (e) {
          var moved = Math.hypot((e.clientX || 0) - ptrX, (e.clientY || 0) - ptrY);
          var elapsed = Date.now() - ptrT;
          if (ptrT && (moved > 8 || elapsed > 450)) return;
          stopAutoBa();
          goToPremiumPlan();
        });
      }

      var prevBtn = $("#baPrev"), nextBtn = $("#baNext");
      if (prevBtn) prevBtn.addEventListener("click", function () {
        stopAutoBa();
        goToBa(activeBa - 1, true);
      });
      if (nextBtn) nextBtn.addEventListener("click", function () {
        stopAutoBa();
        goToBa(activeBa + 1, true);
      });
      dotEls.forEach(function (dot) {
        dot.addEventListener("click", function () {
          stopAutoBa();
          goToBa(parseInt(dot.dataset.baDot, 10) || 0, true);
        });
      });

      goToBa(0, false);

      if ("IntersectionObserver" in window) {
        var ioBa = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting && !userTouchedBa && !autoBaTimer) {
              autoBaTimer = setInterval(function () {
                if (!screens.result.classList.contains("active") || userTouchedBa) {
                  clearInterval(autoBaTimer);
                  autoBaTimer = null;
                  return;
                }
                goToBa(activeBa + 1, true);
              }, 4400);
            } else if (!en.isIntersecting && autoBaTimer) {
              clearInterval(autoBaTimer);
              autoBaTimer = null;
            }
          });
        }, { threshold: 0.45 });
        ioBa.observe(baViewport);
      }
    }

    /* Interatividade da Stack de Bônus: acordeão de benefícios + zoom tela cheia + CTA direto */
    var bonusStackEl = $("#bonusStack");
    if (bonusStackEl) {
      bonusStackEl.addEventListener("click", function (e) {
        var toggleBtn = e.target.closest("[data-bonus-toggle]");
        if (toggleBtn) {
          var card = toggleBtn.closest(".bcard");
          var list = card && card.querySelector(".bcard__perks");
          if (list) {
            var opening = list.hidden;
            list.hidden = !opening;
            toggleBtn.classList.toggle("open", opening);
            toggleBtn.setAttribute("aria-expanded", opening ? "true" : "false");
            var lbl = toggleBtn.querySelector("span");
            if (lbl) lbl.textContent = opening ? "O que você ganha neste presente" : "Toque para ver tudo que vem incluso";
          }
          return;
        }
        var mediaEl = e.target.closest("[data-zoom-src]");
        if (mediaEl) {
          openBonusZoom(mediaEl.dataset.zoomSrc, mediaEl.dataset.zoomTitle);
        }
      });

      bonusStackEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          var mediaEl = e.target.closest && e.target.closest("[data-zoom-src]");
          if (mediaEl) {
            e.preventDefault();
            openBonusZoom(mediaEl.dataset.zoomSrc, mediaEl.dataset.zoomTitle);
          }
        }
      });
    }

    var btnClaimBonuses = $("#btnClaimBonuses");
    if (btnClaimBonuses) btnClaimBonuses.addEventListener("click", goToPremiumPlan);

    /* Modal Lightbox dos Bônus */
    var zoomModal = $("#bonusZoomModal");
    var zoomImg = $("#bonusZoomImg");
    var zoomCap = $("#bonusZoomCaption");
    function openBonusZoom(src, title) {
      if (!zoomModal || !zoomImg) return;
      zoomImg.src = src;
      zoomImg.alt = title || "Bônus exclusivo do aplicativo";
      if (zoomCap) zoomCap.textContent = "🎁 " + (title || "Presente incluso gratuitamente") + " — R$ 0,00 com o App";
      zoomModal.hidden = false;
      document.body.style.overflow = "hidden";
    }
    function closeBonusZoom() {
      if (!zoomModal) return;
      zoomModal.hidden = true;
      document.body.style.overflow = "";
    }
    if (zoomModal && !zoomModal.dataset.bound) {
      zoomModal.dataset.bound = "1";
      var zClose = $("#bonusZoomClose");
      var zCta = $("#bonusZoomCta");
      if (zClose) zClose.addEventListener("click", closeBonusZoom);
      if (zCta) zCta.addEventListener("click", function () {
        closeBonusZoom();
        goToPremiumPlan();
      });
      zoomModal.addEventListener("click", function (e) {
        if (e.target.hasAttribute("data-close-zoom")) closeBonusZoom();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && zoomModal && !zoomModal.hidden) closeBonusZoom();
      });
    }

    /* Prova social viva e discreta (exibe 3 ativações reais sem atrapalhar a leitura) */
    startSocialProofToast();

    $$("[data-count]").forEach(countUp);

    show("result");
    goToTop();
    setHeaderMode("result");
    $("#stickyCta").hidden = false;
  }

  var socialToastTimer = null;
  function startSocialProofToast() {
    var toast = $("#socialToast");
    var nameEl = $("#socialToastName");
    var msgEl = $("#socialToastMsg");
    if (!toast || !nameEl || !msgEl) return;
    if (socialToastTimer) { clearTimeout(socialToastTimer); socialToastTimer = null; }

    var buyers = [
      { who: "Juliana M. · São Paulo, SP", msg: "acabou de ativar o Premium + 3 Bônus Grátis" },
      { who: "Patrícia F. · Belo Horizonte, MG", msg: "resgatou os R$ 281 em bônus há 2 min" },
      { who: "Carolina S. · Curitiba, PR", msg: "liberou o App + Provador Virtual agora" }
    ];
    var idx = 0;

    function showNext() {
      if (!screens.result.classList.contains("active") || idx >= buyers.length) {
        toast.hidden = true;
        return;
      }
      var item = buyers[idx++];
      nameEl.textContent = item.who;
      msgEl.textContent = item.msg;
      toast.hidden = false;
      toast.classList.add("is-visible");
      socialToastTimer = setTimeout(function () {
        toast.classList.remove("is-visible");
        setTimeout(function () {
          toast.hidden = true;
          if (idx < buyers.length) {
            socialToastTimer = setTimeout(showNext, 11000);
          }
        }, 380);
      }, 4600);
    }

    socialToastTimer = setTimeout(showNext, 5500);
  }

  function countUp(el) {
    var target = parseInt(el.dataset.count, 10) || 0;
    var start = null;
    var dur = 850;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------------- Config injetada ---------------- */
  function applyConfig() {
    $$("[data-config]").forEach(function (el) {
      var key = el.dataset.config;
      if (CFG[key] != null) el.textContent = CFG[key];
    });
    $$("[data-config-link]").forEach(function (el) {
      var key = el.dataset.configLink;
      if (CFG[key]) el.href = CFG[key];
    });
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    initPixel();
    applyConfig();

    var params = new URLSearchParams(window.location.search);
    var stepParam = params.get("step");
    var openScratchNow = false;
    var openResultNow = (stepParam === "resultado" || stepParam === "result");

    if (stepParam === "ticket" || stepParam === "raspe") {
      var sentirIdx = QUESTIONS.findIndex(function (q) { return q.ticket; });
      if (sentirIdx !== -1) state.i = sentirIdx;
      openScratchNow = true;
    } else if (stepParam && !openResultNow) {
      var byId = QUESTIONS.findIndex(function (q) { return q.id === stepParam; });
      var byNum = parseInt(stepParam, 10);
      if (byId !== -1) state.i = byId;
      else if (!isNaN(byNum) && byNum >= 1 && byNum <= QUESTIONS.length) state.i = byNum - 1;
    }

    if (openResultNow) {
      document.body.classList.remove("bg-creme");
      startBackgroundWarmup();
      showResult(false);
    } else {
      track("ViewContent", {
        content_name: "Quiz Truque dos Mil Looks",
        content_category: "Quiz Funnel"
      });
      track("QuizStart", true);
      track("QuizStep", {
        step: state.i + 1,
        step_id: QUESTIONS[state.i] ? QUESTIONS[state.i].id : "idade",
        total_steps: QUESTIONS.length
      });
      show("quiz");
      hydrateOrRenderQuestion(state.i === 0);
      startBackgroundWarmup();
      if (openScratchNow) openTicket();
    }

    var brandHome = $("#brandHome");
    if (brandHome) brandHome.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    $("#btnBack").addEventListener("click", function () {
      if (state.i === 0) return;
      state.i -= 1;
      renderQuestion();
    });

    $("#ticketNext").addEventListener("click", function () {
      closeTicket();
      advance();
    });

    $("#lnkRestart").addEventListener("click", function (e) {
      e.preventDefault();
      closeTicket();
      if (socialToastTimer) clearTimeout(socialToastTimer);
      var st = $("#socialToast");
      if (st) st.hidden = true;
      state.i = 0; state.answers = {};
      show("quiz");
      renderQuestion();
    });

    $("#stickyCta").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-cta]");
      if (!btn) return;
      var prem = $("#planPremium") || $("#planos");
      if (prem) {
        var r = prem.getBoundingClientRect();
        var visible = r.top < window.innerHeight * 0.65 && r.bottom > 110;
        if (!visible) {
          e.preventDefault();
          prem.scrollIntoView({ behavior: "smooth", block: "start" });
          prem.classList.remove("plan--focus-pulse");
          void prem.offsetWidth;
          prem.classList.add("plan--focus-pulse");
          setTimeout(function () { prem.classList.remove("plan--focus-pulse"); }, 1900);
          return;
        }
      }
      var plSticky = state.plan || "premium";
      track("InitiateCheckout", {
        content_name: plSticky === "basico" ? "Plano Básico Truque dos Mil Looks" : "Plano Premium + 3 Bônus Truque dos Mil Looks",
        content_ids: [plSticky],
        content_type: "product",
        value: plSticky === "basico" ? 14.90 : 27.90,
        currency: "BRL"
      });
      var dest = offerUrl();
      if (state.plan) dest += (dest.indexOf("?") === -1 ? "?" : "&") + "plano=" + state.plan;
      window.location.href = dest;
    });

    document.addEventListener("keydown", function (e) {
      if (!screens.quiz.classList.contains("active")) return;
      if (!$("#ticketModal").hidden) {
        if (e.key === "Enter" && !$("#ticketNext").hidden) $("#ticketNext").click();
        return;
      }
      var tag = e.target && e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        if (e.key === "Enter") {
          var medBtn = $("#btnMedidasNext");
          if (medBtn) { e.preventDefault(); medBtn.click(); }
        }
        return;
      }
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= 9) {
        var opts = $$("#quizBox .opt");
        if (opts[n - 1]) opts[n - 1].click();
      }
      if (e.key === "Enter") {
        var next = $("#btnNext");
        if (next && next.classList.contains("show")) next.click();
        var medNext = $("#btnMedidasNext");
        if (medNext) medNext.click();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
