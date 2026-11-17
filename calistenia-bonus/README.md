# Manual de los primeros 21 días — Calistenia Asiática H40+

Bono premium en PDF para el producto **Calistenia Asiática H40+** (Lastafit, mercado México).
20 páginas A4, español mexicano, listo para entregar al cliente.

```
Manual-21-Dias-Calistenia-Asiatica-H40.pdf   ← el entregable
bonus/manual.py                              ← contenido (texto y estructura)
bonus/pdfkit.py                              ← sistema de diseño (paleta, tipos, cajas)
assets/fonts/*.ttf                           ← Inter + Bebas Neue (licencia OFL)
assets/img/*.jpg                             ← portada y 3 láminas (sumi-e)
```

## Cómo se construye

```bash
# solo este intérprete tiene reportlab + fonttools + pillow + pypdfium2
PYTHONPATH=bonus /home/user/.venv-pdf/bin/python bonus/manual.py
```

El script hace **dos pasadas**: la primera recolecta el número de página real de
cada sección, la segunda compone el índice con esos números. Si cambias el orden
o el largo de una sección, el índice se corrige solo.

Para revisar la maquetación:

```bash
/home/user/.venv-pdf/bin/python -c "
import pypdfium2 as pdfium
pdf = pdfium.PdfDocument('Manual-21-Dias-Calistenia-Asiatica-H40.pdf')
for i in range(len(pdf)): pdf[i].render(scale=1.2).to_pil().save(f'/tmp/p{i+1:02d}.png')
"
```

## Las 20 páginas

| # | Sección | Para qué sirve |
|---|---|---|
| — | Portada | Arte a sangre completa + promesa acotada |
| 01 | Índice | Generado automáticamente |
| 02 | Lee esto primero | Qué promete y qué **no** promete el manual |
| 03 | El semáforo de los 40+ | Verde / ámbar / rojo: seguir, ajustar o parar |
| 04 | Cómo funcionan los 21 días | 3 bloques de 7 + semana modelo + reparto de los 25 min |
| 05 | Los ejercicios, con su escala | 6 patrones × 4 niveles + tempo + descanso |
| 06 | Cómo encuentras tu nivel hoy | Prueba de 15 minutos, decisión por patrón |
| 07–08 | Fuerza A, B y C | Las tres sesiones ejecutables + calentamiento de 6 min + sin barra |
| 09 | Los cinco errores | Técnica + mapa de dolor por zona |
| 10–11 | Movilidad en 12 minutos | Rutina + 3 pruebas mensuales de movilidad |
| 12–13 | Respirar como se entrena | Protocolo 4-6-2, errores, variante de estrés |
| 14–15 | El plato base H40+ | Regla de la mano, 4 ajustes, 7 días de comida mexicana |
| 16 | La bitácora de 21 días | Imprimible, con ejemplo de fila llena |
| 17–18 | El test de los cuatro números | Dónde anotar + cómo leer el resultado |
| 19 | Qué haces el día 22 | Progresión del bloque 4 en adelante |

## Decisiones de contenido

- **Todo lo del manual se puede hacer sin gimnasio y sin equipo**, igual que el
  producto: pared, silla, mesa, marco de puerta, toalla, una barra si la hay.
- **Ninguna promesa de resultado específico.** El manual dice explícitamente que
  tres semanas no transforman el cuerpo y que cualquier material que prometa
  15 kg o curar una lesión está vendiendo otra cosa.
- **Aviso médico en tres puntos** (apertura, semáforo, respiración) más el
  descargo del pie de página. Los resultados varían queda dicho tres veces.
- Lenguaje: **español mexicano**. *Peso corporal, frijol, aguacate, nopal,
  jitomate, chayote, instructores, echarle ganas.* Nada de formas peninsulares.
- Los plazos fisiológicos citados (sarcopenia, recuperación de fosfágenos,
  adaptación de tendón) están redactados como criterio práctico, sin cifras de
  precisión falsa ni fuentes inventadas.

## Licencias

- **Inter** y **Bebas Neue**: SIL Open Font License 1.1, uso comercial permitido,
  incrustación en PDF permitida.
- Ilustraciones: generadas para este proyecto. Estilo sumi-e/carbón coherente
  con el arte del embudo (`/assets/img/funnel/` del sitio).
- El PDF no incluye enlaces rastreadores ni datos del cliente: es un archivo
  estático, entregable por correo o dentro de Hotmart.

---

## Onde o bônus está publicado

| O quê | Link | Estado |
| --- | --- | --- |
| **Landing (domínio principal)** | https://manual-calistenia-h40.vercel.app | ✅ no ar |
| PDF no mesmo domínio | https://manual-calistenia-h40.vercel.app/manual.pdf | ✅ no ar |
| Espelho do PDF no Google Drive | https://drive.google.com/file/d/1uMJNYCHp8e3vj3ItPB2bhruy2wPvd7w/view | ✅ público |
| Espelho da landing no jsDelivr | https://cdn.jsdelivr.net/gh/GabrielMarcelino01/PRINCIPALEDI-O@manual-h40-v2/calistenia-bonus/site/index.html | ⚠️ parcial (o pacote do repo passa de 50 MB; só arquivos soltos servem) |

### Domínio próprio

A conta Vercel não tem nenhum domínio registrado, e compra/registro de domínio não é feito por aqui.
Para usar um domínio próprio (ex.: `manual.seudominio.com`):

1. Vercel → projeto `manual-calistenia-h40` → **Settings → Domains → Add**.
2. O Vercel devolve o registro DNS (`CNAME cname.vercel-dns.com` ou `A 76.76.21.21`).
3. Crie esse registro no registrador do domínio. A verificação é automática e o certificado TLS é emitido sozinho.

### Como publicar uma nova versão

```bash
cd calistenia-bonus && PYTHONPATH=bonus /home/user/.venv-pdf/bin/python bonus/manual.py \
  Manual-21-Dias-Calistenia-Asiatica-H40.pdf
cp Manual-21-Dias-Calistenia-Asiatica-H40.pdf site/manual.pdf
# gerar as miniaturas e reinjetar o base64 em site/index.html (site/thumbs + SRC[])
git commit -am "bono: nova versao" && git push
```
O deploy é automático: o projeto está ligado ao repositório `GabrielMarcelino01/PRINCIPALEDI-O`,
com **Root Directory = `calistenia-bonus/site`**.

### Notas técnicas da landing

- `site/index.html` é **autocontido**: fontes woff2, capa e as 20 páginas do manual vão embutidas em base64.
  Isso o torna independente de CDN e imune ao limite de 50 MB do jsDelivr.
- Os botões de download apontam para o **Google Drive** (arquivo público, anyoneWithLink);
  `manual.pdf` é o espelho servido pelo próprio domínio.
- `robots.txt` bloqueia indexação: é material de cliente, não página de captura.
