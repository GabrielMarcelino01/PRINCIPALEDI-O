# -*- coding: utf-8 -*-
"""
MANUAL DE LOS PRIMEROS 21 DÍAS — Calistenia Asiática H40+
Español mexicano. Bono premium del programa.
"""
import sys, os
from reportlab.lib.units import mm
from reportlab.platypus import (Paragraph, Spacer, Table, TableStyle, PageBreak,
                                NextPageTemplate, Image, KeepTogether)
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from pdfkit import (Doc, IndexDoc, IndexedHeading, ST, register_fonts, CONTENT_W, PAGE_W, PAGE_H,
                    INK, INK_SOFT, GRAPHITE, SILVER, LINE, PAPER, PAPER_ALT,
                    BONE, CRIMSON, SAGE, Rule, box, data_table, numbered_step,
                    callout, quote_block, plate, checklist, kicker_rule,
                    section_open)

PRODUCT = "MANUAL DE LOS PRIMEROS 21 DÍAS"
EDITION = "EDICIÓN H40+ · MÉXICO · 2026"
AUTHOR  = "Calistenia Asiática H40+"

from reportlab.lib.styles import ParagraphStyle as _PS
from reportlab.lib.enums import TA_RIGHT as _RIGHT

def ParagraphStyle_white(font, size, color, leading=None):
    return _PS(f"w_{font}_{size}", fontName=font, fontSize=size,
               leading=leading or size*1.42, textColor=color, alignment=TA_LEFT)

def ParagraphStyle_right(font, size, color):
    return _PS(f"r_{font}_{size}", fontName=font, fontSize=size,
               leading=size*1.42, textColor=color, alignment=_RIGHT)


def cover_page(canv, doc):
    """Capa: arte composta em PIL (full-bleed) + tipografia vetorial."""
    from reportlab.lib.utils import ImageReader
    canv.saveState()
    canv.setFillColor(HexColor("#14171A"))
    canv.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    canv.drawImage(ImageReader("assets/img/cover-bg.jpg"), 0, 0,
                   width=PAGE_W, height=PAGE_H,
                   preserveAspectRatio=False, mask=None)

    L, R = 24*mm, PAGE_W - 24*mm

    canv.setFont("InterSb", 7.4); canv.setFillColor(HexColor("#938E85"))
    canv.drawString(L, PAGE_H - 20*mm, "LASTAFIT  ·  COLECCIÓN H40+")
    canv.setFillColor(CRIMSON)
    canv.drawRightString(R, PAGE_H - 20*mm, "BONO 01")
    canv.setStrokeColor(HexColor("#34383C")); canv.setLineWidth(0.7)
    canv.line(L, PAGE_H - 23*mm, R, PAGE_H - 23*mm)

    canv.setFillColor(PAPER)
    canv.setFont("Bebas", 66)
    canv.drawString(L, PAGE_H - 44*mm, "MANUAL DE LOS")
    canv.drawString(L, PAGE_H - 61*mm, "PRIMEROS 21 DÍAS")

    canv.setFillColor(HexColor("#B6B0A5")); canv.setFont("Inter", 10)
    canv.drawString(L, PAGE_H - 69.5*mm,
        "El plan de arranque para el hombre de 40+ que quiere")
    canv.drawString(L, PAGE_H - 74*mm,
        "volver a sentirse fuerte, móvil y sin dolor al despertar.")

    canv.setFillColor(CRIMSON)
    canv.rect(L, PAGE_H - 79.5*mm, 26*mm, 1.5*mm, fill=1, stroke=0)

    canv.setFillColor(HexColor("#7E7970")); canv.setFont("InterSb", 6.8)
    canv.drawString(L, PAGE_H - 87*mm,
        "SEMÁFORO DE SEGURIDAD  ·  21 DÍAS EN 3 BLOQUES  ·  6 PATRONES CON 4 NIVELES")
    canv.drawString(L, PAGE_H - 91.5*mm,
        "MOVILIDAD  ·  RESPIRACIÓN  ·  PLATO BASE  ·  BITÁCORA  ·  TEST DE PROGRESO")

    canv.setFillColor(PAPER); canv.setFont("InterSb", 8.4)
    canv.drawString(L, 24*mm, "21 DÍAS  ·  3 BLOQUES  ·  6 EJERCICIOS MADRE")
    canv.setStrokeColor(HexColor("#43474B")); canv.setLineWidth(0.6)
    canv.line(L, 21.8*mm, R, 21.8*mm)
    canv.setFillColor(HexColor("#8F8A81")); canv.setFont("Inter", 6.6)
    canv.drawString(L, 17*mm,
        "Programa en casa, con el peso del cuerpo y sin gimnasio.")
    canv.drawString(L, 13*mm,
        "Material de apoyo del programa digital. No sustituye la valoración de un profesional de la salud. Los resultados varían.")
    canv.setFillColor(HexColor("#6E6961")); canv.setFont("InterSb", 6.6)
    canv.drawRightString(R, 17*mm, "EDICIÓN MÉXICO · 2026")
    canv.restoreState()


def legal_page():
    st = [Spacer(1, 6*mm)]
    st += section_open("ANTES DE EMPEZAR", "Lee esto primero",
        "Dos minutos de lectura que te van a ahorrar una lesión y un mes de "
        "progreso perdido.")
    st.append(Paragraph(
        "Este manual acompaña al programa <b>Calistenia Asiática H40+</b> y está "
        "pensado para hombres de 40 años o más que llevan tiempo sin entrenar "
        "o que vuelven después de una pausa larga. No es un plan para atletas "
        "avanzados y no pretende serlo.", ST["body"]))
    st.append(Paragraph(
        "Antes de arrancar, revisa las tres condiciones de la siguiente página. "
        "Si alguna no se cumple, tu caso necesita una valoración profesional "
        "antes de empezar, no un programa descargado.", ST["body"]))
    st += [Spacer(1, 4*mm),
        callout(
        "Este material tiene fines informativos y educativos. No es consejo "
        "médico, no diagnostica y no sustituye la valoración de un médico o de "
        "un profesional de la salud. Si sientes dolor en el pecho, mareo, "
        "falta de aire anormal o dolor articular agudo, detente y consulta a "
        "un profesional. Los resultados varían de una persona a otra y "
        "dependen de tu punto de partida, tu constancia y tu descanso.",
        label="Aviso importante"),
        Spacer(1, 5*mm)]

    st.append(Paragraph("Qué sí puedes esperar en 21 días", ST["h3"]))
    st.append(Spacer(1, 2.4))
    st.append(Paragraph(
        "Tres semanas no te van a transformar el cuerpo. Lo que sí alcanza para "
        "cambiar, y es lo que este manual busca, es lo siguiente:", ST["body"]))
    st.append(checklist([
        "Que puedas hacer una sentadilla profunda sin que las rodillas te avisen al día siguiente.",
        "Que te levantes de la cama sin sentir la espalda rígida durante los primeros diez minutos.",
        "Que tengas una rutina de 25 minutos que puedas repetir sin pensarlo demasiado.",
        "Que sepas cuál es tu número de partida en cada ejercicio, para poder comparar después.",
        "Que el hábito quede instalado. El cuerpo es consecuencia; el hábito es la causa.",
    ]))
    st += [Spacer(1, 3*mm),
        callout(
        "Lo que <b>no</b> promete este manual: bajar 15 kilos, curar una lesión, "
        "reemplazar un tratamiento médico ni garantizar resultados específicos. "
        "Cualquier material que te prometa eso en tres semanas te está vendiendo "
        "algo distinto a lo que dice.",
        label="Para que no te vendan humo", color=GRAPHITE, bg=PAPER_ALT)]
    return st

# ══════════════════════════════════════════════════════════════════ SEMÁFORO
def semaforo_page():
    st = []
    st += section_open("FILTRO DE SEGURIDAD", "El semáforo de los 40+",
        "Antes de tu primera repetición, decide en qué color estás. Esto no es "
        "burocracia: es lo que separa un arranque de una lesión.")
    st.append(Paragraph(
        "El cuerpo después de los 40 no falla de golpe. Avisa. El problema es "
        "que la mayoría de los hombres confunde ese aviso con debilidad y "
        "empuja. El semáforo sirve para ponerle nombre a lo que sientes antes "
        "de decidir si sigues, ajustas o paras.", ST["body"]))
    st += [Spacer(1, 3*mm)]

    rows = [["SEÑAL", "QUÉ HACES"],
            ["<b>Verde</b><br/>Molestia muscular difusa 24–48 h después, "
             "respiración agitada pero controlable, sudor normal, "
             "cansancio que se va con la ducha.",
             "Continúa el plan tal cual. Es el costo normal del estímulo."],
            ["<b>Ámbar</b><br/>Molestia articular que aparece <i>durante</i> el "
             "movimiento, rigidez que mejora a los 10 minutos, dolor lumbar "
             "leve al final del día, cansancio que no se recupera en 24 h.",
             "Baja el volumen a la mitad y retrocede un nivel de progresión. "
             "Repite el mismo bloque una semana más."],
            ["<b>Rojo</b><br/>Dolor punzante o eléctrico, chasquido con dolor, "
             "hinchazón, dolor en el pecho, mareo, falta de aire en reposo, "
             "dolor de cabeza intenso.",
             "Detente ese mismo día y consulta a un profesional antes de "
             "volver. No es negociable."]]
    st.append(data_table(rows, [CONTENT_W*0.58, CONTENT_W*0.42]))
    st += [Spacer(1, 4*mm),
        callout(
        "Si tienes más de 45 años, llevas más de dos años sin entrenar, tienes "
        "presión alta, diabetes, problema de corazón en la familia, hernia "
        "diagnosticada o lesión de rodilla/hombro previa: <b>consulta a tu "
        "médico antes de empezar</b>. Este manual no puede saber eso por ti.",
        label="Cuándo preguntar antes, no después")]

    st.append(Paragraph("Las dos reglas que no se rompen", ST["h3"]))
    st.append(Spacer(1, 2))
    st.append(checklist([
        "<b>Nunca entrenes con dolor articular.</b> Molestia muscular sí, "
        "articulación no. La articulación no avisa dos veces.",
        "<b>Si dudas, haz menos.</b> En 21 días vas a tener 21 oportunidades. "
        "Perder una sesión por precaución cuesta nada; perder tres semanas "
        "por una lesión cuesta todo el hábito.",
    ]))
    return st

# ══════════════════════════════════════════════════════════════════ MAPA
def mapa_page():
    st = []
    st += section_open("LA ESTRUCTURA", "Cómo funcionan los 21 días",
        "Tres bloques de siete días. Cada bloque tiene una sola tarea mental, "
        "y eso es lo que lo hace funcionar.")
    st += [Spacer(1, 1*mm)]

    rows = [["BLOQUE", "DÍAS", "LA TAREA DEL BLOQUE", "QUÉ BUSCAS"],
            ["<b>01</b><br/>DESPERTAR", "1 – 7",
             "Aprender el movimiento. Nada de intensidad.",
             "Que tu cuerpo reconozca el patrón y que tú tengas un número de "
             "partida honesto."],
            ["<b>02</b><br/>SOSTENER", "8 – 14",
             "Repetir sin fallar. La constancia es el entrenamiento.",
             "Que la rutina deje de ser una decisión y se vuelva parte del día."],
            ["<b>03</b><br/>APRETAR", "15 – 21",
             "Subir un solo escalón: una serie más o una variante más difícil.",
             "Que sientas que el cuerpo responde. Es la prueba de que el método "
             "no es magia, es acumulación."]]
    st.append(data_table(rows, [CONTENT_W*0.15, CONTENT_W*0.10,
                                CONTENT_W*0.34, CONTENT_W*0.41]))
    st += [Spacer(1, 5*mm)]

    st.append(Paragraph("La semana modelo", ST["h3"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "Cinco días de trabajo, dos de recuperación activa. No inventes más. "
        "El hombre de 40+ que fracasa casi siempre fracasa por exceso, no por "
        "falta.", ST["body"]))
    st += [Spacer(1, 2*mm)]

    sem = [["DÍA", "SESIÓN", "DURACIÓN", "QUÉ TRABAJAS"],
           ["Lunes",     "Fuerza A",        "25 min", "Empuje + pierna"],
           ["Martes",    "Movilidad",       "12 min", "Cadera y hombro"],
           ["Miércoles", "Fuerza B",        "25 min", "Jalón + pierna"],
           ["Jueves",    "Respiración",     "8 min",  "Diafragma y recuperación"],
           ["Viernes",   "Fuerza C",        "25 min", "Cuerpo completo, ligero"],
           ["Sábado",    "Caminata",        "30 min", "Aerobio suave"],
           ["Domingo",   "Descanso",        "—",      "Sueño y comida"]]
    st.append(data_table(sem, [CONTENT_W*0.16, CONTENT_W*0.30,
                               CONTENT_W*0.16, CONTENT_W*0.38]))
    st += [Spacer(1, 5*mm)]
    st.append(Paragraph("Cómo se reparten los 25 minutos", ST["h3"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "Si el reloj te aprieta, esta es la proporción que no se rompe. "
        "Recortar el calentamiento para \"llegar\" es la decisión que produce "
        "la lesión de la semana tres.", ST["body"]))
    from reportlab.platypus import Table as _T
    bar = _T([["CALENTAMIENTO 6 min", "FUERZA 15 min", "CIERRE 4 min"]],
             colWidths=[CONTENT_W*0.24, CONTENT_W*0.60, CONTENT_W*0.16])
    bar.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (0,0), SAGE),
        ("BACKGROUND", (1,0), (1,0), INK),
        ("BACKGROUND", (2,0), (2,0), CRIMSON),
        ("TEXTCOLOR", (0,0), (-1,-1), PAPER),
        ("FONTNAME", (0,0), (-1,-1), "InterSb"),
        ("FONTSIZE", (0,0), (-1,-1), 7.4),
        ("TOPPADDING", (0,0), (-1,-1), 6), ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING", (0,0), (-1,-1), 6), ("RIGHTPADDING", (0,0), (-1,-1), 6),
    ]))
    st += [bar, Spacer(1, 2*mm)]
    st.append(Paragraph(
        "Calentamiento articular y de sistema nervioso · fuerza con tempo "
        "controlado · cierre de respiración y bitácora.", ST["tiny"]))
    st += [Spacer(1, 3*mm),
        callout("Si un día se te cae, no lo recuperes al siguiente. Recuperar "
                "sesiones perdidas es la forma más común de terminar lesionado "
                "en la tercera semana. Sigues con el día que toca.",
                label="La regla del día caído", color=SAGE,
                bg=HexColor("#EFF1EC"))]
    return st

# ══════════════════════════════════════════════════════════════════ EJERCICIOS
def ejercicios_page():
    st = []
    st += section_open("LOS SEIS MOVIMIENTOS MADRE",
        "Los ejercicios, con su escala",
        "No hay ejercicios raros. Hay seis patrones y cuatro niveles de cada "
        "uno. Encuentra tu nivel, no el que te gustaría tener.")
    st.append(Paragraph(
        "La calistenia no es hacer dominadas: es manejar tu peso en patrones "
        "básicos. Si el nivel 1 te cuesta, ese es tu nivel. Progredir desde "
        "ahí es lo que hace que en la semana tres sí puedas con el nivel 2.",
        ST["body"]))
    st += [Spacer(1, 3*mm)]

    rows = [["PATRÓN", "NIVEL 1", "NIVEL 2", "NIVEL 3", "NIVEL 4"],
            ["<b>Empuje</b><br/>pecho, hombro",
             "Flexión en pared", "Flexión con rodillas", "Flexión completa",
             "Flexión con pies elevados"],
            ["<b>Jalón</b><br/>espalda, bíceps",
             "Remo con toalla", "Remo invertido en mesa", "Dominada asistida con liga",
             "Dominada estricta"],
            ["<b>Pierna</b><br/>muslo, glúteo",
             "Sentadilla a silla", "Sentadilla asistida", "Sentadilla completa",
             "Sentadilla búlgara"],
            ["<b>Bisagra</b><br/>cadena posterior",
             "Puente de glúteo", "Puente a una pierna", "Peso muerto a una pierna",
             "Buenos días con peso"],
            ["<b>Core</b><br/>abdomen, lumbar",
             "Plancha con rodillas", "Plancha completa", "Plancha con toque de hombro",
             "Hollow hold"],
            ["<b>Colgado</b><br/>hombro, agarre",
             "Colgado 10 s", "Colgado 20 s", "Colgado activo", "Colgado a una mano asistido"]]
    st.append(data_table(rows, [CONTENT_W*0.18, CONTENT_W*0.205,
                                CONTENT_W*0.205, CONTENT_W*0.205,
                                CONTENT_W*0.205], font_size=8.0))
    st += [Spacer(1, 5*mm)]
    st.append(Paragraph("El tempo: el parámetro que casi nadie entiende", ST["h3"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "Cada repetición se escribe como <b>bajada – pausa – subida</b>, en "
        "segundos. A los 40 el músculo tolera más de lo que el tendón soporta, "
        "y el tempo controlado es lo que cierra esa brecha sin agregar peso.",
        ST["body"]))
    st += [Spacer(1, 1.6*mm)]
    rows_t = [["ETAPA", "TEMPO", "POR QUÉ"],
        ["Semana 1", "3 – 0 – 1", "Aprender el recorrido. Sin prisa, sin rebote."],
        ["Semana 2", "3 – 1 – 1", "Agregar pausa abajo. Es donde se gana control."],
        ["Semana 3", "2 – 0 – 1 + 1 serie", "Con el patrón aprendido, ya se puede sumar volumen."]]
    st.append(data_table(rows_t, [CONTENT_W*0.16, CONTENT_W*0.20, CONTENT_W*0.64],
                         font_size=8.4))
    st += [Spacer(1, 4*mm)]
    st.append(Paragraph("Descanso entre series: 90 a 120 segundos", ST["h3"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "No es pereza, es fisiología. Después de los 40 la recuperación de "
        "fosfágenos es más lenta. Descansar 30 segundos para \"sentir que "
        "entrenaste\" solo te hace acumular fatiga y perder técnica en la "
        "última serie, que es justo la que más importa.", ST["body"]))
    st += [Spacer(1, 4*mm)]
    st.append(Paragraph(
        "Con eso ya puedes hacer la prueba de los 15 minutos de la página "
        "siguiente y quedarte con un nivel por patrón. No elijas los seis a la "
        "vez: elige los seis <i>hoy</i>, sí, pero con la cabeza fría.",
        ST["body"]))
    return st

# ══════════════════════════════════════════════════════════════════ SESIONES
def niveles_page():
    st = []
    st += section_open("DÍA 1", "Cómo encuentras tu nivel hoy mismo",
        "Quince minutos de prueba. Eliges un nivel por patrón y lo anotas en la "
        "bitácora. Ese es tu punto de partida honesto.")
    st.append(Paragraph(
        "La tentación es empezar por el nivel que crees que te corresponde. Casi "
        "siempre es uno de más. La regla de este manual es al revés: empieza un "
        "nivel abajo de lo que crees y llega al día 7 con ganas de subir. Es más "
        "fácil progresar desde la sensación de \"me quedé corto\" que desde la de "
        "\"no puedo moverme\".", ST["body"]))
    st += [Spacer(1, 3*mm)]

    rows = [["SI EN ESTO...", "ENTONCES TU NIVEL ES...", "PORQUÉ"],
        ["<b>Sentadilla completa:</b> haces 10 limpias y al día siguiente no "
         "te duelen las rodillas", "Nivel 3 en pierna",
         "Ya tienes el patrón. Trabaja volumen, no dificultad."],
        ["<b>Sentadilla a silla:</b> llegas a 10 pero la rodilla se queja",
         "Nivel 1 o 2 en pierna, dos semanas",
         "El tendón va más lento que el músculo. Dale tiempo."],
        ["<b>Flexión completa:</b> haces 8 con la bajada de 3 segundos",
         "Nivel 3 en empuje", "El control en la bajada es el indicador real."],
        ["<b>Colgado:</b> aguantas menos de 15 segundos", "Nivel 1 en colgado",
         "Hombro y agarre son la base de todo lo demás. No lo saltes."],
        ["<b>Plancha:</b> la cadera se hunde antes de 20 segundos",
         "Nivel 1 en core", "Sin core estable, la lumbar paga la cuenta."]]
    st.append(data_table(rows, [CONTENT_W*0.40, CONTENT_W*0.26, CONTENT_W*0.34],
                         font_size=8.1))
    st += [Spacer(1, 4.5*mm)]

    st.append(Paragraph("La prueba de los 15 minutos", ST["h3"]))
    st.append(Spacer(1, 2))
    st.append(checklist([
        "Haz <b>una serie</b> de cada patrón, con tu mejor técnica, sin llegar al fallo.",
        "Anota el número de repeticiones limpias de cada uno en la bitácora, día 01.",
        "Si en algún patrón te quedaste en 3 repeticiones o menos, baja un nivel y repite.",
        "Descansa 90 segundos entre pruebas. No es un entrenamiento, es una medición.",
    ]))
    st += [Spacer(1, 4.5*mm)]
    st.append(callout("La progresión correcta casi nunca es “más repeticiones”. "
                      "Es <b>más control</b>. Una flexión de 3 segundos bajando y "
                      "1 subiendo vale más que cinco rápidas. Si no puedes "
                      "controlar la bajada, no estás listo para subir de nivel.",
                      label="La regla que casi nadie aplica", color=INK,
                      bg=PAPER_ALT))
    return st


def sesiones_page():
    st = []
    st += section_open("LAS TRES SESIONES", "Fuerza A, B y C",
        "Misma estructura, distinto énfasis. Aprende una y ya sabes las tres.")
    st.append(Paragraph(
        "Cada sesión tiene calentamiento, seis ejercicios y cierre. El "
        "calentamiento no es opcional a esta edad: es la diferencia entre "
        "entrar y entrar con el cuerpo avisado.", ST["body"]))
    st += [Spacer(1, 3*mm)]

    def sesion(name, subtitle, ejercicios):
        blk = [Spacer(1, 1),
               Table([[Paragraph(name, ST["h2"]),
                       Paragraph(subtitle, ParagraphStyle_right("InterSb", 7.6, SILVER))]],
                     colWidths=[CONTENT_W*0.6, CONTENT_W*0.4],
                     style=TableStyle([("LEFTPADDING",(0,0),(-1,-1),0),
                        ("RIGHTPADDING",(0,0),(-1,-1),0),
                        ("TOPPADDING",(0,0),(-1,-1),0),
                        ("BOTTOMPADDING",(0,0),(-1,-1),1),
                        ("VALIGN",(0,0),(-1,-1),"BOTTOM")])),
               Rule(CONTENT_W, 1.6, INK), Spacer(1, 4)]
        rows = [["EJERCICIO", "SERIES × REPS", "DESCANSO", "NOTA"]] + ejercicios
        blk.append(data_table(rows, [CONTENT_W*0.34, CONTENT_W*0.19,
                                     CONTENT_W*0.15, CONTENT_W*0.32],
                              font_size=8.2))
        return KeepTogether(blk)

    st.append(sesion("FUERZA A", "EMPUJE + PIERNA", [
        ["Calentamiento: hombro y cadera", "6 min", "—", "Círculos, gato-camello, sentadilla al aire"],
        ["Flexión (tu nivel)", "3 × 6–10", "75 s", "Bajada de 3 segundos"],
        ["Sentadilla (tu nivel)", "3 × 8–12", "75 s", "Rodilla sigue la punta del pie"],
        ["Remo invertido en mesa", "3 × 6–8", "75 s", "Codos pegados al cuerpo"],
        ["Puente de glúteo", "3 × 12", "60 s", "Aprieta 2 s arriba"],
        ["Plancha", "3 × 20–30 s", "45 s", "Cuerpo en línea, no hundas la cadera"],
        ["Colgado en barra", "2 × 10–20 s", "45 s", "Suelta el hombro del cuello"],
    ]))
    st += [Spacer(1, 4*mm)]
    st.append(sesion("FUERZA B", "JALÓN + PIERNA", [
        ["Calentamiento: escápula y cadera", "6 min", "—", "Retracción escapular, movilidad de tobillo"],
        ["Dominada o remo (tu nivel)", "3 × 5–8", "90 s", "Sin balanceo"],
        ["Sentadilla búlgara o a silla", "3 × 8/lado", "75 s", "Controla la bajada"],
        ["Flexión (variante fácil)", "3 × 8–12", "60 s", "Volumen, no dificultad"],
        ["Peso muerto a una pierna", "3 × 6/lado", "60 s", "Espalda recta, toca con la mano"],
        ["Hollow hold o plancha", "3 × 15–25 s", "45 s", "Costillas abajo"],
        ["Colgado en barra", "2 × 15–25 s", "45 s", "Respira mientras cuelgas"],
    ]))
    st += [Spacer(1, 4*mm)]
    st.append(sesion("FUERZA C", "CUERPO COMPLETO, LIGERO", [
        ["Calentamiento completo", "6 min", "—", "Todo el cuerpo, ritmo suave"],
        ["Circuito: flexión + sentadilla + remo", "3 vueltas × 8 c/u", "60 s entre vueltas", "Ritmo cómodo, técnica limpia"],
        ["Puente de glúteo", "2 × 15", "45 s", "Sin apuro"],
        ["Plancha lateral", "2 × 15 s/lado", "45 s", "Cadera arriba"],
        ["Movilidad de hombro con toalla", "2 × 8", "30 s", "Sin dolor"],
        ["Respiración 4-6", "5 min", "—", "Cierre de la semana"],
    ]))
    st += [Spacer(1, 6*mm)]

    st.append(Paragraph("El calentamiento de 6 minutos, igual para las tres", ST["h3"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "No cambia entre sesiones, y eso es a propósito: a esta edad el "
        "calentamiento es de articulación y de sistema nervioso, no del "
        "músculo que vas a usar. Si un día solo tienes seis minutos, haz "
        "esto y ya hiciste algo.", ST["body"]))
    st += [Spacer(1, 2*mm)]
    rows_w = [["MIN", "QUÉ HACES", "PARA QUÉ"],
        ["0 – 1", "Caminar por la casa o el patio", "Subir temperatura y pulso"],
        ["1 – 2", "Círculos de hombro, 10 por lado, adelante y atrás",
         "Lubricar la articulación que más se queja"],
        ["2 – 3", "Gato-camello lento, 8 repeticiones", "Columna y diafragma"],
        ["3 – 4", "Sentadilla al aire, 10 lentas, agarrado de una puerta",
         "Cadera y tobillo"],
        ["4 – 5", "Retracción escapular, 10, y colgado suave 10 s",
         "Activar espalda antes de empujar"],
        ["5 – 6", "Respiración 4-6, cinco ciclos", "Bajar el pulso y entrar concentrado"]]
    st.append(data_table(rows_w, [CONTENT_W*0.12, CONTENT_W*0.50, CONTENT_W*0.38],
                         font_size=8.1))
    st += [Spacer(1, 6*mm)]

    st.append(Paragraph("Si no tienes barra en casa", ST["h3"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "El jalón es el patrón que casi todos los hombres de 40+ tienen más "
        "débil. No necesitas gimnasio: necesitas algo de lo que colgarte sin "
        "romperlo.", ST["body"]))
    st += [Spacer(1, 2*mm)]
    rows_b = [["QUÉ TIENES", "QUÉ HACES", "CUIDADO CON"],
        ["Marco de puerta sólido", "Colgado suave 10–20 s y remo con toalla "
         "en la bisagra", "Marco hueco o de yeso. Prueba con tu peso antes."],
        ["Mesa firme", "Remo invertido por debajo, cuerpo recto",
         "Mesas de vidrio o de centro. No lo intentes."],
        ["Barra de parque", "Colgado, dominada asistida con liga",
         "Barra mojada o fría. Agarre primero, siempre."],
        ["Nada de lo anterior", "Remo con toalla en la puerta cerrada y "
         "jalón con liga anclada al pie", "Que la puerta abra hacia ti y "
         "esté bien cerrada."]]
    st.append(data_table(rows_b, [CONTENT_W*0.24, CONTENT_W*0.42, CONTENT_W*0.34],
                         font_size=7.9))
    st.append(Paragraph(
        "Si todavía no puedes colgarte, empieza por el <b>colgado parcial</b>: "
        "pies en el piso, rodillas dobladas, hombros activos, 10 segundos. "
        "Progresas cuando puedas soltar un pie.", ST["small"]))
    return st

# ══════════════════════════════════════════════════════════════════ TÉCNICA
def tecnica_page():
    st = []
    st += section_open("TÉCNICA", "Los cinco errores del hombre de 40+",
        "No son errores de novato. Son errores de alguien que ya sabe moverse "
        "y por eso los comete con más peso del que debería.")
    st += [Spacer(1, 1*mm)]

    errores = [
        ("01", "Aguantar la respiración",
         "Apretar el aire en cada repetición sube la presión arterial de golpe. "
         "Exhala en el esfuerzo, inhala al volver. Si te da mareo, estás "
         "aguantando el aire sin darte cuenta."),
        ("02", "Bajar el rango para \"llegar\" a la repetición",
         "Media sentadilla con más repeticiones entrena menos que una "
         "sentadilla completa con menos. El rango que no usas es el rango que "
         "pierdes, y a los 40 se pierde rápido."),
        ("03", "Entrenar el músculo y olvidar el tendón",
         "El músculo se adapta en semanas; el tendón tarda meses. Por eso las "
         "lesiones de hombro y codo aparecen en la semana 3, cuando el músculo "
         "ya aguanta más de lo que el tendón soporta. Sube de nivel cada dos "
         "semanas, no cada semana."),
        ("04", "Compensar el sueño con cafeína",
         "Si dormiste cinco horas, no entrenes la sesión de fuerza. Haz "
         "movilidad. El entrenamiento de fuerza con deuda de sueño es donde más "
         "gente se lesiona, porque la propiocepción va lenta."),
        ("05", "Calentar solo el músculo que vas a usar",
         "El calentamiento a los 40 es de articulación y de sistema nervioso, "
         "no de músculo. Cinco minutos de cadera y hombro antes de la sesión "
         "valen más que veinte de estiramiento estático después."),
    ]
    for n, t, b in errores:
        st.append(numbered_step(n, t, b))
        st.append(Spacer(1, 3.6*mm))
    st += [Spacer(1, 5*mm)]
    st.append(Paragraph("Dónde duele y qué significa", ST["h3"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "No todo dolor es igual. Esta es la lectura rápida de las cuatro zonas "
        "que más aparecen en las primeras semanas.",
        ST["body"]))
    rows_z = [["ZONA", "LO MÁS COMÚN", "QUÉ HACER EN LA SESIÓN"],
        ["<b>Hombro anterior</b>", "Flexión con codos abiertos y escápula suelta",
         "Cierra los codos a 45°, baja a una superficie más alta y agrega remo "
         "antes de empujar."],
        ["<b>Lumbar</b>", "Puente de glúteo sin apretar glúteo, plancha con "
         "cadera hundida", "Aprieta el glúteo antes de subir. Si sigue, cambia "
         "plancha por hollow hold corto."],
        ["<b>Rodilla</b>", "Sentadilla con rodilla hacia adentro o talón que se "
         "levanta", "Reduce el rango a lo que controlas, abre la punta del pie y "
         "usa la silla como referencia de profundidad."],
        ["<b>Codo</b>", "Agarre demasiado abierto en remo y dominada",
         "Agarre al ancho de los hombros. Baja el volumen de jalón a la mitad."]]
    st.append(data_table(rows_z, [CONTENT_W*0.19, CONTENT_W*0.36, CONTENT_W*0.45],
                         font_size=7.9))
    st += [Spacer(1, 3.5*mm)]

    return st

# ══════════════════════════════════════════════════════════════════ MOVILIDAD
def movilidad_page():
    st = []
    st += section_open("BLOQUE DE MOVILIDAD", "Los 12 minutos que abren el cuerpo",
        "Si solo pudieras hacer una cosa de este manual, haz esto. Es lo que "
        "más rápido cambia cómo te sientes al despertar.")
    st.append(Paragraph(
        "La rigidez matutina del hombre de 40+ casi nunca es \"falta de "
        "estiramiento\". Es cadera que dejó de moverse en su rango completo y "
        "un diafragma que dejó de acompañar la respiración. Los cuatro "
        "movimientos de abajo atacan las dos cosas en doce minutos.",
        ST["body"]))
    st += [Spacer(1, 5*mm)]
    st.append(plate("assets/img/plate-movilidad.jpg", CONTENT_W,
                    "La sentadilla profunda sostenida — el movimiento que más "
                    "rápido devuelve movilidad de cadera y tobillo.",
                    "Prancha editorial · Colección H40+"))
    st += [Spacer(1, 5*mm)]

    rows = [["MOVIMIENTO", "TIEMPO", "CÓMO", "QUÉ ABRE"],
        ["<b>Sentadilla sostenida</b>", "2 × 45 s",
         "Baja lo más que puedas, agarrado de una puerta. Respira. Sube el "
         "talón si lo necesitas.", "Cadera, tobillo, fascia plantar"],
        ["<b>Gato-camello lento</b>", "10 reps",
         "En cuatro apoyos. Mueve una vértebra por segundo. Exhala al redondear.",
         "Columna y diafragma"],
        ["<b>Hombro con toalla</b>", "2 × 8",
         "Toalla tensa entre las manos. Sube y baja sin arquear la lumbar.",
         "Hombro y escápula"],
        ["<b>Respiración 4-6</b>", "5 min",
         "Inhala 4 segundos por la nariz, exhala 6 por la boca. Sin forzar.",
         "Diafragma y sistema nervioso"]]
    st.append(data_table(rows, [CONTENT_W*0.20, CONTENT_W*0.11,
                                CONTENT_W*0.42, CONTENT_W*0.27], font_size=8.1))
    st += [PageBreak()]
    st += [Spacer(1, 4*mm)]

    st.append(Paragraph("BLOQUE DE MOVILIDAD  ·  CONTINUACIÓN",
                        ST["eyebrow"]))
    st.append(Spacer(1, 3))
    st.append(Paragraph("Si no puedes hacer la sentadilla sostenida", ST["h3"]))
    st.append(Spacer(1, 1.6))
    st.append(checklist([
        "<b>Nivel 1:</b> siéntate en una silla, apoya los pies y quédate ahí "
        "45 segundos con la espalda larga. Sin bajar.",
        "<b>Nivel 2:</b> agarrado del marco de una puerta, baja hasta donde "
        "llegues sin que el talón se levante.",
        "<b>Nivel 3:</b> sentadilla completa con talón en el piso, 45 s, respirando.",
        "Si sientes pinchazo en la ingle o en la rodilla, sube 5 cm y quédate "
        "en ese rango. El rango se gana en semanas, no en una sesión.",
    ]))
    st += [Spacer(1, 3.5*mm),
        callout("Hazlo <b>antes</b> del entrenamiento, no después. Es "
                "calentamiento articular, no relajación. Después de la sesión "
                "lo único que necesitas es caminar diez minutos y beber agua.",
                label="El orden importa", color=SAGE, bg=HexColor("#EFF1EC"))]

    st.append(Spacer(1, 6*mm))
    st.append(Paragraph("Tres pruebas de movilidad en 60 segundos", ST["h2"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "Hazlas una vez al mes. No buscan que seas flexible como un "
        "practicante de artes marciales; buscan que tengas el rango mínimo "
        "para hacer los seis patrones sin compensar con la lumbar.", ST["body"]))
    st += [Spacer(1, 3*mm)]
    rows_m = [["PRUEBA", "CÓMO", "BIEN", "AJUSTA"],
        ["<b>Sentadilla profunda</b>",
         "Talones en el piso, brazos al frente, baja y sostén 10 s.",
         "Bajas sin levantar los talones ni redondear la espalda.",
         "Si el talón se levanta: tobillo. Sentadilla con talón elevado y "
         "movilidad de tobillo en la pared."],
        ["<b>Toque de hombro</b>",
         "De pie, espalda en la pared, sube los brazos rectos hasta tocar la pared por encima de la cabeza.",
         "Llegas sin arquear la lumbar ni sacar las costillas.",
         "Si se arquea: movilidad torácica. Gato-camello y hombro con toalla."],
        ["<b>Peso muerto a una pierna</b>",
         "De pie, baja la mano hacia el pie con la espalda recta, sin girar la cadera.",
         "Llegas a media pantorrilla con la cadera cuadrada.",
         "Si la cadera gira: isquiotibiales y glúteo. Puente de glúteo y "
         "peso muerto asistido."]]
    st.append(data_table(rows_m, [CONTENT_W*0.19, CONTENT_W*0.33,
                                  CONTENT_W*0.24, CONTENT_W*0.24], font_size=7.9))
    st += [Spacer(1, 5*mm)]

    st.append(Paragraph("Cómo progresa la movilidad de verdad", ST["h3"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "La flexibilidad se gana con <b>tiempo en el rango</b>, no con "
        "estirar fuerte. Dos series de 45 segundos en una posición cómoda "
        "hacen más que un minuto aguantando dolor. Si estás temblando o "
        "aguantando la respiración, no estás ganando rango: estás resistiendo.",
        ST["body"]))
    st += [Spacer(1, 2*mm)]
    st.append(checklist([
        "Sostén la posición, respira y <b>afloja un poco</b> desde el tope. Ese "
        "punto es donde se gana rango.",
        "Suma <b>diez segundos por semana</b>, no treinta por día.",
        "Si un mes no cambiaste en una prueba, no es falta de estiramiento: es "
        "falta de fuerza en ese rango. Vuelve al patrón con tempo lento.",
    ]))
    return st

# ══════════════════════════════════════════════════════════════════ RESPIRACIÓN
def respiracion_page():
    st = []
    st += section_open("EL PROTOCOLO SILENCIOSO", "Respirar como se entrena",
        "Es la parte que todo el mundo salta y la que más rápido te baja el "
        "cansancio del día.")
    st.append(Paragraph(
        "A los 40 el diafragma pierde cerca de un centímetro de recorrido por "
        "década si no lo usas. Eso significa menos oxígeno por respiración, "
        "respiración más alta en el pecho y un sistema nervioso que vive en "
        "alerta. Cinco minutos diarios revierten buena parte de eso — y no "
        "requieren nada más que una silla y silencio.",
        ST["body"]))
    st += [Spacer(1, 5*mm)]
    st.append(plate("assets/img/plate-respiracion.jpg", CONTENT_W*0.88,
                    "Postura de base: columna larga, costillas abajo, hombros "
                    "sueltos. Si el pecho sube primero, está mal.",
                    "Prancha editorial · Colección H40+"))
    st += [Spacer(1, 6*mm)]

    st.append(Paragraph("Protocolo 4-6-2", ST["h3"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "Cuatro segundos inhalando, seis exhalando, dos en pausa vacía. Diez "
        "ciclos. Una vez al día, idealmente antes de dormir o al terminar la "
        "sesión de fuerza.", ST["body"]))
    st += [Spacer(1, 2*mm)]
    rows = [["FASE", "SEGUNDOS", "POR DÓNDE", "QUÉ DEBE MOVERSE"],
        ["Inhalar", "4", "Nariz", "Costillas hacia los lados, no hombros"],
        ["Exhalar", "6", "Boca, labios semi cerrados", "Costillas hacia abajo"],
        ["Pausa", "2", "—", "Nada. Sin apretar."]]
    st.append(data_table(rows, [CONTENT_W*0.18, CONTENT_W*0.15,
                                CONTENT_W*0.33, CONTENT_W*0.34], font_size=8.4))
    st += [Spacer(1, 3*mm),
        callout("Si te cuesta llegar a seis segundos exhalando, empieza en "
                "cuatro y sube uno por semana. Forzar la exhalación tensa el "
                "abdomen y anula el efecto.", label="Progresión del protocolo",
                color=INK, bg=PAPER_ALT)]
    st += [PageBreak()]

    st.append(Paragraph("Los tres errores que anulan el protocolo", ST["h2"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "Casi todos los hombres que dicen \"la respiración no me hace nada\" "
        "están cometiendo uno de estos tres. Y los tres se corrigen en la "
        "primera sesión.", ST["body"]))
    st += [Spacer(1, 2*mm)]
    st.append(checklist([
        "<b>Respirar por la boca.</b> Si el aire entra por la boca, la nariz se "
        "seca y el diafragma no baja igual. Nariz siempre en la inhalación.",
        "<b>Inflar el pecho.</b> Si los hombros suben, estás respirando "
        "clavicular. La mano en las costillas te delata: deben abrirse hacia "
        "los lados.",
        "<b>Aguantar la pausa con fuerza.</b> La pausa de dos segundos es "
        "soltar, no apretar. Si aprietas, sube la presión y pierdes el efecto.",
    ]))
    st += [Spacer(1, 5*mm)]

    st.append(Paragraph("Para los días de estrés alto", ST["h3"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "Cuando el día fue pesado, cambia el 4-6-2 por <b>4-8 sin pausa</b>: "
        "cuatro segundos inhalando, ocho exhalando, diez ciclos. La exhalación "
        "larga activa el freno parasimpático y es lo que realmente baja el "
        "pulso. Cinco minutos alcanzan; más no es mejor.", ST["body"]))
    st += [Spacer(1, 5*mm)]

    st.append(Paragraph("La prueba del suspiro: cómo saber si ya lo tienes", ST["h3"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "Haz tres ciclos completos y luego respira normal. Si en los primeros "
        "treinta segundos después sientes la necesidad de suspirar o de tomar "
        "aire por la boca, estás compensando hiperventilación: el ciclo fue "
        "demasiado rápido o demasiado profundo. Baja el volumen, no el ritmo.",
        ST["body"]))
    st += [Spacer(1, 5*mm)]

    st.append(Paragraph("El minuto antes de dormir", ST["h3"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "Acostado, una mano en el pecho y otra en el abdomen. Diez ciclos de "
        "4-6. La mano del pecho no debe moverse. Si se mueve, estás "
        "respirando con los hombros y el protocolo no va a funcionar esa "
        "noche. Es la forma más rápida de saber si lo estás haciendo bien "
        "sin mirarte al espejo.", ST["body"]))
    st += [Spacer(1, 4*mm),
        callout("Este protocolo es de recuperación y concentración, no un "
                "tratamiento. Si tienes asma, EPOC, apnea diagnosticada o "
                "ansiedad en tratamiento, coméntalo con tu médico antes de "
                "practicar retenciones o pausas.",
                label="Dónde está el límite", color=GRAPHITE, bg=PAPER_ALT)]
    return st

# ══════════════════════════════════════════════════════════════════ COCINA
def cocina_page():
    st = []
    st += section_open("LO QUE COME UN HOMBRE QUE ENTRENA",
        "El plato base H40+",
        "No es dieta. Es una estructura de plato que resuelve el 80% de las "
        "decisiones sin contar calorías.")
    st.append(Paragraph(
        "A partir de los 40 el cuerpo responde peor al exceso de carbohidrato "
        "refinado y peor al déficit agresivo. Las dos cosas que más mueven la "
        "aguja son <b>suficiente proteína</b> y <b>suficiente fibra</b>. Todo "
        "lo demás es secundario hasta que esas dos estén resueltas.",
        ST["body"]))
    st += [Spacer(1, 5*mm)]
    st.append(plate("assets/img/plate-cocina.jpg", CONTENT_W,
                    "El plato base: una palma de proteína, un puño de carbohidrato, "
                    "dos puños de verdura, grasa buena y agua.",
                    "Prancha editorial · Colección H40+"))
    st += [Spacer(1, 5*mm)]

    st.append(Paragraph("La regla de la mano", ST["h3"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "No necesitas báscula ni app. Tu mano ya es una porción calibrada a tu "
        "cuerpo. Úsala en cada comida principal.", ST["body"]))
    st += [Spacer(1, 2*mm)]
    rows = [["PARTE DEL PLATO", "PORCIÓN", "EJEMPLOS"],
        ["Proteína", "1 palma y media", "Pollo, pescado, huevo, frijol, lenteja, queso fresco"],
        ["Carbohidrato", "1 puño", "Arroz, tortilla, papa, avena, camote"],
        ["Verdura", "2 puños", "Nopal, calabaza, brócoli, espinaca, jitomate, chayote"],
        ["Grasa buena", "1 pulgar", "Aguacate, aceite de oliva, nuez, semilla de calabaza"],
        ["Agua", "1 vaso antes", "Antes de comer, no durante a sorbos"]]
    st.append(data_table(rows, [CONTENT_W*0.24, CONTENT_W*0.22, CONTENT_W*0.54],
                         font_size=8.4))
    st += [PageBreak()]

    st.append(Paragraph("Los cuatro ajustes que sí importan", ST["h2"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "Si solo cambias cuatro cosas de cómo comes, que sean estas. Ninguna "
        "requiere pesar nada ni comprar suplementos.", ST["body"]))
    st += [Spacer(1, 2*mm)]
    st.append(checklist([
        "<b>Proteína en el desayuno.</b> Es la comida donde casi todos fallan. "
        "Huevo, requesón o frijol: algo con proteína antes de las 10:00.",
        "<b>Verdura en dos comidas.</b> No para bajar de peso, para la fibra y "
        "la saciedad. Sin fibra, el hambre de la noche gana siempre.",
        "<b>Agua antes, no después.</b> Un vaso antes de cada comida reduce la "
        "porción sin esfuerzo.",
        "<b>Alcohol: máximo dos días por semana.</b> No es moral, es "
        "recuperación. El alcohol baja la calidad del sueño profundo y el "
        "sueño profundo es donde se construye el músculo.",
    ]))
    st += [Spacer(1, 4.5*mm)]
    st.append(Paragraph("Siete días de ejemplo, con comida de aquí", ST["h3"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "Nada de ingredientes importados ni suplementos. Lo que ya hay en "
        "cualquier mercado, ordenado para que la proteína esté resuelta antes "
        "de las 10:00 y la verdura no falte dos veces al día.", ST["body"]))
    st += [Spacer(1, 1.6*mm)]
    rows_m = [["DÍA", "DESAYUNO", "COMIDA", "CENA"],
        ["Lunes", "2 huevos + frijol + tortilla", "Pollo asado + arroz + nopal", "Queso fresco + jitomate"],
        ["Martes", "Avena + nuez + plátano", "Atún + calabaza + aguacate", "Huevo hervido + ensalada"],
        ["Miércoles", "Huevo con chayote", "Pescado + camote + brócoli", "Frijol + tortilla + salsa"],
        ["Jueves", "Requesón + fruta", "Pollo en salsa verde + arroz", "Atún + espinaca"],
        ["Viernes", "2 huevos + nopal", "Lenteja + tortilla + aguacate", "Queso + jitomate + nuez"],
        ["Sábado", "Huevo a la mexicana", "Carne asada + verdura + tortilla", "Caldo de pollo + verduras"],
        ["Domingo", "Avena + semilla de calabaza", "Lo que haya, con proteína", "Ligero: fruta + queso"]]
    st.append(data_table(rows_m, [CONTENT_W*0.13, CONTENT_W*0.31,
                                  CONTENT_W*0.32, CONTENT_W*0.24], font_size=7.6))
    st += [Spacer(1, 4*mm),
        callout("Este manual no prescribe dietas ni suplementos. Si tienes "
                "diabetes, hipertensión, problema renal o tomas medicamento, "
                "los ajustes de comida se consultan con tu médico o "
                "nutriólogo. Ninguna regla de esta página está por encima de "
                "esa indicación.", label="Límite claro")]
    return st

# ══════════════════════════════════════════════════════════════════ BITÁCORA
def bitacora_page():
    st = []
    st += section_open("TU REGISTRO", "La bitácora de los 21 días",
        "Una hoja. Lápiz. Cinco columnas. Si no lo escribes, no pasó.")
    st.append(Paragraph(
        "La bitácora no es motivacional, es técnica: te da el número de "
        "partida. Sin ese número el día 15 abandonas porque \"no ves "
        "resultados\". Los resultados están en la hoja, no en el espejo.",
        ST["body"]))
    st += [Spacer(1, 2.5*mm)]

    sesiones = ["Fuerza A", "Movilidad", "Fuerza B", "Respiración", "Fuerza C",
                "Caminata", "Descanso"]
    rows = [["DÍA", "SESIÓN", "NIVEL / REPS", "SENSACIÓN V-A-R", "SUEÑO"]]
    for d in range(1, 22):
        rows.append([f"{d:02d}", sesiones[(d-1) % 7], "", "", ""])
    data = []
    for i, r in enumerate(rows):
        data.append([Paragraph(c, ST["tbl_h"] if i == 0 else ST["tbl"]) for c in r])
    tb = Table(data, colWidths=[CONTENT_W*0.09, CONTENT_W*0.20,
                                CONTENT_W*0.23, CONTENT_W*0.26, CONTENT_W*0.22],
               repeatRows=1)
    cmds = [("VALIGN", (0,0), (-1,-1), "MIDDLE"),
            ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 4),
            ("TOPPADDING", (0,0), (-1,-1), 3.9), ("BOTTOMPADDING", (0,0), (-1,-1), 3.9),
            ("LINEBELOW", (0,0), (-1,0), 0.9, INK)]
    for i in range(1, len(data)):
        cmds.append(("LINEBELOW", (0,i), (-1,i), 0.35, LINE))
        if i % 2 == 0:
            cmds.append(("BACKGROUND", (0,i), (-1,i), PAPER_ALT))
    for sep in (7, 14):
        cmds.append(("LINEBELOW", (0,sep), (-1,sep), 1.4, CRIMSON))
    tb.setStyle(TableStyle(cmds))
    st.append(tb)
    st += [Spacer(1, 1.6*mm),
        Paragraph("V-A-R = verde / ámbar / rojo, según el semáforo. Las líneas "
                  "rojas marcan el cierre de cada bloque.", ST["tiny"])]
    st += [Spacer(1, 3*mm)]

    st.append(Paragraph("Cómo se ve una fila bien llena", ST["h3"]))
    st.append(Spacer(1, 2))
    rows_e = [["DÍA", "SESIÓN", "NIVEL / REPS", "SENSACIÓN", "SUEÑO"],
        ["05", "Fuerza C", "flex. nivel 2 · 8/8/7", "verde, hombro bien", "6,5 h"],
        ["06", "Caminata", "35 min", "ámbar, lumbar cargada", "5,5 h"]]
    st.append(data_table(rows_e, [CONTENT_W*0.09, CONTENT_W*0.20,
                                  CONTENT_W*0.23, CONTENT_W*0.26,
                                  CONTENT_W*0.22], font_size=8.2))
    st += [Spacer(1, 2.6*mm),
        Paragraph("En el día 06 el sueño de 5,5 h y la lumbar cargada aparecen "
                  "juntos. Ese es el uso real de la bitácora: no registrar el "
                  "entrenamiento, sino encontrar el patrón que lo frena.",
                  ST["small"])]
    return st


def test_page():
    """Página de test de progreso: se repite en el día 0, 7, 14 y 21."""
    st = []
    st += section_open("MEDICIÓN", "El test de los cuatro números",
        "Se hace el día 0, el 7, el 14 y el 21. Diez minutos. Es la única "
        "forma honesta de saber si el plan está funcionando.")

    st.append(Paragraph(
        "No necesitas báscula ni cinta métrica. Necesitas cuatro números que "
        "puedas repetir igual, en el mismo lugar y a la misma hora. Un test "
        "que cambia de condiciones no mide nada.", ST["body"]))
    st += [Spacer(1, 3*mm)]

    rows = [["#", "TEST", "CÓMO SE HACE", "QUÉ SIGNIFICA"],
        ["01", "<b>Sentadilla a silla</b>",
         "Baja y toca la silla sin sentarte, sube. Máximo en 60 segundos, sin "
         "usar las manos.",
         "Fuerza de pierna y resistencia. Es el test que mejor predice cómo "
         "vas a envejecer."],
        ["02", "<b>Flexión máxima</b>",
         "Con tu nivel actual, hasta que la técnica se rompa. Cuenta solo las "
         "limpias.",
         "Fuerza de empuje y control escapular."],
        ["03", "<b>Colgado en barra</b>",
         "Cuélgate con los hombros activos. Cuenta los segundos hasta soltar.",
         "Agarre, hombro y salud de la columna."],
        ["04", "<b>Sentadilla profunda sostenida</b>",
         "Talones en el piso, espalda larga. Cuenta los segundos antes de "
         "perder la posición.",
         "Movilidad real de cadera y tobillo."]]
    st.append(data_table(rows, [CONTENT_W*0.06, CONTENT_W*0.24,
                                CONTENT_W*0.40, CONTENT_W*0.30], font_size=8.2))
    st += [Spacer(1, 3.5*mm)]

    st.append(Paragraph("Dónde anotar tus números", ST["h3"]))
    st.append(Spacer(1, 1.6*mm))
    rows2 = [["TEST", "DÍA 0", "DÍA 7", "DÍA 14", "DÍA 21"],
             ["Sentadilla a silla (reps / 60 s)", "", "", "", ""],
             ["Flexión máxima (reps)", "", "", "", ""],
             ["Colgado (segundos)", "", "", "", ""],
             ["Sentadilla sostenida (segundos)", "", "", "", ""]]
    t = data_table(rows2, [CONTENT_W*0.40, CONTENT_W*0.15, CONTENT_W*0.15,
                           CONTENT_W*0.15, CONTENT_W*0.15], font_size=8.4)
    # altura mínima de fila para escribir a mano
    t.setStyle(TableStyle([("TOPPADDING", (0,1), (-1,-1), 6.5),
                           ("BOTTOMPADDING", (0,1), (-1,-1), 6.5)]))
    st.append(t)
    st += [Spacer(1, 4*mm)]

    st += [Spacer(1, 3.5*mm),
        callout("Estos números son para ti, no para compararte con nadie. Un "
                "hombre de 52 años que sube de 6 a 11 sentadillas está "
                "progresando más rápido que uno de 41 que se queda en 20.",
                label="La única comparación válida", color=SAGE,
                bg=HexColor("#EFF1EC"))]
    st += [PageBreak()]

    st.append(Paragraph("Cómo lees el resultado del día 21", ST["h2"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "Con los cuatro números no hay interpretación libre: hay cuatro casos "
        "y cada uno tiene una decisión. Léelos en orden y quédate con el que "
        "te toque.", ST["body"]))
    st += [Spacer(1, 2*mm)]
    st.append(checklist([
        "<b>Mejoraste en 2 de 4:</b> el plan funcionó. Repite el bloque 3 "
        "subiendo un nivel en el patrón que más mejoró.",
        "<b>Mejoraste en 1 de 4:</b> revisa el sueño y la proteína antes de "
        "culpar al plan. Casi siempre el freno está ahí.",
        "<b>No mejoraste en ninguno:</b> no es falta de esfuerzo, es falta de "
        "progresión. Vuelve a la tabla de niveles y sube un escalón por patrón.",
        "<b>Empeoraste en alguno:</b> señal de sobrecarga. Aplica el semáforo "
        "ámbar durante dos semanas completas.",
    ]))
    st += [Spacer(1, 5*mm)]

    st += [Spacer(1, 6*mm)]

    st.append(Paragraph("El plan de las siguientes tres semanas", ST["h3"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "Con los cuatro números ya no tienes que adivinar qué hacer. Esta "
        "tabla te da la decisión por escrito, y es la parte que se usa "
        "después, cuando la motivación ya se fue.", ST["body"]))
    st += [Spacer(1, 2.5*mm)]
    rows_p = [["SI TU RESULTADO ES...", "QUÉ AJUSTAS", "CADA CUÁNTO"],
        ["Subiste en 3 o 4 pruebas", "Sube un nivel en dos patrones. Mantén "
         "el resto igual.", "Cada 2 semanas"],
        ["Subiste en 2 pruebas", "Sube un nivel en un patrón y agrega una serie "
         "en otro. Nada más.", "Cada 2 semanas"],
        ["Subiste en 1 prueba", "No subas nivel. Revisa sueño y proteína "
         "primero; el freno casi nunca está en el plan.", "Cada 3 semanas"],
        ["Sin cambios", "Baja el volumen 20% una semana y recupera técnica. "
         "Después sube un nivel.", "Revalúa a la semana"],
        ["Empeoraste", "Semáforo ámbar dos semanas: mitad de volumen, "
         "movilidad diaria, sin subir nivel.", "Revalúa a los 14 días"]]
    st.append(data_table(rows_p, [CONTENT_W*0.28, CONTENT_W*0.52,
                                  CONTENT_W*0.20], font_size=8.2))
    st += [Spacer(1, 5*mm)]

    st.append(Paragraph("Lo que no se mide en este test", ST["h3"]))
    st.append(Spacer(1, 2))
    st.append(Paragraph(
        "Y que también importa: cómo te levantas de la cama, si te duele la "
        "espalda a media tarde, si te quedas dormido antes de las once, si "
        "subes las escaleras del metro sin parar. Anótalos en la bitácora "
        "como una línea suelta. A los 40 esos tres detalles valen más que "
        "cinco repeticiones más de flexión.", ST["body"]))
    return st


# ══════════════════════════════════════════════════════════════════ CIERRE
def cierre_page():
    st = []
    st += section_open("DESPUÉS DEL DÍA 21", "Qué haces el día 22",
        "El error más caro de un plan de 21 días es terminarlo y detenerse.")
    st.append(Paragraph(
        "Al día 21 vas a tener tres cosas: un nivel en cada uno de los seis "
        "patrones, una rutina de 25 minutos y una bitácora con 21 líneas. Eso "
        "es más de lo que tiene el 90% de los hombres de tu edad. Lo que sigue "
        "son tres caminos, y solo uno es el correcto.", ST["body"]))
    st += [Spacer(1, 3*mm)]

    rows = [["CAMINO", "QUÉ PASA", "RESULTADO"],
        ["<b>Parar</b>", "Vuelves a lo de antes en tres semanas.",
         "Pierdes lo ganado y la siguiente vez cuesta el doble."],
        ["<b>Empezar otro plan de cero</b>",
         "Cambias de método antes de agotar el actual.",
         "Nunca acumulas suficiente para ver el cambio real."],
        ["<b>Repetir el bloque 3 subiendo un nivel</b>",
         "Mantienes la rutina y agregas dificultad.",
         "Es la única ruta que sigue construyendo sin riesgo."]]
    st.append(data_table(rows, [CONTENT_W*0.30, CONTENT_W*0.32, CONTENT_W*0.38],
                         font_size=8.4))
    st += [Spacer(1, 5*mm)]

    st.append(Paragraph("La progresión del bloque 4 en adelante", ST["h3"]))
    st.append(Spacer(1, 1.6))
    st.append(checklist([
        "Sube <b>un solo nivel por patrón cada dos semanas</b>. No los seis a la vez.",
        "Si un patrón se estanca más de tres semanas, no es falta de fuerza: "
        "revisa sueño, proteína y rango de movimiento.",
        "Cada seis semanas, haz una semana de descarga: mismas sesiones, la "
        "mitad del volumen. Es donde el cuerpo se pone al día.",
        "Vuelve a esta bitácora cada trimestre. Comparar números de hace tres "
        "meses es el mejor antídoto contra la desmotivación.",
    ]))
    st += [Spacer(1, 6*mm)]

    st.append(quote_block(
        "La fuerza a los 40 no se pierde por la edad. Se pierde por dejar de "
        "pedirle al cuerpo que la sostenga. Tres semanas de pedírselo, con "
        "cabeza, alcanzan para notar la diferencia.",
        "La idea central de este manual"))

    st += [Spacer(1, 8*mm)]
    st.append(Rule(CONTENT_W, 0.8, LINE))
    st += [Spacer(1, 4*mm),
        Paragraph("LASTAFIT · CALISTENIA ASIÁTICA H40+", ST["eyebrow"]),
        Spacer(1, 1.6),
        Paragraph("Manual de los primeros 21 días — Edición México 2026. "
                  "Material de apoyo del programa digital. Prohibida su "
                  "reventa o distribución. Este documento no es consejo "
                  "médico.", ST["tiny"])]
    return st

# ══════════════════════════════════════════════════════════════════ BUILD
def contenido_page():
    """Índice real, montado na segunda passada de composição."""
    st = []
    st += section_open("ÍNDICE", "Qué hay en este manual",
        "Once secciones cortas. No hace falta leerlas en orden, pero sí hacer "
        "las que tienen casilla.")
    st += [Spacer(1, 3*mm)]
    rows = []
    if TOC_ENTRIES:
        for title, page in TOC_ENTRIES:
            rows.append([Paragraph(title, ST["tbl"]),
                         Paragraph(f"{page:02d}",
                                   ParagraphStyle_right("InterSb", 8.4, CRIMSON))])
    else:
        for title in ("Lee esto primero", "El semáforo de los 40+",
                      "Cómo funcionan los 21 días", "Los ejercicios, con su escala",
                      "Cómo encuentras tu nivel hoy mismo", "Fuerza A, B y C",
                      "Los cinco errores del hombre de 40+",
                      "Los 12 minutos que abren el cuerpo",
                      "Respirar como se entrena", "El plato base H40+",
                      "La bitácora de los 21 días", "El test de los cuatro números",
                      "Qué haces el día 22"):
            rows.append([Paragraph(title, ST["tbl"]),
                         Paragraph("--",
                                   ParagraphStyle_right("InterSb", 8.4, CRIMSON))])
    tb = Table(rows, colWidths=[CONTENT_W*0.82, CONTENT_W*0.18])
    cmds = [("VALIGN", (0,0), (-1,-1), "BOTTOM"),
            ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0),
            ("TOPPADDING", (0,0), (-1,-1), 6), ("BOTTOMPADDING", (0,0), (-1,-1), 6),
            ("LINEBELOW", (0,0), (-1,-1), 0.35, LINE)]
    tb.setStyle(TableStyle(cmds))
    st.append(tb)
    st += [Spacer(1, 6*mm),
        callout("Si solo tienes diez minutos hoy: haz el semáforo, la movilidad "
                "de 12 minutos y anota una línea en la bitácora. Eso ya cuenta "
                "como día 1.", label="El mínimo viable", color=INK, bg=PAPER_ALT)]
    return st


TOC_ENTRIES = []

SECTIONS = [
    contenido_page, legal_page, semaforo_page, mapa_page, ejercicios_page,
    niveles_page, sesiones_page, tecnica_page, movilidad_page, respiracion_page,
    cocina_page, bitacora_page, test_page, cierre_page,
]


def build(out="Manual-21-Dias-Calistenia-Asiatica-H40.pdf"):
    register_fonts()
    # passada 1: coleta os números de página reais (o índice fica no lugar dele)
    doc1 = IndexDoc(out, title="Manual de los primeros 21 días — Calistenia Asiática H40+",
                    subject="Bono 01 · Programa de 21 días para hombres 40+",
                    author=AUTHOR, edition=EDITION, cover_fn=cover_page)
    story = [NextPageTemplate("body"), PageBreak()]
    for fn in SECTIONS:
        story += fn() + [PageBreak()]
    doc1.build(story[:-1])

    TOC_ENTRIES[:] = [(t, p) for t, p in doc1.toc_entries
                     if t != "Qué hay en este manual"]

    # passada 2: versão final, com o índice preenchido
    doc2 = IndexDoc(out, title="Manual de los primeros 21 días — Calistenia Asiática H40+",
                    subject="Bono 01 · Programa de 21 días para hombres 40+",
                    author=AUTHOR, edition=EDITION, cover_fn=cover_page)
    story = [NextPageTemplate("body"), PageBreak()]
    for fn in SECTIONS:
        story += fn() + [PageBreak()]
    doc2.build(story[:-1])
    return out


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "Manual-21-Dias-Calistenia-Asiatica-H40.pdf"
    p = build(out)
    print("OK", p, os.path.getsize(p), "bytes")
