/* =========================================================================
   LUMINA STYLE AI (US EDITION) · Official Member PWA Engine
   Includes: Personal Color Swatch Deck, AI Closet (IndexedDB), Virtual Try-On,
   Smart Carry-On Planner, 15->150 Capsule Matrix, 24/7 AI Stylist & 7 Lessons
   ========================================================================= */
(function () {
  "use strict";

  var PROFILE_KEY = "lumina_us_profile_v1";
  var QUIZ_BRIDGE_KEY = "lumina_quiz_result_v1";
  var SAVED_LOOKS_KEY = "lumina_us_saved_looks_v1";
  var CAPSULE_CHECKS_KEY = "lumina_us_capsule_v1";
  var LESSONS_DONE_KEY = "lumina_us_lessons_v1";
  var DB_NAME = "LuminaStyleUSClosetDB";
  var DB_STORE = "custom_items";

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  function formatFtIn(inches) {
    var v = parseInt(inches, 10) || 65;
    return Math.floor(v / 12) + "'" + (v % 12) + '"';
  }

  var SEASONS = {
    soft_autumn: {
      label: "Soft Warm Autumn",
      metal: "Yellow & Brushed Gold",
      swatches: [
        { name: "Ivory", hex: "#F6EFE2" },
        { name: "Camel", hex: "#C69C6D" },
        { name: "Burgundy", hex: "#6E1423" },
        { name: "Olive", hex: "#657453" },
        { name: "Espresso", hex: "#3E2723" },
        { name: "Terracotta", hex: "#B85D43" }
      ]
    },
    deep_winter: {
      label: "Deep Cool Winter",
      metal: "Silver & White Gold",
      swatches: [
        { name: "Pure White", hex: "#FAFAFA" },
        { name: "True Black", hex: "#1C1B1E" },
        { name: "Deep Berry", hex: "#72142E" },
        { name: "Navy", hex: "#1B2A4A" },
        { name: "Emerald", hex: "#165B4C" },
        { name: "Charcoal", hex: "#4A4E54" }
      ]
    },
    warm_spring: {
      label: "Light Warm Spring",
      metal: "Yellow Gold & Pearl",
      swatches: [
        { name: "Cream", hex: "#FFF8E7" },
        { name: "Warm Sand", hex: "#DFC59E" },
        { name: "Coral", hex: "#D96B5C" },
        { name: "Warm Navy", hex: "#283C5F" },
        { name: "Camel", hex: "#CCA06E" },
        { name: "Leaf", hex: "#6D8252" }
      ]
    },
    cool_summer: {
      label: "Soft Cool Summer",
      metal: "Silver & Rose Gold",
      swatches: [
        { name: "Soft White", hex: "#F4F3F1" },
        { name: "Taupe", hex: "#B2A89F" },
        { name: "Dusty Rose", hex: "#C98D94" },
        { name: "French Navy", hex: "#263859" },
        { name: "Plum", hex: "#65213B" },
        { name: "Slate", hex: "#5E7693" }
      ]
    }
  };

  /* ---------------- Garment Vector Illustrations ---------------- */
  function makeGarmentSvg(kind, fillHex, accentHex) {
    var stroke = "#3A221D";
    var acc = accentHex || "#DDA94B";
    var shapes = {
      shirt: '<path d="M26 18 L36 14 L44 22 L52 14 L62 18 L72 34 L62 40 L58 31 L58 72 L30 72 L30 31 L26 40 L16 34 Z" fill="' + fillHex + '" stroke="' + stroke + '" stroke-width="2.2" stroke-linejoin="round"/><line x1="44" y1="22" x2="44" y2="72" stroke="' + stroke + '" stroke-width="1.4" stroke-dasharray="3 3"/>',
      tee: '<path d="M26 18 L36 15 Q44 23 52 15 L62 18 L71 33 L61 39 L57 31 L57 70 L31 70 L31 31 L27 39 L17 33 Z" fill="' + fillHex + '" stroke="' + stroke + '" stroke-width="2.2" stroke-linejoin="round"/>',
      tank: '<path d="M33 16 L38 16 Q44 28 50 16 L55 16 L58 34 L59 70 L29 70 L30 34 Z" fill="' + fillHex + '" stroke="' + stroke + '" stroke-width="2.2" stroke-linejoin="round"/>',
      knit: '<path d="M27 19 L37 15 Q44 21 51 15 L61 19 L70 58 L61 61 L56 34 L56 70 L32 70 L32 34 L27 61 L18 58 Z" fill="' + fillHex + '" stroke="' + stroke + '" stroke-width="2.2" stroke-linejoin="round"/>',
      pants: '<path d="M29 14 L59 14 L64 74 L47 74 L44 36 L41 74 L24 74 Z" fill="' + fillHex + '" stroke="' + stroke + '" stroke-width="2.2" stroke-linejoin="round"/><line x1="29" y1="21" x2="59" y2="21" stroke="' + acc + '" stroke-width="2"/>',
      skirt: '<path d="M31 16 L57 16 L66 71 Q44 76 22 71 Z" fill="' + fillHex + '" stroke="' + stroke + '" stroke-width="2.2" stroke-linejoin="round"/>',
      blazer: '<path d="M25 16 L36 13 L44 34 L52 13 L63 16 L72 64 L62 66 L58 34 L58 72 L30 72 L30 34 L26 66 L16 64 Z" fill="' + fillHex + '" stroke="' + stroke + '" stroke-width="2.2" stroke-linejoin="round"/><circle cx="48" cy="48" r="2.2" fill="' + acc + '"/>',
      shoes: '<path d="M16 54 Q28 52 38 40 L48 44 Q56 54 72 56 L72 64 L48 64 L44 56 L30 64 L16 64 Z" fill="' + fillHex + '" stroke="' + stroke + '" stroke-width="2.2" stroke-linejoin="round"/>',
      sneaker: '<path d="M16 56 L28 40 L42 46 Q56 50 72 54 L72 64 L16 64 Z" fill="' + fillHex + '" stroke="' + stroke + '" stroke-width="2.2" stroke-linejoin="round"/><line x1="16" y1="60" x2="72" y2="60" stroke="' + acc + '" stroke-width="2.5"/>',
      bag: '<path d="M34 30 Q34 16 44 16 Q54 16 54 30" fill="none" stroke="' + stroke + '" stroke-width="2.6" stroke-linecap="round"/><rect x="23" y="30" width="42" height="36" rx="7" fill="' + fillHex + '" stroke="' + stroke + '" stroke-width="2.2"/><circle cx="44" cy="44" r="3.2" fill="' + acc + '"/>'
    };
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 84">' + (shapes[kind] || shapes.shirt) + '</svg>';
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  /* ---------------- 15-Piece Quiet Luxury US Capsule ---------------- */
  var BASE_CAPSULE = [
    { id: "c1",  cat: "top",    name: "Crisp Warm Ivory Button-Down", color: "#F7F2E8", colorName: "Warm Ivory", tone: "neutral", occ: ["trabalho", "casual", "jantar", "evento"], svgKind: "shirt" },
    { id: "c2",  cat: "top",    name: "Burgundy Silk V-Neck Camisole", color: "#6E1423", colorName: "Burgundy", tone: "accent", occ: ["trabalho", "jantar", "evento"], svgKind: "tank" },
    { id: "c3",  cat: "top",    name: "Elevated Pima Cotton White Tee", color: "#FAF8F5", colorName: "Soft White", tone: "neutral", occ: ["casual", "trabalho"], svgKind: "tee" },
    { id: "c4",  cat: "top",    name: "Espresso Fine-Rib Knit Top", color: "#3B2822", colorName: "Espresso", tone: "dark", occ: ["trabalho", "jantar", "casual"], svgKind: "knit" },
    { id: "c5",  cat: "top",    name: "French Navy Breton Stripe Knit", color: "#233249", colorName: "French Navy", tone: "neutral", occ: ["casual", "trabalho"], svgKind: "tee" },

    { id: "c6",  cat: "bottom", name: "High-Rise Sand Tailored Trousers", color: "#DCC6A6", colorName: "Warm Sand", tone: "neutral", occ: ["trabalho", "evento", "jantar"], svgKind: "pants" },
    { id: "c7",  cat: "bottom", name: "Dark-Wash Straight-Leg Jeans", color: "#23364E", colorName: "Dark Rinse", tone: "dark", occ: ["casual", "trabalho", "jantar"], svgKind: "pants" },
    { id: "c8",  cat: "bottom", name: "Champagne Bias-Cut Satin Midi Skirt", color: "#E8D4B4", colorName: "Champagne", tone: "neutral", occ: ["jantar", "evento", "trabalho"], svgKind: "skirt" },
    { id: "c9",  cat: "bottom", name: "Tailored Charcoal Wide-Leg Pants", color: "#34363A", colorName: "Charcoal", tone: "dark", occ: ["trabalho", "jantar", "evento"], svgKind: "pants" },

    { id: "c10", cat: "layer",  name: "Structured Camel Single-Breasted Blazer", color: "#C69C6D", colorName: "Camel", tone: "neutral", occ: ["trabalho", "casual", "jantar", "evento"], svgKind: "blazer" },
    { id: "c11", cat: "layer",  name: "Soft Cream Cashmere Cardigan", color: "#EFE5D4", colorName: "Cream", tone: "neutral", occ: ["casual", "trabalho", "jantar"], svgKind: "blazer" },
    { id: "c12", cat: "layer",  name: "Navy Tailored Trench / Jacket", color: "#1D2C44", colorName: "Navy", tone: "dark", occ: ["trabalho", "jantar", "evento"], svgKind: "blazer" },

    { id: "c13", cat: "shoes",  name: "Nude Pointed Slingback Flats/Heels", color: "#D5B295", colorName: "Skin-Tone Nude", tone: "neutral", occ: ["trabalho", "jantar", "evento"], svgKind: "shoes" },
    { id: "c14", cat: "shoes",  name: "Clean Minimalist White Leather Sneakers", color: "#F5F2EC", colorName: "Crisp White", tone: "neutral", occ: ["casual", "trabalho"], svgKind: "sneaker" },
    { id: "c15", cat: "bag",    name: "Structured Caramel Leather Tote/Crossbody", color: "#9C5B34", colorName: "Caramel", tone: "accent", occ: ["trabalho", "casual", "jantar", "evento"], svgKind: "bag" },
    { id: "c16", cat: "bag",    name: "Burgundy Gold-Clasp Evening Bag", color: "#5E111E", colorName: "Burgundy", tone: "accent", occ: ["jantar", "evento", "trabalho"], svgKind: "bag" }
  ];

  var LESSONS = [
    { id: "l1", time: "3 min", title: "1. The 80/20 Closet Audit & Orphan Piece Rescue", body: "Pull out the 5 pieces you wear every single week—that's your comfort baseline. For every 'orphan' piece sitting with tags on, pair it with 2 neutral anchors (Warm Ivory Shirt, Sand Trousers, or Dark Straight Jeans). That single shift unlocks 30+ outfits without buying a thing." },
    { id: "l2", time: "4 min", title: "2. Wearing Your Seasonal Colors Near Your Face", body: "Only the color directly beneath your chin reflects onto your skin! Keep your most flattering seasonal shades in tops, scarves, and blazers—and wear off-palette colors you still own as bottoms, skirts, or bags." },
    { id: "l3", time: "4 min", title: "3. The Golden Ratio (1/3 Top to 2/3 Legs)", body: "Never split your outfit 50/50 at the widest part of your hips. A gentle front 'French tuck' into high-rise jeans or trousers shifts your visual ratio to 1/3 top and 2/3 legs—instantly elongating your frame by 2–3 visual inches." },
    { id: "l4", time: "3 min", title: "4. The Third-Piece Secret to 'Quiet Luxury'", body: "Top + Jeans is just clothes; Top + Jeans + Structured Camel Blazer (with sleeves pushed up to show your wrists!) is an intentional outfit. Pushing up blazer sleeves creates instant waist space and effortless polish." },
    { id: "l5", time: "3 min", title: "5. Elongating Legs in Flats & Sneakers", body: "You never need painful heels to look long and lean! Match your shoe either to your skin tone (nude pointed slingbacks/loafers with skirts) OR to the hem of your pants (dark loafers with dark trousers) so your leg line never breaks." },
    { id: "l6", time: "4 min", title: "6. The 15 → 150 Capsule Multiplier", body: "5 tops × 4 bottoms × 3 layers × 2–3 shoes = over 150 distinct outfits! When 75% of your core pieces sit in harmonious neutrals (Ivory, Camel, Sand, Navy/Espresso) and 25% in your signature accent (Burgundy, Olive, Berry), literally everything matches." },
    { id: "l7", time: "3 min", title: "7. The 'Rule of 3' Smart Shopping Filter", body: "Before buying anything on sale, picture 3 complete outfits you can wear it with using items ALREADY in your Lumina Closet. If you can't name 3 outfits in 10 seconds, leave it on the rack—you just saved $80!" }
  ];

  var state = {
    profile: null,
    customItems: [],
    closetFilter: "all",
    dailyOcc: "trabalho",
    dailySeed: 0,
    currentDailyLook: null,
    mirrorIdx: { layer: 0, top: 0, bottom: 0, shoes: 0, bag: 0 },
    savedLooks: [],
    capsuleChecks: {},
    lessonsDone: {},
    pendingPhotoDataUrl: null
  };

  /* ---------------- IndexedDB Custom Closet ---------------- */
  function openDB() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) { resolve(null); return; }
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE, { keyPath: "id" });
      };
      req.onsuccess = function (e) { resolve(e.target.result); };
      req.onerror = function () { reject(req.error); };
    });
  }
  function loadCustomItems() {
    return openDB().then(function (db) {
      if (!db) return [];
      return new Promise(function (resolve) {
        var tx = db.transaction(DB_STORE, "readonly");
        var req = tx.objectStore(DB_STORE).getAll();
        req.onsuccess = function () { resolve(req.result || []); };
        req.onerror = function () { resolve([]); };
      });
    }).catch(function () { return []; });
  }
  function saveCustomItemDB(item) {
    return openDB().then(function (db) {
      if (!db) return;
      return new Promise(function (resolve) {
        var tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).put(item);
        tx.oncomplete = function () { resolve(); };
      });
    });
  }
  function deleteCustomItemDB(id) {
    return openDB().then(function (db) {
      if (!db) return;
      return new Promise(function (resolve) {
        var tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).delete(id);
        tx.oncomplete = function () { resolve(); };
      });
    });
  }

  function allItems() {
    var base = BASE_CAPSULE.map(function (it) {
      return Object.assign({}, it, { imgSrc: makeGarmentSvg(it.svgKind, it.color) });
    });
    var custom = state.customItems.map(function (it) {
      return Object.assign({}, it, {
        imgSrc: it.photoData || makeGarmentSvg("shirt", it.color || "#C69C6D"),
        isCustom: true
      });
    });
    return custom.concat(base);
  }
  function itemsByCat(cat) { return allItems().filter(function (x) { return x.cat === cat; }); }

  function showToast(msg) {
    var t = $("#appToast");
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { t.hidden = true; }, 2600);
  }

  /* ---------------- Personalized Styling Rules ---------------- */
  function bodyTipFor(profile) {
    var b = (profile && profile.body) || "ampulheta";
    var hIn = (profile && profile.heightIn) || 65;
    var ftLbl = formatFtIn(hIn);
    var map = {
      ampulheta: "Use a gentle front French tuck to honor your natural waist without adding bulk.",
      triangulo: "Bright, luminous seasonal shades on top + darker streamlined bottoms balance your frame effortlessly.",
      tinvertido: "V-necks or open collars soften shoulders while wide-leg or satin skirts add graceful lower movement.",
      retangular: "Pushed-up blazer sleeves + textured fabrics create subtle waist dimension and polish.",
      oval: "Open third pieces create two vertical center lines that elongate and skim comfortably."
    };
    var hTip = hIn <= 63
      ? " At " + ftLbl + ", high-rise bottoms + nude or tonal footwear add 2+ visual inches."
      : (hIn >= 68 ? " At " + ftLbl + ", structured blazers and wide-leg trousers showcase your vertical elegance." : "");
    return (map[b] || map.ampulheta) + hTip;
  }

  /* ---------------- Header, Seasonal Swatches & Daily Outfit ---------------- */
  function renderProfileHeader() {
    var p = state.profile;
    if (!p) return;
    var first = (p.name || "Gorgeous").trim().split(/\s+/)[0];
    $("#userInitial").textContent = first.charAt(0).toUpperCase();
    var hr = new Date().getHours();
    var greet = hr < 12 ? "Good morning" : (hr < 18 ? "Good afternoon" : "Good evening");
    $("#welcomeTitle").textContent = greet + ", " + first + "! ✨";

    var styleNames = { classica: "Quiet Luxury", moderna: "Modern Chic", romantica: "Soft Feminine", casual: "Elevated Casual", criativa: "Editorial" };
    var bodyNames = { ampulheta: "Hourglass", triangulo: "Pear", tinvertido: "Inv. Triangle", retangular: "Rectangle", oval: "Soft Midsection" };
    var seasonObj = SEASONS[p.season] || SEASONS.soft_autumn;

    $("#profilePills").innerHTML =
      '<span class="ppill">🎨 ' + seasonObj.label + '</span>' +
      '<span class="ppill">✨ ' + (styleNames[p.style] || "Modern Chic") + '</span>' +
      '<span class="ppill">👗 ' + (bodyNames[p.body] || "Hourglass") + ' · ' + formatFtIn(p.heightIn) + '</span>';

    $("#seasonStripBox").innerHTML =
      '<div class="season-strip__top">' +
        '<strong>🎨 My ' + seasonObj.label + ' Swatches</strong>' +
        '<span>Best Metal: ' + seasonObj.metal + '</span>' +
      '</div>' +
      '<div class="season-swatches">' +
        seasonObj.swatches.map(function (sw) {
          return '<div class="season-sw"><i style="background:' + sw.hex + '"></i><small>' + sw.name + '</small></div>';
        }).join("") +
      '</div>';
  }

  function buildDailyLook() {
    var occ = state.dailyOcc;
    var pick = function (cat, offset) {
      var list = itemsByCat(cat);
      var matching = list.filter(function (i) { return !i.occ || i.occ.indexOf(occ) !== -1; });
      var pool = matching.length ? matching : list;
      return pool[(state.dailySeed + offset) % pool.length];
    };
    var look = {
      occ: occ,
      top: pick("top", 0),
      bottom: pick("bottom", 1),
      layer: pick("layer", 2),
      shoes: pick("shoes", 0),
      bag: pick("bag", 1)
    };
    state.currentDailyLook = look;

    var slots = [
      { role: "Top", item: look.top },
      { role: "Bottom", item: look.bottom },
      { role: "3rd Piece", item: look.layer },
      { role: "Shoes", item: look.shoes }
    ];
    $("#dailyLookGrid").innerHTML = slots.map(function (s) {
      return '<div class="look-piece">' +
        '<img src="' + s.item.imgSrc + '" alt="' + s.item.name + '">' +
        '<span class="look-piece__role">' + s.role + '</span>' +
        '<strong>' + s.item.name + '</strong>' +
      '</div>';
    }).join("");

    $("#dailyStylistTip").innerHTML = "💡 <strong>AI Stylist Note:</strong> " + bodyTipFor(state.profile) +
      " Finish with the <strong>" + look.bag.name + "</strong> for effortless cohesion.";
  }

  function renderSavedLooks() {
    var box = $("#savedLooksList");
    $("#savedLooksCount").textContent = state.savedLooks.length + (state.savedLooks.length === 1 ? " outfit" : " outfits");
    if (!state.savedLooks.length) {
      box.innerHTML = '<div class="saved-empty">Tap <strong>"❤️ Save to Lookbook"</strong> on any outfit or inside the Virtual Try-On to build your go-to morning menu!</div>';
      return;
    }
    box.innerHTML = state.savedLooks.map(function (lk, idx) {
      return '<div class="saved-card">' +
        '<div class="saved-card__thumbs">' +
          '<img src="' + lk.top.imgSrc + '" alt="">' +
          '<img src="' + lk.bottom.imgSrc + '" alt="">' +
          '<img src="' + lk.layer.imgSrc + '" alt="">' +
          '<img src="' + lk.shoes.imgSrc + '" alt="">' +
        '</div>' +
        '<div class="saved-card__info">' +
          '<strong>' + lk.title + '</strong>' +
          '<small>' + lk.top.name + ' + ' + lk.bottom.name + '</small>' +
        '</div>' +
        '<button type="button" class="saved-card__del" data-del-look="' + idx + '" aria-label="Remove outfit">🗑️</button>' +
      '</div>';
    }).join("");
  }

  /* ---------------- Closet & 15->150 Matrix ---------------- */
  function renderCloset() {
    var items = allItems();
    var tops = items.filter(function (i) { return i.cat === "top"; }).length;
    var bottoms = items.filter(function (i) { return i.cat === "bottom"; }).length;
    var layers = items.filter(function (i) { return i.cat === "layer"; }).length;
    var shoes = items.filter(function (i) { return i.cat === "shoes"; }).length;
    var combos = tops * bottoms * Math.max(1, layers) * Math.max(1, shoes);

    $("#closetStats").innerHTML =
      '<div class="cstat"><strong>' + items.length + '</strong><span>Pieces in Closet</span></div>' +
      '<div class="cstat"><strong>' + state.customItems.length + '</strong><span>My Photos</span></div>' +
      '<div class="cstat cstat--gold"><strong>' + combos + '+</strong><span>Possible Outfits</span></div>';

    var filtered = state.closetFilter === "all" ? items : items.filter(function (i) { return i.cat === state.closetFilter; });
    var catLbl = { top: "Top", bottom: "Bottom", layer: "3rd Piece", shoes: "Shoes", bag: "Bag" };

    $("#closetGrid").innerHTML = filtered.map(function (it) {
      return '<div class="citem">' +
        (it.isCustom ? '<button type="button" class="citem__del" data-del-item="' + it.id + '" title="Delete piece">✕</button>' : '') +
        '<div class="citem__img"><img src="' + it.imgSrc + '" alt="' + it.name + '"></div>' +
        '<span class="citem__cat">' + (catLbl[it.cat] || it.cat) + (it.isCustom ? " · MY PHOTO" : " · CAPSULE") + '</span>' +
        '<strong class="citem__name">' + it.name + '</strong>' +
        '<span class="citem__dot"><i style="background:' + (it.color || "#C69C6D") + '"></i>' + (it.colorName || "Neutral") + '</span>' +
      '</div>';
    }).join("");

    $("#capsuleChecklist").innerHTML = BASE_CAPSULE.slice(0, 15).map(function (it) {
      var done = state.capsuleChecks[it.id] !== false;
      return '<div class="cap-check' + (done ? " done" : "") + '" data-cap-id="' + it.id + '">' +
        '<i>' + (done ? "✓" : "") + '</i>' +
        '<span>' + it.name + '</span>' +
      '</div>';
    }).join("");
  }

  function detectDominantColor(dataUrl, cb) {
    var img = new Image();
    img.onload = function () {
      var cv = document.createElement("canvas");
      cv.width = 32; cv.height = 32;
      var ctx = cv.getContext("2d");
      ctx.drawImage(img, 0, 0, 32, 32);
      var d = ctx.getImageData(8, 8, 16, 16).data;
      var r = 0, g = 0, b = 0, n = d.length / 4;
      for (var i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
      r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
      var hex = "#" + [r, g, b].map(function (v) { return v.toString(16).padStart(2, "0"); }).join("");
      cb(hex, nameColor(r, g, b));
    };
    img.src = dataUrl;
  }

  function nameColor(r, g, b) {
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var lum = (max + min) / 2;
    if (lum > 222) return "Ivory / Soft White";
    if (lum < 48) return "Black / Deep Charcoal";
    if (max - min < 26) return lum > 150 ? "Warm Sand / Taupe" : "Slate / Charcoal";
    if (r > g + 35 && r > b + 25) return r > 150 ? "Terracotta / Rose" : "Burgundy / Wine";
    if (b > r + 20 && b > g) return "French Navy / Denim";
    if (r > b + 25 && g > b + 15) return "Camel / Caramel";
    return "Signature Accent";
  }

  /* ---------------- Virtual Outfit Try-On Mirror ---------------- */
  function currentMirrorSelection() {
    var pick = function (cat) {
      var list = itemsByCat(cat);
      var idx = ((state.mirrorIdx[cat] || 0) % list.length + list.length) % list.length;
      return list[idx];
    };
    return { layer: pick("layer"), top: pick("top"), bottom: pick("bottom"), shoes: pick("shoes"), bag: pick("bag") };
  }

  function computeHarmony(sel) {
    var pieces = [sel.layer, sel.top, sel.bottom, sel.shoes, sel.bag];
    var accents = pieces.filter(function (p) { return p.tone === "accent"; }).length;
    if (accents <= 1) return { score: 97, label: "97% · Quiet Luxury Harmony", note: "Neutral base + single focal shade creates effortless high-end polish and elongates your frame." };
    if (accents === 2) return { score: 93, label: "93% · Coordinated Chic", note: "Intentional color echo between your top and accessory ties your outfit together beautifully!" };
    return { score: 85, label: "85% · Bold Editorial Mix", note: "Tip: swap one accent piece for Warm Ivory or Sand if you want a calmer everyday silhouette." };
  }

  function renderMirror() {
    var sel = currentMirrorSelection();
    var roles = { layer: "3rd Piece / Blazer", top: "Top / Blouse", bottom: "Bottom", shoes: "Shoes", bag: "Bag" };
    ["layer", "top", "bottom", "shoes", "bag"].forEach(function (cat) {
      var el = $("#slot-" + cat);
      var it = sel[cat];
      if (!el || !it) return;
      el.innerHTML = '<img src="' + it.imgSrc + '" alt="' + it.name + '">' +
        '<div class="slot-meta"><span>' + roles[cat] + '</span><strong>' + it.name + '</strong></div>';
    });
    var h = computeHarmony(sel);
    $("#mirrorHarmonyPct").textContent = h.label;
    $("#mirrorVerdict").innerHTML = "🪞 <strong>Try-On Verdict:</strong> " + h.note;
  }

  function exportMirrorCard() {
    var sel = currentMirrorSelection();
    var cv = document.createElement("canvas");
    cv.width = 720; cv.height = 920;
    var ctx = cv.getContext("2d");
    ctx.fillStyle = "#FFFDF9"; ctx.fillRect(0, 0, 720, 920);
    ctx.fillStyle = "#6E1423"; ctx.fillRect(0, 0, 720, 120);
    ctx.fillStyle = "#FCE3A6"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("✦ LUMINA STYLE AI · VIRTUAL TRY-ON CARD ✦", 360, 50);
    ctx.fillStyle = "#FFFFFF"; ctx.font = "italic bold 30px Georgia, serif";
    ctx.fillText("My Curated Outfit", 360, 92);

    var list = [
      ["🧥 3rd Piece", sel.layer.name, sel.layer.color],
      ["👚 Top", sel.top.name, sel.top.color],
      ["👖 Bottom", sel.bottom.name, sel.bottom.color],
      ["👠 Shoes", sel.shoes.name, sel.shoes.color],
      ["👜 Bag", sel.bag.name, sel.bag.color]
    ];
    list.forEach(function (row, i) {
      var y = 160 + i * 120;
      ctx.fillStyle = "#F5ECDC"; ctx.fillRect(48, y, 624, 96);
      ctx.fillStyle = row[2] || "#C69C6D"; ctx.beginPath(); ctx.arc(96, y + 48, 24, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#3A221D"; ctx.lineWidth = 2; ctx.stroke();
      ctx.textAlign = "left";
      ctx.fillStyle = "#6E1423"; ctx.font = "bold 16px sans-serif"; ctx.fillText(row[0], 140, y + 38);
      ctx.fillStyle = "#1E1A17"; ctx.font = "bold 22px Georgia, serif"; ctx.fillText(row[1], 140, y + 70);
    });
    var h = computeHarmony(sel);
    ctx.fillStyle = "#117A3E"; ctx.textAlign = "center"; ctx.font = "bold 21px sans-serif";
    ctx.fillText("✓ " + h.label, 360, 815);
    ctx.fillStyle = "#6B6158"; ctx.font = "16px sans-serif";
    ctx.fillText("Generated in Lumina Style AI Member App", 360, 865);

    var a = document.createElement("a");
    a.download = "lumina-outfit-card.png";
    a.href = cv.toDataURL("image/png");
    a.click();
    showToast("📲 Outfit Card saved to your device!");
  }

  /* ---------------- Smart Carry-On & Week Planner ---------------- */
  function buildTripPlan() {
    var type = $("#tripType").value;
    var days = parseInt($("#tripDays").value, 10) || 5;
    var climate = $("#tripClimate").value;

    var tops = itemsByCat("top"), bottoms = itemsByCat("bottom"), layers = itemsByCat("layer"), shoes = itemsByCat("shoes"), bags = itemsByCat("bag");
    var packedIds = {}, packedList = [];
    function remember(it) { if (it && !packedIds[it.id]) { packedIds[it.id] = 1; packedList.push(it); } }

    var dayPlans = [];
    var acts = {
      semana: ["Monday · Key Meetings", "Tuesday · Hybrid / Focus", "Wednesday · Lunch & Errands", "Thursday · Polished Presentation", "Friday · Casual Chic & Dinner", "Saturday · Brunch & Coffee", "Sunday · Relaxed Reset"],
      trabalho: ["Day 1 · Flight + Check-in", "Day 2 · Conference / Client Day", "Day 3 · Business Dinner", "Day 4 · Workshops", "Day 5 · Return Flight", "Day 6 · Extra Networking", "Day 7 · Executive Wrap"],
      ferias: ["Day 1 · Travel + Sunset Walk", "Day 2 · Sightseeing & Cafés", "Day 3 · Special Dinner Out", "Day 4 · Day Trip & Photos", "Day 5 · Relaxed Shopping", "Day 6 · Rooftop Drinks", "Day 7 · Easy Journey Home"],
      inverno: ["Day 1 · Cozy Layered Travel", "Day 2 · City Stroll & Museum", "Day 3 · Wine Bar Dinner", "Day 4 · Crisp Morning Café", "Day 5 · Gallery & Shops", "Day 6 · Fireside Dinner", "Day 7 · Chic Travel Home"]
    }[type];

    for (var d = 0; d < days; d++) {
      var t = tops[d % Math.min(4, tops.length)];
      var b = bottoms[d % Math.min(3, bottoms.length)];
      var l = layers[d % Math.min(2, layers.length)];
      var s = shoes[d % Math.min(2, shoes.length)];
      var bg = bags[0];
      remember(t); remember(b); if (climate !== "quente" || d % 2 === 0) remember(l); remember(s); remember(bg);
      dayPlans.push({ title: acts[d] || ("Day " + (d + 1)), top: t, bottom: b, layer: (climate === "quente" && d % 2 === 1) ? null : l, shoes: s });
    }

    var html = '<div class="card"><div class="card__head"><div><span class="kicker">✦ ZERO OVERPACKING</span>' +
      '<h3>Carry-On Checklist: Only ' + packedList.length + ' Pieces for ' + days + ' Days!</h3></div></div>' +
      '<div class="suitcase-summary">' +
        packedList.map(function (p) { return '<span class="suit-chip"><img src="' + p.imgSrc + '" alt="">' + p.name + '</span>'; }).join("") +
      '</div>' +
      '<div class="day-cards">' +
        dayPlans.map(function (dp) {
          var formula = dp.top.name + " + " + dp.bottom.name + (dp.layer ? " + " + dp.layer.name : "") + " + " + dp.shoes.name;
          return '<div class="day-card"><strong>' + dp.title + '</strong><p>' + formula + '</p></div>';
        }).join("") +
      '</div></div>';

    $("#tripResultBox").innerHTML = html;
  }

  /* ---------------- 7 Lessons & 24/7 AI Stylist ---------------- */
  function renderLessons() {
    var doneCount = Object.keys(state.lessonsDone).filter(function (k) { return state.lessonsDone[k]; }).length;
    $("#lessonsProgressLbl").textContent = doneCount + "/" + LESSONS.length + " completed";
    $("#lessonsList").innerHTML = LESSONS.map(function (ls, i) {
      var done = !!state.lessonsDone[ls.id];
      return '<div class="lesson-item' + (i === 0 ? " open" : "") + '" data-lesson="' + ls.id + '">' +
        '<div class="lesson-head" data-toggle-lesson="' + ls.id + '">' +
          '<span class="lesson-num">' + (done ? "✓" : (i + 1)) + '</span>' +
          '<div class="lesson-meta"><strong>' + ls.title + '</strong><small>⏱️ ' + ls.time + ' read · Practical Blueprint</small></div>' +
          '<span>▾</span>' +
        '</div>' +
        '<div class="lesson-body"><p>' + ls.body + '</p>' +
          '<button type="button" class="' + (done ? "btn-outline-sm" : "btn-primary-sm") + '" data-complete-lesson="' + ls.id + '">' +
            (done ? "✓ Lesson Completed" : "Mark as Completed ✓") +
          '</button>' +
        '</div></div>';
    }).join("");
  }

  function answerStylistQuestion(q) {
    var ql = q.toLowerCase();
    var seasonObj = SEASONS[(state.profile && state.profile.season) || "soft_autumn"] || SEASONS.soft_autumn;
    var ans = "";
    if (ql.indexOf("tall") !== -1 || ql.indexOf("flat") !== -1 || ql.indexOf("sneaker") !== -1) {
      ans = "✨ <strong>Flat-Shoe Elongation Formula:</strong> Pair high-rise straight jeans or tailored trousers with a front French-tucked top (1/3 top to 2/3 leg ratio), show your ankles or match shoe tone to your pants/skin, and push up your blazer sleeves!";
    } else if (ql.indexOf("color") !== -1 || ql.indexOf("glow") !== -1 || ql.indexOf("young") !== -1 || ql.indexOf("rested") !== -1) {
      ans = "🎨 <strong>Your " + seasonObj.label + " Glow Trick:</strong> Wear <strong>" + seasonObj.swatches[0].name + "</strong>, <strong>" + seasonObj.swatches[1].name + "</strong>, or <strong>" + seasonObj.swatches[2].name + "</strong> right near your neckline with <strong>" + seasonObj.metal + "</strong> earrings—it reflects warm light under your eyes like 8 hours of sleep!";
    } else if (ql.indexOf("midsection") !== -1 || ql.indexOf("belly") !== -1 || ql.indexOf("skim") !== -1 || ql.indexOf("stomach") !== -1) {
      ans = "🌬️ <strong>Effortless Midsection Skim:</strong> Drape a fluid blouse (never clingy Lycra) under an <strong>open structured Camel or Navy Blazer</strong>. Those two vertical lapel lines slim your torso by 30% visually with zero discomfort!";
    } else if (ql.indexOf("dinner") !== -1 || ql.indexOf("date") !== -1 || ql.indexOf("jean") !== -1) {
      ans = "🍷 <strong>Chic Date-Night Jeans Formula:</strong> Dark-wash straight jeans + your Burgundy Silk Camisole + Camel Blazer draped over your shoulders + Nude Pointed Slingbacks + gold hoops. Effortless, magnetic, and ready in 4 minutes!";
    } else {
      ans = "👗 <strong>Custom Formula For You:</strong> Start with High-Rise Sand Trousers or Dark Straight Jeans + a " + seasonObj.swatches[0].name + " top (French-tucked) + a structured third piece with sleeves pushed up. Remember: " + bodyTipFor(state.profile);
    }
    var box = $("#stylistAnswer");
    box.innerHTML = ans;
    box.hidden = false;
  }

  function switchTab(tabId) {
    $$(".view").forEach(function (v) { v.classList.toggle("active", v.dataset.view === tabId); });
    $$(".tabbar .tab").forEach(function (t) { t.classList.toggle("active", t.dataset.tab === tabId); });
    window.scrollTo(0, 0);
  }

  /* ---------------- Boot & Events ---------------- */
  var deferredPrompt = null;

  function boot() {
    try { state.profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null"); } catch (e) {}
    try { state.savedLooks = JSON.parse(localStorage.getItem(SAVED_LOOKS_KEY) || "[]"); } catch (e) {}
    try { state.capsuleChecks = JSON.parse(localStorage.getItem(CAPSULE_CHECKS_KEY) || "{}"); } catch (e) {}
    try { state.lessonsDone = JSON.parse(localStorage.getItem(LESSONS_DONE_KEY) || "{}"); } catch (e) {}

    // Pre-fill onboarding from Quiz bridge if available!
    try {
      var bridge = JSON.parse(localStorage.getItem(QUIZ_BRIDGE_KEY) || "null");
      if (bridge && !state.profile) {
        if (bridge.heightIn) {
          $("#inpHeight").value = bridge.heightIn;
          $("#gateHeightLbl").textContent = formatFtIn(bridge.heightIn);
        }
        if (bridge.style && $("#inpStyle")) $("#inpStyle").value = bridge.style;
        if (bridge.body && $("#inpBody")) $("#inpBody").value = bridge.body;
      }
    } catch (e) {}

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/app/sw.js").catch(function () {});
    }
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      deferredPrompt = e;
      $("#btnInstallApp").hidden = false;
    });
    var isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    if (!isStandalone) $("#btnInstallApp").hidden = false;

    loadCustomItems().then(function (custom) {
      state.customItems = custom;
      if (!state.profile) {
        $("#gateScreen").hidden = false;
        $("#appShell").hidden = true;
      } else {
        enterApp();
      }
    });

    $("#inpHeight").addEventListener("input", function (e) {
      $("#gateHeightLbl").textContent = formatFtIn(e.target.value);
    });

    $("#gateForm").addEventListener("submit", function (e) {
      e.preventDefault();
      state.profile = {
        name: $("#inpName").value.trim() || "Gorgeous",
        email: $("#inpEmail").value.trim(),
        style: $("#inpStyle").value,
        season: $("#inpSeason").value,
        body: $("#inpBody").value,
        heightIn: parseInt($("#inpHeight").value, 10) || 65
      };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(state.profile));
      enterApp();
      showToast("🎉 Welcome! All VIP Tools & Swatches unlocked.");
    });

    $("#btnEditProfile").addEventListener("click", function () {
      if (state.profile) {
        $("#inpName").value = state.profile.name || "";
        $("#inpEmail").value = state.profile.email || "";
        $("#inpStyle").value = state.profile.style || "moderna";
        $("#inpSeason").value = state.profile.season || "soft_autumn";
        $("#inpBody").value = state.profile.body || "ampulheta";
        $("#inpHeight").value = state.profile.heightIn || 65;
        $("#gateHeightLbl").textContent = formatFtIn(state.profile.heightIn || 65);
      }
      $("#appShell").hidden = true;
      $("#gateScreen").hidden = false;
    });

    $$(".tabbar .tab").forEach(function (t) { t.addEventListener("click", function () { switchTab(t.dataset.tab); }); });
    $$("[data-goto]").forEach(function (b) { b.addEventListener("click", function () { switchTab(b.dataset.goto); }); });

    $("#btnShuffleDaily").addEventListener("click", function () { state.dailySeed += 1; buildDailyLook(); showToast("✨ Fresh outfit formula ready!"); });
    $$("#dailyOccChips .occ-chip").forEach(function (c) {
      c.addEventListener("click", function () {
        $$("#dailyOccChips .occ-chip").forEach(function (x) { x.classList.remove("active"); });
        c.classList.add("active"); state.dailyOcc = c.dataset.occ; state.dailySeed += 1; buildDailyLook();
      });
    });

    $("#btnOpenInMirror").addEventListener("click", function () {
      var lk = state.currentDailyLook;
      if (lk) {
        ["layer", "top", "bottom", "shoes", "bag"].forEach(function (cat) {
          var idx = itemsByCat(cat).findIndex(function (x) { return x.id === lk[cat].id; });
          if (idx !== -1) state.mirrorIdx[cat] = idx;
        });
        renderMirror();
      }
      switchTab("provador");
    });

    $("#btnSaveDailyLook").addEventListener("click", function () {
      var lk = state.currentDailyLook;
      if (!lk) return;
      var occNames = { trabalho: "Work Chic", casual: "Elevated Casual", jantar: "Date Night", evento: "Special Event" };
      state.savedLooks.unshift({ title: (occNames[lk.occ] || "Saved") + " · Ready in 4m", top: lk.top, bottom: lk.bottom, layer: lk.layer, shoes: lk.shoes });
      localStorage.setItem(SAVED_LOOKS_KEY, JSON.stringify(state.savedLooks.slice(0, 30)));
      renderSavedLooks();
      showToast("❤️ Saved to your Lookbook!");
    });

    $("#savedLooksList").addEventListener("click", function (e) {
      var del = e.target.closest("[data-del-look]");
      if (!del) return;
      state.savedLooks.splice(parseInt(del.dataset.delLook, 10), 1);
      localStorage.setItem(SAVED_LOOKS_KEY, JSON.stringify(state.savedLooks));
      renderSavedLooks();
    });

    $$("#closetCatTabs .cat-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        $$("#closetCatTabs .cat-tab").forEach(function (x) { x.classList.remove("active"); });
        btn.classList.add("active"); state.closetFilter = btn.dataset.cat; renderCloset();
      });
    });

    $("#btnToggleMatrix").addEventListener("click", function () { $("#matrixPanel").hidden = !$("#matrixPanel").hidden; });
    $("#btnCloseMatrix").addEventListener("click", function () { $("#matrixPanel").hidden = true; });
    $("#capsuleChecklist").addEventListener("click", function (e) {
      var row = e.target.closest("[data-cap-id]");
      if (!row) return;
      var id = row.dataset.capId;
      state.capsuleChecks[id] = !(state.capsuleChecks[id] !== false);
      localStorage.setItem(CAPSULE_CHECKS_KEY, JSON.stringify(state.capsuleChecks));
      renderCloset();
    });

    $("#btnOpenAddItem").addEventListener("click", function () {
      state.pendingPhotoDataUrl = null;
      $("#formAddItem").reset();
      $("#uploadPreviewWrap").innerHTML = '<span class="upload-ico">📷</span><strong>Tap to snap a photo or choose from library</strong><small>Our AI automatically detects your garment\'s color!</small>';
      $("#modalAddItem").hidden = false;
    });

    $("#inpItemPhoto").addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        var img = new Image();
        img.onload = function () {
          var maxSide = 440, scale = Math.min(1, maxSide / Math.max(img.width, img.height));
          var cv = document.createElement("canvas");
          cv.width = Math.round(img.width * scale); cv.height = Math.round(img.height * scale);
          cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
          var compressed = cv.toDataURL("image/jpeg", 0.82);
          state.pendingPhotoDataUrl = compressed;
          $("#uploadPreviewWrap").innerHTML = '<img src="' + compressed + '" alt="Preview"><strong>✓ Photo ready! Color detected by AI</strong>';
          detectDominantColor(compressed, function (hex, name) {
            $("#inpItemColor").value = hex;
            $("#inpItemColorName").textContent = name;
          });
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

    $("#formAddItem").addEventListener("submit", function (e) {
      e.preventDefault();
      var newItem = {
        id: "usr_" + Date.now(),
        name: $("#inpItemName").value.trim(),
        cat: $("#inpItemCat").value,
        color: $("#inpItemColor").value,
        colorName: $("#inpItemColorName").textContent,
        tone: "neutral",
        occ: ["trabalho", "casual", "jantar", "evento"],
        photoData: state.pendingPhotoDataUrl
      };
      state.customItems.unshift(newItem);
      saveCustomItemDB(newItem).then(function () {
        $("#modalAddItem").hidden = true;
        renderCloset(); renderMirror(); buildDailyLook();
        showToast("👗 Piece added to your Digital Closet!");
      });
    });

    $("#closetGrid").addEventListener("click", function (e) {
      var del = e.target.closest("[data-del-item]");
      if (!del) return;
      var id = del.dataset.delItem;
      state.customItems = state.customItems.filter(function (x) { return x.id !== id; });
      deleteCustomItemDB(id).then(function () { renderCloset(); renderMirror(); showToast("Piece removed."); });
    });

    $$("#mirrorStage .slot-nav").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.dataset.cat;
        state.mirrorIdx[cat] = (state.mirrorIdx[cat] || 0) + (parseInt(btn.dataset.dir, 10) || 1);
        renderMirror();
      });
    });
    $("#btnMirrorSurprise").addEventListener("click", function () {
      ["layer", "top", "bottom", "shoes", "bag"].forEach(function (cat) {
        state.mirrorIdx[cat] = Math.floor(Math.random() * itemsByCat(cat).length);
      });
      renderMirror(); showToast("🎲 Fresh combination in the Try-On Mirror!");
    });
    $("#btnSaveMirrorLook").addEventListener("click", function () {
      var sel = currentMirrorSelection();
      state.savedLooks.unshift({ title: "Try-On · " + sel.top.colorName, top: sel.top, bottom: sel.bottom, layer: sel.layer, shoes: sel.shoes });
      localStorage.setItem(SAVED_LOOKS_KEY, JSON.stringify(state.savedLooks.slice(0, 30)));
      renderSavedLooks(); showToast("❤️ Try-On outfit saved to Lookbook!");
    });
    $("#btnExportLookCard").addEventListener("click", exportMirrorCard);

    $("#btnBuildTrip").addEventListener("click", function () { buildTripPlan(); showToast("✈️ Smart Carry-On Itinerary created!"); });

    $$("#quickPrompts .qprompt").forEach(function (b) {
      b.addEventListener("click", function () { $("#inpStylistQ").value = b.dataset.q; answerStylistQuestion(b.dataset.q); });
    });
    $("#stylistForm").addEventListener("submit", function (e) { e.preventDefault(); answerStylistQuestion($("#inpStylistQ").value); });

    $("#lessonsList").addEventListener("click", function (e) {
      var tog = e.target.closest("[data-toggle-lesson]");
      if (tog) { tog.closest(".lesson-item").classList.toggle("open"); return; }
      var comp = e.target.closest("[data-complete-lesson]");
      if (comp) {
        var id = comp.dataset.completeLesson;
        state.lessonsDone[id] = !state.lessonsDone[id];
        localStorage.setItem(LESSONS_DONE_KEY, JSON.stringify(state.lessonsDone));
        renderLessons();
        showToast(state.lessonsDone[id] ? "🎓 Lesson completed!" : "Lesson unmarked.");
      }
    });

    $("#btnInstallApp").addEventListener("click", function () {
      if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.finally(function () { deferredPrompt = null; }); }
      else { $("#modalInstall").hidden = false; }
    });

    $$("[data-close-modal]").forEach(function (el) {
      el.addEventListener("click", function () { var m = $("#" + el.dataset.closeModal); if (m) m.hidden = true; });
    });
  }

  function enterApp() {
    $("#gateScreen").hidden = true;
    $("#appShell").hidden = false;
    renderProfileHeader();
    buildDailyLook();
    renderSavedLooks();
    renderCloset();
    renderMirror();
    buildTripPlan();
    renderLessons();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
