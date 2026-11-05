/* =========================================================
   LUMINA STYLE AI (US EDITION) · Quiz Engine & Offer Page
   100% Faithful 3D Visuals + Exact CSS Classes + Mosso Color Analysis
   ========================================================= */
(function () {
  "use strict";

  var CFG = window.FUNIL_CONFIG || {};
  var CDN_ORIGIN = (CFG.cdnAssetOrigin || "https://descompacto.vercel.app").replace(/\/$/, "");

  /* Local bespoke English 3D & portrait assets stored inside funil-us/assets/img/ */
  var LOCAL_ASSETS = {
    "assets/img/hero-banner-v2-en.webp": true,
    "assets/img/age-18-29.jpg": true,
    "assets/img/age-30-39.jpg": true,
    "assets/img/age-40-49.jpg": true,
    "assets/img/age-50-plus.jpg": true,
    "assets/img/app-preview-3d-en.jpg": true,
    "assets/img/before-after-cover-en.jpg": true,
    "assets/img/before-after-1-en.jpg": true,
    "assets/img/before-after-2-en.jpg": true,
    "assets/img/before-after-3-en.jpg": true,
    "assets/img/bonus-planner-en.jpg": true,
    "assets/img/bonus-closet-en.jpg": true,
    "assets/img/bonus-tryon-en.jpg": true,
    "assets/img/mockup-vip-3d-en.jpg": true,
    "assets/img/triptych-looks-en.jpg": true
  };

  function assetUrl(relPath) {
    if (!relPath) return "";
    if (/^https?:\/\//i.test(relPath)) return relPath;
    var clean = relPath.replace(/^\//, "").split("?")[0];
    if (LOCAL_ASSETS[clean]) return relPath;
    return CDN_ORIGIN + "/" + relPath.replace(/^\//, "");
  }

  /* ---------------- 14 High-Converting US Quiz Steps ---------------- */
  var QUESTIONS = [
    {
      id: "idade",
      kicker: "",
      title: "Learn which <em>colors &amp; shapes</em> flatter you most",
      hint: "Select your age range to personalize your Color Palette & Wardrobe Report:",
      type: "single",
      layout: "grid-img",
      options: [
        { id: "18-29", img: "assets/img/age-18-29.jpg", label: "18 to 29" },
        { id: "30-39", img: "assets/img/age-30-39.jpg", label: "30 to 39" },
        { id: "40-49", img: "assets/img/age-40-49.jpg", label: "40 to 49" },
        { id: "50+",   img: "assets/img/age-50-plus.jpg", label: "50 or older" }
      ]
    },
    {
      id: "guardaRoupa",
      kicker: "Your starting point",
      title: "Be honest: what does your closet feel like right now?",
      type: "single",
      layout: "duo-img",
      options: [
        { id: "caos", img: "assets/img/guarda-roupa-caos.jpg", label: "Packed with pieces that don't match each other", small: "I open the doors, stare at everything… and feel overwhelmed." },
        { id: "repete", img: "assets/img/guarda-roupa-cheio.jpg", label: "Plenty of clothes, yet I repeat the same 3 safe outfits", small: "80% of my hangers barely get touched all month." }
      ]
    },
    {
      id: "undertone",
      kicker: "Personal Color Analysis · Step 1",
      title: "Look at your inner wrist in natural daylight. Which shade are your veins?",
      hint: "Your skin undertone determines which colors make you glow—and which wash you out.",
      type: "single",
      layout: "list",
      options: [
        { id: "warm",    ico: "☀️", label: "Mostly greenish or olive", small: "Classic sign of warm / golden undertones" },
        { id: "cool",    ico: "❄️", label: "Blue or slightly purplish", small: "Classic sign of cool / rosy undertones" },
        { id: "neutral", ico: "✨", label: "A mix of blue & green — hard to tell", small: "Balanced neutral undertone" },
        { id: "deep",    ico: "🤎", label: "Subtle / rich complexion", small: "Deep warm-neutral radiance" }
      ]
    },
    {
      id: "jewelry",
      kicker: "Personal Color Analysis · Step 2",
      title: "The Jewelry Test: Which metal makes your skin look brighter and more rested?",
      type: "single",
      layout: "list",
      options: [
        { id: "gold",   ico: "🥇", label: "Yellow Gold gives me an instant warm glow" },
        { id: "silver", ico: "🥈", label: "Silver, White Gold, or Platinum looks crispest" },
        { id: "both",   ico: "💫", label: "Rose Gold — or honestly both Gold & Silver flatter me" }
      ]
    },
    {
      id: "estilo",
      kicker: "Your style identity",
      title: "Which of these aesthetics feels most like the best-dressed version of you?",
      hint: "Tap the look that catches your eye naturally—not what you feel you 'should' wear.",
      type: "single",
      layout: "grid-img",
      options: [
        { id: "classica",  img: "assets/img/perfil-classica.jpg?v=2",  label: "Quiet Luxury Classic", small: "Tailoring, rich neutrals, timeless gold" },
        { id: "moderna",   img: "assets/img/perfil-moderna.jpg?v=2",   label: "Modern Minimalist",    small: "Clean lines, elevated everyday cuts" },
        { id: "romantica", img: "assets/img/perfil-romantica.jpg?v=3", label: "Soft & Feminine",      small: "Fluid drape, warm flattering tones" },
        { id: "criativa",  img: "assets/img/perfil-criativa.jpg?v=2",  label: "Bold & Editorial",     small: "Statement layers, color & personality" },
        { id: "fitness",   img: "assets/img/perfil-fitness.jpg",       label: "Elevated Athleisure",  small: "Clean sneakers, comfort & smart layers" },
        { id: "naosei",    ico: "🧭", label: "Not sure yet",           small: "I want the app to help me discover mine" }
      ]
    },
    {
      id: "corpo",
      kicker: "Your natural proportions",
      title: "Which silhouette is closest to your natural body shape?",
      hint: "Swipe sideways and tap the closest match—we use this solely to recommend cuts that flatter your balance.",
      type: "single",
      layout: "corpo",
      options: [
        { id: "ampulheta",  img: "assets/img/corpo-ampulheta.png",           label: "Hourglass",         small: "Defined waist" },
        { id: "tinvertido", img: "assets/img/corpo-triangulo-invertido.png", label: "Inverted Triangle", small: "Broader shoulders" },
        { id: "oval",       img: "assets/img/corpo-oval.png",                label: "Soft Midsection",   small: "Fullness in center" },
        { id: "retangular", img: "assets/img/corpo-retangulo.png",           label: "Rectangle",         small: "Clean straight lines" },
        { id: "triangulo",  img: "assets/img/corpo-triangulo.png",           label: "Pear / Triangle",   small: "Curvier hips" },
        { id: "naosei",     ico: "✨", label: "Not sure",                    small: "Let the app calibrate it" }
      ]
    },
    {
      id: "medidas",
      kicker: "Exact fit calibration",
      title: "What are your current height and approximate weight?",
      hint: "Slide the controls or use + / − — we calibrate hemline lengths, rise, and visual proportions specifically for you.",
      type: "medidas",
      layout: "medidas",
      options: []
    },
    {
      id: "dificuldade",
      kicker: "Biggest frustration",
      title: "What frustrates you most about getting dressed right now?",
      type: "single",
      layout: "list",
      options: [
        { id: "combinar", ico: "🧩", label: "Putting together fresh outfits from pieces I already own" },
        { id: "valoriza", ico: "🪞", label: "Knowing which colors & cuts genuinely flatter my body" },
        { id: "comprar",  ico: "💸", label: "Stopping impulse buys that end up sitting unworn with tags" },
        { id: "tempo",    ico: "⏰", label: "Looking polished & put-together in under 5 minutes" }
      ]
    },
    {
      id: "ocasioes",
      kicker: "Your real life",
      title: "Which occasions do you need great outfits for most?",
      hint: "Select as many as you'd like.",
      type: "multi",
      layout: "chips",
      options: [
        { id: "trabalho",  ico: "💼", label: "Work & Meetings" },
        { id: "passeio",   ico: "🌿", label: "Weekends & Errands" },
        { id: "eventos",   ico: "🥂", label: "Events & Parties" },
        { id: "encontros", ico: "❤️", label: "Date Nights & Dinners" },
        { id: "viagens",   ico: "✈️", label: "Travel & Carry-On Trips" }
      ]
    },
    {
      id: "pecas",
      kicker: "The golden question",
      title: "Roughly how many clothes are hanging in your closet?",
      hint: "A quick guess is totally fine—we calculate your hidden outfit multiplier from this.",
      type: "single",
      layout: "list",
      options: [
        { id: "p15", ico: "👚", label: "Under 25 pieces", small: "Minimalist / lean closet" },
        { id: "p30", ico: "👗", label: "25 to 45 pieces" },
        { id: "p55", ico: "🧥", label: "45 to 75 pieces" },
        { id: "p80", ico: "🛍️", label: "75+ pieces", small: "Honestly lost count!" }
      ]
    },
    {
      id: "tempoLook",
      kicker: "Your mornings",
      title: "How long does it usually take you to pick an outfit in the morning?",
      type: "single",
      layout: "list",
      options: [
        { id: "t5",  ico: "⚡", label: "Under 5 minutes", small: "I just grab the first safe thing I see" },
        { id: "t15", ico: "🕐", label: "5 to 15 minutes" },
        { id: "t30", ico: "🕰️", label: "15 to 30 minutes" },
        { id: "t30m",ico: "😮‍💨", label: "Over 30 minutes", small: "And I still walk out second-guessing my outfit" }
      ]
    },
    {
      id: "uso",
      kicker: "Total honesty",
      title: "And how much of your closet do you actually wear in a typical month?",
      type: "single",
      layout: "list",
      options: [
        { id: "u15", ico: "🙈", label: "Under 20%", small: "The rest sits waiting for 'someday'" },
        { id: "u30", ico: "🌗", label: "Around 20% to 40%" },
        { id: "u50", ico: "⚖️", label: "About half (40% to 60%)" },
        { id: "u85", ico: "🌟", label: "Almost all of it!", small: "I just want fresher combinations" }
      ]
    },
    {
      id: "objetivo",
      kicker: "Almost there",
      title: "What is your #1 goal for your personal style?",
      type: "single",
      layout: "list",
      options: [
        { id: "autoestima",  ico: "💖", label: "Confidence — feeling radiant & put-together every day" },
        { id: "elegancia",   ico: "🕊️", label: "Effortless Chic — looking elevated without trying too hard" },
        { id: "praticidade", ico: "⚡", label: "Zero Morning Stress — ready in 4 minutes flat" },
        { id: "economia",    ico: "🎯", label: "Smart Savings — loving what I own & buying right once" }
      ]
    },
    {
      id: "sentir",
      kicker: "The trick in action",
      banner: "assets/img/triptych-looks-en.jpg",
      bannerAlt: "1 crisp white button-down styled into 3 chic outfits: Casual, Chic, and Luxury",
      bannerCap: "1 white shirt, 3 effortlessly chic outfits!",
      title: "Final step! How do you want to feel walking out the door in your new outfits?",
      type: "single",
      layout: "list",
      ticket: true,
      options: [
        { id: "poderosa", ico: "💃", label: "Confident & Magnetic", small: "Turning heads effortlessly wherever I walk in" },
        { id: "elegante", ico: "✨", label: "Polished Without Trying", small: "Quiet luxury ease in my everyday clothes" },
        { id: "leve",     ico: "😌", label: "Calm & Decisive", small: "Opening my closet and knowing what works in seconds" }
      ]
    }
  ];

  /* ---------------- 12-Season Color Palette Engine ---------------- */
  var COLOR_SEASONS = {
    soft_autumn: {
      key: "soft_autumn",
      name: "Soft Warm Autumn",
      metal: "Yellow & Brushed Gold",
      desc: "Warm, velvety earth tones and creamy neutrals bring out an instant 'lit-from-within' glow in your complexion.",
      swatches: [
        { name: "Warm Ivory", hex: "#F6EFE2" },
        { name: "Camel",      hex: "#C69C6D" },
        { name: "Burgundy",   hex: "#6E1423" },
        { name: "Sage Olive", hex: "#657453" },
        { name: "Espresso",   hex: "#3E2723" },
        { name: "Terracotta", hex: "#B85D43" }
      ],
      avoid: "Icy stark white & neon magenta (swap for Warm Ivory & Burgundy)"
    },
    deep_winter: {
      key: "deep_winter",
      name: "Deep Cool Winter",
      metal: "Silver, Platinum & White Gold",
      desc: "Rich jewel tones and crisp high-contrast neutrals frame your features with striking clarity and polish.",
      swatches: [
        { name: "Crisp White",   hex: "#FAFAFA" },
        { name: "True Black",    hex: "#1C1B1E" },
        { name: "Deep Berry",    hex: "#72142E" },
        { name: "Midnight Navy", hex: "#1B2A4A" },
        { name: "Emerald",       hex: "#165B4C" },
        { name: "Charcoal",      hex: "#4A4E54" }
      ],
      avoid: "Muted yellowish beige & pale orange (swap for Crisp White & Berry)"
    },
    warm_spring: {
      key: "warm_spring",
      name: "Light Warm Spring",
      metal: "Yellow Gold & Warm Pearl",
      desc: "Fresh, sunlit neutrals paired with clear warm accents make your skin look energized, youthful, and rested.",
      swatches: [
        { name: "Cream Silk", hex: "#FFF8E7" },
        { name: "Warm Sand",  hex: "#DFC59E" },
        { name: "Coral Rose", hex: "#D96B5C" },
        { name: "Warm Navy",  hex: "#283C5F" },
        { name: "Soft Camel", hex: "#CCA06E" },
        { name: "Olive Leaf", hex: "#6D8252" }
      ],
      avoid: "Heavy head-to-toe black & muddy gray (swap for Warm Navy & Cream)"
    },
    cool_summer: {
      key: "cool_summer",
      name: "Soft Cool Summer",
      metal: "Silver, Rose Gold & Pearl",
      desc: "Refined, cool-toned neutrals and dusty rose/navy hues harmonize with your natural features without overpowering you.",
      swatches: [
        { name: "Soft White",  hex: "#F4F3F1" },
        { name: "Taupe Gray",  hex: "#B2A89F" },
        { name: "Dusty Rose",  hex: "#C98D94" },
        { name: "French Navy", hex: "#263859" },
        { name: "Plum Wine",   hex: "#65213B" },
        { name: "Slate Blue",  hex: "#5E7693" }
      ],
      avoid: "Harsh orange-rust & mustard yellow (swap for Plum Wine & Taupe)"
    }
  };

  function computeColorSeason(a) {
    var u = a.undertone || "warm";
    var j = a.jewelry || "gold";
    if (u === "cool" || (j === "silver" && u !== "warm")) {
      return u === "deep" ? COLOR_SEASONS.deep_winter : COLOR_SEASONS.cool_summer;
    }
    return j === "both" ? COLOR_SEASONS.warm_spring : COLOR_SEASONS.soft_autumn;
  }

  var PERFIS = {
    classica: {
      nome: "Timeless Quiet Luxury",
      tag: "Neutral capsule base, effortless tailoring, and a touch of rich burgundy.",
      desc: "You project calm confidence without ever trying too hard. Your closet multiplies fastest when anchored in Warm Ivory, Camel, and Sand neutrals accented by your seasonal power shade—and our AI builds those exact daily formulas for you.",
      img: "assets/img/perfil-classica.jpg?v=2"
    },
    moderna: {
      nome: "Modern Minimalist Chic",
      tag: "Fewer pieces, 10x more impact.",
      desc: "You don't need an overflowing closet—you need smart cohesion. With 15 well-connected pieces in your right proportions, your wardrobe turns into an effortless outfit machine every morning.",
      img: "assets/img/perfil-moderna.jpg?v=2"
    },
    romantica: {
      nome: "Refined Feminine",
      tag: "Soft movement, flattering waist definition, and warm elegance.",
      desc: "Your style shines in subtle details. Balancing fluid blouses and satin midi skirts with structured third pieces multiplies your outfits while keeping your signature warmth.",
      img: "assets/img/perfil-romantica.jpg?v=3"
    },
    criativa: {
      nome: "Authentic Editorial",
      tag: "Signature color & smart layering tailored to you.",
      desc: "You spot combinations nobody else sees—all that's missing is a visual system to organize them. Lumina catalogs your pieces and hands you ready-to-wear looks from work to dinner.",
      img: "assets/img/perfil-criativa.jpg?v=2"
    },
    fitness: {
      nome: "Elevated Everyday Comfort",
      tag: "Comfort that looks effortlessly styled—from errands to lunch.",
      desc: "Your life moves fast: clean white sneakers, smart blazers, breathable knits, and flattering proportions give you all-day comfort that still looks polished and intentional.",
      img: "assets/img/perfil-fitness.jpg"
    },
    naosei: {
      nome: "Signature Style in Discovery",
      tag: "You don't need to have it figured out—our AI maps it with you.",
      desc: "You don't have to start with a label. Using your seasonal color palette, proportions, and the clothes already in your closet, Lumina reveals your most flattering daily outfit formulas automatically.",
      img: "assets/img/estilo-novo.jpg"
    }
  };

  /* ---------------- Background Image Preloader ---------------- */
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
        if (typeof img.decode === "function") img.decode().catch(function () {}).then(resolve);
        else resolve();
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
    if (idx === 0) list.push("assets/img/hero-banner-v2-en.webp");
    if (q.banner) list.push(q.banner);
    (q.options || []).forEach(function (o) { if (o.img) list.push(o.img); });
    return list;
  }

  function warmNextSteps(fromIdx) {
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
      "assets/img/app-preview-3d-en.jpg",
      "assets/img/before-after-cover-en.jpg",
      "assets/img/before-after-2-en.jpg",
      "assets/img/before-after-3-en.jpg",
      "assets/img/before-after-1-en.jpg",
      "assets/img/bonus-planner-en.jpg",
      "assets/img/bonus-closet-en.jpg",
      "assets/img/bonus-tryon-en.jpg",
      "assets/img/mockup-vip-3d-en.jpg"
    ].forEach(function (src) {
      if (allOrdered.indexOf(src) === -1) allOrdered.push(src);
    });

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

  var PECAS_VALOR = { p15: 20, p30: 35, p55: 58, p80: 80 };
  var USO_VALOR = { u15: 0.18, u30: 0.3, u50: 0.5, u85: 0.85 };
  var USO_ROTULO = { u15: "20%", u30: "30%", u50: "50%", u85: "85%" };
  var TEMPO_ROTULO = { t5: "under 5 min", t15: "5–15 min", t30: "15–30 min", t30m: "over 30 min" };
  var OCASAO_ROTULO = { trabalho: "work & meetings", passeio: "weekends & casual", eventos: "special events", encontros: "date nights", viagens: "carry-on travel" };
  var CORPO_ROTULO = {
    ampulheta: "Hourglass (defined waist)",
    tinvertido: "Inverted Triangle (defined shoulders)",
    retangular: "Rectangle (clean vertical lines)",
    oval: "Soft Midsection (elongating center drape)",
    triangulo: "Pear / Triangle (curvy hips)",
    naosei: "balanced custom silhouette"
  };

  /* US Imperial Height (inches: 58 = 4'10" .. 73 = 6'1") & Weight (lbs: 95 .. 280) */
  var H_MIN = 58, H_MAX = 73, H_DEF = 65; // 5'5"
  var W_MIN = 95, W_MAX = 280, W_DEF = 145;

  var state = { i: 0, answers: {}, locked: false, plan: "vip" };
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

  /* ---------------- Meta Pixel (USD Full-Funnel Tracking) ---------------- */
  var STANDARD_FB_EVENTS = { PageView: 1, ViewContent: 1, Lead: 1, InitiateCheckout: 1, AddToCart: 1, CompleteRegistration: 1, Purchase: 1 };

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

  function offerUrl(plan) {
    var chosen = (plan || state.plan || "vip").toLowerCase();
    var base = (chosen === "basic"
      ? (CFG.offerUrlBasic || CFG.offerUrl)
      : (CFG.offerUrlVip || CFG.offerUrl)) || "#";

    if (base.charAt(0) === "#") return base;

    var forwarded = new URLSearchParams(window.location.search || "");
    forwarded.delete("step");
    var fbp = readCookie("_fbp");
    var fbc = readCookie("_fbc");
    if (fbp && !forwarded.has("fbp") && base.indexOf("fbp=") === -1) forwarded.set("fbp", fbp);
    if (fbc && !forwarded.has("fbc") && base.indexOf("fbc=") === -1) forwarded.set("fbc", fbc);

    var qs = forwarded.toString();
    if (!qs) return base;
    return base + (base.indexOf("?") === -1 ? "?" : "&") + qs;
  }

  function triggerCheckout(plan) {
    var pl = (plan || state.plan || "vip").toLowerCase();
    var val = pl === "basic" ? 14.00 : 27.00;
    track("InitiateCheckout", {
      content_name: pl === "basic" ? "Lumina Basic Starter ($14 USD)" : "Lumina VIP Complete Lifetime + 3 Free Bonuses ($27 USD)",
      content_ids: [pl],
      content_type: "product",
      value: val,
      currency: "USD"
    });
    var dest = offerUrl(pl);
    if (!dest || dest.charAt(0) === "#") {
      var info = $("#setupModalPlanInfo");
      if (info) info.textContent = pl === "basic" ? "Basic Starter ($14.00 USD)" : "VIP Complete Lifetime ($27.00 USD)";
      var sm = $("#checkoutSetupModal");
      if (sm) sm.hidden = false;
      return;
    }
    window.location.href = dest;
  }

  /* ---------------- Progress & Header ---------------- */
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

  /* ---------------- Animated US Height (ft/in) & Weight (lbs) Widget ---------------- */
  function clamp(val, min, max) {
    var n = parseInt(val, 10);
    if (isNaN(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  function formatFtIn(totalIn) {
    var v = clamp(totalIn, H_MIN, H_MAX);
    return Math.floor(v / 12) + "'" + (v % 12) + '"';
  }

  function describeMedidasUS(inches, lbs) {
    var ftTxt = formatFtIn(inches);
    if (inches <= 63) {
      return {
        badge: "✦ Petite Elongation Fit",
        dica: "At <strong>" + ftTxt + "</strong>, we prioritize slightly higher rises, front French-tucks, and unbroken vertical color lines to <strong>visually lengthen your legs—even in flats &amp; sneakers</strong>."
      };
    }
    if (inches <= 67) {
      return {
        badge: "✦ Balanced Golden Ratio",
        dica: "At <strong>" + ftTxt + "</strong>, the classic <strong>1/3 top + 2/3 bottom ratio</strong>, hip-skimming blazers, and mid-calf midi hems flatter your proportions effortlessly."
      };
    }
    return {
      badge: "✦ Statuesque Tailored Line",
      dica: "At <strong>" + ftTxt + "</strong>, fluid wide-leg trousers, relaxed third pieces, and intentional waist contrast showcase your natural presence."
    };
  }

  function updateRangeFill(input) {
    var min = parseFloat(input.min) || 0;
    var max = parseFloat(input.max) || 100;
    var val = parseFloat(input.value) || min;
    var pct = ((val - min) / (max - min)) * 100;
    input.style.background = "linear-gradient(90deg, var(--vinho) " + pct + "%, var(--bege) " + pct + "%)";
  }

  function renderMedidasHTML(saved) {
    var inches = saved ? saved.inches : H_DEF;
    var lbs = saved ? saved.lbs : W_DEF;
    var info = describeMedidasUS(inches, lbs);

    var rulerTicks = "";
    for (var t = 0; t <= 10; t++) {
      rulerTicks += '<i class="' + (t % 5 === 0 ? "major" : "") + '"></i>';
    }

    return (
      '<div class="medidas" id="medidasWidget">' +
        '<div class="medidas-preview">' +
          '<div class="medidas-stage" aria-hidden="true">' +
            '<div class="medidas-ruler">' + rulerTicks + '</div>' +
            '<div class="medidas-marker" id="medidasMarker"><span id="medidasMarkerTxt">' + formatFtIn(inches) + '</span></div>' +
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
              '<span class="medidas-pill">Height: <strong id="pillAltura">' + formatFtIn(inches) + '</strong></span>' +
              '<span class="medidas-pill">Weight: <strong id="pillPeso">' + lbs + ' lbs</strong></span>' +
            '</div>' +
            '<p class="medidas-tip" id="medidasTip">' + info.dica + '</p>' +
          '</div>' +
        '</div>' +

        '<div class="medidas-grid">' +
          '<div class="medidas-card">' +
            '<div class="medidas-card__top">' +
              '<span class="medidas-card__label"><span class="medidas-card__ico">📏</span>Your Height</span>' +
              '<div class="medidas-stepper">' +
                '<button type="button" class="medidas-step" data-step-target="inches" data-delta="-1" aria-label="Decrease height">−</button>' +
                '<span class="medidas-val" style="padding:0 10px"><strong id="lblFtReadout" style="font-size:17px;color:var(--vinho)">' + formatFtIn(inches) + '</strong></span>' +
                '<button type="button" class="medidas-step" data-step-target="inches" data-delta="1" aria-label="Increase height">+</button>' +
              '</div>' +
            '</div>' +
            '<input type="range" class="medidas-range" id="rangeAltura" min="' + H_MIN + '" max="' + H_MAX + '" step="1" value="' + inches + '" aria-label="Height slider">' +
            '<div class="medidas-ticks"><span>4\'10"</span><span>5\'5"</span><span>6\'1"</span></div>' +
          '</div>' +

          '<div class="medidas-card">' +
            '<div class="medidas-card__top">' +
              '<span class="medidas-card__label"><span class="medidas-card__ico">⚖️</span>Your Weight</span>' +
              '<div class="medidas-stepper">' +
                '<button type="button" class="medidas-step" data-step-target="lbs" data-delta="-2" aria-label="Decrease weight">−</button>' +
                '<label class="medidas-val" aria-label="Weight in pounds">' +
                  '<input type="number" class="medidas-num" id="numPeso" min="' + W_MIN + '" max="' + W_MAX + '" value="' + lbs + '" inputmode="numeric">' +
                  '<span class="medidas-unit">lbs</span>' +
                '</label>' +
                '<button type="button" class="medidas-step" data-step-target="lbs" data-delta="2" aria-label="Increase weight">+</button>' +
              '</div>' +
            '</div>' +
            '<input type="range" class="medidas-range" id="rangePeso" min="' + W_MIN + '" max="' + W_MAX + '" step="1" value="' + lbs + '" aria-label="Weight slider">' +
            '<div class="medidas-ticks"><span>95 lbs</span><span>175 lbs</span><span>280 lbs</span></div>' +
          '</div>' +
        '</div>' +

        '<p class="medidas-note">🔒 100% private — used solely to calibrate hemline &amp; outfit proportions for you.</p>' +
        '<button type="button" class="btn btn--primary btn--lg medidas__next" id="btnMedidasNext">Confirm Proportions &amp; Continue →</button>' +
      '</div>'
    );
  }

  function bindMedidas(q) {
    var current = state.answers[q.id] || { inches: H_DEF, lbs: W_DEF };
    var rangeAltura = $("#rangeAltura");
    var rangePeso = $("#rangePeso");
    var lblFt = $("#lblFtReadout");
    var numPeso = $("#numPeso");
    var marker = $("#medidasMarker");
    var markerTxt = $("#medidasMarkerTxt");
    var figure = $("#medidasFigure");
    var badge = $("#medidasBadge");
    var pillAltura = $("#pillAltura");
    var pillPeso = $("#pillPeso");
    var tip = $("#medidasTip");

    function syncVisuals() {
      var h = current.inches;
      var w = current.lbs;
      state.answers[q.id] = { inches: h, lbs: w };

      rangeAltura.value = h;
      rangePeso.value = w;
      if (lblFt) lblFt.textContent = formatFtIn(h);
      if (document.activeElement !== numPeso) numPeso.value = w;

      updateRangeFill(rangeAltura);
      updateRangeFill(rangePeso);

      var hNorm = (h - H_MIN) / (H_MAX - H_MIN);
      var wNorm = (w - W_MIN) / (W_MAX - W_MIN);

      var bottomPct = Math.round(62 + hNorm * 28);
      marker.style.bottom = bottomPct + "%";
      markerTxt.textContent = formatFtIn(h);

      var scaleY = (0.82 + hNorm * 0.22).toFixed(3);
      var scaleX = (0.88 + wNorm * 0.28).toFixed(3);
      figure.style.transform = "scale(" + scaleX + ", " + scaleY + ")";

      var info = describeMedidasUS(h, w);
      badge.textContent = info.badge;
      pillAltura.textContent = formatFtIn(h);
      pillPeso.textContent = w + " lbs";
      tip.innerHTML = info.dica;
    }

    rangeAltura.addEventListener("input", function () {
      current.inches = clamp(rangeAltura.value, H_MIN, H_MAX);
      syncVisuals();
    });
    rangePeso.addEventListener("input", function () {
      current.lbs = clamp(rangePeso.value, W_MIN, W_MAX);
      numPeso.value = current.lbs;
      syncVisuals();
    });
    numPeso.addEventListener("input", function () {
      var v = parseInt(numPeso.value, 10);
      if (!isNaN(v) && v >= W_MIN && v <= W_MAX) { current.lbs = v; syncVisuals(); }
    });
    numPeso.addEventListener("blur", function () {
      current.lbs = clamp(numPeso.value || current.lbs, W_MIN, W_MAX);
      numPeso.value = current.lbs;
      syncVisuals();
    });

    $$("#medidasWidget .medidas-step").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.dataset.stepTarget;
        var delta = parseInt(btn.dataset.delta, 10) || 0;
        if (target === "inches") current.inches = clamp(current.inches + delta, H_MIN, H_MAX);
        else { current.lbs = clamp(current.lbs + delta, W_MIN, W_MAX); numPeso.value = current.lbs; }
        syncVisuals();
      });
    });

    $("#btnMedidasNext").addEventListener("click", function () {
      current.lbs = clamp(numPeso.value || current.lbs, W_MIN, W_MAX);
      state.answers[q.id] = { inches: current.inches, lbs: current.lbs };
      track("QuizMedidasSaved", { height_in: current.inches, weight_lbs: current.lbs });
      advance();
    });

    syncVisuals();
  }

  /* ---------------- Render Quiz Questions (Exact CSS Classes) ---------------- */
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
      3:  "🎨 Great! Analyzing your skin undertone & seasonal color harmony…",
      6:  "🎯 Calibrating garment lengths & proportions for your exact frame…",
      9:  "🔥 Almost there! Calculating outfit formulas hiding in your closet…",
      12: "🎟️ 88% OFF Founder Ticket reserved! Just 2 quick taps left…"
    };
    if (milestoneMsgs[state.i]) {
      html += '<div class="quiz__milestone">' + milestoneMsgs[state.i] + '</div>';
    }

    if (first) {
      html += '<div class="quiz__mosaic"><img src="' + assetUrl("assets/img/hero-banner-v2-en.webp") + '" width="1360" height="765" alt="Lumina Style AI — Unlock 150+ Outfits From Clothes You Already Own" fetchpriority="high" decoding="sync"></div>';
    }
    if (q.banner) {
      html += '<div class="quiz__banner"><img src="' + assetUrl(q.banner) + '" width="1000" height="1250" alt="' + (q.bannerAlt || "") + '" fetchpriority="high" decoding="sync">' +
        (q.bannerCap ? '<p class="quiz__banner__cap">' + q.bannerCap + '</p>' : '') +
        '</div>';
    }

    html += '<div class="quiz__head">' +
      (first ? '<div class="quiz__livepill"><span class="quiz__livedot" aria-hidden="true"></span>★ 4.9/5 · 128,400+ women discovered their colors &amp; outfits · 45s</div>' : '') +
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
      html += '<p class="quiz__swipe">Swipe sideways to view all silhouettes ⇢</p>';
    }
    if (q.type === "multi") {
      var hasMulti = Array.isArray(prevAns) && prevAns.length > 0;
      html += '<button type="button" class="btn btn--primary quiz__next' + (hasMulti ? " show" : "") + '" id="btnNext">Continue →</button>';
    }
    if (first) {
      html += '<p class="quiz__consent">By continuing, you agree to our <a href="#terms" data-config-link="termsUrl">Terms of Service</a> and <a href="#privacy" data-config-link="privacyUrl">Privacy Policy</a>.</p>';
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

  function renderQuestion() { hydrateOrRenderQuestion(false); }

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

  /* ---------------- Mobile Scratch-Off Ticket ---------------- */
  var scratchDone = false;
  var cleanupScratch = null;

  function openTicket() {
    if (cleanupScratch) { cleanupScratch(); cleanupScratch = null; }
    var modal = $("#ticketModal");
    modal.hidden = false;
    document.body.classList.add("no-scroll");
    $("#ticketNext").hidden = true;
    $("#scratchHint").textContent = "Swipe your finger to scratch 👆";
    $("#scratchHint").classList.remove("ok");
    $("#scratchProgWrap").hidden = false;
    $("#scratchProgFill").style.width = "0%";
    var cv = $("#scratchCanvas");
    cv.style.transition = "none";
    cv.style.opacity = "1";
    scratchDone = false;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { initScratch(cv, modal); });
    });
  }

  function closeTicket() {
    $("#ticketModal").hidden = true;
    document.body.classList.remove("no-scroll");
    if (cleanupScratch) { cleanupScratch(); cleanupScratch = null; }
  }

  function initScratch(cv, modal) {
    var wrap = $("#scratchWrap");
    var rect = wrap.getBoundingClientRect();
    var w = Math.max(240, Math.round(rect.width || wrap.offsetWidth || 280));
    var h = Math.max(150, Math.round(rect.height || wrap.offsetHeight || 176));
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    var ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#DFC89E");
    g.addColorStop(0.5, "#F5E7CC");
    g.addColorStop(1, "#BA9B66");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(110, 20, 35, .36)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.setLineDash([]);

    ctx.fillStyle = "#6E1423";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "800 18px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("✦ SCRATCH HERE ✦", w / 2, h / 2 - 11);
    ctx.fillStyle = "#5B4636";
    ctx.font = "700 12.5px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("Swipe to reveal your Founder Discount", w / 2, h / 2 + 15);

    var cols = 16, rows = 10, totalCells = cols * rows;
    var cleared = new Uint8Array(totalCells), clearedCount = 0;
    var brushRadius = Math.max(26, Math.round(Math.min(w, h) * 0.17));
    var drawing = false, lastPt = null;

    function markCells(x, y) {
      var r = brushRadius * 0.85;
      var c0 = Math.max(0, Math.floor(((x - r) / w) * cols));
      var c1 = Math.min(cols - 1, Math.floor(((x + r) / w) * cols));
      var r0 = Math.max(0, Math.floor(((y - r) / h) * rows));
      var r1 = Math.min(rows - 1, Math.floor(((y + r) / h) * rows));
      for (var ry = r0; ry <= r1; ry++) {
        for (var cx = c0; cx <= c1; cx++) {
          var idx = ry * cols + cx;
          if (!cleared[idx]) { cleared[idx] = 1; clearedCount++; }
        }
      }
    }

    function reveal() {
      if (scratchDone) return;
      scratchDone = true;
      cv.style.transition = "opacity .38s ease";
      cv.style.opacity = "0";
      cv.style.pointerEvents = "none";
      $("#scratchProgFill").style.width = "100%";
      $("#scratchHint").textContent = "🎉 88% OFF + 3 Free VIP Bonuses Unlocked!";
      $("#scratchHint").classList.add("ok");
      $("#ticketNext").hidden = false;
      if (navigator.vibrate) { try { navigator.vibrate([35, 45, 70]); } catch (err) {} }
      confetti();
    }

    function scratchSegment(pt) {
      if (scratchDone) return;
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = brushRadius * 2;
      ctx.beginPath();
      if (lastPt) {
        ctx.moveTo(lastPt.x, lastPt.y); ctx.lineTo(pt.x, pt.y); ctx.stroke();
        var dist = Math.hypot(pt.x - lastPt.x, pt.y - lastPt.y);
        var steps = Math.max(1, Math.ceil(dist / 10));
        for (var s = 0; s <= steps; s++) {
          markCells(lastPt.x + ((pt.x - lastPt.x) * s) / steps, lastPt.y + ((pt.y - lastPt.y) * s) / steps);
        }
      } else {
        ctx.arc(pt.x, pt.y, brushRadius, 0, Math.PI * 2); ctx.fill();
        markCells(pt.x, pt.y);
      }
      lastPt = pt;
      var ratio = clearedCount / totalCells;
      $("#scratchProgFill").style.width = Math.min(100, Math.round((ratio / 0.28) * 100)) + "%";
      if (ratio >= 0.28) reveal();
    }

    function posFromClient(cx, cy) {
      var r = cv.getBoundingClientRect();
      return { x: ((cx - r.left) / (r.width || w)) * w, y: ((cy - r.top) / (r.height || h)) * h };
    }

    function onTouchStart(e) { if (scratchDone) return; if (e.cancelable) e.preventDefault(); drawing = true; lastPt = null; if (e.touches[0]) scratchSegment(posFromClient(e.touches[0].clientX, e.touches[0].clientY)); }
    function onTouchMove(e) { if (!drawing || scratchDone) return; if (e.cancelable) e.preventDefault(); if (e.touches[0]) scratchSegment(posFromClient(e.touches[0].clientX, e.touches[0].clientY)); }
    function onTouchEnd() { drawing = false; lastPt = null; }
    function blockModalBounce(e) { if (e.target === cv && e.cancelable) e.preventDefault(); }
    function onMouseDown(e) { if (scratchDone) return; e.preventDefault(); drawing = true; lastPt = null; scratchSegment(posFromClient(e.clientX, e.clientY)); }
    function onMouseMove(e) { if (!drawing || scratchDone) return; scratchSegment(posFromClient(e.clientX, e.clientY)); }
    function onMouseUp() { drawing = false; lastPt = null; }

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
      s.style.animationDelay = (Math.random() * 0.4) + "s";
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
      track("QuizStep", { step: state.i + 1, step_id: nextQ ? nextQ.id : String(state.i + 1), total_steps: QUESTIONS.length });
      renderQuestion();
    } else {
      startAnalyzing();
    }
  }

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

  /* ---------------- Result + 3D Offer Page ---------------- */
  function calc() {
    var a = state.answers;
    var pecas = PECAS_VALOR[a.pecas] || 35;
    var uso = USO_VALOR[a.uso] || 0.3;
    var looks = Math.min(150, pecas * 5);
    var esquecidas = Math.max(5, Math.round(pecas * (1 - uso)));
    return { pecas: pecas, uso: uso, looks: looks, esquecidas: esquecidas };
  }

  function showResult(fromQuiz) {
    var a = state.answers;
    var c = calc();
    var season = computeColorSeason(a);
    var perfil = PERFIS[a.estilo] || PERFIS.moderna;
    var ocasoes = (a.ocasioes || []).map(function (id) { return OCASAO_ROTULO[id]; }).join(", ") || "everyday life, work & weekends";
    var med = a.medidas || { inches: H_DEF, lbs: W_DEF };
    var usoTxt = USO_ROTULO[a.uso] || "30%";
    var tempoTxt = TEMPO_ROTULO[a.tempoLook] || "15–30 min";

    // Sync Quiz Results -> /app Member Portal
    try {
      localStorage.setItem("lumina_quiz_result_v1", JSON.stringify({
        seasonName: season.name,
        season: season.key,
        swatches: season.swatches,
        metal: season.metal,
        heightIn: med.inches,
        style: (a.estilo && a.estilo !== "naosei" && a.estilo !== "fitness") ? a.estilo : "moderna",
        body: (a.corpo && a.corpo !== "naosei") ? a.corpo : "ampulheta"
      }));
    } catch (e) {}

    var insights = [
      { ico: "✓", txt: "You have roughly <strong>~" + c.pecas + " pieces</strong> in your closet. Connected properly, they unlock <strong>up to " + c.looks + " flattering outfits</strong>—without buying anything new." },
      { ico: "✓", txt: "Right now you rotate only <strong>" + usoTxt + "</strong> of what you own: another <strong>" + c.esquecidas + " pieces</strong> are sitting untouched waiting for the right match." },
      { ico: "✓", txt: "Seasonal Color Harmony: wearing your <strong>" + season.name + "</strong> shades + <strong>" + season.metal + "</strong> near your neckline gives an instant rested, youthful glow." },
      { ico: "✓", txt: "Proportions calibrated to <strong>" + formatFtIn(med.inches) + " and " + med.lbs + " lbs</strong> + <strong>" + (CORPO_ROTULO[a.corpo] || "your natural frame") + "</strong>—zero rigid rules, pure visual balance." },
      { ico: "✓", txt: "Getting dressed currently takes <strong>" + tempoTxt + "</strong>. Our goal is dropping that to <strong>under 4 minutes every morning</strong> for <strong>" + ocasoes + "</strong>." }
    ];

    var baSlides = [
      {
        src: "assets/img/before-after-cover-en.jpg",
        alt: "Before and After: 70% wasted closet transformed into 94% efficiency and flawless color harmony",
        quote: "“I was wasting 70% of my clothes. Within one week the app completely transformed my mornings!” — Sarah M., 34 (Austin, TX)"
      },
      {
        src: "assets/img/before-after-2-en.jpg",
        alt: "Before and After: plain jeans outfit upgraded into chic burgundy & off-white blazer harmony",
        quote: "“Went from boring safe jeans to chic, flattering outfits using pieces already sitting in my drawer.” — Rachel K., 39 (Seattle, WA)"
      },
      {
        src: "assets/img/before-after-3-en.jpg",
        alt: "Before and After: busy morning stress transformed into effortless royal blue & tailored black confidence",
        quote: "“I had zero time for myself in the morning. Now I open the app and I’m dressed in 4 minutes flat!” — Michelle T., 44 (Atlanta, GA)"
      },
      {
        src: "assets/img/before-after-1-en.jpg",
        alt: "Before and After: 68% unworn wardrobe upgraded to 91% utilized with elegant color coordination",
        quote: "“Stopped impulse shopping and now wear 91% of my closet with total confidence.” — Denise R., 51 (Charlotte, NC)"
      }
    ];

    var bonusItems = [
      {
        num: "01",
        tag: "VIP GIFT #1 · UNLOCKED IN YOUR APP",
        title: "Automatic Outfit & 5-Day Travel Packing Planner",
        oldPrice: 87,
        img: "assets/img/bonus-planner-en.jpg",
        alt: "Lumina Style AI Outfit Planner: build stunning outfits and 5-day carry-on travel capsules with clothes you already own",
        desc: "Heading to work, out for the weekend, or packing a carry-on for 5 days? The app pairs your tops, bottoms, shoes, and accessories into ready-to-wear Day 1 to Day 5 outfits.",
        perks: [
          "Complete Day 1 to Day 5 visual travel itinerary with zero overpacking",
          "Ready-made daily combinations built from clothes already in your closet",
          "Matches the right shoes, sunglasses, earrings, and bag automatically"
        ]
      },
      {
        num: "02",
        tag: "VIP GIFT #2 · UNLOCKED IN YOUR APP",
        title: "My Smart AI Closet (15 Pieces → 150 Outfits) + Color Swatches",
        oldPrice: 107,
        img: "assets/img/bonus-closet-en.jpg",
        alt: "Lumina Style AI Digital Closet: 15 pieces create 150 outfits, personal color swatches, and 24/7 AI style advice",
        desc: "Your entire closet organized in the palm of your hand with AI color recognition, plus the interactive blueprint that multiplies 15 core pieces into 150 polished outfits.",
        perks: [
          "Smart Digital Closet that catalogs your clothes & colors by photo",
          "15 Pieces → 150 Outfits interactive matrix + daily outfit inspiration",
          "Pocket Seasonal Color Swatches + 24/7 Personal AI Stylist Advice"
        ]
      },
      {
        num: "03",
        tag: "VIP GIFT #3 · UNLOCKED IN YOUR APP",
        title: "Realistic Virtual Outfit Try-On on Your Phone",
        oldPrice: 97,
        img: "assets/img/bonus-tryon-en.jpg",
        alt: "Lumina Style AI Virtual Try-On: preview complete outfits with what you already own before getting dressed",
        desc: "No more pulling 10 tops off hangers and leaving a pile on your bed! Test tops, blazers, trousers, and shoes right on your screen and see the balance before getting dressed.",
        perks: [
          "Preview the complete outfit before even opening your closet doors",
          "Compare 3 outfit options side-by-side and pick the most flattering in seconds",
          "Zero second-guessing before walking into work, dinner, or special events"
        ]
      }
    ];

    var html = "";
    html += '<div class="result__unlocked">' +
      '<span class="result__unlocked-badge">🎉 Report Complete</span>' +
      '<span class="result__unlocked-txt"><strong>88% OFF</strong> + <strong>3 Free VIP Gifts</strong> unlocked for you!</span>' +
      '</div>';

    html += '<div class="result__top result__top--cta" id="resultFirstImg" role="button" tabindex="0" aria-label="Jump to VIP Complete Lifetime Bundle with 88% OFF and 3 Free Bonuses">' +
      '<img src="' + assetUrl("assets/img/app-preview-3d-en.jpg") + '" alt="Lumina Style AI Personal Stylist & Color App — Ready in 4 Minutes" decoding="sync">' +
      '<span class="result__tapbadge">👆 Tap to Unlock App + 3 Free Bonuses</span>' +
      '</div>';
    html += '<button type="button" class="btn btn--primary btn--lg result__appbtn pulse" id="btnApp">Unlock My App + 3 Free Bonuses →</button>';

    /* Enlarged 4-Slide 3D Before & After Carousel (1 card at a time, zero overlap) */
    html += '<section class="ba-sec" aria-label="Real member transformations">' +
      '<div class="ba-head">' +
        '<span class="ba-kicker">✦ Real Member Transformations</span>' +
        '<h3 class="ba-title">Women Who Use Our App <span class="ba-hl">Never Look Back!</span></h3>' +
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
          '<button type="button" class="ba-btn" id="baPrev" aria-label="Previous transformation">' +
            '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>' +
          '</button>' +
          '<div class="ba-meta">' +
            '<div class="ba-dots" id="baDots" role="tablist" aria-label="Select transformation">' +
              baSlides.map(function (_, idx) {
                return '<button type="button" class="ba-dot' + (idx === 0 ? ' active' : '') + '" data-ba-dot="' + idx + '" aria-label="Go to transformation ' + (idx + 1) + '"></button>';
              }).join("") +
            '</div>' +
            '<span class="ba-count" id="baCount">1 of ' + baSlides.length + '</span>' +
          '</div>' +
          '<button type="button" class="ba-btn" id="baNext" aria-label="Next transformation">' +
            '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '</section>';

    /* Personal Seasonal Color Palette Reveal */
    html += '<div class="palette-card">' +
      '<span class="palette-card__kicker">✦ Your Personal Color Analysis</span>' +
      '<h2 class="palette-card__title">Your Color Season: <em>' + season.name + '</em></h2>' +
      '<p class="palette-card__desc">' + season.desc + ' <strong>Best Jewelry Metal:</strong> ' + season.metal + '.</p>' +
      '<div class="swatch-grid">' +
        season.swatches.map(function (sw) {
          return '<div class="swatch"><div class="swatch__chip" style="background:' + sw.hex + '"></div><strong>' + sw.name + '</strong></div>';
        }).join("") +
      '</div>' +
      '<div class="palette-avoid">⚠️ <strong>Avoid Near Your Face:</strong> ' + season.avoid + '</div>' +
      '</div>';

    /* Style Profile Card */
    html += '<div class="result__hero">' +
      '<span class="result__eyebrow">✦ Your Style Diagnosis</span>' +
      '<h2 class="result__title">Your Signature Aesthetic: <em>' + perfil.nome + '</em>.</h2>' +
      '<p class="result__tag">' + perfil.tag + '</p>' +
      '</div>';

    html += '<div class="profile-card">' +
      '<img src="' + assetUrl(perfil.img) + '" alt="Style archetype ' + perfil.nome + '" decoding="sync">' +
      '<div class="profile-card__body">' +
        '<h3 class="profile-card__name">' + perfil.nome + '</h3>' +
        '<p class="profile-card__desc">' + perfil.desc + '</p>' +
      '</div>' +
      '</div>';

    html += '<div class="stats">' +
      '<div class="stat"><div class="stat__num" data-count="' + c.pecas + '">0</div><div class="stat__label">pieces in your closet</div></div>' +
      '<div class="stat"><div class="stat__num" data-count="' + c.esquecidas + '">0</div><div class="stat__label">pieces sitting unworn</div></div>' +
      '<div class="stat stat--hero"><div class="stat__num" data-count="' + c.looks + '">0</div><div class="stat__label">outfits hiding in what you already own</div></div>' +
      '</div>';

    /* How the App Works + Animated AI Stylist Chat Demo */
    html += '<section class="how">' +
      '<p class="how__kicker">How the app works for you</p>' +
      '<h3 class="how__title">A Personal AI Stylist that <em>actually</em> builds your outfits</h3>' +
      '<p class="how__copy">Inside the app, simply <strong>snap a quick photo of any piece</strong> you want to wear. Your AI Stylist analyzes your <strong>' + season.name + ' palette and exact ' + formatFtIn(med.inches) + ' proportions</strong>, matches it with your ' + perfil.nome + ' vibe, and hands you the finished outfit: <strong>ready in 4 minutes</strong>, zero mirror stress.</p>' +
      '<div class="how__steps">' +
        '<div class="how__step"><span>1</span><b>Snap a photo</b><small>of any piece inside your closet</small></div>' +
        '<div class="how__step"><span>2</span><b>AI analyzes</b><small>your colors, cuts &amp; proportions</small></div>' +
        '<div class="how__step"><span>3</span><b>Ready in 4 min</b><small>saved to your daily planner</small></div>' +
      '</div>' +
      '<div class="chat" id="chatDemo">' +
        '<div class="chat__head"><i></i>Lumina Style AI Stylist<span>online now</span></div>' +
        '<div class="chat__msg chat__msg--user">I just snapped a photo of my burgundy satin skirt. What do I wear with it?</div>' +
        '<div class="chat__msg chat__msg--ai">Analyzing… for your ' + season.name + ' palette and ' + formatFtIn(med.inches) + ' frame, pair it with a Warm Ivory top (front-tucked!) and your Camel Blazer. I built 3 complete outfits from your closet! ✨</div>' +
        '<div class="chat__msg chat__msg--ai">Done: complete outfit in 4 minutes—already saved to your Today Planner! 💃</div>' +
      '</div>' +
      '</section>';

    html += '<div class="insights">';
    insights.forEach(function (ins) {
      html += '<div class="insight"><span class="ico">' + ins.ico + '</span><span>' + ins.txt + '</span></div>';
    });
    html += '</div>';

    /* US Price Anchor ($350 Consultant / $59.99/mo Subscription Apps vs $27 ONCE) */
    html += '<div class="vs-anchor">' +
      '<div class="vs-anchor__head">' +
        '<span>✦ Smart Value Comparison</span>' +
        '<h3>Why 128,400+ Women Ditched $59.99/mo Styling Apps</h3>' +
      '</div>' +
      '<div class="vs-rows">' +
        '<div class="vs-row"><span>In-Person Seasonal Color Analysis</span><b>$297 – $400</b></div>' +
        '<div class="vs-row"><span>Other AI Styling Apps (Recurring Billing)</span><b>$59.99 / month</b></div>' +
        '<div class="vs-row vs-row--win"><span>👑 Lumina Style AI + All 3 VIP Bonuses</span><b>$27 ONCE · $0/mo Forever!</b></div>' +
      '</div>' +
      '</div>';

    /* ==============================================================
       SHIMMERING 3D VIP BONUS STACK ($291.00 VALUE -> $0.00 FREE)
       ============================================================== */
    html += '<section class="bstack" id="bonusStack" aria-label="Exclusive VIP Bonuses Included Free">' +
      '<div class="bstack__glow" aria-hidden="true"></div>' +
      '<div class="bstack__head">' +
        '<span class="bstack__pill shimmer-badge">🎁 3 FREE VIP GIFTS UNLOCKED FOR YOU</span>' +
        '<h3 class="bstack__title">Grab Your App Today &amp; Get All 3 VIP Bonuses <em>100% FREE!</em></h3>' +
        '<p class="bstack__sub">Sold separately for <strong><s>$291.00</s></strong> — when you activate your Founder Pass today, all 3 come <strong>100% unlocked for $0.00</strong> inside your app:</p>' +
        '<div class="bstack__meter">' +
          '<div class="bstack__meter-top">' +
            '<span>✨ <b>3 of 3 VIP gifts</b> added to your access</span>' +
            '<strong class="bstack__saved">You Save: $291.00</strong>' +
          '</div>' +
          '<div class="bstack__meter-bar"><div class="bstack__meter-fill"></div></div>' +
        '</div>' +
      '</div>' +

      '<div class="bstack__list">' +
        bonusItems.map(function (b, idx) {
          return '<article class="bcard" data-bonus-card="' + idx + '">' +
            '<div class="bcard__ribbon">' +
              '<span class="bcard__tag">✦ ' + b.tag + '</span>' +
              '<span class="bcard__free shimmer-badge">FREE TODAY</span>' +
            '</div>' +
            '<div class="bcard__body">' +
              '<div class="bcard__media" data-zoom-src="' + assetUrl(b.img) + '" data-zoom-title="' + b.title + '" role="button" tabindex="0" aria-label="Tap to zoom ' + b.title + '">' +
                '<img src="' + assetUrl(b.img) + '" alt="' + b.alt + '" decoding="sync">' +
                '<span class="bcard__zoom">🔍 Tap to enlarge</span>' +
              '</div>' +
              '<div class="bcard__content">' +
                '<h4 class="bcard__title">' + b.title + '</h4>' +
                '<p class="bcard__desc">' + b.desc + '</p>' +
                '<div class="bcard__pricebox">' +
                  '<div class="bcard__old">Regular Price: <s>$' + b.oldPrice + '.00</s></div>' +
                  '<div class="bcard__now">Today With App: <strong>$0.00 <span>(FREE)</span></strong></div>' +
                '</div>' +
                '<button type="button" class="bcard__toggle" data-bonus-toggle="' + idx + '" aria-expanded="' + (idx === 0 ? "true" : "false") + '">' +
                  '<span>' + (idx === 0 ? "What you get inside this gift" : "Tap to see everything included") + '</span>' +
                  '<i>▾</i>' +
                '</button>' +
                '<ul class="bcard__perks"' + (idx === 0 ? '' : ' hidden') + '>' +
                  b.perks.map(function (p) { return '<li>' + p + '</li>'; }).join("") +
                '</ul>' +
                '<div class="bcard__status"><span>✓</span> Automatically unlocked with your VIP Lifetime Pass</div>' +
              '</div>' +
            '</div>' +
          '</article>';
        }).join("") +
      '</div>' +

      '<div class="bstack__summary shimmer-card">' +
        '<div class="bstack__sum-eyebrow">🎉 SUMMARY OF WHAT YOU GET FREE TODAY</div>' +
        '<div class="bstack__sum-rows">' +
          '<div class="bstack__sum-row"><span>🎁 Outfit &amp; 5-Day Travel Planner</span><b><s>$87.00</s> → FREE</b></div>' +
          '<div class="bstack__sum-row"><span>🎁 AI Smart Closet (15→150 Outfits)</span><b><s>$107.00</s> → FREE</b></div>' +
          '<div class="bstack__sum-row"><span>🎁 Realistic Virtual Try-On Mirror</span><b><s>$97.00</s> → FREE</b></div>' +
        '</div>' +
        '<div class="bstack__sum-total">' +
          '<div><small>Real Value of 3 Bonuses:</small><s>$291.00</s></div>' +
          '<div class="bstack__sum-zero"><small>You Pay For Bonuses:</small><strong>$0.00</strong></div>' +
        '</div>' +
        '<button type="button" class="btn btn--gold btn--lg bstack__cta" id="btnClaimBonuses">Claim App + $291 in Free Bonuses →</button>' +
      '</div>' +
      '</section>';

    /* ==============================================================
       IMPULSE ONE-TIME USD PLANS ($14 BASIC vs $27 VIP LIFETIME)
       ============================================================== */
    html += '<section class="offer" id="planos">' +
      '<p class="offer__kicker">✦ Founder Flash Offer · One-Time Payment</p>' +
      '<h3 class="offer__title">Your ' + c.looks + ' Outfits + $291 in Bonuses Are Waiting</h3>' +
      '<p class="offer__copy">Activate your personalized app for <strong>' + ocasoes + '</strong> right now with a <strong>single one-time payment</strong> (zero monthly subscriptions, ever!) + all <strong>3 VIP gifts FREE</strong>.</p>' +

      '<div class="plans" id="plansBox">' +
        '<div class="plan" data-plan="basic" tabindex="0" role="button" aria-pressed="false">' +
          '<span class="plan__radio"></span>' +
          '<h4 class="plan__name">Basic Starter</h4>' +
          '<p class="plan__for">Starter guide without VIP Bonus Pack</p>' +
          '<div class="plan__price">' +
            '<span class="plan__from">Regularly <s>$79.00</s></span>' +
            '<div><strong>$14</strong><span> one-time</span></div>' +
            '<small>Pay once · Excludes the 3 VIP Bonuses</small>' +
          '</div>' +
          '<ul class="plan__list">' +
            '<li style="--i:0">Core Style &amp; Color Report</li>' +
            '<li style="--i:1">7 Bite-Sized Styling Lessons</li>' +
          '</ul>' +
          '<button type="button" class="btn btn--ghost plan__btn" data-cta data-plan="basic">Start With Basic for $14 Once</button>' +
        '</div>' +

        '<div class="plan plan--premium plan--sel" id="planPremium" data-plan="vip" tabindex="0" role="button" aria-pressed="true">' +
          '<span class="plan__flag shimmer-badge">⭐ Most Popular · 88% OFF + 3 Bonuses</span>' +
          '<div class="plan__shot"><img src="' + assetUrl("assets/img/mockup-vip-3d-en.jpg") + '" alt="Lumina Style AI VIP Lifetime Bundle on iPad, iPhone and Seasonal Color Fan" decoding="sync"></div>' +
          '<span class="plan__radio"></span>' +
          '<h4 class="plan__name">VIP Complete Lifetime</h4>' +
          '<p class="plan__for">Full App + Color Swatches + All 3 Free VIP Bonuses</p>' +
          '<div class="plan__price">' +
            '<span class="plan__from">From <s>$229.00</s> for only</span>' +
            '<div><strong>$27</strong><span> ONE-TIME</span></div>' +
            '<small>☕ Pay Once, Keep Forever · $0/Month · Instant Access</small>' +
          '</div>' +
          '<div class="plan__bonus-pill">🎁 <strong>+ $291.00 in FREE Bonuses</strong> (Planner + AI Closet + Try-On)</div>' +
          '<ul class="plan__list">' +
            '<li style="--i:0">Everything in Basic + <strong>' + season.name + '</strong> Swatch Deck</li>' +
            '<li style="--i:1"><strong>Bonus #1:</strong> Outfit &amp; 5-Day Travel Planner <em>(FREE)</em></li>' +
            '<li style="--i:2"><strong>Bonus #2:</strong> AI Closet 15→150 Outfits <em>(FREE)</em></li>' +
            '<li style="--i:3"><strong>Bonus #3:</strong> Realistic Virtual Try-On Mirror <em>(FREE)</em></li>' +
            '<li style="--i:4">24/7 Personal AI Stylist Chat + Lifetime Access</li>' +
          '</ul>' +
          '<button type="button" class="btn btn--cta plan__btn" data-cta data-plan="vip">Get VIP Lifetime + 3 Free Bonuses ($27) →</button>' +
        '</div>' +
      '</div>' +

      '<div class="plan-loss" id="planLossNote" hidden>' +
        '<p>⚠️ <strong>Are you sure?</strong> Choosing Basic means giving up <strong>$291.00 in VIP Tools</strong> (Virtual Try-On, AI Closet 15→150 Outfits &amp; Travel Planner) for a one-time difference of just <strong>$13</strong>!</p>' +
        '<button type="button" class="plan-loss__btn" id="btnRestorePremium">Switch Back to VIP Complete + 3 Free Bonuses ✨</button>' +
      '</div>' +

      '<button type="button" class="cmp__toggle" id="cmpToggle" aria-expanded="false">Compare both plans item by item <span>▾</span></button>' +
      '<div class="cmp" id="cmpBox" hidden>' +
        '<div class="cmp__row cmp__head"><span>What you get</span><b>Basic</b><b>VIP</b></div>' +
        '<div class="cmp__row"><span>Lumina Style &amp; Color Report</span><b class="ok">✓</b><b class="ok">✓</b></div>' +
        '<div class="cmp__row"><span>7 Practical Styling Masterclasses</span><b class="ok">✓</b><b class="ok">✓</b></div>' +
        '<div class="cmp__row"><span>🎁 Outfit &amp; Travel Planner ($87)</span><b class="na">—</b><b class="ok">FREE</b></div>' +
        '<div class="cmp__row"><span>🎁 AI Closet 15→150 Outfits ($107)</span><b class="na">—</b><b class="ok">FREE</b></div>' +
        '<div class="cmp__row"><span>🎁 Virtual Try-On Mirror ($97)</span><b class="na">—</b><b class="ok">FREE</b></div>' +
        '<div class="cmp__row"><span>24/7 AI Stylist + Pocket Color Swatches</span><b class="na">—</b><b class="ok">✓</b></div>' +
      '</div>' +

      '<div class="offer__timer">⏳ Your 88% OFF Pass + 3 Free Bonuses expire in <strong id="offerClock">15:00</strong></div>' +

      '<div class="offer__guarantee">' +
        '<span class="offer__g-ico">🛡️</span>' +
        '<div>' +
          '<strong>30-Day Ironclad Money-Back Guarantee · Zero Risk</strong>' +
          '<p>Log into the App, test the Virtual Try-On, your Seasonal Color Swatches, and outfits built from your own closet for 30 full days. Don’t love it? Get a 100% refund with 1 email.</p>' +
        '</div>' +
      '</div>' +

      '<div class="offer__badges">' + (CFG.trustBadges || []).map(function (b) { return '<span>' + b + '</span>'; }).join("") + '</div>' +
      '</section>';

    var tsmList = CFG.testimonials || [];
    if (tsmList.length) {
      html += '<section class="social">' +
        '<h3 class="social__title">Women Who Unlocked Their Closet</h3>' +
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

    html += '<section class="faq-sec">' +
      '<h3 class="faq-sec__title">Frequently Asked Questions</h3>' +
      '<div class="faq-list">' +
        '<details class="faq-item" open><summary>Is $27 really a one-time payment with NO monthly subscription?</summary><p>Yes, 100%! Unlike other styling apps that charge $59.99 every 4 weeks, your Founder Pass today is a single one-time payment of $27 for lifetime access to the Lumina Style AI Web App and all 3 VIP Bonuses. Zero recurring charges.</p></details>' +
        '<details class="faq-item"><summary>Do I need to buy new clothes to use the app?</summary><p>No! Lumina Style AI is built specifically to multiply the clothes already hanging in your closet first—and stop you from wasting money on pieces that don’t match.</p></details>' +
        '<details class="faq-item"><summary>How do I get access after checkout?</summary><p>Immediately! Right after payment, you get instant login access on iPhone, Android, tablet, or computer.</p></details>' +
      '</div></section>';

    $("#resultBox").innerHTML = html;

    if (fromQuiz) track("PageView");
    track("Lead", {
      content_name: "Style & Color Report Completed - " + season.name,
      content_category: "Lumina Style AI US Quiz"
    });
    track("ViewContent", {
      content_name: "Lumina VIP Offer - " + season.name,
      content_ids: ["vip", "basic"],
      content_type: "product",
      value: 27.00,
      currency: "USD"
    });

    $$("#resultBox [data-cta]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        triggerCheckout(btn.dataset.plan || state.plan || "vip");
      });
    });

    var plansBox = $("#plansBox");
    var planLossNote = $("#planLossNote");
    var selectPlan = function () {};
    if (plansBox) {
      var syncSticky = function (id) {
        var s = $("#stickyCta [data-cta]");
        if (s) s.innerHTML = id === "vip" ? "VIP Lifetime + 3 Free Bonuses · $27 Once →" : "Basic Starter (No Bonuses) · $14 Once →";
        if (planLossNote) planLossNote.hidden = (id === "vip");
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
      var btnRestorePrem = $("#btnRestorePremium");
      if (btnRestorePrem) {
        btnRestorePrem.addEventListener("click", function () {
          selectPlan("vip");
          var premEl = $("#planPremium");
          if (premEl) premEl.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
      selectPlan("vip");

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
      selectPlan("vip");
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
    if (firstImg) firstImg.addEventListener("click", goToPremiumPlan);
    var btnApp = $("#btnApp");
    if (btnApp) btnApp.addEventListener("click", goToPremiumPlan);

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

    /* Before & After Carousel: smooth tactile finger drag + auto-advance */
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
        if (countEl) countEl.textContent = (activeBa + 1) + " of " + totalBa;
        if (quoteEl && baSlides[activeBa]) quoteEl.textContent = baSlides[activeBa].quote;
      };

      var stopAutoBa = function () {
        userTouchedBa = true;
        if (autoBaTimer) { clearInterval(autoBaTimer); autoBaTimer = null; }
      };

      var startX = 0, startY = 0, deltaX = 0, draggingBa = false, horizLock = null;
      baViewport.addEventListener("touchstart", function (e) {
        var t = e.touches[0];
        if (!t) return;
        stopAutoBa();
        startX = t.clientX; startY = t.clientY; deltaX = 0;
        draggingBa = true; horizLock = null;
        baTrack.style.transition = "none";
      }, { passive: true });

      baViewport.addEventListener("touchmove", function (e) {
        if (!draggingBa) return;
        var t = e.touches[0];
        if (!t) return;
        var dx = t.clientX - startX, dy = t.clientY - startY;
        if (horizLock === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) horizLock = Math.abs(dx) > Math.abs(dy);
        if (!horizLock) return;
        if (e.cancelable) e.preventDefault();
        deltaX = dx;
        var vw = baViewport.clientWidth || 300;
        baTrack.style.transform = "translate3d(" + ((-activeBa * 100) + ((dx / vw) * 100)).toFixed(2) + "%, 0, 0)";
      }, { passive: false });

      var finishSwipe = function () {
        if (!draggingBa) return;
        draggingBa = false;
        var vw = baViewport.clientWidth || 300;
        if (horizLock && Math.abs(deltaX) > Math.min(48, vw * 0.16)) {
          goToBa(deltaX < 0 ? activeBa + 1 : activeBa - 1, true);
        } else {
          goToBa(activeBa, true);
        }
      };
      baViewport.addEventListener("touchend", finishSwipe, { passive: true });
      baViewport.addEventListener("touchcancel", finishSwipe, { passive: true });

      var prevBtn = $("#baPrev"), nextBtn = $("#baNext");
      if (prevBtn) prevBtn.addEventListener("click", function () { stopAutoBa(); goToBa(activeBa - 1, true); });
      if (nextBtn) nextBtn.addEventListener("click", function () { stopAutoBa(); goToBa(activeBa + 1, true); });
      dotEls.forEach(function (dot) {
        dot.addEventListener("click", function () { stopAutoBa(); goToBa(parseInt(dot.dataset.baDot, 10) || 0, true); });
      });

      goToBa(0, false);

      if ("IntersectionObserver" in window) {
        var ioBa = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting && !userTouchedBa && !autoBaTimer) {
              autoBaTimer = setInterval(function () {
                if (!screens.result.classList.contains("active") || userTouchedBa) {
                  clearInterval(autoBaTimer); autoBaTimer = null; return;
                }
                goToBa(activeBa + 1, true);
              }, 4400);
            } else if (!en.isIntersecting && autoBaTimer) {
              clearInterval(autoBaTimer); autoBaTimer = null;
            }
          });
        }, { threshold: 0.45 });
        ioBa.observe(baViewport);
      }
    }

    /* Bonus Stack Accordion + Fullscreen 3D Poster Zoom (.bzoom) */
    var bonusStackEl = $("#bonusStack");
    var zoomModal = $("#bonusZoomModal");
    var zoomImg = $("#bonusZoomImg");
    var zoomTag = $("#bonusZoomTag");

    function openBonusZoom(src, title) {
      if (!zoomModal || !zoomImg) return;
      zoomImg.src = src;
      zoomImg.alt = title || "Exclusive VIP Bonus";
      if (zoomTag) zoomTag.textContent = "🎁 " + (title || "VIP Gift") + " — $0.00 FREE Today";
      zoomModal.hidden = false;
      document.body.style.overflow = "hidden";
    }
    function closeBonusZoom() {
      if (!zoomModal) return;
      zoomModal.hidden = true;
      document.body.style.overflow = "";
    }

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
            if (lbl) lbl.textContent = opening ? "What you get inside this gift" : "Tap to see everything included";
          }
          return;
        }
        var mediaEl = e.target.closest("[data-zoom-src]");
        if (mediaEl) openBonusZoom(mediaEl.dataset.zoomSrc, mediaEl.dataset.zoomTitle);
      });
    }

    var btnClaimBonuses = $("#btnClaimBonuses");
    if (btnClaimBonuses) btnClaimBonuses.addEventListener("click", goToPremiumPlan);

    if (zoomModal && !zoomModal.dataset.bound) {
      zoomModal.dataset.bound = "1";
      var zClose = $("#bonusZoomClose");
      var zCta = $("#bonusZoomCta");
      if (zClose) zClose.addEventListener("click", closeBonusZoom);
      if (zCta) zCta.addEventListener("click", function () { closeBonusZoom(); goToPremiumPlan(); });
      zoomModal.addEventListener("click", function (e) {
        if (e.target === zoomModal || e.target.hasAttribute("data-close-zoom")) closeBonusZoom();
      });
    }

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
    var txtEl = $("#socialToastTxt");
    var closeBtn = $("#socialToastClose");
    if (!toast || !txtEl) return;
    if (socialToastTimer) { clearTimeout(socialToastTimer); socialToastTimer = null; }
    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = "1";
      closeBtn.addEventListener("click", function () {
        if (socialToastTimer) clearTimeout(socialToastTimer);
        toast.hidden = true;
      });
    }

    var buyers = [
      "<strong>Hannah M. (Austin, TX)</strong> just unlocked VIP Lifetime + 3 Free Bonuses",
      "<strong>Jessica R. (Denver, CO)</strong> claimed her $291 Bonus Pack 2 min ago",
      "<strong>Emily W. (Tampa, FL)</strong> unlocked the App + Virtual Try-On Mirror"
    ];
    var idx = 0;

    function showNext() {
      if (!screens.result.classList.contains("active") || idx >= buyers.length) {
        toast.hidden = true;
        return;
      }
      txtEl.innerHTML = buyers[idx++];
      toast.hidden = false;
      toast.classList.add("is-visible");
      socialToastTimer = setTimeout(function () {
        toast.classList.remove("is-visible");
        setTimeout(function () {
          toast.hidden = true;
          if (idx < buyers.length) socialToastTimer = setTimeout(showNext, 11000);
        }, 380);
      }, 4600);
    }
    socialToastTimer = setTimeout(showNext, 5500);
  }

  function countUp(el) {
    var target = parseInt(el.dataset.count, 10) || 0;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / 850);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

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

  function boot() {
    initPixel();
    applyConfig();

    var params = new URLSearchParams(window.location.search);
    var stepParam = params.get("step");
    var openScratchNow = false;
    var openResultNow = (stepParam === "resultado" || stepParam === "result");

    if (stepParam === "ticket" || stepParam === "scratch") {
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
      track("ViewContent", { content_name: "Lumina Style AI Quiz (US)", content_category: "Quiz Funnel" });
      track("QuizStart", true);
      track("QuizStep", { step: state.i + 1, step_id: QUESTIONS[state.i] ? QUESTIONS[state.i].id : "idade", total_steps: QUESTIONS.length });
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
      triggerCheckout(state.plan || "vip");
    });

    var setupModal = $("#checkoutSetupModal");
    if (setupModal) {
      var sClose = $("#checkoutSetupClose");
      if (sClose) sClose.addEventListener("click", function () { setupModal.hidden = true; });
      setupModal.addEventListener("click", function (e) { if (e.target === setupModal) setupModal.hidden = true; });
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
