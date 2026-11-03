#!/usr/bin/env python3
"""Constrói a composição HyperFrames a partir da locução cronometrada.

Todo movimento é registrado em timelines GSAP pausadas e buscáveis. Não há
animação CSS livre, relógio, aleatoriedade ou rede no documento renderizado.
"""
from __future__ import annotations

import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "build"
COMP = ROOT / "compositions"
COMP.mkdir(exist_ok=True)
T = json.loads((BUILD / "timeline.json").read_text())
D = T["duration"]
SCENES = {s["id"]: s for s in T["scenes"]}
LINES = T["lines"]

PLUM = "#250D18"
PLUM_2 = "#3A1524"
CREAM = "#F6F0E8"
CORAL = "#F26E64"
SAGE = "#D9E8DF"
INK = "#2B101C"
MUTED = "#7C6870"

COMMON = r"""
@font-face{font-family:Inter;src:url('assets/fonts/Inter-Variable.woff2') format('woff2');font-weight:100 900;font-style:normal}
@font-face{font-family:Playfair;src:url('assets/fonts/PlayfairDisplay-Italic.woff2') format('woff2');font-weight:400 900;font-style:italic}
@font-face{font-family:EBG;src:url('assets/fonts/EBGaramond-700.woff2') format('woff2');font-weight:700;font-style:normal}
*{box-sizing:border-box;margin:0;padding:0}
#root{position:absolute;inset:0;overflow:hidden;font-family:Inter,Arial,sans-serif;background:var(--ground)}
.clip{position:absolute}
.shot{inset:0;overflow:hidden}
.shot-motion{position:absolute;inset:-5%;will-change:transform}
.shot-motion img{width:100%;height:100%;object-fit:cover;display:block}
.shade{position:absolute;inset:0;pointer-events:none}
.text-motion{position:relative;width:100%;height:100%;will-change:transform,clip-path,opacity}
.display{font-family:EBG,Georgia,serif;font-weight:700;letter-spacing:-.045em;line-height:.91}
.serif-italic{font-family:Playfair,Georgia,serif;font-style:italic}
.kicker{font-family:Inter,Arial,sans-serif;font-size:30px;font-weight:700;letter-spacing:.13em;line-height:1.2;text-transform:uppercase}
.body-copy{font-family:Inter,Arial,sans-serif;font-size:36px;line-height:1.3}
.disclosure{position:absolute;left:64px;top:168px;z-index:55;font-size:28px;font-weight:700;letter-spacing:.16em;line-height:1.15;color:#F6F0E8;background:rgba(37,13,24,.84);padding:5px 10px}
.grain{position:absolute;inset:0;z-index:45;pointer-events:none;opacity:.05;background-image:url('assets/images/grain.png');background-repeat:repeat}
.light-sweep{position:absolute;top:-20%;bottom:-20%;left:0;width:260px;z-index:35;pointer-events:none;opacity:0;background:linear-gradient(90deg,transparent,rgba(255,244,222,.7),transparent)}
.phone-frame{position:absolute;overflow:hidden;border:12px solid #21131a;border-radius:48px;background:#fff;box-shadow:0 30px 70px rgba(37,13,24,.24)}
.phone-frame img{position:absolute;left:0;top:0;width:100%;display:block}
.ui-stage{position:absolute;inset:0;background:#f6f0e8}
.editorial-rule{height:10px;width:160px;background:var(--coral,#F26E64)}
.feature-line{font-family:EBG,Georgia,serif;font-size:80px;font-weight:700;line-height:.95;letter-spacing:-.035em}
"""


def f(value: float) -> str:
    return f"{value:.6f}".rstrip("0").rstrip(".")


def local(scene: str, absolute: float) -> float:
    return absolute - SCENES[scene]["start"]


def line_start(scene: str, index: int, offset: float = 0.0) -> float:
    return max(0.0, local(scene, LINES[index]["start"]) + offset)


def line_end(scene: str, index: int, offset: float = 0.0) -> float:
    return min(SCENES[scene]["duration"], local(scene, LINES[index]["end"]) + offset)


def attrs(start: float, end: float, track: int, classes: str = "clip") -> str:
    return f'class="{classes}" data-start="{f(start)}" data-duration="{f(end-start)}" data-track-index="{track}"'


def shot(scene: str, ident: str, start: float, end: float, image: str, position: str = "50% 50%",
         shade: str = "linear-gradient(180deg,rgba(25,8,16,.1) 20%,rgba(25,8,16,.78) 100%)",
         scale_from: float = 1.02, scale_to: float = 1.10, x_from: int = 0, x_to: int = -24,
         extra_style: str = "", contain: bool = False) -> tuple[str, str]:
    motion_style = "inset:0" if contain else ""
    fit = "contain" if contain else "cover"
    markup = f"""
<div id="{ident}" {attrs(start,end,1,"clip shot")} style="z-index:1;{extra_style}" data-layout-allow-overflow>
  <div id="{ident}-motion" class="shot-motion" style="{motion_style}">
    <img src="assets/images/{image}" alt="" style="object-position:{position};object-fit:{fit}"/>
    <div class="shade" style="background:{shade}"></div>
  </div>
</div>"""
    tween = f"""tl.fromTo('#{ident}-motion',{{scale:{scale_from},x:{x_from}}},{{scale:{scale_to},x:{x_to},duration:{f(end-start)},ease:'none'}},{f(start)});"""
    return markup, tween


def text_clip(ident: str, start: float, end: float, content: str, style: str,
              mode: str = "wipe", track: int = 10, delay: float = 0.0) -> tuple[str, str]:
    markup = f"""
<div id="{ident}" {attrs(start,end,track)} style="z-index:{track};{style}" data-layout-allow-overlap>
  <div id="{ident}-motion" class="text-motion">{content}</div>
</div>"""
    at = start + delay
    if mode == "static":
        return markup, ""
    if mode == "wipe":
        tween = f"""tl.fromTo('#{ident}-motion',{{clipPath:'inset(0 100% 0 0)'}},{{clipPath:'inset(0 0% 0 0)',duration:.52,ease:'power3.out'}},{f(at)});"""
    elif mode == "rise":
        tween = f"""tl.fromTo('#{ident}-motion',{{y:54,opacity:0}},{{y:0,opacity:1,duration:.46,ease:'power3.out'}},{f(at)});"""
    elif mode == "scale":
        tween = f"""tl.fromTo('#{ident}-motion',{{scale:.92,opacity:0}},{{scale:1,opacity:1,duration:.58,ease:'back.out(1.4)'}},{f(at)});"""
    else:
        raise ValueError(mode)
    return markup, tween


def light(ident: str, at: float) -> tuple[str, str]:
    markup = f'<div id="{ident}" class="light-sweep" data-layout-ignore></div>'
    tween = f"""tl.fromTo('#{ident}',{{x:-500,opacity:0,rotation:9}},{{x:1500,opacity:.3,rotation:9,duration:1.05,ease:'power2.inOut'}},{f(at)});
tl.to('#{ident}',{{opacity:0,duration:.25}},{f(at+1.05)});"""
    return markup, tween


def scene_file(scene: str, body: str, tweens: list[str], ground: str, disclosure: str,
               disclosure_start: float | None = None, disclosure_end: float | None = None) -> None:
    ink = CREAM if ground == PLUM else INK
    if disclosure_start is None and disclosure_end is None:
        disclosure_html = '<div class="disclosure">DRAMATIZAÇÃO</div>'
    else:
        start = disclosure_start or 0.0
        end = disclosure_end if disclosure_end is not None else SCENES[scene]["duration"]
        disclosure_html = (f'<div id="{scene}-disclosure" class="clip disclosure" data-start="{f(start)}" '
                           f'data-duration="{f(end-start)}" '
                           'data-track-index="55" data-layout-allow-overlap>DRAMATIZAÇÃO</div>')
    content = f"""<template>
<style>{COMMON}
#root{{--ground:{ground};--ink:{ink};--disclosure:{disclosure}}}
</style>
<div id="root" data-composition-id="{scene}" data-width="1080" data-height="1920">
{body}
{disclosure_html}
<div class="grain" data-layout-ignore></div>
</div>
<script>
const tl=gsap.timeline({{paused:true}});
{chr(10).join(tweens)}
window.__timelines['{scene}']=tl;
tl.seek(0);
</script>
</template>
"""
    (COMP / f"{scene}.html").write_text(content)


def title(ident: str, start: float, end: float, text: str, top: int, color: str = CREAM,
          size: int = 88, mode: str = "wipe", left: int = 64, width: int = 900,
          extra: str = "") -> tuple[str, str]:
    lines = "<br/>".join(html.escape(x) for x in text.split("\n"))
    return text_clip(ident, start, end, f'<div class="display" style="font-size:{size}px;color:{color};{extra}">{lines}</div>',
                     f"left:{left}px;top:{top}px;width:{width}px;min-height:{int(size*1.1)}px", mode)


# HOOK -----------------------------------------------------------------------
scene = "hook"
dur = SCENES[scene]["duration"]
a, b = 0.0, line_start(scene, 1)
c, d = line_start(scene, 2), dur
body, tw = [], []
for args in [
    ("hook-a", 0.0, b, "modelo-ana.jpg", "50% 28%", "linear-gradient(180deg,rgba(25,8,16,.12) 20%,rgba(25,8,16,.82) 100%)", 1.00, 1.075, 0, -22),
    ("hook-b", b, c, "modelo-clara.jpg", "50% 42%", "linear-gradient(180deg,rgba(25,8,16,.08) 20%,rgba(25,8,16,.82) 100%)", 1.02, 1.11, 20, -20),
    ("hook-c", c, dur, "modelo-ana.jpg", "52% 38%", "linear-gradient(180deg,rgba(25,8,16,.12) 20%,rgba(25,8,16,.86) 100%)", 1.08, 1.16, -30, 20),
]:
    m, t = shot(scene, *args)
    body.append(m); tw.append(t)
for args in [
    ("hook-title-a", 0.0, b, "POR QUE TODO LOOK\nPARECIA ERRADO\nEM MIM?", 850, CREAM, 88, "static"),
    ("hook-title-b", b, c, "MELHOR NAS OUTRAS\nDO QUE EM MIM?", 850, CREAM, 80, "wipe"),
    ("hook-title-c", c, dur, "NADA\nCOMBINAVA\nCOMIGO.", 820, CREAM, 104, "wipe"),
]:
    m, t = title(*args)
    body.append(m); tw.append(t)
m, t = light("hook-light", c + 0.1); body.append(m); tw.append(t)
scene_file(scene, "\n".join(body), tw, PLUM, CREAM)

# CONFLICT -------------------------------------------------------------------
scene = "conflict"
dur = SCENES[scene]["duration"]
a = line_start(scene, 4)
b = line_start(scene, 5)
body, tw = [], []
m, t = shot(scene, "conflict-a", 0, a, "modelo-clara.jpg", "50% 36%",
            "linear-gradient(90deg,rgba(37,13,24,.88) 0%,rgba(37,13,24,.2) 72%)", 1.03, 1.10, 0, -30)
body.append(m); tw.append(t)
m, t = title("conflict-title-a", 0.15, a, "O JANTAR\nDO TRABALHO.", 850, CREAM, 94)
body.append(m); tw.append(t)
# Segundo mundo: composição editorial, não um simples zoom na mesma foto.
body.append(f"""
<div id="conflict-b" {attrs(a,b,1)} style="z-index:1;inset:0;background:{CREAM}">
  <div id="conflict-b-motion" class="shot-motion" style="inset:0 0 48% 0">
    <img src="assets/images/modelo-ana.jpg" alt="" style="object-position:50% 29%;width:100%;height:100%;object-fit:cover"/>
  </div>
</div>""")
tw.append(f"tl.fromTo('#conflict-b-motion',{{scale:1.04,x:-30}},{{scale:1.12,x:30,duration:{f(b-a)},ease:'none'}},{f(a)});")
m, t = title("conflict-title-b", a + 0.12, b, "PROVO TUDO.\nNÃO SEI\nO QUE VESTIR.", 1050, INK, 82)
body.append(m); tw.append(t)
m, t = text_clip("conflict-rule", a + 0.25, b, '<div class="editorial-rule"></div>', "left:64px;top:1008px;width:160px;height:10px", "wipe")
body.append(m); tw.append(t)
m, t = shot(scene, "conflict-c", b, dur, "modelo-ana.jpg", "54% 24%",
            "linear-gradient(180deg,rgba(37,13,24,.15),rgba(37,13,24,.85))", 1.04, 1.13, -15, 15)
body.append(m); tw.append(t)
m, t = title("conflict-title-c", b + 0.08, dur, "O QUE FUNCIONA\nPARA MIM?", 850, CREAM, 94)
body.append(m); tw.append(t)
m, t = light("conflict-light", a); body.append(m); tw.append(t)
scene_file(scene, "\n".join(body), tw, PLUM, CREAM)

# REVEAL ---------------------------------------------------------------------
scene = "reveal"
dur = SCENES[scene]["duration"]
a = line_start(scene, 7)
b = line_start(scene, 8)
c = line_start(scene, 9)
body, tw = [], []
m, t = shot(scene, "reveal-a", 0, a, "modelo-clara.jpg", "50% 44%",
            "linear-gradient(180deg,rgba(37,13,24,.08),rgba(37,13,24,.84))", 1.01, 1.09, 0, -24)
body.append(m); tw.append(t)
m, t = title("reveal-title-a", 0.12, a, "O PROBLEMA\nNÃO ERA\nO ARMÁRIO.", 850, CREAM, 94)
body.append(m); tw.append(t)
body.append(f'<div id="reveal-b" {attrs(a,b,1)} style="z-index:1;inset:0;background:{CREAM}"></div>')
m, t = title("reveal-title-b", a, b, "ACEITAR?", 450, INK, 164, mode="scale")
body.append(m); tw.append(t)
body.append(f'<div id="reveal-brand" {attrs(b,c,1)} style="z-index:1;inset:0;background:{PLUM}"></div>')
for ident, start, text, top, size, color in [
    ("reveal-brand-1", b + 0.10, "TRUQUE", 300, 152, CREAM),
    ("reveal-brand-2", b + 0.28, "DOS MIL", 500, 152, CORAL),
    ("reveal-brand-3", b + 0.46, "LOOKS", 700, 152, CREAM),
]:
    m, t = title(ident, start, c, text, top, color, size, mode="wipe")
    body.append(m); tw.append(t)
m, t = text_clip("reveal-brand-sub", b + 0.75, c, '<div class="kicker" style="color:#F6F0E8">UM NOME. MIL POSSIBILIDADES.</div>',
                 "left:70px;top:970px;width:900px;height:60px", "rise")
body.append(m); tw.append(t)
m, t = shot(scene, "reveal-app", c, dur, "app-inicio.png", "50% 50%",
            "none", 1.00, 1.00, 0, 0, extra_style=f"background:{CREAM}", contain=True)
body.append(m); tw.append(t)
m, t = light("reveal-light", b); body.append(m); tw.append(t)
m, t = light("reveal-app-light", c + 0.15); body.append(m); tw.append(t)
scene_file(scene, "\n".join(body), tw, PLUM, CREAM, disclosure_start=0.0, disclosure_end=c)

# CLOSET ---------------------------------------------------------------------
scene = "closet"
dur = SCENES[scene]["duration"]
body, tw = [], []
m, t = shot(scene, "closet-full", 0, 0.85, "app-closet.png", "50% 50%", "none", 1.00, 1.00, 0, 0,
            extra_style=f"background:{CREAM}", contain=True)
body.append(m); tw.append(t)
body.append(f"""
<div id="closet-demo" {attrs(.85,dur,2)} style="z-index:2;inset:0;background:{CREAM}">
  <div class="kicker" style="position:absolute;left:64px;top:230px;color:{MUTED}">CLOSET INTELIGENTE</div>
  <div class="display" style="position:absolute;left:64px;top:295px;width:940px;font-size:82px;color:{INK}">FOTOGRAFE.<br/>A IA ORGANIZA.</div>
  <div class="phone-frame" style="left:152px;top:520px;width:776px;height:715px">
    <img id="closet-scroll" src="assets/images/app-closet-screen.jpg" alt="Tela real do closet virtual"/>
  </div>
</div>""")
tw.append(f"tl.fromTo('#closet-demo',{{clipPath:'inset(100% 0 0 0)'}},{{clipPath:'inset(0% 0 0 0)',duration:.55,ease:'power3.out'}},.85);")
# A tela real roda dentro do dispositivo; não é um mockup nem um cursor falso.
tw.append(f"tl.fromTo('#closet-scroll',{{y:0}},{{y:-810,duration:{f(dur-1.25)},ease:'none'}},1.25);")
m, t = light("closet-light", 0.85); body.append(m); tw.append(t)
scene_file(scene, "\n".join(body), tw, CREAM, INK, disclosure_start=0.85)

# LOOKS ----------------------------------------------------------------------
scene = "looks"
dur = SCENES[scene]["duration"]
body, tw = [], []
m, t = shot(scene, "looks-full", 0, 0.9, "app-looks.png", "50% 50%", "none", 1.00, 1.00, 0, 0,
            extra_style=f"background:{CREAM}", contain=True)
body.append(m); tw.append(t)
body.append(f"""
<div id="looks-demo" {attrs(.9,4.2,2)} style="z-index:2;inset:0;background:{CREAM}">
  <div class="kicker" style="position:absolute;left:64px;top:230px;color:{MUTED}">COMBINAÇÕES INTELIGENTES</div>
  <div class="display" style="position:absolute;left:64px;top:295px;width:940px;font-size:82px;color:{INK}">UMA PEÇA.<br/>VÁRIOS LOOKS.</div>
  <div class="phone-frame" style="left:152px;top:520px;width:776px;height:715px">
    <img id="looks-scroll" src="assets/images/app-looks-screen.jpg" alt="Tela real de combinações inteligentes"/>
  </div>
</div>""")
tw.append("tl.fromTo('#looks-demo',{clipPath:'inset(0 0 0 100%)'},{clipPath:'inset(0 0 0 0%)',duration:.55,ease:'power3.out'},.9);")
tw.append("tl.fromTo('#looks-scroll',{y:0},{y:-690,duration:2.7,ease:'none'},1.25);")
body.append(f"""
<div id="looks-results" {attrs(4.2,dur,2)} style="z-index:2;inset:0;background:{CREAM};overflow:hidden">
  <div class="kicker" style="position:absolute;left:64px;top:230px;color:{MUTED}">O MESMO BLAZER. TRÊS OCASIÕES.</div>
  <div id="looks-results-motion" style="position:absolute;left:90px;top:450px;width:900px;height:800px;overflow:hidden">
    <img src="assets/images/app-looks-results.jpg" alt="Looks reais para trabalho, fim de semana e jantar" style="width:100%;display:block"/>
  </div>
</div>""")
tw.append("tl.fromTo('#looks-results',{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.55,ease:'power3.out'},4.2);")
tw.append(f"tl.fromTo('#looks-results-motion',{{x:70,scale:1.04}},{{x:-70,scale:1.12,duration:{f(dur-4.2)},ease:'none'}},4.2);")
for i, (label, start, end) in enumerate([
    ("TRABALHO", 4.35, 6.25),
    ("FIM DE SEMANA", 6.25, 8.15),
    ("JANTAR", 8.15, dur),
]):
    m, t = text_clip(f"looks-cat-{i}", start, end, f'<div class="display" style="font-size:86px;color:{INK}">{label}</div><div class="editorial-rule" style="margin-top:22px"></div>',
                     "left:64px;top:285px;width:940px;height:160px", "wipe")
    body.append(m); tw.append(t)
m, t = light("looks-light", 4.2); body.append(m); tw.append(t)
scene_file(scene, "\n".join(body), tw, CREAM, INK, disclosure_start=0.9)

# OFFERS ---------------------------------------------------------------------
scene = "offers"
dur = SCENES[scene]["duration"]
a = line_start(scene, 14)
body, tw = [], []
body.append(f"""
<div id="offers-a" {attrs(0,a,1)} style="z-index:1;inset:0;background:{CREAM}">
  <div class="kicker" style="position:absolute;left:64px;top:230px;color:{MUTED}">QUANDO FALTAR UMA PEÇA</div>
  <div class="display" style="position:absolute;left:64px;top:305px;width:940px;font-size:190px;color:{CORAL}">ATÉ 50%</div>
  <div class="display" style="position:absolute;left:64px;top:525px;width:940px;font-size:72px;color:{INK}">DE DESCONTO<br/>EM LOJAS.</div>
  <div id="offers-detail-motion" style="position:absolute;left:90px;top:800px;width:900px;box-shadow:0 24px 65px rgba(37,13,24,.16)">
    <img src="assets/images/app-offers-detail.jpg" alt="Área real de ofertas do aplicativo" style="display:block;width:100%"/>
  </div>
  <div class="body-copy" style="position:absolute;left:90px;top:1210px;width:900px;font-size:30px;color:{MUTED}">Ofertas sujeitas à disponibilidade e às condições das lojas.</div>
</div>""")
tw.append(f"tl.fromTo('#offers-detail-motion',{{y:70,opacity:0}},{{y:0,opacity:1,duration:.6,ease:'power3.out'}},.4);")
body.append(f"""
<div id="offers-features" {attrs(a,dur,1)} style="z-index:1;inset:0;background:{PLUM}">
  <div style="position:absolute;left:64px;top:230px;width:940px;color:#F6F0E8" class="kicker">NO SEU ESTILO</div>
</div>""")
for i, (label, start, end, color) in enumerate([
    ("SUGESTÕES\nPARA VOCÊ", a + 0.10, a + 1.15, CREAM),
    ("FAVORITOS", a + 1.15, a + 2.15, CORAL),
    ("OFERTAS", a + 2.15, a + 3.10, CREAM),
    ("E MUITO MAIS", a + 3.10, dur, SAGE),
]):
    m, t = text_clip(f"offers-feature-{i}", start, end,
                     f'<div class="feature-line" style="color:{color}">{label.replace(chr(10),"<br/>")}</div><div class="editorial-rule" style="margin-top:35px"></div>',
                     "left:64px;top:405px;width:940px;height:330px", "wipe")
    body.append(m); tw.append(t)
m, t = light("offers-light", a); body.append(m); tw.append(t)
scene_file(scene, "\n".join(body), tw, CREAM, INK)

# PAYOFF ---------------------------------------------------------------------
scene = "payoff"
dur = SCENES[scene]["duration"]
a = line_start(scene, 16)
b = line_start(scene, 17)
body, tw = [], []
m, t = shot(scene, "payoff-a", 0, a, "modelo-ana.jpg", "50% 26%",
            "linear-gradient(180deg,rgba(37,13,24,.04),rgba(37,13,24,.82))", 1.02, 1.12, 0, -20)
body.append(m); tw.append(t)
m, t = title("payoff-title-a", 0.12, a * 0.58, "EU PAREI\nDE ME ESCONDER.", 1000, CREAM, 100)
body.append(m); tw.append(t)
m, t = title("payoff-title-a2", a * 0.58, a, "FINALMENTE\nPARECIA COMIGO.", 1000, CREAM, 92)
body.append(m); tw.append(t)
body.append(f"""
<div id="payoff-b" {attrs(a,b,1)} style="z-index:1;inset:0;background:{CREAM}">
  <div style="position:absolute;left:0;top:0;width:100%;height:700px;overflow:hidden">
    <img src="assets/images/modelo-clara.jpg" alt="" style="width:100%;height:100%;object-fit:cover;object-position:50% 0%"/>
  </div>
</div>""")
m, t = title("payoff-title-b", a + 0.12, b, "MIL\nPOSSIBILIDADES.", 790, INK, 124)
body.append(m); tw.append(t)
m, t = text_clip("payoff-sub-b", a + 0.35, b, '<div class="kicker" style="color:#250D18">SEM MUDAR QUEM VOCÊ É.</div>',
                 "left:70px;top:1100px;width:900px;height:70px", "rise")
body.append(m); tw.append(t)
m, t = shot(scene, "payoff-c", b, dur, "modelo-clara.jpg", "50% 45%",
            "linear-gradient(180deg,rgba(37,13,24,.1),rgba(37,13,24,.86))", 1.00, 1.10, 20, -20)
body.append(m); tw.append(t)
m, t = title("payoff-title-c", b + 0.08, dur, "SEU PRÓXIMO LOOK\nJÁ ESTÁ\nNO SEU ARMÁRIO.", 850, CREAM, 82)
body.append(m); tw.append(t)
m, t = light("payoff-light", 0.2); body.append(m); tw.append(t)
scene_file(scene, "\n".join(body), tw, PLUM, CREAM)

# ENDCARD --------------------------------------------------------------------
scene = "endcard"
dur = SCENES[scene]["duration"]
body, tw = [], []
body.append(f'<div id="endcard-bg" {attrs(0,dur,1)} style="z-index:1;inset:0;background:{PLUM}"></div>')
for ident, start, text, top, size, color in [
    ("endcard-brand-1", 0.12, "TRUQUE", 300, 142, CREAM),
    ("endcard-brand-2", 0.28, "DOS MIL", 470, 142, CORAL),
    ("endcard-brand-3", 0.44, "LOOKS", 640, 142, CREAM),
]:
    m, t = title(ident, start, dur, text, top, color, size, mode="wipe")
    body.append(m); tw.append(t)
m, t = text_clip("endcard-sub", 0.75, dur, '<div class="kicker" style="color:#F6F0E8">SEU ARMÁRIO. MIL POSSIBILIDADES.</div>',
                 "left:70px;top:900px;width:940px;height:70px", "rise")
body.append(m); tw.append(t)
m, t = text_clip("endcard-cta", 1.05, dur,
                 '<div style="background:#F26E64;color:#250D18;padding:34px 48px;font-size:42px;font-weight:800;letter-spacing:.04em;text-align:center">CLIQUE NO LINK</div>',
                 "left:190px;top:1080px;width:700px;height:130px", "scale")
body.append(m); tw.append(t)
m, t = text_clip("endcard-note", 1.25, dur,
                 '<div class="body-copy" style="color:#F6F0E8;text-align:center">Conheça o <span data-var-text="brand">Truque dos Mil Looks</span>.</div>',
                 "left:90px;top:1240px;width:900px;height:70px", "rise")
body.append(m); tw.append(t)
m, t = light("endcard-light", 0.1); body.append(m); tw.append(t)
scene_file(scene, "\n".join(body), tw, PLUM, CREAM)

# CAPTIONS -------------------------------------------------------------------
cap_body, cap_tw = [], []
for line in LINES:
    for j, part in enumerate(line["parts"]):
        ident = f"cap-{line['index']:02d}-{j}"
        start, end = part["start"], part["end"]
        # Legendas ficam estáveis durante a leitura; somente a entrada tem 180 ms.
        safe = html.escape(part["text"])
        for phrase in ["Truque dos Mil Looks", "cinquenta por cento", "mil possibilidades", "vários looks"]:
            safe = safe.replace(phrase, f'<span style="color:{CORAL}">{phrase}</span>')
        color = CORAL if line["speaker"] == "Ana" else SAGE
        cap_body.append(f"""
<div id="{ident}" class="clip" data-start="{f(start)}" data-duration="{f(end-start)}" data-track-index="{line['index']+1}" style="z-index:20;left:64px;top:1315px;width:860px" data-layout-allow-caption-zone>
  <div id="{ident}-motion" style="background:rgba(37,13,24,.94);border-left:8px solid {color};padding:20px 26px 22px;box-shadow:0 12px 32px rgba(0,0,0,.18)">
    <div style="font-size:28px;font-weight:700;letter-spacing:.12em;color:{color};margin-bottom:8px">{line['speaker'].upper()}</div>
    <div style="font-family:Inter,Arial,sans-serif;font-size:46px;font-weight:650;line-height:1.12;color:{CREAM}">{safe}</div>
  </div>
</div>""")
        cap_tw.append(f"tl.fromTo('#{ident}-motion',{{y:18,opacity:0}},{{y:0,opacity:1,duration:.18,ease:'power2.out'}},{f(start)});")
scene_file("captions", "\n".join(cap_body), cap_tw, "transparent", CREAM)
# A cena de captions não precisa de disclosure/grain próprios; remove-os para não duplicar.
cap_path = COMP / "captions.html"
cap_text = cap_path.read_text()
cap_text = cap_text.replace('<div class="disclosure">DRAMATIZAÇÃO</div>\n<div class="grain" data-layout-ignore></div>\n', "")
cap_path.write_text(cap_text)

# ROOT -----------------------------------------------------------------------
variables = [
    {"id": "brand", "type": "string", "label": "Marca", "default": T["brand"], "maxLength": 80},
    {"id": "coral", "type": "color", "label": "Cor de destaque", "default": CORAL},
]
hosts = []
for i, s in enumerate(T["scenes"]):
    hosts.append(f"""<div id="{s['id']}" data-composition-id="{s['id']}" data-composition-src="compositions/{s['id']}.html"
      data-start="{f(s['start'])}" data-duration="{f(s['duration'])}" data-track-index="{i+2}" data-track-kind="graphics"
      data-width="1080" data-height="1920" style="z-index:{i+2}"></div>""")
hosts.append(f"""<div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html"
  data-start="0" data-duration="{f(D)}" data-track-index="30" data-track-kind="captions" data-width="1080" data-height="1920"
  style="z-index:100" data-layout-allow-caption-zone></div>""")
index = f"""<!doctype html>
<html lang="pt-BR" data-resolution="portrait" data-composition-variables='{json.dumps(variables,ensure_ascii=False)}'>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=1080,height=1920"/>
  <title>Truque dos Mil Looks — Facebook Ads</title>
  <script src="assets/vendor/gsap.min.js"></script>
  <style>
    *{{box-sizing:border-box;margin:0;padding:0}}
    html,body{{width:1080px;height:1920px;overflow:hidden;background:{PLUM}}}
    #root{{position:absolute;inset:0;width:1080px;height:1920px;overflow:hidden}}
  </style>
</head>
<body>
  <div id="root" data-composition-id="main" data-start="0" data-duration="{f(D)}" data-fps="60" data-width="1080" data-height="1920">
    <audio id="soundtrack" class="clip" data-start="0" data-duration="{f(D)}" data-track-index="0" data-volume="1" src="assets/audio/soundtrack.wav"></audio>
    {chr(10).join(hosts)}
  </div>
  <script>
    window.__timelines['main']=gsap.timeline({{paused:true}});
  </script>
</body>
</html>
"""
(ROOT / "index.html").write_text(index)

# Documentação de direção e revisão ------------------------------------------
shot_rows = []
for s in T["scenes"]:
    related = [x for x in LINES if x["scene"] == s["id"]]
    shot_rows.append(f"| {s['id']} | {s['start']:.2f}–{s['end']:.2f} | {related[0]['text']} |")
storyboard = f"""# Storyboard — Truque dos Mil Looks

Formato: 1080×1920, 60 fps, {D:.0f} s. Narrativa em diálogo off com duas vozes sintéticas.
As personagens são apresentadas como dramatização; não há lip-sync nem depoimento real.

| Mundo | Tempo | Entrada da copy |
| --- | ---: | --- |
{chr(10).join(shot_rows)}

## Provas visuais

1. Closet real: a tela enviada roda dentro de um dispositivo, revelando organização e peças.
2. Combinações reais: a mesma peça aparece em trabalho, fim de semana e jantar.
3. Ofertas: a área real de ofertas acompanha a alegação de até 50%, com condição visível.
4. Marca e CTA: revelação tipográfica e botão estável durante os dois segundos finais.

## Decisões de produção

- As fotos são animadas por câmera, crop e luz; nenhuma boca ou face é deformada.
- Não foi usado o bloco `app-showcase` do registry porque sua UI de fitness seria outro produto.
- O sistema de captions adapta o contraste editorial do componente `caption-editorial-emphasis`.
- A locução usa grafia fonética em “look(s)” e “closet” e uma pausa breve na marca; a tela mantém a ortografia correta.
"""
(ROOT / "STORYBOARD.md").write_text(storyboard)

spec = f"""# SPEC — Truque dos Mil Looks

GOAL: fazer a espectadora entender que o app cria possibilidades com o que ela já tem e conduzir ao clique.
OUTPUT: HyperFrames, 1080×1920, 60 fps, H.264/AAC, SDR.
TIME: {D:.0f} s × 60 = {int(D*60)} quadros; trilha original a 100 BPM; locução termina em {T['voice_end']:.2f} s.
LOOK: plum {PLUM}, cream {CREAM}, coral {CORAL}, sage {SAGE}; fotografia editorial e UI real;
      EBGaramond 700 para display, Inter variável para leitura; grain estático a 5%;
      sombra de telefone 30 px/70 px/24%; light sweep de 1,05 s somente em mudanças de mundo.
OBJECTS: duas modelos fornecidas, três artes reais do app, recortes reais das telas, telefone,
         tipografia da marca, captions e CTA. Nenhum dashboard, botão ou tela de outro produto.
MOTION: câmera 1,00→1,16 por shot; entradas por clip-path de 0,52 s; rises de 0,46 s;
        rolagem de UI linear; um hero move por shot; captions estáveis após 0,18 s.
SHOTS: ver STORYBOARD.md; tempos derivados de build/timeline.json, nunca estimados no HTML.
BANNED: void preto com elementos pequenos; glow/neon; gradiente roxo; três cards genéricos;
        dashboard fictício; lip-sync de foto; logo no canto; texto abaixo de 28 px;
        movimento infinito; Math.random; timers; rede; CSS keyframes; alegação de download grátis.
QA: frame 0; cada corte; 40,8 s; 45,7 s; 49,5 s; 56,5 s; 66,5 s; 72,8 s; 82,5 s; 86,5 s;
    captions a 360 px; rolagem sem texto cortado; CTA estável; loudness e silêncio medidos.
"""
(ROOT / "SPEC.md").write_text(spec)

print(f"Composição construída: {D:.0f}s, {int(D*60)} quadros, {len(T['scenes'])} mundos + captions")
for s in T["scenes"]:
    print(f"{s['id']:8s} {s['start']:6.2f}–{s['end']:6.2f} ({s['duration']:.2f}s)")
