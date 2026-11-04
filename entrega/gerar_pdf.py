#!/usr/bin/env python3
"""Gera o PDF entregável base do produto Truque dos Mil Looks."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                Spacer, Table, TableStyle, PageBreak, KeepTogether)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.fonts import addMapping

# --- Fonts (DejaVu suporta acentos PT-BR) ---
FD = "/usr/share/fonts/truetype/dejavu"
pdfmetrics.registerFont(TTFont("DejaVu", f"{FD}/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DejaVu-Bold", f"{FD}/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("DejaVu-Serif", f"{FD}/DejaVuSerif.ttf"))
pdfmetrics.registerFont(TTFont("DejaVu-Serif-Bold", f"{FD}/DejaVuSerif-Bold.ttf"))
addMapping("DejaVu", 0, 0, "DejaVu")
addMapping("DejaVu", 1, 0, "DejaVu-Bold")
addMapping("DejaVu-Serif", 0, 0, "DejaVu-Serif")
addMapping("DejaVu-Serif", 1, 0, "DejaVu-Serif-Bold")

# --- Palette ---
PLUM = colors.HexColor("#4A1E3F")
PLUM_D = colors.HexColor("#351529")
GOLD = colors.HexColor("#C9A227")
CREAM = colors.HexColor("#FAF5EF")
INK = colors.HexColor("#2B2428")
GREY = colors.HexColor("#7A7075")
LINE = colors.HexColor("#E4DBD2")
ROSE = colors.HexColor("#8E4B6E")

W, H = A4

# --- Styles ---
S = {}
S["cover_title"] = ParagraphStyle("cover_title", fontName="DejaVu-Serif-Bold", fontSize=44,
                                  leading=52, textColor=PLUM_D, alignment=TA_CENTER, spaceAfter=6*mm)
S["cover_sub"] = ParagraphStyle("cover_sub", fontName="DejaVu", fontSize=15,
                                leading=22, textColor=INK, alignment=TA_CENTER, spaceAfter=4*mm)
S["cover_tag"] = ParagraphStyle("cover_tag", fontName="DejaVu-Bold", fontSize=11,
                                leading=16, textColor=GOLD, alignment=TA_CENTER)
S["cover_meta"] = ParagraphStyle("cover_meta", fontName="DejaVu", fontSize=9,
                                 leading=14, textColor=GREY, alignment=TA_CENTER)
S["h1"] = ParagraphStyle("h1", fontName="DejaVu-Serif-Bold", fontSize=24,
                         leading=30, textColor=PLUM_D, spaceBefore=2*mm, spaceAfter=4*mm)
S["h2"] = ParagraphStyle("h2", fontName="DejaVu-Bold", fontSize=13,
                         leading=17, textColor=ROSE, spaceBefore=3*mm, spaceAfter=2*mm)
S["body"] = ParagraphStyle("body", fontName="DejaVu", fontSize=10.5,
                           leading=16, textColor=INK, spaceAfter=2.5*mm)
S["bullet"] = ParagraphStyle("bullet", fontName="DejaVu", fontSize=10.5,
                             leading=16, textColor=INK, leftIndent=6*mm,
                             bulletIndent=1.5*mm, spaceAfter=1.6*mm)
S["small"] = ParagraphStyle("small", fontName="DejaVu", fontSize=8.5,
                            leading=12, textColor=GREY)
S["kpi"] = ParagraphStyle("kpi", fontName="DejaVu-Serif-Bold", fontSize=20,
                          leading=24, textColor=PLUM_D, alignment=TA_CENTER)
S["kpi_l"] = ParagraphStyle("kpi_l", fontName="DejaVu", fontSize=8.5,
                            leading=12, textColor=GREY, alignment=TA_CENTER)

def P(txt, style="body"):
    return Paragraph(txt, S[style])

def bullets(items, style="bullet"):
    return [Paragraph(f'<bullet>&bull;</bullet>{t}', S[style]) for t in items]

# --- Page decoration ---
def cover_bg(canv, doc):
    canv.saveState()
    canv.setFillColor(CREAM)
    canv.rect(0, 0, W, H, stroke=0, fill=1)
    # big plum band bottom
    canv.setFillColor(PLUM)
    canv.rect(0, 0, W, 46*mm, stroke=0, fill=1)
    canv.setFillColor(GOLD)
    canv.rect(0, 46*mm, W, 1.5*mm, stroke=0, fill=1)
    # soft blobs
    canv.setFillColor(colors.HexColor("#F3E9E0"))
    canv.circle(W*0.12, H*0.86, 58*mm, stroke=0, fill=1)
    canv.circle(W*0.9, H*0.18, 52*mm, stroke=0, fill=1)
    canv.restoreState()

def inner_bg(canv, doc):
    canv.saveState()
    canv.setFillColor(CREAM)
    canv.rect(0, 0, W, H, stroke=0, fill=1)
    # header rule
    canv.setStrokeColor(LINE)
    canv.setLineWidth(0.8)
    canv.line(18*mm, H-16*mm, W-18*mm, H-16*mm)
    canv.setFillColor(PLUM)
    canv.rect(18*mm, H-18*mm, 3.5*mm, 3.5*mm, stroke=0, fill=1)
    # footer
    canv.setFillColor(GREY)
    canv.setFont("DejaVu", 7.5)
    canv.drawString(18*mm, 10*mm, "Truque dos Mil Looks — Entrega Base para Testes")
    canv.drawRightString(W-18*mm, 10*mm, f"Página {doc.page}")
    canv.setStrokeColor(LINE)
    canv.line(18*mm, 14*mm, W-18*mm, 14*mm)
    canv.restoreState()

doc = BaseDocTemplate("/home/user/PRINCIPALEDI-O/entrega/Truque_dos_Mil_Looks.pdf",
                      pagesize=A4, leftMargin=18*mm, rightMargin=18*mm,
                      topMargin=22*mm, bottomMargin=18*mm,
                      title="Truque dos Mil Looks — Entrega Base para Testes",
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
story.append(P("TRUQUE DOS MIL LOOKS", "cover_title"))
story.append(Spacer(1, 2*mm))
story.append(P("Descubra o truque para gastar menos e montar muito mais looks", "cover_sub"))
story.append(Spacer(1, 8*mm))
# gold divider
div = Table([[""]], colWidths=[70*mm], rowHeights=[1.2*mm])
div.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), GOLD)]))
story.append(div)
story.append(Spacer(1, 8*mm))
story.append(P("QUIZ INTELIGENTE + RELATÓRIO PERSONALIZADO DE ESTILO", "cover_tag"))
story.append(Spacer(1, 4*mm))
story.append(P("+120 mil mulheres já transformaram seu guarda-roupa", "cover_sub"))
story.append(Spacer(1, 10*mm))
story.append(P("Produto: Truque dos Mil Looks &nbsp;|&nbsp; Entrega base para testes &nbsp;|&nbsp; 2026", "cover_meta"))
story.append(PageBreak())

# ============ O QUE É ============
story.append(P("O que é o Truque dos Mil Looks", "h1"))
story.append(P(
    "O <b>Truque dos Mil Looks</b> é um produto digital de consultoria de estilo em formato de "
    "quiz interativo. Em 13 perguntas rápidas, ele mapeia seu guarda-roupa, sua silhueta, seu "
    "estilo e as ocasiões da sua vida — e mostra, com as peças que você já tem, como montar "
    "milhares de combinações sem comprar quase nada novo."
))
story.append(P(
    "A promessa central é simples e poderosa: <b>1 peça pode virar 5 looks</b>. E com a "
    "matemática do seu armário, você descobre que já tem tudo para vestir bem todos os dias."
))
story.append(Spacer(1, 3*mm))
story.append(P("Pilares do produto", "h2"))
story.extend(bullets([
    "<b>Gastar menos</b> — parar de comprar errado e desperdiçar dinheiro.",
    "<b>Montar muito mais</b> — criar looks para trabalho, passeio, evento e viagem.",
    "<b>Usar o que tem</b> — valorizar as peças que já estão no guarda-roupa.",
    "<b>Se sentir bem</b> — autoestima, elegância sem esforço e praticidade no dia a dia.",
]))
story.append(Spacer(1, 3*mm))
kpi = Table([[P("13", "kpi"), P("1 peça = 5 looks", "kpi"), P("971", "kpi"), P("88%", "kpi")],
             [P("perguntas do quiz", "kpi_l"), P("na prática", "kpi_l"),
              P("pessoas no grupo WhatsApp", "kpi_l"), P("OFF no plano", "kpi_l")]],
            colWidths=[42*mm]*4)
kpi.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#F6ECDF")),
    ("BOX", (0,0), (-1,-1), 0.8, LINE),
    ("INNERGRID", (0,0), (-1,-1), 0.8, LINE),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("TOPPADDING", (0,0), (-1,-1), 5*mm),
    ("BOTTOMPADDING", (0,0), (-1,-1), 5*mm),
]))
story.append(kpi)
story.append(PageBreak())

# ============ A METODOLOGIA ============
story.append(P("A metodologia: o truque na prática", "h1"))
story.append(P(
    "O método parte de uma premissa: <b>você não tem falta de roupa — tem falta de combinação</b>. "
    "Ao cruzar o perfil da mulher com as peças do armário, o produto transforma looks aparentes "
    "em possibilidades reais."
))
story.append(P("Como funciona, passo a passo", "h2"))
story.extend(bullets([
    "<b>1. Mapeamento do guarda-roupa</b> — contagem de peças, porcentagem realmente usada, "
    "peças base e peças de destaque.",
    "<b>2. Análise da silhueta</b> — identificação do corpo predominante (ampulheta, triângulo, "
    "oval, reto, invertido) para sugerir modelagens que valorizem.",
    "<b>3. Perfil de estilo</b> — clássica elegante, moderna minimalista, casual, chique ou luxo.",
    "<b>4. Ocasiões da vida real</b> — trabalho, passeios, eventos, encontros e viagens.",
    "<b>5. Cálculo de combinações</b> — quantas combinações são possíveis com o que já existe.",
    "<b>6. Relatório personalizado</b> — plano de looks, compras inteligentes e lista de compras.",
]))
story.append(Spacer(1, 3*mm))
story.append(P("Exemplo do truque em ação", "h2"))
story.append(P(
    "Uma mesma peça base, combinada com diferentes básicas, sobreposições e acessórios, "
    "vira cinco visuais completos:"
))
ex = Table([
    [P("<b>1 peça, 5 looks lindos</b>", "body")],
    [P("Casual Chic · Trabalho Elegante · Leve e Moderno · Noite Elegante · Viagem prática", "body")],
], colWidths=[W-36*mm])
ex.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#F6ECDF")),
    ("BOX", (0,0), (-1,-1), 0.8, GOLD),
    ("TOPPADDING", (0,0), (-1,-1), 3*mm),
    ("BOTTOMPADDING", (0,0), (-1,-1), 3*mm),
    ("LEFTPADDING", (0,0), (-1,-1), 5*mm),
]))
story.append(ex)
story.append(Spacer(1, 2*mm))
story.append(P(
    "Na prática, o produto também mostra como <b>1 camisa vira 3 looks estilosos</b> — o "
    "exemplo mais didático usado na comunicação para provar que o armário já responde."
))
story.append(PageBreak())

# ============ O QUIZ ============
story.append(P("O quiz: 13 perguntas transformadoras", "h1"))
story.append(P(
    "O quiz é a porta de entrada do produto. Cada pergunta captura um dado que alimenta o "
    "cálculo do perfil e do relatório final. São 13 perguntas, sem cadastro de e-mail e sem "
    "coleta de dados pessoais."
))
story.append(P("As 13 perguntas do quiz", "h2"))
quiz = [
    ("1", "Qual é a sua faixa de idade?", "18–24 · 25–34 · 35–44 · 45 anos ou mais"),
    ("2", "Como está seu guarda-roupa hoje?", "Cheio de peças que não combinam · Abro, olho tudo e fico angustiada"),
    ("3", "Qual é a sua maior dificuldade com o guarda-roupa?", "Combinar peças que já tenho · Saber o que valoriza meu corpo · Parar de comprar errado · Montar looks em pouco tempo"),
    ("4", "Qual desses estilos é mais a sua cara?", "Clássica elegante · Moderna minimalista · Casual · Chique · Luxo"),
    ("5", "Qual é o seu tipo de corpo predominante?", "Ampulheta · Triângulo · Oval · Reto · Invertido · Volume no centro · Ombros largos"),
    ("6", "1 peça, 5 looks lindos", "O truque na prática, com exemplo de combinações para cada ocasião"),
    ("7", "Para quais ocasiões você mais precisa de looks?", "Trabalho · Passeios e fim de semana · Eventos e festas · Encontros · Viagens"),
    ("8", "Você tem quantas roupas no guarda-roupa?", "Menos de 20 · 20 a 40 · 40 a 70 · 70 ou mais · Nem sei contar"),
    ("9", "Quanto tempo você leva para escolher um look?", "Até 5 min · 5 a 15 · 15 a 30 · Mais de 30 · Saio insatisfeita mesmo assim"),
    ("10", "O que você sente quando abre o guarda-roupa de manhã?", "Ansiedade · Tédio · Culpa · Indiferença"),
    ("11", "Como você quer se sentir ao montar seus novos looks?", "Poderosa e confiante · Elegante sem esforço · Leve e decidida · Saber na hora o que vestir"),
    ("12", "Quanto do guarda-roupa você usa de verdade?", "Menos de 20% · O resto é “um dia eu uso” · 20–40% · 40–60% · Quase tudo"),
    ("13", "Qual é a sua maior objetivo com seu estilo?", "Autoestima · Elegância sem esforço · Praticidade · Economia inteligente"),
]
rows = []
for n, q, opts in quiz:
    rows.append([P(f"<b>{n}</b>", "body"), P(f"<b>{q}</b>", "body"), P(opts, "small")])
tq = Table(rows, colWidths=[12*mm, 62*mm, 92*mm])
tq.setStyle(TableStyle([
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("ROWBACKGROUNDS", (0,0), (-1,-1), [CREAM, colors.HexColor("#F6ECDF")]),
    ("LINEBELOW", (0,0), (-1,-2), 0.5, LINE),
    ("LEFTPADDING", (0,0), (-1,-1), 3*mm),
    ("RIGHTPADDING", (0,0), (-1,-1), 3*mm),
    ("TOPPADDING", (0,0), (-1,-1), 2.2*mm),
    ("BOTTOMPADDING", (0,0), (-1,-1), 2.2*mm),
]))
story.append(tq)
story.append(PageBreak())

# ============ RELATORIO ============
story.append(P("O relatório personalizado", "h1"))
story.append(P(
    "Depois da 13ª pergunta, o produto cruza as respostas com o método Truque dos Mil Looks "
    "e monta um relatório pessoal. O momento de revelação mostra o processo de análise em "
    "cada etapa, até entregar o resultado final."
))
story.append(P("O processo de análise", "h2"))
story.extend(bullets([
    "<b>Cruzando suas respostas com o método Truque dos Mil Looks</b> — perfis de estilo, "
    "dificuldades e objetivos.",
    "<b>Mapeando suas peças e ocasiões</b> — o que você tem vs. onde você precisa de looks.",
    "<b>Calculando combinações possíveis</b> — a prova numérica de que há mais looks do que "
    "você imagina.",
    "<b>Identificando seu perfil de estilo</b> — clássica, moderna, casual, chique ou luxo.",
    "<b>Montando seu relatório pessoal</b> — plano de looks e orientações de compra.",
]))
story.append(Spacer(1, 3*mm))
story.append(P("O que a mulher recebe", "h2"))
story.extend(bullets([
    "Plano de looks personalizado para suas ocasiões.",
    "Modelagens que valorizam sua silhueta.",
    "Lista de compras inteligente — o que realmente vale a pena comprar.",
    "Links exclusivos de produtos em promoção (MercadoLivre e sites secretos).",
    "Acesso ao grupo WhatsApp com a comunidade (971 pessoas, vagas quase esgotadas).",
]))
story.append(PageBreak())

# ============ OFERTA / FUNIL ============
story.append(P("A oferta: de relatório a assinatura", "h1"))
story.append(P(
    "O relatório personalizado é a porta de entrada para o plano pago. O funil converte a "
    "descoberta em engajamento (grupo WhatsApp) e depois em venda (plano Truque dos Mil Looks)."
))
story.append(P("Pilare de conversão", "h2"))
story.extend(bullets([
    "<b>Grupo WhatsApp</b> — acesso à comunidade e links exclusivos de promoções: hoje 971 "
    "pessoas no grupo, vagas quase esgotando.",
    "<b>MercadoLivre</b> — produtos curados em promoção (ex.: conjunto de 179,90 por 66,90).",
    "<b>Site secreto</b> — curadoria de compras com produtos que valem muito a pena.",
    "<b>88% OFF</b> — desconto especial de lançamento no plano Truque dos Mil Looks.",
    "<b>Plano Personalizado</b> — o produto final, entregue no app.",
]))
story.append(Spacer(1, 3*mm))
story.append(P("Fluxo de funil", "h2"))
funil = [
    ["Quiz 13 perguntas", "Relatório personalizado", "Grupo WhatsApp + links exclusivos", "Plano Truque dos Mil Looks"],
    ["Gatilho: descobrimento", "Gatilho: valor entregue", "Gatilho: comunidade + promoções", "Gatilho: 88% OFF e plano personalizado"],
]
tf = Table([[P(c, "body") for c in row] for row in funil], colWidths=[42*mm]*4)
tf.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), PLUM),
    ("TEXTCOLOR", (0,0), (-1,0), colors.white),
    ("BACKGROUND", (0,1), (-1,1), colors.HexColor("#F6ECDF")),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("BOX", (0,0), (-1,-1), 0.8, GOLD),
    ("INNERGRID", (0,0), (-1,-1), 0.8, GOLD),
    ("TOPPADDING", (0,0), (-1,-1), 4*mm),
    ("BOTTOMPADDING", (0,0), (-1,-1), 4*mm),
]))
story.append(tf)
story.append(PageBreak())

# ============ PRÓXIMOS PASSOS ============
story.append(P("Como testar este entregavel", "h1"))
story.append(P(
    "Este PDF é a <b>entrega base para testes</b> do produto Truque dos Mil Looks. Ele apresenta "
    "o produto de forma completa: o que é, a metodologia, o quiz, o relatório e a oferta. "
    "A partir dele, podemos validar o conceito antes de construir algo maior."
))
story.append(P("Etapas de teste", "h2"))
story.extend(bullets([
    "<b>1. Leitura da equipe</b> — validar se a narrativa e os números refletem o produto real.",
    "<b>2. Apresentação para a primeira pessoa</b> — medir a reação ao conceito “1 peça, 5 looks”.",
    "<b>3. Revisão do quiz</b> — confirmar as 13 perguntas e as opções mais fortes de conversão.",
    "<b>4. Ajustes de oferta</b> — validar desconto, grupo WhatsApp e links de produtos.",
    "<b>5. Próxima fase</b> — transformar o conceito aprovado em uma landing page completa e app.",
]))
story.append(Spacer(1, 3*mm))
story.append(P("Próximo passo", "h2"))
story.append(P(
    "Com a aprovação desta entrega base, o próximo passo é construir a <b>landing page completa</b> "
    "do quiz — com header editorial, carrossel antes/depois, teste de todas as 13 perguntas, "
    "resultado de relatório e funil de conversão — e depois a estrutura do app. "
    "Este PDF já serve como o documento oficial de referência do produto."
))
story.append(Spacer(1, 8*mm))
story.append(P("Truque dos Mil Looks", "cover_title"))
story.append(P("Descubra o truque para gastar menos e montar muito mais looks", "cover_sub"))
story.append(P("+120 mil mulheres já transformaram seu guarda-roupa", "cover_sub"))

doc.build(story)
print("PDF gerado:", os.path.abspath(doc.filename))
