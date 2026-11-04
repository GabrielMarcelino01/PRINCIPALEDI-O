#!/usr/bin/env python3
"""Gera o PDF básico 'Como se vestir melhor' do Truque dos Mil Looks."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                Spacer, Table, TableStyle, PageBreak)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.fonts import addMapping

FD = "/usr/share/fonts/truetype/dejavu"
pdfmetrics.registerFont(TTFont("DejaVu", f"{FD}/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DejaVu-Bold", f"{FD}/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("DejaVu-Serif", f"{FD}/DejaVuSerif.ttf"))
pdfmetrics.registerFont(TTFont("DejaVu-Serif-Bold", f"{FD}/DejaVuSerif-Bold.ttf"))
addMapping("DejaVu", 0, 0, "DejaVu")
addMapping("DejaVu", 1, 0, "DejaVu-Bold")
addMapping("DejaVu-Serif", 0, 0, "DejaVu-Serif")
addMapping("DejaVu-Serif", 1, 0, "DejaVu-Serif-Bold")

PLUM = colors.HexColor("#4A1E3F")
PLUM_D = colors.HexColor("#351529")
GOLD = colors.HexColor("#C9A227")
CREAM = colors.HexColor("#FAF5EF")
INK = colors.HexColor("#2B2428")
GREY = colors.HexColor("#7A7075")
LINE = colors.HexColor("#E4DBD2")
ROSE = colors.HexColor("#8E4B6E")

W, H = A4

S = {}
S["cover_title"] = ParagraphStyle("cover_title", fontName="DejaVu-Serif-Bold", fontSize=40,
                                  leading=48, textColor=PLUM_D, alignment=TA_CENTER, spaceAfter=6*mm)
S["cover_sub"] = ParagraphStyle("cover_sub", fontName="DejaVu", fontSize=14,
                                leading=20, textColor=INK, alignment=TA_CENTER, spaceAfter=4*mm)
S["cover_tag"] = ParagraphStyle("cover_tag", fontName="DejaVu-Bold", fontSize=11,
                                leading=16, textColor=GOLD, alignment=TA_CENTER)
S["cover_meta"] = ParagraphStyle("cover_meta", fontName="DejaVu", fontSize=9,
                                 leading=14, textColor=GREY, alignment=TA_CENTER)
S["h1"] = ParagraphStyle("h1", fontName="DejaVu-Serif-Bold", fontSize=22,
                         leading=28, textColor=PLUM_D, spaceBefore=2*mm, spaceAfter=4*mm)
S["h2"] = ParagraphStyle("h2", fontName="DejaVu-Bold", fontSize=12.5,
                         leading=16, textColor=ROSE, spaceBefore=3*mm, spaceAfter=2*mm)
S["body"] = ParagraphStyle("body", fontName="DejaVu", fontSize=10.5,
                           leading=16, textColor=INK, spaceAfter=2.5*mm)
S["bullet"] = ParagraphStyle("bullet", fontName="DejaVu", fontSize=10.5,
                             leading=16, textColor=INK, leftIndent=6*mm,
                             bulletIndent=1.5*mm, spaceAfter=1.6*mm)
S["small"] = ParagraphStyle("small", fontName="DejaVu", fontSize=8.5,
                            leading=12, textColor=GREY)
S["cell"] = ParagraphStyle("cell", fontName="DejaVu", fontSize=9.5,
                           leading=13, textColor=INK)
S["cell_b"] = ParagraphStyle("cell_b", fontName="DejaVu-Bold", fontSize=9.5,
                             leading=13, textColor=PLUM_D)

def P(txt, style="body"):
    return Paragraph(txt, S[style])

def bullets(items, style="bullet"):
    return [Paragraph(f'<bullet>&bull;</bullet>{t}', S[style]) for t in items]

def cover_bg(canv, doc):
    canv.saveState()
    canv.setFillColor(CREAM)
    canv.rect(0, 0, W, H, stroke=0, fill=1)
    canv.setFillColor(PLUM)
    canv.rect(0, 0, W, 44*mm, stroke=0, fill=1)
    canv.setFillColor(GOLD)
    canv.rect(0, 44*mm, W, 1.5*mm, stroke=0, fill=1)
    canv.setFillColor(colors.HexColor("#F3E9E0"))
    canv.circle(W*0.1, H*0.88, 55*mm, stroke=0, fill=1)
    canv.circle(W*0.92, H*0.16, 50*mm, stroke=0, fill=1)
    canv.restoreState()

def inner_bg(canv, doc):
    canv.saveState()
    canv.setFillColor(CREAM)
    canv.rect(0, 0, W, H, stroke=0, fill=1)
    canv.setStrokeColor(LINE)
    canv.setLineWidth(0.8)
    canv.line(18*mm, H-16*mm, W-18*mm, H-16*mm)
    canv.setFillColor(PLUM)
    canv.rect(18*mm, H-18*mm, 3.5*mm, 3.5*mm, stroke=0, fill=1)
    canv.setFillColor(GREY)
    canv.setFont("DejaVu", 7.5)
    canv.drawString(18*mm, 10*mm, "Truque dos Mil Looks — Guia Básico")
    canv.drawRightString(W-18*mm, 10*mm, f"Página {doc.page}")
    canv.setStrokeColor(LINE)
    canv.line(18*mm, 14*mm, W-18*mm, 14*mm)
    canv.restoreState()

doc = BaseDocTemplate("/home/user/PRINCIPALEDI-O/entrega/Como_vestir_melhor.pdf",
                      pagesize=A4, leftMargin=18*mm, rightMargin=18*mm,
                      topMargin=22*mm, bottomMargin=18*mm,
                      title="Como se vestir melhor — Truque dos Mil Looks",
                      author="Gabriel Marcelino")
frame_cover = Frame(18*mm, 24*mm, W-36*mm, H-70*mm, id="cover")
frame_inner = Frame(18*mm, 20*mm, W-36*mm, H-46*mm, id="inner")
doc.addPageTemplates([
    PageTemplate(id="cover", frames=[frame_cover], onPage=cover_bg),
    PageTemplate(id="inner", frames=[frame_inner], onPage=inner_bg),
])

story = []

# ============ COVER ============
story.append(Spacer(1, 22*mm))
story.append(P("COMO VESTIR MELHOR", "cover_title"))
story.append(Spacer(1, 2*mm))
story.append(P("Guia básico do Truque dos Mil Looks", "cover_sub"))
story.append(Spacer(1, 6*mm))
div = Table([[""]], colWidths=[70*mm], rowHeights=[1.2*mm])
div.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), GOLD)]))
story.append(div)
story.append(Spacer(1, 6*mm))
story.append(P("TOM DE ROUPA · SILHUETA · ESTILO · OCASIÕES", "cover_tag"))
story.append(Spacer(1, 4*mm))
story.append(P("1 peça = 5 looks lindos", "cover_sub"))
story.append(Spacer(1, 8*mm))
story.append(P("Entrega básica · Truque dos Mil Looks · 2026", "cover_meta"))
story.append(PageBreak())

# ============ O TRÂNQUE ============
story.append(P("O truque: você não tem falta de roupa, tem falta de combinação", "h1"))
story.append(P(
    "A maioria das mulheres olha o armário cheio e sente que não tem nada para vestir. "
    "A verdade é outra: <b>você tem peças suficientes para montar milhares de looks</b> — "
    "só falta o truque para combinar o que já tem."
))
story.append(P("A matemática simples", "h2"))
story.append(P(
    "Se você tem 20 peças e 8 delas são base (calças, blusas neutras, vestidos), cada base "
    "pode ser combinada com diferentes sobreposições e acessórios. Isso transforma um armário "
    "comum em dezenas de visuais para todas as ocasiões da sua vida."
))
story.append(Spacer(1, 2*mm))
kpi = Table([[P("13", "cell_b"), P("1 peça = 5 looks", "cell_b"), P("5", "cell_b")],
             [P("perguntas do quiz", "small"), P("o truque na prática", "small"),
              P("silhuetas principais", "small")]],
            colWidths=[50*mm]*3)
kpi.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#F6ECDF")),
    ("BOX", (0,0), (-1,-1), 0.8, LINE),
    ("INNERGRID", (0,0), (-1,-1), 0.8, LINE),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("TOPPADDING", (0,0), (-1,-1), 4*mm),
    ("BOTTOMPADDING", (0,0), (-1,-1), 4*mm),
]))
story.append(kpi)
story.append(PageBreak())

# ============ TOM DE ROUPA ============
story.append(P("Tom de roupa: cores que valorizam você", "h1"))
story.append(P(
    "O tom da sua pele define as cores que mais combinam com você. Quando as roupas harmonizam "
    "com o tom da pele, o visual fica mais valorizado — e isso é o primeiro passo do truque."
))
story.append(P("Como identificar o seu tom", "h2"))
story.extend(bullets([
    "<b>Toque no pulso</b> sob luz natural: veias azuis/violetas = tom frio; verdes = tom quente.",
    "<b>Experimente prata e ouro</b>: prata valoriza tom frio; ouro valoriza tom quente.",
    "<b>Observe as bochechas</b>: rosadas ou azuis = frio; amareladas = quente.",
]))
story.append(P("Cores por tom", "h2"))
cores = [
    ["", "Tom quente", "Tom frio"],
    ["Cores que valorizam",
     "Marrom, mostarda, laranja, verde musgo, amarelo dourado, vermelho tijolo",
     "Azul marinho, roxo, verde esmeralda, rosa choque, vermelho violeta"],
    ["Cores neutras universais",
     "Branco, preto, cinza, camelo, azul jeans — usam com qualquer tom",
     "Mesma: brancas, preto, cinza, branco, jeans, camelo"],
    ["Acessórios",
     "Ouro, couro marrom, marfim",
     "Prata, couro preto, branco"],
]
tc = Table([[P(f"<b>{c}</b>", "cell") if i==0 else P(c, "cell") for c in row] for i, row in enumerate(cores)],
           colWidths=[36*mm, 62*mm, 62*mm])
tc.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), PLUM),
    ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#F6ECDF")]),
    ("BOX", (0,0), (-1,-1), 0.8, GOLD),
    ("INNERGRID", (0,0), (-1,-1), 0.8, LINE),
    ("TOPPADDING", (0,0), (-1,-1), 3*mm),
    ("BOTTOMPADDING", (0,0), (-1,-1), 3*mm),
]))
story.append(tc)
story.append(PageBreak())

# ============ SILHUETAS ============
story.append(P("Silhueta: modelagens que valorizam seu corpo", "h1"))
story.append(P(
    "Cada corpo tem uma silhueta predominante. Conhecer a sua é o segundo passo do truque: "
    "modelagens certas valorizam, evitam volumes desnecessários e deixam o visual mais alinhado."
))
story.append(P("As 5 silhuetas e o que valoriza cada uma", "h2"))
sil = [
    ("Ampulheta", "Curvas marcadas, cintura definida",
     "Modelagens justas na cintura, cintura alta, vestidos acinturados"),
    ("Triângulo", "Ombros mais largos, pernas mais finas",
     "Blusas com detalhes acima da cintura, calças straight, saias midi"),
    ("Oval", "Volume no centro, pernas e ombros mais finos",
     "V-necks, modelagens fluidas, tecidos leves, mangas 3/4"),
    ("Reto", "Ombros, cintura e quadril na mesma linha",
     "Cintura marcada, peças com volume nos quadris, modelagens estruturadas"),
    ("Invertido", "Ombros finos, quadril mais largo",
     "Blusas com detalhes, blazers, calças pantalona, saias evasê"),
]
rows = []
for n, desc, val in sil:
    rows.append([P(f"<b>{n}</b>", "cell"), P(desc, "cell"), P(val, "cell")])
ts = Table(rows, colWidths=[28*mm, 60*mm, 72*mm])
ts.setStyle(TableStyle([
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("ROWBACKGROUNDS", (0,0), (-1,-1), [colors.white, colors.HexColor("#F6ECDF")]),
    ("LINEBELOW", (0,0), (-1,-2), 0.5, LINE),
    ("LEFTPADDING", (0,0), (-1,-1), 3*mm),
    ("RIGHTPADDING", (0,0), (-1,-1), 3*mm),
    ("TOPPADDING", (0,0), (-1,-1), 2.4*mm),
    ("BOTTOMPADDING", (0,0), (-1,-1), 2.4*mm),
]))
story.append(ts)
story.append(PageBreak())

# ============ ESTILO ============
story.append(P("Estilo: qual é a sua cara", "h1"))
story.append(P(
    "Saber o estilo que combina com você transforma qualquer peça em um visual com personalidade. "
    "Não é sobre copiar — é sobre descobrir o que faz seu olho brilhar."
))
story.append(P("Perfis de estilo", "h2"))
est = [
    ("Clássica elegante", "Alfaiataria, neutros, joias discretas, cortes impecáveis", "Blazer, camisa, calças de alfaiataria, vestidos midi"),
    ("Moderna minimalista", "Linhas limpas, básicos bem cortados, poucos elementos", "Básicos de algodão, calças straight, blusas de corte geométrico"),
    ("Casual", "Conforto sem perder a elegância", "Jeans, camisetas, moletoms, tênis limpos, sobreposições"),
    ("Chique", "Peças com detalhes, tecidos nobres, acessórios marcantes", "Tule, seda, pedrarias, salto alto, bolsa estruturada"),
    ("Luxo", "Qualidade acima de quantidade, peças atemporais", "Couro, caxemira, peças assinadas, acessórios fine"),
]
rows = []
for n, desc, ex in est:
    rows.append([P(f"<b>{n}</b>", "cell"), P(desc, "cell"), P(ex, "cell")])
te = Table(rows, colWidths=[32*mm, 58*mm, 70*mm])
te.setStyle(TableStyle([
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("ROWBACKGROUNDS", (0,0), (-1,-1), [colors.white, colors.HexColor("#F6ECDF")]),
    ("LINEBELOW", (0,0), (-1,-2), 0.5, LINE),
    ("LEFTPADDING", (0,0), (-1,-1), 3*mm),
    ("RIGHTPADDING", (0,0), (-1,-1), 3*mm),
    ("TOPPADDING", (0,0), (-1,-1), 2.4*mm),
    ("BOTTOMPADDING", (0,0), (-1,-1), 2.4*mm),
]))
story.append(te)
story.append(PageBreak())

# ============ OCASIÕES ============
story.append(P("Ocasiões: looks para a sua vida real", "h1"))
story.append(P(
    "Um look não serve para tudo. O truque é ter, para cada ocasião da sua vida, peças-base "
    "que permitem montar visuais diferentes sem sair do seu estilo."
))
story.append(P("Ocasiões e o look ideal", "h2"))
occ = [
    ("Trabalho", "Elegante sem esforço", "Blazer + calça alfaiataria + blusa neutra; sapato fechado"),
    ("Passeios e fim de semana", "Leve e moderno", "Jeans + blusa básica + tênis; sobreposição de camiseta"),
    ("Eventos e festas", "Chique e marcante", "Vestido ou conjunto com detalhes; acessórios marcantes"),
    ("Encontros", "Poderosa e confiante", "Look com um ponto de destaque: peça ou acessório"),
    ("Viagens", "Prático e versátil", "Conjuntos confortáveis, calças stretch, blusas leves"),
]
rows = []
for n, tag, ex in occ:
    rows.append([P(f"<b>{n}</b>", "cell"), P(tag, "cell"), P(ex, "cell")])
to = Table(rows, colWidths=[38*mm, 40*mm, 82*mm])
to.setStyle(TableStyle([
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("ROWBACKGROUNDS", (0,0), (-1,-1), [colors.white, colors.HexColor("#F6ECDF")]),
    ("LINEBELOW", (0,0), (-1,-2), 0.5, LINE),
    ("LEFTPADDING", (0,0), (-1,-1), 3*mm),
    ("RIGHTPADDING", (0,0), (-1,-1), 3*mm),
    ("TOPPADDING", (0,0), (-1,-1), 2.4*mm),
    ("BOTTOMPADDING", (0,0), (-1,-1), 2.4*mm),
]))
story.append(to)
story.append(PageBreak())

# ============ O TRÂNQUE NA PRÁTICA ============
story.append(P("O truque na prática: 1 peça, 5 looks", "h1"))
story.append(P(
    "Pegue uma peça base — uma calça, uma camisa ou um vestido — e combine com diferentes "
    "básicas, sobreposições e acessórios. O resultado: <b>5 looks lindos de uma mesma peça</b>."
))
story.append(P("Exemplo: 1 peça, 5 looks lindos", "h2"))
looks = [
    ("Casual Chic", "Calça + blusa básica + tênis + bolsa casual"),
    ("Trabalho Elegante", "Calça + blazer + blusa de seda + sapato fechado"),
    ("Leve e Moderno", "Calça + camiseta + sobreposição de camisa + chinelos limpos"),
    ("Noite Elegante", "Calça + blusa com detalhes + salto alto + acessórios marcantes"),
    ("Viagem", "Calça + blusa leve + sobrecasaco + sapato confortável"),
]
rows = []
for n, ex in looks:
    rows.append([P(f"<b>{n}</b>", "cell"), P(ex, "cell")])
tl = Table(rows, colWidths=[38*mm, 122*mm])
tl.setStyle(TableStyle([
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("ROWBACKGROUNDS", (0,0), (-1,-1), [colors.white, colors.HexColor("#F6ECDF")]),
    ("LINEBELOW", (0,0), (-1,-2), 0.5, LINE),
    ("LEFTPADDING", (0,0), (-1,-1), 3*mm),
    ("RIGHTPADDING", (0,0), (-1,-1), 3*mm),
    ("TOPPADDING", (0,0), (-1,-1), 2.4*mm),
    ("BOTTOMPADDING", (0,0), (-1,-1), 2.4*mm),
]))
story.append(tl)
story.append(Spacer(1, 3*mm))
story.append(P("O mesmo vale para uma camisa: 1 camisa vira 3 looks estilosos", "h2"))
story.extend(bullets([
    "<b>Look 1</b>: camisa + calça jeans + tênis = casual.",
    "<b>Look 2</b>: camisa + calça alfaiataria + salto = trabalho.",
    "<b>Look 3</b>: camisa amarrada + saia midi + acessórios = passeio.",
]))
story.append(PageBreak())

# ============ DICAS RÁPIDAS ============
story.append(P("Dicas rápidas para se vestir melhor hoje", "h1"))
story.extend(bullets([
    "<b>Comece pelo tom da pele</b> — roupas harmoniosas valorizam mais.",
    "<b>Conheça sua silhueta</b> — modelagens certas fazem diferença.",
    "<b>Separe peças-base</b> — neutras e versáteis são a base do truque.",
    "<b>Monte por ocasião</b> — trabalho, passeio, evento, encontro e viagem.",
    "<b>Use acessórios</b> — um ponto de destaque transforma qualquer look.",
    "<b>Menos é mais</b> — qualidade das peças > quantidade de peças.",
    "<b>Revise o armário periodicamente</b> — o que você usa de verdade vira base.",
]))
story.append(Spacer(1, 4*mm))
story.append(P("Próximo passo: o Quiz dos Mil Looks", "h2"))
story.append(P(
    "Este guia é a base. O <b>Quiz dos Mil Looks</b> pega tudo isso — tom, silhueta, estilo, "
    "ocasiões — e monta um <b>relatório personalizado</b> com plano de looks, combinações "
    "possíveis e lista de compras inteligente. Responda 13 perguntas e descubra como montar "
    "mil looks com o que você já tem."
))
story.append(Spacer(1, 8*mm))
story.append(P("Truque dos Mil Looks", "cover_title"))
story.append(P("1 peça = 5 looks lindos", "cover_sub"))
story.append(P("Descubra o truque para gastar menos e montar muito mais looks", "cover_sub"))

doc.build(story)
print("PDF gerado:", os.path.abspath(doc.filename))
