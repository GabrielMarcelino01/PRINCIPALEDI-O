# -*- coding: utf-8 -*-
"""
Design system do bônus premium — Calistenia Asiática H40+ (es-MX)
Utilitários de layout sobre ReportLab: paleta, tipografia, caixas, tabelas,
numeração e rodapé editorial.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                Spacer, Table, TableStyle, Image, KeepTogether,
                                Flowable)
from reportlab.platypus.tableofcontents import TableOfContents

# ---------------------------------------------------------------- paleta
INK        = HexColor("#14171A")   # carvão quase preto
INK_SOFT   = HexColor("#2A2F35")
GRAPHITE   = HexColor("#5A626B")
SILVER     = HexColor("#98A0A8")
LINE       = HexColor("#D8D3CB")
PAPER      = HexColor("#FBF9F5")   # papel quente
PAPER_ALT  = HexColor("#F3EFE7")
BONE       = HexColor("#E8E2D6")
CRIMSON    = HexColor("#8E2F2F")   # acento único
SAGE       = HexColor("#5F6F5E")

PAGE_W, PAGE_H = A4

# ---------------------------------------------------------------- fontes
_FDIR = "assets/fonts/"
def register_fonts():
    pdfmetrics.registerFont(TTFont("Inter",      _FDIR + "Inter-Regular.ttf"))
    pdfmetrics.registerFont(TTFont("InterSb",    _FDIR + "Inter-SemiBold.ttf"))
    pdfmetrics.registerFont(TTFont("InterB",     _FDIR + "Inter-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("InterEb",    _FDIR + "Inter-ExtraBold.ttf"))
    pdfmetrics.registerFont(TTFont("Bebas",      _FDIR + "BebasNeue-Regular.ttf"))

# ---------------------------------------------------------------- estilos
def S(name, **kw):
    base = dict(fontName="Inter", fontSize=9.7, leading=14.4, textColor=INK_SOFT,
                alignment=TA_JUSTIFY, spaceAfter=0, spaceBefore=0)
    base.update(kw)
    return ParagraphStyle(name, **base)

ST = {
    "body":      S("body", spaceAfter=5.4),
    "body_l":    S("body_l", alignment=TA_LEFT, spaceAfter=6),
    "lead":      S("lead", fontName="Inter", fontSize=12.2, leading=18.6,
                   textColor=INK, spaceAfter=8, alignment=TA_LEFT),
    "h1":        S("h1", fontName="Bebas", fontSize=44, leading=46,
                   textColor=INK, alignment=TA_LEFT, spaceAfter=2),
    "h2":        S("h2", fontName="Bebas", fontSize=27, leading=29,
                   textColor=INK, alignment=TA_LEFT, spaceAfter=3),
    "h3":        S("h3", fontName="InterEb", fontSize=12.4, leading=16,
                   textColor=INK, alignment=TA_LEFT, spaceAfter=2),
    "h4":        S("h4", fontName="InterSb", fontSize=10.6, leading=14.5,
                   textColor=INK, alignment=TA_LEFT, spaceAfter=1),
    "kicker":    S("kicker", fontName="InterSb", fontSize=7.6, leading=10,
                   textColor=CRIMSON, alignment=TA_LEFT),
    "eyebrow":   S("eyebrow", fontName="InterSb", fontSize=8.2, leading=11,
                   textColor=SILVER, alignment=TA_LEFT),
    "small":     S("small", fontSize=8.4, leading=12.4, textColor=GRAPHITE),
    "tiny":      S("tiny", fontSize=7.4, leading=10.6, textColor=GRAPHITE),
    "caption":   S("caption", fontName="InterSb", fontSize=7.6, leading=10.5,
                   textColor=GRAPHITE, alignment=TA_LEFT),
    "quote":     S("quote", fontName="Inter", fontSize=12.2, leading=18.5,
                   textColor=INK, alignment=TA_LEFT),
    "num":       S("num", fontName="Bebas", fontSize=30, leading=31,
                   textColor=BONE, alignment=TA_LEFT),
    "tbl":       S("tbl", fontSize=8.5, leading=12.2, alignment=TA_LEFT),
    "tbl_h":     S("tbl_h", fontName="InterSb", fontSize=7.5, leading=10,
                   textColor=GRAPHITE, alignment=TA_LEFT),
    "white_h2":  S("white_h2", fontName="Bebas", fontSize=30, leading=32,
                   textColor=PAPER, alignment=TA_LEFT),
    "white_body":S("white_body", fontSize=9.6, leading=14.6,
                   textColor=BONE, alignment=TA_LEFT),
    "white_eyebrow": S("white_eyebrow", fontName="InterSb", fontSize=7.8,
                   leading=10, textColor=HexColor("#A8A29A"), alignment=TA_LEFT),
}

# ---------------------------------------------------------------- flowables
class Rule(Flowable):
    """Linha fina com peso configurável."""
    def __init__(self, width, thickness=0.7, color=LINE, space_before=0, space_after=0):
        Flowable.__init__(self)
        self.width, self.thickness, self.color = width, thickness, color
        self.sb, self.sa = space_before, space_after
    def wrap(self, aw, ah):
        self.width = self.width or aw
        return (self.width, self.thickness + self.sb + self.sa)
    def draw(self):
        c = self.canv
        c.setStrokeColor(self.color); c.setLineWidth(self.thickness)
        y = self.sa
        c.line(0, y, self.width, y)

def kicker_rule(text, width=None, color=CRIMSON, rule_color=CRIMSON):
    """Eyebrow em versalete + filete curto."""
    t = Table([[Paragraph(text.upper(), ST["kicker"]), ""]],
              colWidths=[None, 26*mm])
    t.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "BOTTOM"),
        ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ("TOPPADDING", (0,0), (-1,-1), 0), ("BOTTOMPADDING", (0,0), (-1,-1), 3),
        ("LINEBELOW", (0,0), (0,0), 0, PAPER),
        ("LINEBELOW", (1,0), (1,0), 0.9, rule_color),
    ]))
    return t

def box(content, bg=PAPER_ALT, border=None, pad=9*mm, width=None, accent=None):
    """Caixa com fundo, borda opcional e filete de acento à esquerda."""
    w = width or CONTENT_W
    inner_pad_l = pad + (4.6 if accent else 0)
    t = Table([[content]], colWidths=[w])
    style = [
        ("BACKGROUND", (0,0), (-1,-1), bg),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), inner_pad_l),
        ("RIGHTPADDING", (0,0), (-1,-1), pad),
        ("TOPPADDING", (0,0), (-1,-1), pad),
        ("BOTTOMPADDING", (0,0), (-1,-1), pad),
    ]
    if accent:
        style.append(("LINEBEFORE", (0,0), (0,-1), 3.2, accent))
    if border:
        style.append(("BOX", (0,0), (-1,-1), 0.7, border))
    t.setStyle(TableStyle(style))
    return t

def data_table(rows, colWidths, header=True, zebra=True, align=None, font_size=8.5):
    """Tabela editorial com cabeçalho em versalete e linhas finas."""
    data = []
    for i, row in enumerate(rows):
        r = []
        for j, cell in enumerate(row):
            if isinstance(cell, str):
                st = ST["tbl_h"] if (header and i == 0) else ST["tbl"]
                if header and i == 0:
                    r.append(Paragraph(cell.upper(), st))
                else:
                    r.append(Paragraph(cell, ParagraphStyle(
                        f"c{i}{j}", parent=st, fontSize=font_size,
                        leading=font_size*1.42,
                        alignment=(align[j] if align else TA_LEFT))))
            else:
                r.append(cell)
        data.append(r)
    t = Table(data, colWidths=colWidths, repeatRows=1 if header else 0)
    cmds = [
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 7),
        ("TOPPADDING", (0,0), (-1,-1), 4.1),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4.1),
        ("LINEBELOW", (0,0), (-1,0), 0.9, INK),
    ]
    if zebra:
        for i in range(1, len(data)):
            if i % 2 == 0:
                cmds.append(("BACKGROUND", (0,i), (-1,i), PAPER_ALT))
    for i in range(1, len(data)):
        cmds.append(("LINEBELOW", (0,i), (-1,i), 0.4, LINE))
    t.setStyle(TableStyle(cmds))
    return t

def numbered_step(n, title, body, width=None):
    """Passo numerado com numeral grande em outline claro."""
    w = width or CONTENT_W
    num = Paragraph(f"{int(n):02d}", ST["num"])
    txt = [Paragraph(title, ST["h4"]), Spacer(1, 1.6), Paragraph(body, ST["small"])]
    t = Table([[num, txt]], colWidths=[14*mm, w - 14*mm])
    t.setStyle(TableStyle([
        ("VALIGN", (0,0), (0,0), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (0,0), 3),
        ("RIGHTPADDING", (1,0), (1,0), 0),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
    ]))
    return t

def callout(text, label="OJO", color=CRIMSON, bg=HexColor("#F6EFEA")):
    inner = [Paragraph(label.upper(), ParagraphStyle(
                "cl", fontName="InterSb", fontSize=7.4, leading=9.6, textColor=color)),
             Spacer(1, 3), Paragraph(text, ST["body_l"])]
    return box(inner, bg=bg, accent=color, pad=7*mm)

def quote_block(text, source=None, width=None):
    inner = [Paragraph(text, ST["quote"])]
    if source:
        inner += [Spacer(1, 4), Paragraph(source.upper(), ParagraphStyle(
            "qs", fontName="InterSb", fontSize=7.4, leading=10, textColor=SILVER))]
    return box(inner, bg=PAPER_ALT, pad=8*mm, width=width, accent=INK)

def plate(path, width, caption=None, credit=None):
    """Prancha de imagem com legenda editorial."""
    from PIL import Image as PILImage
    iw, ih = PILImage.open(path).size
    h = width * ih / iw
    img = Image(path, width=width, height=h)
    items = [img]
    if caption:
        cap = [Paragraph(caption.upper(), ST["caption"])]
        if credit:
            cap.append(Paragraph(credit, ParagraphStyle(
                "cr", fontName="Inter", fontSize=7, leading=9.6, textColor=SILVER)))
        items += [Spacer(1, 3), Rule(width, 0.8, INK), Spacer(1, 3)] + cap
    return KeepTogether(items)

def checklist(items, width=None, columns=1):
    """Lista com marcadores tipográficos."""
    rows = []
    for it in items:
        rows.append(["—", Paragraph(it, ST["body_l"])])
    t = Table(rows, colWidths=[6*mm, (width or CONTENT_W) - 6*mm])
    t.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ("TOPPADDING", (0,0), (-1,-1), 1.4), ("BOTTOMPADDING", (0,0), (-1,-1), 3.4),
        ("TEXTCOLOR", (0,0), (0,-1), CRIMSON),
        ("FONTNAME", (0,0), (0,-1), "InterSb"),
    ]))
    return t

# ---------------------------------------------------------------- documento
CONTENT_W = PAGE_W - 2*24*mm

class Doc(BaseDocTemplate):
    """Documento com capa própria, páginas de conteúdo e rodapé editorial."""
    def __init__(self, filename, title, subject, author, edition,
                 cover_fn=None, **kw):
        BaseDocTemplate.__init__(self, filename, pagesize=A4,
            leftMargin=24*mm, rightMargin=24*mm,
            topMargin=22*mm, bottomMargin=20*mm,
            title=title, subject=subject, author=author,
            creator="Lastafit Editorial", **kw)
        self.title_ = title
        self.edition = edition
        self.author_ = author
        self.subject_ = subject
        frame = Frame(24*mm, 20*mm, CONTENT_W, PAGE_H - 42*mm, id="main",
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([
            PageTemplate(id="cover", frames=[Frame(0, 0, PAGE_W, PAGE_H, id="c",
                         leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)],
                         onPage=self._cover_bg),
            PageTemplate(id="body", frames=[frame], onPage=self._deco),
        ])
        self._pageno = 0
        self.cover_fn = cover_fn
        self.toc_entries = []

    def _cover_bg(self, canv, doc):
        if self.cover_fn:
            self.cover_fn(canv, doc)
        else:
            canv.saveState()
            canv.setFillColor(INK)
            canv.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
            canv.restoreState()

    def _deco(self, canv, doc):
        self._pageno += 1
        canv.saveState()
        # cabeçalho / rodapé
        canv.setFont("InterSb", 6.9)
        canv.setFillColor(SILVER)
        canv.drawString(24*mm, PAGE_H - 14.5*mm, self.title_.upper())
        canv.drawRightString(PAGE_W - 24*mm, PAGE_H - 14.5*mm, self.edition.upper())
        canv.setStrokeColor(LINE); canv.setLineWidth(0.6)
        canv.line(24*mm, PAGE_H - 16.6*mm, PAGE_W - 24*mm, PAGE_H - 16.6*mm)
        canv.line(24*mm, 15.6*mm, PAGE_W - 24*mm, 15.6*mm)
        canv.setFont("InterSb", 6.9)
        canv.drawString(24*mm, 11.6*mm, "LASTAFIT  ·  CALISTENIA ASIÁTICA H40+")
        canv.drawRightString(PAGE_W - 24*mm, 11.6*mm, f"{self._pageno:02d}")
        canv.restoreState()

# ---------------------------------------------------------------- índice
class IndexedHeading(Flowable):
    """Título de seção que se registra no índice com o número real da página."""
    def __init__(self, text, level=0, key=None):
        Flowable.__init__(self)
        self.text = text
        self.level = level
        self.key = key
        self.width = CONTENT_W
        self.height = 0.1
    def draw(self):
        pass

class IndexDoc(Doc):
    """Doc que registra os títulos de seção com o número real da página."""
    def afterFlowable(self, flowable):
        if isinstance(flowable, IndexedHeading):
            self.toc_entries.append((flowable.text, self._pageno))


def section_open(kicker, title, lead=None, space_before=0):
    out = []
    if space_before:
        out.append(Spacer(1, space_before))
    out += [kicker_rule(kicker), Spacer(1, 4),
            IndexedHeading(title), Paragraph(title, ST["h2"]), Spacer(1, 2),
            Rule(CONTENT_W, 1.6, INK), Spacer(1, 6)]
    if lead:
        out += [Paragraph(lead, ST["lead"]), Spacer(1, 1)]
    return out
