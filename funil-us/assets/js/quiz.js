/* =========================================================================
   LUMINA STYLE AI (US EDITION) · 14-Step Color, Proportion & Wardrobe Quiz
   Mosso-Aligned Diagnostic + Seasonal Color Reveal + $27 Impulse VIP Offer
   ========================================================================= */
(function () {
  "use strict";

  var CFG = window.FUNIL_CONFIG || {};

  function makeBodySvg(type) {
    var paths = {
      hourglass: '<path d="M44 20 C58 20 62 32 54 48 C47 60 47 66 56 80 C64 94 58 114 44 114 C30 114 24 94 32 80 C41 66 41 60 34 48 C26 32 30 20 44 20 Z" fill="#E8D3B9" stroke="#6E1423" stroke-width="2.5"/>',
      inverted:  '<path d="M44 20 C64 20 66 34 55 50 C49 60 48 72 51 86 C54 100 50 114 44 114 C38 114 34 100 37 86 C40 72 39 60 33 50 C22 34 24 20 44 20 Z" fill="#E8D3B9" stroke="#6E1423" stroke-width="2.5"/>',
      rectangle: '<path d="M44 20 C57 20 58 34 55 52 C53 66 54 82 55 98 C56 108 51 114 44 114 C37 114 32 108 33 98 C34 82 35 66 33 52 C30 34 31 20 44 20 Z" fill="#E8D3B9" stroke="#6E1423" stroke-width="2.5"/>',
      oval:      '<path d="M44 20 C56 20 62 38 62 60 C62 82 55 114 44 114 C33 114 26 82 26 60 C26 38 32 20 44 20 Z" fill="#E8D3B9" stroke="#6E1423" stroke-width="2.5"/>',
      pear:      '<path d="M44 20 C53 20 55 32 51 48 C48 60 56 72 62 88 C66 102 58 114 44 114 C30 114 22 102 26 88 C32 72 40 60 37 48 C33 32 35 20 44 20 Z" fill="#E8D3B9" stroke="#6E1423" stroke-width="2.5"/>'
    };
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 132">' +
      '<rect width="88" height="132" rx="14" fill="#FBF6EE"/>' +
      '<circle cx="44" cy="11" r="6" fill="#6E1423"/>' +
      (paths[type] || paths.hourglass) +
      '<line x1="22" y1="62" x2="66" y2="62" stroke="#DDA94B" stroke-width="1.6" stroke-dasharray="3 3"/>' +
      '</svg>';
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  /* ---------------- 14 Mosso-Aligned US Quiz Steps ---------------- */
  var QUESTIONS = [
    {
      id: "age",
      title: "Learn which colors & shapes flatter you most",
      sub: "Get personal style insights, virtual try-on tools, and daily outfit formulas—select your age to start:",
      layout: "gridimg",
      options: [
        { id: "18-29", label: "18–29", img: "assets/img/age-18-29.jpg" },
        { id: "30-39", label: "30–39", img: "assets/img/age-30-39.jpg" },
        { id: "40-49", label: "40–49", img: "assets/img/age-40-49.jpg" },
        { id: "50+",   label: "50+",   img: "assets/img/age-50-plus.jpg" }
      ]
    },
    {
      id: "undertone",
      title: "Step 1 of Color Analysis: How do the veins on your inner wrist look in daylight?",
      sub: "Your undertone determines which shades make your skin look rested and radiant—and which wash you out.",
      options: [
        { id: "warm",    ico: "☀️", label: "Mostly greenish or olive", small: "Classic sign of golden / warm undertones" },
        { id: "cool",    ico: "❄️", label: "Blue or slightly purple", small: "Classic sign of cool / rosy undertones" },
        { id: "neutral", ico: "✨", label: "A mix of blue & green — hard to tell", small: "Balanced neutral undertone" },
        { id: "deep",    ico: "🌿", label: "Subtle / deep rich complexion", small: "Warm-neutral or deep radiant tone" }
      ]
    },
    {
      id: "jewelry",
      title: "The Jewelry Test: Which metal makes your skin look brighter and healthier?",
      sub: "Don't think about what you own most—think about which one makes your face glow instantly.",
      options: [
        { id: "gold",   ico: "🥇", label: "Yellow Gold gives me an instant warm glow" },
        { id: "silver", ico: "🥈", label: "Silver, Platinum, or White Gold looks crispest" },
        { id: "both",   ico: "💫", label: "Rose Gold — or honestly both flatter me equally" }
      ]
    },
    {
      id: "contrast",
      title: "Which combination is closest to your natural hair & eye contrast?",
      sub: "Stylists use contrast level to pick your best neutrals (whether stark black/white overpowers you or makes you shine).",
      options: [
        { id: "high",  ico: "🖤", label: "High Contrast", small: "Dark brown/black hair + fair/medium skin or bright eyes" },
        { id: "warm",  ico: "🍂", label: "Rich & Golden", small: "Warm brunette, chestnut, auburn, or honey tones + hazel/brown eyes" },
        { id: "muted", ico: "🕊️", label: "Soft & Muted", small: "Ash blonde, light brown, or silver/gray hair + soft blue/green/hazel eyes" },
        { id: "light", ico: "🌼", label: "Light & Clear", small: "Blonde or light brown hair + clear blue, green, or light amber eyes" }
      ]
    },
    {
      id: "colorPain",
      title: "Have you ever bought a top you loved on the hanger, only to feel 'washed out' wearing it?",
      sub: "There are no wrong answers—this helps us tailor your shopping & closet filter.",
      insight: "💡 <strong>Stylist Fact:</strong> 78% of women default to black because other colors felt 'off'—yet for 3 out of 4 undertones, espresso, navy, or burgundy near the face takes 5 years off instantly.",
      options: [
        { id: "always",    ico: "🙋‍♀️", label: "Yes, constantly — so I default to safe black or gray!" },
        { id: "sometimes", ico: "🛍️", label: "Sometimes — choosing colors in stores feels like guesswork" },
        { id: "cohesive",  ico: "🎨", label: "Occasionally — I just want my whole closet to mix effortlessly" }
      ]
    },
    {
      id: "corpo",
      title: "Dress for your proportions, not rigid rules. Which silhouette feels closest to yours?",
      sub: "Swipe sideways to view all options — we focus on effortless visual balance.",
      layout: "corpo",
      options: [
        { id: "ampulheta",  label: "Hourglass",         small: "Defined waist, balanced bust & hips", imgData: makeBodySvg("hourglass") },
        { id: "tinvertido", label: "Inverted Triangle", small: "Shoulders slightly broader than hips", imgData: makeBodySvg("inverted") },
        { id: "retangular", label: "Rectangle",         small: "Clean, straight athletic lines", imgData: makeBodySvg("rectangle") },
        { id: "oval",       label: "Soft Midsection",   small: "Fullness through the center, great legs", imgData: makeBodySvg("oval") },
        { id: "triangulo",  label: "Pear / Curvy Hips", small: "Hips fuller than shoulders", imgData: makeBodySvg("pear") },
        { id: "naosei",     ico: "✨", label: "Not 100% sure — calculate my best cuts for me" }
      ]
    },
    {
      id: "medidas",
      type: "medidas",
      title: "What are your height and approximate weight?",
      sub: "Exact hemline, rise, and 3rd-piece lengths change completely between 5'2\" and 5'8\"—let's calibrate yours."
    },
    {
      id: "focusGoals",
      type: "multi",
      title: "What do you want your everyday outfits to effortlessly do for you?",
      sub: "Select as many as you like:",
      options: [
        { id: "waist",   ico: "⏳", label: "Define my waist naturally without tight, restrictive clothes" },
        { id: "legs",    ico: "👠", label: "Make my legs look longer (even in flat sneakers or loafers!)" },
        { id: "skim",    ico: "🌬️", label: "Skim smoothly & comfortably over my midsection" },
        { id: "polish",  ico: "✨", label: "Look 'Quiet Luxury' polished in under 5 minutes" }
      ]
    },
    {
      id: "closetStress",
      title: "From closet stress to outfit clarity: which sounds most like your mornings?",
      sub: "Most women own plenty of clothes—they're just missing the system that connects them.",
      options: [
        { id: "nothing", ico: "🚪", label: "Closet full of clothes, yet 'I have nothing to wear'" },
        { id: "repeat",  ico: "🔁", label: "I rotate the exact same 4–5 safe outfits every week" },
        { id: "shifted", ico: "🦋", label: "My body or lifestyle changed and my wardrobe feels stuck" },
        { id: "orphan",  ico: "🏷️", label: "Too many 'orphan pieces' with tags still on that match nothing" }
      ]
    },
    {
      id: "pecas",
      title: "Roughly how many everyday pieces (tops, bottoms, dresses, jackets) are in your closet?",
      sub: "A quick ballpark is perfect—we'll calculate your hidden outfit count.",
      layout: "chips",
      options: [
        { id: "p20", label: "Under 25 pieces" },
        { id: "p35", label: "25 to 45 pieces" },
        { id: "p60", label: "45 to 75 pieces" },
        { id: "p85", label: "75+ pieces" }
      ]
    },
    {
      id: "uso",
      title: "Be honest: how much of your closet do you actually wear in a normal month?",
      sub: "Studies show the average American woman wears only 20% of her wardrobe.",
      insight: "✨ <strong>Good news:</strong> Unlocking just 10 neglected items in your right color palette can create 45+ brand-new outfits without spending $1 at the mall.",
      options: [
        { id: "u20", ico: "🙈", label: "Barely 20% — most hangers sit untouched" },
        { id: "u30", ico: "🤷‍♀️", label: "Around 30% — I stick to what feels safe" },
        { id: "u50", ico: "⚖️", label: "About half (50%)" },
        { id: "u80", ico: "🌟", label: "Most of it — I just want fresher combinations" }
      ]
    },
    {
      id: "estilo",
      title: "Which aesthetic feels most like the 'best-dressed version' of you?",
      sub: "Pick the vibe that makes you feel naturally confident—not costumed.",
      options: [
        { id: "classica",  ico: "🥂", label: "Quiet Luxury / Timeless Classic", small: "Tailored trousers, crisp shirts, camel, ivory & gold" },
        { id: "moderna",   ico: "🧥", label: "Effortless Modern Chic", small: "Great dark denim, structured blazer, loafers or white sneakers" },
        { id: "romantica", ico: "🌸", label: "Soft & Feminine", small: "Draped blouses, satin midi skirts, warm flattering tones" },
        { id: "casual",    ico: "👟", label: "Elevated Everyday Casual", small: "Cozy knits, breathable fabrics, polished comfort" },
        { id: "criativa",  ico: "🎨", label: "Bold & Editorial", small: "Rich jewel tones, statement layers, artistic flair" }
      ]
    },
    {
      id: "ocasioes",
      type: "multi",
      title: "Where do you need your outfits to work hardest right now?",
      sub: "Select all that apply to your week:",
      options: [
        { id: "work",    ico: "💼", label: "Work / Hybrid Office / Meetings" },
        { id: "casual",  ico: "☕", label: "Everyday Errands, Brunch & Kids/Family" },
        { id: "date",    ico: "🍷", label: "Date Nights & Dinners Out" },
        { id: "travel",  ico: "✈️", label: "Travel & Carry-On Weekends" },
        { id: "events",  ico: "🥂", label: "Special Events, Weddings & Gatherings" }
      ]
    },
    {
      id: "sentir",
      ticket: true,
      title: "Last step! When you get dressed in 4 minutes knowing your colors & fit are 100% spot-on, what matters most?",
      sub: "Your Personal Color Palette & Style Report are ready to unlock!",
      options: [
        { id: "confiante", ico: "💫", label: "Walking into any room feeling radiant & put-together" },
        { id: "tempo",     ico: "⏱️", label: "Calm, effortless mornings with zero mirror stress" },
        { id: "economia",  ico: "💳", label: "Saving $1,000s by loving what I already own" },
        { id: "elogios",   ico: "🥰", label: "Hearing 'You look amazing!' without trying hard" }
      ]
    }
  ];

  /* ---------------- 12-Season Color Palette Engine ---------------- */
  var COLOR_SEASONS = {
    soft_autumn: {
      name: "Soft Warm Autumn",
      metal: "Brushed Gold & Champagne",
      desc: "Warm, velvety earth tones and creamy neutrals bring out an instant 'lit-from-within' warmth in your complexion.",
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
      name: "Deep Cool Winter",
      metal: "Silver, Platinum & White Gold",
      desc: "Rich jewel tones and crisp high-contrast neutrals frame your features with striking clarity and polish.",
      swatches: [
        { name: "Crisp White", hex: "#FAFAFA" },
        { name: "True Black",  hex: "#1C1B1E" },
        { name: "Deep Berry",  hex: "#72142E" },
        { name: "Midnight Navy", hex: "#1B2A4A" },
        { name: "Emerald",     hex: "#165B4C" },
        { name: "Charcoal",    hex: "#4A4E54" }
      ],
      avoid: "Muted yellowish beige & pale orange (swap for Crisp White & Berry)"
    },
    warm_spring: {
      name: "Light Warm Spring",
      metal: "Yellow Gold & Warm Pearl",
      desc: "Fresh, sunlit neutrals paired with clear warm accents make your skin look energized, youthful, and rested.",
      swatches: [
        { name: "Cream Silk",  hex: "#FFF8E7" },
        { name: "Warm Sand",   hex: "#DFC59E" },
        { name: "Coral Rose",  hex: "#D96B5C" },
        { name: "Warm Navy",   hex: "#283C5F" },
        { name: "Soft Camel",  hex: "#CCA06E" },
        { name: "Olive Leaf",  hex: "#6D8252" }
      ],
      avoid: "Heavy head-to-toe black & muddy gray (swap for Warm Navy & Cream)"
    },
    cool_summer: {
      name: "Soft Cool Summer",
      metal: "Silver, Rose Gold & Pearl",
      desc: "Refined, cool-toned neutrals and dusty rose/navy hues harmonize effortlessly with your natural softness without overpowering you.",
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
    var c = a.contrast || "warm";

    var isCool = (u === "cool") || (j === "silver" && u !== "warm");
    if (isCool) {
      return (c === "high" || u === "deep") ? COLOR_SEASONS.deep_winter : COLOR_SEASONS.cool_summer;
    }
    return (c === "light") ? COLOR_SEASONS.warm_spring : COLOR_SEASONS.soft_autumn;
  }

  var ARCHETYPES = {
    classica: {
      name: "Quiet Luxury Classic",
      tag: "Effortless tailoring, rich neutrals, and timeless pieces that always look expensive.",
      desc: "Your sweet spot is clean lines, structured layers, and tonal harmony. With the right 15 core pieces in your seasonal palette, getting dressed takes under 4 minutes.",
      img: "assets/img/ba-us-3.jpg"
    },
    moderna: {
      name: "Effortless Modern Chic",
      tag: "Polished comfort: great denim, tailored third pieces, and smart hi-lo styling.",
      desc: "You look incredible when crisp tailoring meets relaxed everyday ease—like pairing dark straight-leg jeans with an ivory blouse, camel blazer, and clean sneakers or loafers.",
      img: "assets/img/ba-us-2.jpg"
    },
    romantica: {
      name: "Refined Feminine",
      tag: "Fluid movement, flattering waist definition, and warm approachable elegance.",
      desc: "Soft drapes, satin midi skirts, wrap necklines, and warm luminous colors highlight your features without ever feeling overdone.",
      img: "assets/img/ba-us-1.jpg"
    },
    casual: {
      name: "Elevated Everyday Chic",
      tag: "Zero-fuss comfort upgraded with intentional color harmony and proportion.",
      desc: "You value real-life comfort first. By swapping random basics for calibrated cuts in your exact color palette, even errands look effortlessly put-together.",
      img: "assets/img/ba-us-2.jpg"
    },
    criativa: {
      name: "Editorial Statement",
      tag: "Confident color accents grounded by smart capsule neutrals.",
      desc: "You shine when a clean neutral base lets one rich focal color or texture steal the spotlight—polished, memorable, and authentically you.",
      img: "assets/img/ba-us-1.jpg"
    }
  };

  /* ---------------- Preloader ---------------- */
  var ALL_IMGS = [
    "assets/img/hero-collage-en.jpg",
    "assets/img/age-18-29.jpg",
    "assets/img/age-30-39.jpg",
    "assets/img/age-40-49.jpg",
    "assets/img/age-50-plus.jpg",
    "assets/img/app-hero-en.jpg",
    "assets/img/ba-us-1.jpg",
    "assets/img/ba-us-2.jpg",
    "assets/img/ba-us-3.jpg",
    "assets/img/bundle-vip-en.jpg"
  ];

  function startWarmup() {
    setTimeout(function () {
      ALL_IMGS.forEach(function (src) {
        var im = new Image();
        im.decoding = "async";
        im.src = src;
      });
    }, 150);
  }

  /* ---------------- US Imperial Helpers (ft/in & lbs) ---------------- */
  var H_MIN = 58, H_MAX = 73, H_DEF = 65; // 4'10" to 6'1", default 5'5"
  var W_MIN = 95, W_MAX = 280, W_DEF = 145; // lbs

  function formatFeetInches(totalIn) {
    var ft = Math.floor(totalIn / 12);
    var inch = totalIn % 12;
    return ft + "'" + inch + '"';
  }

  function describeUSProportions(inches, lbs) {
    var ftStr = formatFeetInches(inches);
    if (inches <= 63) {
      return {
        badge: "✦ Petite Elongation Ratio",
        tip: "At <strong>" + ftStr + "</strong>, high-rise bottoms + a gentle front 'French tuck' and low-contrast footwear create a continuous vertical line that adds 2–3 visual inches—even in flats."
      };
    }
    if (inches <= 67) {
      return {
        badge: "✦ Balanced Golden-Ratio Fit",
        tip: "At <strong>" + ftStr + "</strong>, the <strong>1/3 top to 2/3 leg rule</strong> is your superpower—cropped or hip-bone blazers and midi hems hitting mid-calf will flatter you effortlessly."
      };
    }
    return {
      badge: "✦ Statuesque Tailored Drape",
      tip: "At <strong>" + ftStr + "</strong>, wide-leg tailored trousers, longer relaxed blazers, and intentional color-blocking celebrate your natural vertical presence."
    };
  }

  /* ---------------- State & DOM ---------------- */
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
    try { window.scrollTo({ top: 0, behavior: "instant" }); } catch (e) { window.scrollTo(0, 0); }
  }

  /* ---------------- Meta Pixel (USD Full-Funnel Tracking) ---------------- */
  var STANDARD_FB_EVENTS = { PageView: 1, ViewContent: 1, Lead: 1, InitiateCheckout: 1, Purchase: 1 };

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
    return qs ? base + (base.indexOf("?") === -1 ? "?" : "&") + qs : base;
  }

  function handleCheckoutClick(plan) {
    var pl = (plan || state.plan || "vip").toLowerCase();
    var val = pl === "basic" ? 14.00 : 27.00;
    track("InitiateCheckout", {
      content_name: pl === "basic" ? "Lumina Basic Style Guide ($14)" : "Lumina VIP Lifetime Bundle + 3 Free Bonuses ($27)",
      content_ids: [pl],
      content_type: "product",
      value: val,
      currency: "USD"
    });

    var dest = offerUrl(pl);
    if (!dest || dest.charAt(0) === "#") {
      var info = $("#setupModalPlanInfo");
      if (info) info.textContent = (pl === "basic" ? "Basic Plan ($14.00 USD)" : "VIP Lifetime Bundle ($27.00 USD)");
      var sm = $("#checkoutSetupModal");
      if (sm) sm.hidden = false;
      return;
    }
    window.location.href = dest;
  }

  /* ---------------- Progress & Header ---------------- */
  function setHeaderMode(mode) {
    var isResult = mode === "result";
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

  /* ---------------- Step 7: US Imperial Proportions UI ---------------- */
  function renderMedidasQuestion(q) {
    var saved = state.answers.medidas || { inches: H_DEF, lbs: W_DEF };
    var current = { inches: saved.inches || H_DEF, lbs: saved.lbs || W_DEF };
    var diag = describeUSProportions(current.inches, current.lbs);

    var html = '<div class="quiz__step">' +
      '<div class="quiz__head">' +
        '<h2 class="quiz__title">' + q.title + '</h2>' +
        '<p class="quiz__sub">' + q.sub + '</p>' +
      '</div>' +
      '<div class="medidas">' +
        '<div class="med-card">' +
          '<div class="med-card__top">' +
            '<span class="med-card__label"><i aria-hidden="true">📏</i> Your Height</span>' +
            '<div class="med-card__valwrap">' +
              '<strong class="med-card__big" id="lblHeightFt">' + formatFeetInches(current.inches) + '</strong>' +
              '<small id="lblHeightCm">(' + Math.round(current.inches * 2.54) + ' cm)</small>' +
            '</div>' +
          '</div>' +
          '<div class="med-ctrl">' +
            '<button type="button" class="med-step" data-target="inches" data-delta="-1" aria-label="Decrease height">−</button>' +
            '<input type="range" class="med-range" id="rngHeight" min="' + H_MIN + '" max="' + H_MAX + '" step="1" value="' + current.inches + '">' +
            '<button type="button" class="med-step" data-target="inches" data-delta="1" aria-label="Increase height">+</button>' +
          '</div>' +
          '<div class="med-scale"><span>4\'10"</span><span>5\'5"</span><span>6\'1"</span></div>' +
        '</div>' +

        '<div class="med-card">' +
          '<div class="med-card__top">' +
            '<span class="med-card__label"><i aria-hidden="true">⚖️</i> Approximate Weight</span>' +
            '<div class="med-card__valwrap">' +
              '<strong class="med-card__big" id="lblWeightLbs">' + current.lbs + '</strong>' +
              '<span class="med-card__unit">lbs</span>' +
            '</div>' +
          '</div>' +
          '<div class="med-ctrl">' +
            '<button type="button" class="med-step" data-target="lbs" data-delta="-2" aria-label="Decrease weight">−</button>' +
            '<input type="range" class="med-range" id="rngWeight" min="' + W_MIN + '" max="' + W_MAX + '" step="1" value="' + current.lbs + '">' +
            '<button type="button" class="med-step" data-target="lbs" data-delta="2" aria-label="Increase weight">+</button>' +
          '</div>' +
          '<div class="med-scale"><span>95 lbs</span><span>170 lbs</span><span>280 lbs</span></div>' +
        '</div>' +

        '<div class="med-fit" id="medFitBox" aria-live="polite">' +
          '<div class="med-fit__badges"><span class="med-badge" id="medBadge">' + diag.badge + '</span></div>' +
          '<p class="med-fit__tip" id="medTip">' + diag.tip + '</p>' +
        '</div>' +
      '</div>' +
      '<p class="med-privacy">🔒 100% private — used solely to calibrate your garment lengths &amp; proportions.</p>' +
      '<button type="button" class="btn btn--primary quiz__next show" id="btnMedidasNext">Save My Proportions &amp; Continue →</button>' +
    '</div>';

    $("#quizBox").innerHTML = html;
    $("#btnBack").style.visibility = "visible";

    var rngH = $("#rngHeight"), rngW = $("#rngWeight");
    function sync(field, val) {
      if (field === "inches") {
        current.inches = Math.max(H_MIN, Math.min(H_MAX, parseInt(val, 10) || H_DEF));
        rngH.value = current.inches;
        $("#lblHeightFt").textContent = formatFeetInches(current.inches);
        $("#lblHeightCm").textContent = "(" + Math.round(current.inches * 2.54) + " cm)";
      } else {
        current.lbs = Math.max(W_MIN, Math.min(W_MAX, parseInt(val, 10) || W_DEF));
        rngW.value = current.lbs;
        $("#lblWeightLbs").textContent = String(current.lbs);
      }
      var d = describeUSProportions(current.inches, current.lbs);
      $("#medBadge").textContent = d.badge;
      $("#medTip").innerHTML = d.tip;
    }

    rngH.addEventListener("input", function () { sync("inches", rngH.value); });
    rngW.addEventListener("input", function () { sync("lbs", rngW.value); });
    $$("#quizBox .med-step").forEach(function (b) {
      b.addEventListener("click", function () {
        var t = b.dataset.target;
        var dl = parseInt(b.dataset.delta, 10) || 0;
        sync(t, current[t] + dl);
      });
    });

    $("#btnMedidasNext").addEventListener("click", function () {
      state.answers.medidas = { inches: current.inches, lbs: current.lbs };
      track("QuizProportionsSaved", { height_in: current.inches, weight_lbs: current.lbs });
      advance();
    });
  }

  /* ---------------- Render Quiz Steps ---------------- */
  function hydrateOrRenderQuestion(useSSR) {
    state.locked = false;
    setHeaderMode("quiz");
    var q = QUESTIONS[state.i];
    setProgress(state.i);
    var box = $("#quizBox");

    if (useSSR && state.i === 0 && box && box.dataset.ssr === "age") {
      box.removeAttribute("data-ssr");
      $("#btnBack").style.visibility = "hidden";
      $$("#quizBox .opt").forEach(function (el) {
        el.addEventListener("click", function () { onOption(q, el); });
      });
      return;
    }

    if (q.type === "medidas") {
      renderMedidasQuestion(q);
      return;
    }

    var first = state.i === 0;
    var html = "";
    if (first) {
      html += '<div class="trust-strip"><span class="trust-stars">★★★★★</span><span><strong>4.9/5</strong> · Trusted by 128,400+ Women · 60-Sec Quiz</span></div>';
      html += '<div class="quiz__mosaic"><img src="assets/img/hero-collage-en.jpg" alt="Personal color swatches & Lumina Style AI" decoding="sync"></div>';
    }

    var milestones = {
      3:  "🎨 Great! Finishing your Seasonal Color Analysis…",
      6:  "✨ Halfway there! Mapping your best silhouettes…",
      10: "👗 Almost done! Calculating your closet's hidden outfits…",
      13: "🎁 Final step to unlock your Color Palette & Style Report!"
    };
    if (milestones[state.i]) {
      html += '<div class="quiz__milestone">' + milestones[state.i] + '</div>';
    }

    html += '<div class="quiz__head">' +
      '<h2 class="quiz__title">' + q.title + '</h2>' +
      (q.sub ? '<p class="quiz__sub">' + q.sub + '</p>' : '') +
      '</div>';

    if (q.insight) {
      html += '<div class="quiz__insight-card"><span>✨</span><div>' + q.insight + '</div></div>';
    }

    var prevAns = state.answers[q.id];
    var layoutClass = q.layout === "chips" ? " opts--chips"
      : q.layout === "gridimg" ? " opts--gridimg"
      : q.layout === "corpo" ? " opts--corpo" : "";

    html += '<div class="opts' + layoutClass + '">';
    var isChip = q.layout === "chips";

    q.options.forEach(function (o) {
      var imgSrc = o.imgData || o.img;
      var isImg = !!imgSrc;
      var imgClass = isImg ? (q.layout === "corpo" ? " opt--img opt--corpo" : " opt--img")
        : (q.layout === "corpo" ? " opt--corpo-fallback" : "");
      var isSel = q.type === "multi" ? (Array.isArray(prevAns) && prevAns.indexOf(o.id) !== -1) : prevAns === o.id;

      html += '<button type="button" class="opt' + imgClass + (isChip ? " opt--chip" : "") + (isSel ? " selected" : "") + '" data-id="' + o.id + '">' +
        (isImg
          ? '<img src="' + imgSrc + '" alt="' + o.label + '" decoding="sync">'
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
      html += '<p class="quiz__consent">Takes under 60 seconds · No wrong answers · By continuing, you agree to our <a href="#terms">Terms</a> &amp; <a href="#privacy">Privacy Policy</a>.</p>';
    }

    box.innerHTML = '<div class="quiz__step">' + html + '</div>';
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

  /* ---------------- Interactive Mobile Scratch-Off Pass ---------------- */
  var scratchDone = false;
  var cleanupScratch = null;

  function openTicket() {
    if (cleanupScratch) { cleanupScratch(); cleanupScratch = null; }
    var modal = $("#ticketModal");
    modal.hidden = false;
    document.body.classList.add("no-scroll");
    $("#ticketNext").hidden = true;
    $("#scratchHint").textContent = "Swipe your finger across the gold card 👆";
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
    ctx.fillText("Swipe to reveal your VIP Founder Pass", w / 2, h / 2 + 15);

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
      $("#scratchHint").textContent = "🎉 93% OFF + $291 in VIP Bonuses Unlocked!";
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

    function onTS(e) { if (scratchDone) return; if (e.cancelable) e.preventDefault(); drawing = true; lastPt = null; if (e.touches[0]) scratchSegment(posFromClient(e.touches[0].clientX, e.touches[0].clientY)); }
    function onTM(e) { if (!drawing || scratchDone) return; if (e.cancelable) e.preventDefault(); if (e.touches[0]) scratchSegment(posFromClient(e.touches[0].clientX, e.touches[0].clientY)); }
    function onTE() { drawing = false; lastPt = null; }
    function onMD(e) { if (scratchDone) return; e.preventDefault(); drawing = true; lastPt = null; scratchSegment(posFromClient(e.clientX, e.clientY)); }
    function onMM(e) { if (!drawing || scratchDone) return; scratchSegment(posFromClient(e.clientX, e.clientY)); }
    function onMU() { drawing = false; lastPt = null; }

    cv.style.pointerEvents = "auto";
    cv.addEventListener("touchstart", onTS, { passive: false });
    cv.addEventListener("touchmove", onTM, { passive: false });
    cv.addEventListener("touchend", onTE, { passive: true });
    cv.addEventListener("mousedown", onMD);
    window.addEventListener("mousemove", onMM);
    window.addEventListener("mouseup", onMU);

    cleanupScratch = function () {
      cv.removeEventListener("touchstart", onTS);
      cv.removeEventListener("touchmove", onTM);
      cv.removeEventListener("touchend", onTE);
      cv.removeEventListener("mousedown", onMD);
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("mouseup", onMU);
    };
  }

  function confetti() {
    var box = $("#confettiBox");
    box.innerHTML = "";
    var colors = ["#6E1423", "#8A2334", "#C9B491", "#E5D7BE", "#FFFDF9", "#D9A441"];
    for (var i = 0; i < 68; i++) {
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
      setTimeout(function () { li.classList.add("done"); }, 220 + idx * 310);
    });
    setTimeout(function () { showResult(true); }, 220 + steps.length * 310 + 300);
  }

  /* ---------------- Crisp Retina Bonus Mockups (100% English) ---------------- */
  function renderBonusMockupHtml(type) {
    if (type === "suitcase") {
      return '<div class="bcard__ui">' +
        '<div class="bcard__ui-top"><span>✈️ SMART CARRY-ON PLANNER</span><span>5 DAYS · 8 PIECES</span></div>' +
        '<div class="bcard__ui-screen">' +
          '<div style="font-weight:800;color:#6E1423;margin-bottom:5px">Weekend &amp; Work Trip Capsule</div>' +
          '<div style="display:grid;gap:4px;font-size:10.5px">' +
            '<div style="background:#FBF6EE;padding:4px 7px;border-radius:6px"><b>Day 1:</b> Ivory Shirt + Dark Jeans + Camel Blazer</div>' +
            '<div style="background:#FBF6EE;padding:4px 7px;border-radius:6px"><b>Day 2:</b> Silk Tank + Sand Trousers + Loafers</div>' +
            '<div style="background:#FBF6EE;padding:4px 7px;border-radius:6px"><b>Day 3:</b> Black Turtleneck + Satin Midi Skirt</div>' +
          '</div>' +
        '</div>' +
        '<div class="bcard__ui-foot">✓ Zero Overpacking · Tap to Preview</div>' +
      '</div>';
    }
    if (type === "closet") {
      return '<div class="bcard__ui">' +
        '<div class="bcard__ui-top"><span>👗 AI DIGITAL CLOSET</span><span>15 → 150 OUTFITS</span></div>' +
        '<div class="bcard__ui-screen">' +
          '<div style="font-weight:800;color:#6E1423;margin-bottom:5px">Auto-Color Recognition by Photo</div>' +
          '<div style="display:flex;gap:5px;margin-bottom:6px">' +
            '<span style="width:20px;height:20px;border-radius:50%;background:#F6EFE2;border:1px solid #ccc"></span>' +
            '<span style="width:20px;height:20px;border-radius:50%;background:#C69C6D"></span>' +
            '<span style="width:20px;height:20px;border-radius:50%;background:#6E1423"></span>' +
            '<span style="width:20px;height:20px;border-radius:50%;background:#1E2D4A"></span>' +
          '</div>' +
          '<div style="background:#EEFBF3;color:#117A3E;font-weight:800;padding:5px 7px;border-radius:6px;font-size:10.5px">⚡ 94% Closet Utilization Unlocked</div>' +
        '</div>' +
        '<div class="bcard__ui-foot">✓ Snap Photos or Use Capsule · Tap to Preview</div>' +
      '</div>';
    }
    return '<div class="bcard__ui">' +
      '<div class="bcard__ui-top"><span>🪞 VIRTUAL OUTFIT TRY-ON</span><span>97% HARMONY</span></div>' +
      '<div class="bcard__ui-screen">' +
        '<div style="font-weight:800;color:#6E1423;margin-bottom:5px">Mix &amp; Preview Before Dressing</div>' +
        '<div style="display:grid;gap:4px;font-size:10.5px">' +
          '<div style="background:#FBF6EE;padding:4px 7px;border-radius:6px">‹ 🧥 Tailored Sand Blazer ›</div>' +
          '<div style="background:#FBF6EE;padding:4px 7px;border-radius:6px">‹ 👚 Burgundy Silk Blouse ›</div>' +
          '<div style="background:#FBF6EE;padding:4px 7px;border-radius:6px">‹ 👖 High-Rise Cream Trousers ›</div>' +
        '</div>' +
      '</div>' +
      '<div class="bcard__ui-foot">✓ Save &amp; Export Look Cards · Tap to Preview</div>' +
    '</div>';
  }

  /* ---------------- Personalized Style & Color Report + Offer ---------------- */
  function showResult(fromQuiz) {
    var a = state.answers;
    var season = computeColorSeason(a);
    var arch = ARCHETYPES[a.estilo] || ARCHETYPES.moderna;
    var med = a.medidas || { inches: H_DEF, lbs: W_DEF };
    var propDiag = describeUSProportions(med.inches, med.lbs);

    var pecasMap = { p20: 22, p35: 35, p60: 58, p85: 82 };
    var usoMap = { u20: 0.2, u30: 0.3, u50: 0.5, u80: 0.78 };
    var totalPieces = pecasMap[a.pecas] || 35;
    var usedRatio = usoMap[a.uso] || 0.25;
    var unworn = Math.max(6, Math.round(totalPieces * (1 - usedRatio)));
    var outfitsUnlocked = Math.min(165, Math.max(95, totalPieces * 4));

    var occLabels = { work: "work & meetings", casual: "everyday casual", date: "date nights", travel: "carry-on travel", events: "special events" };
    var occText = (a.ocasioes || []).map(function (id) { return occLabels[id]; }).filter(Boolean).join(", ") || "everyday life, work & weekends";

    // Save quiz calibration so /app automatically imports her Color Season & Proportions!
    try {
      localStorage.setItem("lumina_quiz_result_v1", JSON.stringify({
        seasonName: season.name,
        swatches: season.swatches,
        metal: season.metal,
        heightIn: med.inches,
        style: a.estilo || "moderna",
        body: a.corpo || "ampulheta"
      }));
    } catch (e) {}

    var baSlides = [
      {
        src: "assets/img/ba-us-1.jpg",
        beforeBadge: "BEFORE: 70% Closet Unworn",
        afterBadge: "AFTER: 94% Color Harmony",
        alt: "Woman glowing in Soft Autumn burgundy blouse and cream tailored trousers",
        quote: "“I stopped buying random clearance tops and unlocked 40+ polished outfits from my own closet in one weekend!” — Sarah M., 36 (Austin, TX)"
      },
      {
        src: "assets/img/ba-us-2.jpg",
        beforeBadge: "BEFORE: 25 Min Morning Stress",
        afterBadge: "AFTER: Ready in 4 Minutes",
        alt: "Effortless modern chic outfit with dark straight-leg jeans, ivory shirt, sand blazer and white sneakers",
        quote: "“Seeing my colors and proportions side-by-side finally made 'effortless chic' click for me.” — Rachel K., 41 (Seattle, WA)"
      },
      {
        src: "assets/img/ba-us-3.jpg",
        beforeBadge: "BEFORE: Defaulting to All-Black",
        afterBadge: "AFTER: True Palette Glow",
        alt: "Elegant woman in navy wrap top and camel wide-leg trousers",
        quote: "“Three coworkers asked if I just came back from vacation—all I changed was wearing my true neckline & color palette!” — Lauren D., 48 (Charlotte, NC)"
      }
    ];

    var bonusItems = [
      {
        tag: "VIP BONUS #1 · INCLUDED FREE",
        title: "Smart Carry-On & 5-Day Outfit Planner",
        oldPrice: 87,
        mockType: "suitcase",
        desc: "Heading on a work trip, weekend getaway, or busy Monday–Friday? Pick your weather and days—the app packs 8–10 mix-and-match pieces into complete Day 1 to Day 7 outfits.",
        perks: [
          "Day-by-day visual itinerary so you never overpack a heavy suitcase again",
          "Automatically reuses shoes & third pieces across daytime and dinner looks",
          "1-tap outfit swap if your plans or weather change"
        ]
      },
      {
        tag: "VIP BONUS #2 · INCLUDED FREE",
        title: "AI Digital Closet & '15 Pieces → 150 Outfits' System",
        oldPrice: 107,
        mockType: "closet",
        desc: "Snap a quick photo of your clothes (our AI auto-detects the dominant shade!) or start immediately with our pre-loaded 15-Piece Quiet Luxury Capsule Matrix.",
        perks: [
          "Instant AI color-matching directly from your phone camera or photo library",
          "Interactive 15-Piece Capsule Checklist that unlocks up to 150 foolproof formulas",
          "Rule-of-3 Shopping Filter so you never waste money on 'orphan' pieces again"
        ]
      },
      {
        tag: "VIP BONUS #3 · INCLUDED FREE",
        title: "Virtual Outfit Try-On & Color Harmony Mirror",
        oldPrice: 97,
        mockType: "tryon",
        desc: "No more piling 12 rejected outfits onto your bed! Swipe tops, bottoms, blazers, shoes, and bags on screen with a live 0–99% Color & Proportion Harmony Score.",
        perks: [
          "Preview combinations in seconds before opening a single closet drawer",
          "Live proportion guidance calibrated to your exact " + formatFeetInches(med.inches) + " frame",
          "Export high-res Lookbook Cards to save on your phone for busy mornings"
        ]
      }
    ];

    var html = "";
    html += '<div class="result__unlocked">' +
      '<span class="result__unlocked-badge">🎉 Report Ready</span>' +
      '<span class="result__unlocked-txt"><strong>93% OFF Founder Pass</strong> + <strong>$291 in Free Bonuses</strong> Unlocked!</span>' +
      '</div>';

    /* 1. Genuine Personal Color Palette & Style Archetype Reveal */
    html += '<div class="palette-card">' +
      '<span class="palette-card__kicker">✦ Your Seasonal Color Direction</span>' +
      '<h2 class="palette-card__title">Your Palette: <em>' + season.name + '</em></h2>' +
      '<p class="palette-card__desc">' + season.desc + ' <strong>Best Jewelry Metal:</strong> ' + season.metal + '.</p>' +
      '<div class="swatch-grid">' +
        season.swatches.map(function (sw) {
          return '<div class="swatch">' +
            '<div class="swatch__chip" style="background:' + sw.hex + '"></div>' +
            '<strong>' + sw.name + '</strong>' +
          '</div>';
        }).join("") +
      '</div>' +
      '<div class="palette-avoid">⚠️ <strong>Shades Washing You Out:</strong> ' + season.avoid + '</div>' +
    '</div>';

    html += '<div class="result__top result__top--cta" id="resultFirstImg" role="button" tabindex="0" aria-label="Jump to VIP Lifetime Bundle ($27 One-Time)">' +
      '<img src="assets/img/app-hero-en.jpg" alt="Lumina Style AI App & Personal Color Swatch Fan" decoding="sync">' +
      '<span class="result__tapbadge">👆 Tap to Unlock App + 3 Free Bonuses ($27 Once)</span>' +
    '</div>';
    html += '<button type="button" class="btn btn--primary btn--lg result__appbtn pulse" id="btnApp">Unlock My Full Style App + 3 Free Bonuses →</button>';

    /* 2. Enlarged US Transformation Carousel (Zero Overlap) */
    html += '<section class="ba-sec" aria-label="Real member transformations">' +
      '<div class="ba-head">' +
        '<span class="ba-kicker">✦ Real Wardrobe Transformations</span>' +
        '<h3 class="ba-title">Women Who Switch to Intentional Styling <span class="ba-hl">Never Look Back!</span></h3>' +
      '</div>' +
      '<div class="ba-stage">' +
        '<div class="ba-viewport" id="baViewport">' +
          '<div class="ba-track" id="baTrack">' +
            baSlides.map(function (s, idx) {
              return '<div class="ba-slide' + (idx === 0 ? ' is-active' : '') + '" data-ba-idx="' + idx + '">' +
                '<div class="ba-badge-top">' +
                  '<span class="ba-pill ba-pill--before">' + s.beforeBadge + '</span>' +
                  '<span class="ba-pill ba-pill--after">' + s.afterBadge + '</span>' +
                '</div>' +
                '<img src="' + s.src + '" alt="' + s.alt + '" decoding="sync">' +
              '</div>';
            }).join("") +
          '</div>' +
        '</div>' +
        '<p class="ba-quote" id="baQuote">' + baSlides[0].quote + '</p>' +
        '<div class="ba-bar">' +
          '<button type="button" class="ba-btn" id="baPrev" aria-label="Previous transformation">' +
            '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>' +
          '</button>' +
          '<div class="ba-meta">' +
            '<div class="ba-dots" id="baDots">' +
              baSlides.map(function (_, idx) {
                return '<button type="button" class="ba-dot' + (idx === 0 ? ' active' : '') + '" data-ba-dot="' + idx + '" aria-label="Slide ' + (idx + 1) + '"></button>';
              }).join("") +
            '</div>' +
            '<span class="ba-count" id="baCount">1 of ' + baSlides.length + '</span>' +
          '</div>' +
          '<button type="button" class="ba-btn" id="baNext" aria-label="Next transformation">' +
            '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</section>';

    /* 3. Archetype + Closet Potential Stats */
    html += '<div class="profile-card">' +
      '<img src="' + arch.img + '" alt="' + arch.name + '" decoding="sync">' +
      '<div class="profile-card__body">' +
        '<span class="pill-mini" style="margin-bottom:6px">✦ YOUR STYLE ARCHETYPE</span>' +
        '<h3 class="profile-card__name">' + arch.name + '</h3>' +
        '<p class="profile-card__desc">' + arch.desc + '</p>' +
      '</div>' +
    '</div>';

    html += '<div class="stats">' +
      '<div class="stat"><div class="stat__num" data-count="' + totalPieces + '">0</div><div class="stat__label">pieces in your closet</div></div>' +
      '<div class="stat"><div class="stat__num" data-count="' + unworn + '">0</div><div class="stat__label">pieces sitting unworn</div></div>' +
      '<div class="stat stat--hero"><div class="stat__num" data-count="' + outfitsUnlocked + '">0</div><div class="stat__label">flattering outfits hiding in your closet right now</div></div>' +
    '</div>';

    html += '<div class="insights">' +
      '<div class="insight"><span class="ico">🎨</span><span><strong>Color Clarity:</strong> Swapping harsh shades near your face for your <strong>' + season.name + '</strong> neutrals gives an instant well-rested glow.</span></div>' +
      '<div class="insight"><span class="ico">📏</span><span><strong>Proportion Blueprint:</strong> ' + propDiag.tip + '</span></div>' +
      '<div class="insight"><span class="ico">✨</span><span><strong>Lifestyle Focus:</strong> Every daily outfit formula is tailored around <strong>' + occText + '</strong>.</span></div>' +
    '</div>';

    /* 4. US Price Comparison Anchor (Why pay $59.99/mo elsewhere?) */
    html += '<div class="vs-anchor">' +
      '<div class="vs-anchor__head">' +
        '<span>✦ Smart Value Comparison</span>' +
        '<h3>Why 128,400+ Women Ditched $59/mo Styling Subscriptions</h3>' +
      '</div>' +
      '<div class="vs-rows">' +
        '<div class="vs-row"><span>In-Person Seasonal Color Analysis</span><b>$297 – $400</b></div>' +
        '<div class="vs-row"><span>Personal Stylist Closet Audit</span><b>$350+ / session</b></div>' +
        '<div class="vs-row"><span>Other AI Styling Apps (Recurring Billing)</span><b>$59.99 / month</b></div>' +
        '<div class="vs-row vs-row--win"><span>👑 Lumina Style AI + All 3 VIP Bonuses</span><b>$27 ONCE · $0/mo Forever!</b></div>' +
      '</div>' +
    '</div>';

    /* 5. Shimmering 3 VIP Bonuses Stack ($291 Value -> $0.00 FREE) */
    html += '<section class="bstack" id="bonusStack" aria-label="Free VIP Bonuses">' +
      '<div class="bstack__glow" aria-hidden="true"></div>' +
      '<div class="bstack__head">' +
        '<span class="bstack__pill shimmer-badge">🎁 3 FREE VIP GIFTS UNLOCKED TODAY</span>' +
        '<h3 class="bstack__title">Unlock Your App Today &amp; Get All 3 VIP Tools <em>100% FREE!</em></h3>' +
        '<p class="bstack__sub">Sold separately for <strong><s>$291.00</s></strong> — when you grab your Founder Pass right now, all 3 premium tools are <strong>automatically unlocked for $0.00</strong> inside your member app:</p>' +
        '<div class="bstack__meter">' +
          '<div class="bstack__meter-top">' +
            '<span>✨ <b>3 of 3 VIP Gifts</b> added to your bundle</span>' +
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
              '<div class="bcard__media" data-zoom-mock="' + b.mockType + '" data-zoom-title="' + b.title + '" role="button" tabindex="0" aria-label="Preview ' + b.title + '" style="padding:6px;background:#2B0710">' +
                renderBonusMockupHtml(b.mockType) +
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
                '<div class="bcard__status"><span>✓</span> Included automatically with your VIP Lifetime Pass</div>' +
              '</div>' +
            '</div>' +
          '</article>';
        }).join("") +
      '</div>' +

      '<div class="bstack__summary shimmer-card">' +
        '<div class="bstack__sum-eyebrow">🎉 EVERYTHING YOU’RE GETTING FREE TODAY</div>' +
        '<div class="bstack__sum-rows">' +
          '<div class="bstack__sum-row"><span>🎁 Smart Carry-On &amp; 5-Day Planner</span><b><s>$87</s> → FREE</b></div>' +
          '<div class="bstack__sum-row"><span>🎁 AI Digital Closet + 15→150 Matrix</span><b><s>$107</s> → FREE</b></div>' +
          '<div class="bstack__sum-row"><span>🎁 Virtual Try-On &amp; Harmony Mirror</span><b><s>$97</s> → FREE</b></div>' +
        '</div>' +
        '<div class="bstack__sum-total">' +
          '<div><small>Total Bonus Value:</small><s>$291.00</s></div>' +
          '<div class="bstack__sum-zero"><small>You Pay For Bonuses:</small><strong>$0.00</strong></div>' +
        '</div>' +
        '<button type="button" class="btn btn--gold btn--lg bstack__cta" id="btnClaimBonuses">Claim App + $291 in Free Bonuses ($27 Once) →</button>' +
      '</div>' +
    '</section>';

    /* 6. Impulse One-Time Checkout Plans ($14 Basic vs $27 VIP Lifetime) */
    html += '<section class="offer" id="planos">' +
      '<p class="offer__kicker">✦ Founder Flash Offer · One-Time Payment</p>' +
      '<h3 class="offer__title">Unlock Your ' + season.name + ' Guide, App &amp; $291 in Bonuses</h3>' +
      '<p class="offer__copy">Pay <strong>once</strong>, own it <strong>forever</strong>. Zero monthly subscriptions, zero hidden charges—just effortless outfits from your own closet every single morning.</p>' +

      '<div class="plans" id="plansBox">' +
        '<div class="plan" data-plan="basic" tabindex="0" role="button" aria-pressed="false">' +
          '<span class="plan__radio"></span>' +
          '<h4 class="plan__name">Basic Starter</h4>' +
          '<p class="plan__for">Core Report &amp; Lessons Only (No VIP Tools)</p>' +
          '<div class="plan__price">' +
            '<span class="plan__from">Regularly <s>$79.00</s></span>' +
            '<div><strong>$14</strong><span> one-time</span></div>' +
            '<small>No recurring fees · Excludes 3 VIP Bonuses</small>' +
          '</div>' +
          '<ul class="plan__list">' +
            '<li style="--i:0">Personal Color &amp; Proportion Summary</li>' +
            '<li style="--i:1">7 Bite-Sized Styling Mini-Lessons</li>' +
          '</ul>' +
          '<button type="button" class="btn btn--ghost plan__btn" data-cta data-plan="basic">Get Basic Starter ($14 One-Time)</button>' +
        '</div>' +

        '<div class="plan plan--premium plan--sel" id="planPremium" data-plan="vip" tabindex="0" role="button" aria-pressed="true">' +
          '<span class="plan__flag shimmer-badge">⭐ Most Popular · 93% OFF + 3 Free Bonuses</span>' +
          '<div class="plan__shot"><img src="assets/img/bundle-vip-en.jpg" alt="Lumina Style AI Complete Lifetime VIP Bundle on iPhone, iPad and Lookbook" decoding="sync"></div>' +
          '<span class="plan__radio"></span>' +
          '<h4 class="plan__name">VIP Complete Lifetime</h4>' +
          '<p class="plan__for">Full App + Personal Color Swatches + All 3 VIP Bonuses</p>' +
          '<div class="plan__price">' +
            '<span class="plan__from">Total Value <s>$397.00</s> · Today Only</span>' +
            '<div><strong>$27</strong><span> ONE-TIME</span></div>' +
            '<small>✅ Pay Once, Keep Forever · $0/Month · Instant Access</small>' +
          '</div>' +
          '<div class="plan__bonus-pill">🎁 <strong>Includes $291 in FREE Bonuses</strong> (Try-On + AI Closet + Travel Planner)</div>' +
          '<ul class="plan__list">' +
            '<li style="--i:0">Complete <strong>' + season.name + '</strong> Digital Swatch Deck</li>' +
            '<li style="--i:1"><strong>Bonus #1:</strong> Smart Carry-On &amp; 5-Day Planner <em>(FREE)</em></li>' +
            '<li style="--i:2"><strong>Bonus #2:</strong> AI Closet + 15→150 Outfits Matrix <em>(FREE)</em></li>' +
            '<li style="--i:3"><strong>Bonus #3:</strong> Virtual Try-On &amp; Harmony Mirror <em>(FREE)</em></li>' +
            '<li style="--i:4">24/7 AI Stylist Chat + 7 Masterclass Lessons + Lifetime Updates</li>' +
          '</ul>' +
          '<button type="button" class="btn btn--cta plan__btn" data-cta data-plan="vip">Get Full Lifetime Access + 3 Bonuses ($27) →</button>' +
        '</div>' +
      '</div>' +

      '<div class="plan-loss" id="planLossNote" hidden>' +
        '<p>⚠️ <strong>Wait—are you sure?</strong> Basic Starter excludes <strong>$291.00 in VIP Tools</strong> (Virtual Try-On, AI Photo Closet, 15→150 Capsule Matrix &amp; Smart Packing Planner) for just a <strong>$13 difference</strong>!</p>' +
        '<button type="button" class="plan-loss__btn" id="btnRestorePremium">Switch Back to VIP Complete Lifetime ($27) ✨</button>' +
      '</div>' +

      '<div class="offer__timer">⏳ Your 93% OFF Founder Pass + $291 Free Bonuses reserved for <strong id="offerClock">15:00</strong></div>' +

      '<div class="offer__guarantee">' +
        '<span class="offer__g-ico">🛡️</span>' +
        '<div>' +
          '<strong>30-Day "Love Your Closet" 100% Money-Back Guarantee</strong>' +
          '<p>Try your Seasonal Color Swatches, Virtual Try-On Mirror, and 15→150 Outfit Formulas for a full 30 days. If you don’t feel more confident and save time every morning, email us for a fast, friendly 100% refund. Zero risk.</p>' +
        '</div>' +
      '</div>' +

      '<div class="offer__badges">' + (CFG.trustBadges || []).map(function (b) { return '<span>' + b + '</span>'; }).join("") + '</div>' +
    '</section>';

    /* 7. US Reviews + Buyer Objection-Crushing FAQ */
    var tsmList = CFG.testimonials || [];
    if (tsmList.length) {
      html += '<section class="social">' +
        '<h3 class="social__title">What Women Across the US Are Saying</h3>' +
        '<div class="social__grid">' +
          tsmList.map(function (t) {
            return '<blockquote class="tsm"><span class="stars">★★★★★</span><p>' + t.text + '</p><footer>' + t.name + '<small>' + t.context + '</small></footer></blockquote>';
          }).join("") +
        '</div></section>';
    }

    html += '<section class="faq-sec">' +
      '<h3 class="faq-sec__title">Frequently Asked Questions</h3>' +
      '<div class="faq-list">' +
        '<details class="faq-item" open><summary>Is $27 really a one-time payment with NO monthly subscription?</summary><p>Yes, 100%! Unlike other styling apps that charge $59.99 every 4 weeks, your Founder Pass today is a single one-time payment of $27 for lifetime access to the Lumina Style AI Web App and all 3 VIP Bonuses. You will never be billed again.</p></details>' +
        '<details class="faq-item"><summary>Do I need to buy new clothes to use Lumina Style AI?</summary><p>Not at all! The entire system is designed to multiply the clothes already hanging in your closet first. You can photograph your own pieces or use our pre-loaded 15-piece capsule templates right away.</p></details>' +
        '<details class="faq-item"><summary>How do I access the app after checkout?</summary><p>Instantly! Right after checkout, you receive immediate access to the Lumina Style AI Web App on iPhone, Android, tablet, or computer—and you can add it to your Home Screen in 1 tap with zero App Store hassle.</p></details>' +
        '<details class="faq-item"><summary>What if I’m over 45 or between sizes right now?</summary><p>Lumina was built for real women of every age (20s through 70s+) and changing bodies. Instead of rigid rules or teen trends, we calibrate proportions to your exact height and comfort preferences.</p></details>' +
      '</div>' +
    '</section>';

    $("#resultBox").innerHTML = html;

    if (fromQuiz) track("PageView");
    track("Lead", { content_name: "Style & Color Report - " + season.name, content_category: "US Style Quiz" });
    track("ViewContent", {
      content_name: "Lumina VIP Lifetime Offer - " + season.name,
      content_ids: ["vip", "basic"],
      content_type: "product",
      value: 27.00,
      currency: "USD"
    });

    $$("#resultBox [data-cta]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        handleCheckoutClick(btn.dataset.plan || state.plan);
      });
    });

    var plansBox = $("#plansBox");
    var planLossNote = $("#planLossNote");
    var selectPlan = function (id) {
      state.plan = id;
      $$("#plansBox .plan").forEach(function (p) {
        var on = p.dataset.plan === id;
        p.classList.toggle("plan--sel", on);
        p.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var s = $("#stickyCta [data-cta]");
      if (s) {
        s.innerHTML = id === "vip"
          ? "Get Full Lifetime Access + 3 Free Bonuses ($27) →"
          : "Get Basic Starter Without Bonuses ($14) →";
      }
      if (planLossNote) planLossNote.hidden = (id === "vip");
    };

    if (plansBox) {
      plansBox.addEventListener("click", function (e) {
        if (e.target.closest("[data-cta]")) return;
        var p = e.target.closest(".plan");
        if (p) selectPlan(p.dataset.plan);
      });
      var btnRestore = $("#btnRestorePremium");
      if (btnRestore) btnRestore.addEventListener("click", function () {
        selectPlan("vip");
        var prem = $("#planPremium");
        if (prem) prem.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      selectPlan("vip");
      plansBox.classList.add("inview");

      var clock = $("#offerClock");
      if (clock) {
        var end = Date.now() + 15 * 60 * 1000;
        var tick = setInterval(function () {
          var sec = Math.max(0, Math.floor((end - Date.now()) / 1000));
          clock.textContent = String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0");
          if (sec <= 0) clearInterval(tick);
        }, 1000);
      }
    }

    var goToVipPlan = function () {
      selectPlan("vip");
      var premCard = $("#planPremium") || $("#planos");
      if (premCard) {
        premCard.scrollIntoView({ behavior: "smooth", block: "start" });
        premCard.classList.remove("plan--focus-pulse");
        void premCard.offsetWidth;
        premCard.classList.add("plan--focus-pulse");
        setTimeout(function () { premCard.classList.remove("plan--focus-pulse"); }, 1800);
      }
    };

    var firstImg = $("#resultFirstImg");
    if (firstImg) firstImg.addEventListener("click", goToVipPlan);
    var btnApp = $("#btnApp");
    if (btnApp) btnApp.addEventListener("click", goToVipPlan);
    var btnClaim = $("#btnClaimBonuses");
    if (btnClaim) btnClaim.addEventListener("click", goToVipPlan);

    // Carousel swipe & controls
    var baViewport = $("#baViewport"), baTrack = $("#baTrack");
    if (baViewport && baTrack) {
      var slideEls = $$("#baTrack .ba-slide");
      var dotEls = $$("#baDots .ba-dot");
      var countEl = $("#baCount"), quoteEl = $("#baQuote");
      var totalBa = slideEls.length, activeBa = 0;

      var goToBa = function (idx) {
        activeBa = ((idx % totalBa) + totalBa) % totalBa;
        baTrack.style.transform = "translate3d(-" + (activeBa * 100) + "%, 0, 0)";
        slideEls.forEach(function (el, i) { el.classList.toggle("is-active", i === activeBa); });
        dotEls.forEach(function (el, i) { el.classList.toggle("active", i === activeBa); });
        if (countEl) countEl.textContent = (activeBa + 1) + " of " + totalBa;
        if (quoteEl && baSlides[activeBa]) quoteEl.textContent = baSlides[activeBa].quote;
      };

      var sx = 0, dx = 0, drag = false;
      baViewport.addEventListener("touchstart", function (e) { if (e.touches[0]) { sx = e.touches[0].clientX; dx = 0; drag = true; } }, { passive: true });
      baViewport.addEventListener("touchmove", function (e) { if (drag && e.touches[0]) dx = e.touches[0].clientX - sx; }, { passive: true });
      baViewport.addEventListener("touchend", function () { if (!drag) return; drag = false; if (Math.abs(dx) > 42) goToBa(dx < 0 ? activeBa + 1 : activeBa - 1); }, { passive: true });

      $("#baPrev").addEventListener("click", function () { goToBa(activeBa - 1); });
      $("#baNext").addEventListener("click", function () { goToBa(activeBa + 1); });
      dotEls.forEach(function (d) { d.addEventListener("click", function () { goToBa(parseInt(d.dataset.baDot, 10) || 0); }); });
    }

    // Bonus drawers + zoom modal
    var bonusStackEl = $("#bonusStack");
    var zoomModal = $("#bonusZoomModal");
    if (bonusStackEl) {
      bonusStackEl.addEventListener("click", function (e) {
        var tBtn = e.target.closest("[data-bonus-toggle]");
        if (tBtn) {
          var card = tBtn.closest(".bcard");
          var list = card && card.querySelector(".bcard__perks");
          if (list) {
            var opening = list.hidden;
            list.hidden = !opening;
            tBtn.setAttribute("aria-expanded", opening ? "true" : "false");
            var sp = tBtn.querySelector("span");
            if (sp) sp.textContent = opening ? "What you get inside this gift" : "Tap to see everything included";
          }
          return;
        }
        var mock = e.target.closest("[data-zoom-mock]");
        if (mock && zoomModal) {
          $("#bonusZoomBody").innerHTML = renderBonusMockupHtml(mock.dataset.zoomMock);
          $("#bonusZoomCaption").textContent = "🎁 " + mock.dataset.zoomTitle + " — $0.00 FREE Today";
          zoomModal.hidden = false;
        }
      });
    }
    if (zoomModal && !zoomModal.dataset.bound) {
      zoomModal.dataset.bound = "1";
      $("#bonusZoomClose").addEventListener("click", function () { zoomModal.hidden = true; });
      $("#bonusZoomCta").addEventListener("click", function () { zoomModal.hidden = true; goToVipPlan(); });
      zoomModal.addEventListener("click", function (e) { if (e.target.hasAttribute("data-close-zoom")) zoomModal.hidden = true; });
    }

    startUSSocialToast();
    $$("[data-count]").forEach(countUp);
    show("result");
    setHeaderMode("result");
    $("#stickyCta").hidden = false;
  }

  var socialTimer = null;
  function startUSSocialToast() {
    var toast = $("#socialToast"), nEl = $("#socialToastName"), mEl = $("#socialToastMsg");
    if (!toast || !nEl || !mEl) return;
    if (socialTimer) clearTimeout(socialTimer);
    var buyers = [
      { who: "Hannah M. · Austin, TX", msg: "just unlocked the $27 VIP Lifetime Pass + 3 Free Bonuses" },
      { who: "Jessica R. · Denver, CO", msg: "claimed her Soft Autumn Palette & Virtual Try-On 2m ago" },
      { who: "Emily W. · Tampa, FL", msg: "upgraded to VIP Complete Lifetime ($0/mo fees)" }
    ];
    var idx = 0;
    function next() {
      if (!screens.result.classList.contains("active") || idx >= buyers.length) { toast.hidden = true; return; }
      var b = buyers[idx++];
      nEl.textContent = b.who; mEl.textContent = b.msg;
      toast.hidden = false; toast.classList.add("is-visible");
      socialTimer = setTimeout(function () {
        toast.classList.remove("is-visible");
        setTimeout(function () { toast.hidden = true; if (idx < buyers.length) socialTimer = setTimeout(next, 11000); }, 360);
      }, 4500);
    }
    socialTimer = setTimeout(next, 5500);
  }

  function countUp(el) {
    var target = parseInt(el.dataset.count, 10) || 0, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / 850);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function boot() {
    initPixel();
    var params = new URLSearchParams(window.location.search);
    var stepParam = params.get("step");
    var openResult = (stepParam === "result" || stepParam === "resultado");
    var openScratch = (stepParam === "ticket" || stepParam === "scratch");

    if (openScratch) {
      state.i = QUESTIONS.length - 1;
    } else if (stepParam && !openResult) {
      var byId = QUESTIONS.findIndex(function (q) { return q.id === stepParam; });
      var byNum = parseInt(stepParam, 10);
      if (byId !== -1) state.i = byId;
      else if (!isNaN(byNum) && byNum >= 1 && byNum <= QUESTIONS.length) state.i = byNum - 1;
    }

    if (openResult) {
      document.body.classList.remove("bg-creme");
      startWarmup();
      showResult(false);
    } else {
      track("ViewContent", { content_name: "Lumina Style & Color Quiz (US)", content_category: "Quiz Funnel" });
      track("QuizStart", true);
      track("QuizStep", { step: state.i + 1, step_id: QUESTIONS[state.i].id, total_steps: QUESTIONS.length });
      show("quiz");
      hydrateOrRenderQuestion(state.i === 0);
      startWarmup();
      if (openScratch) openTicket();
    }

    $("#btnBack").addEventListener("click", function () {
      if (state.i === 0) return;
      state.i -= 1;
      renderQuestion();
    });
    $("#ticketNext").addEventListener("click", function () { closeTicket(); advance(); });
    $("#lnkRestart").addEventListener("click", function (e) {
      e.preventDefault();
      closeTicket();
      state.i = 0; state.answers = {};
      $("#stickyCta").hidden = true;
      show("quiz");
      renderQuestion();
    });
    $("#stickyCta").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-cta]");
      if (!btn) return;
      var prem = $("#planPremium") || $("#planos");
      if (prem) {
        var r = prem.getBoundingClientRect();
        if (!(r.top < window.innerHeight * 0.68 && r.bottom > 110)) {
          e.preventDefault();
          prem.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
      handleCheckoutClick(state.plan);
    });

    var setupModal = $("#checkoutSetupModal");
    if (setupModal) {
      $("#checkoutSetupClose").addEventListener("click", function () { setupModal.hidden = true; });
      setupModal.addEventListener("click", function (e) { if (e.target.hasAttribute("data-close-setup")) setupModal.hidden = true; });
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
