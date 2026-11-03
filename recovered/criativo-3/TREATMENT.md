# CRIATIVO-3 — tratamento de edição

## Direção

Manter a estrutura de duas cenas e transformar sua divisão horizontal em um elemento útil de design. O anúncio deve ficar mais ágil e legível sem esconder a atuação, os looks ou a interface do aplicativo.

## Gradiente e captions

- Gradiente de preto puro, centrado em y=640, com 140 px de meia-altura e alpha máximo 150/255; as bordas chegam a alpha zero antes dos extremos dos painéis.
- 32 captions de uma única linha, centralizadas horizontal e verticalmente.
- Inter Caption, 40 px; somente o bloco mais longo usa 37 px para permanecer em uma linha.
- Largura máxima medida de 639 px em um canvas de 720 px; nenhum texto ultrapassa a margem.
- 146 unidades de texto ativas: pílulas arredondadas com texto escuro na palavra falada, sublinhados animados em quatro blocos de marca/conceito e um CTA com pílula própria e destaque vinho.
- Champanhe, menta e rosa são aplicados deterministicamente por seção; os desenhos ASS usam curvas cúbicas e acompanham a métrica real do renderizador.
- SRT e ASS exportados; os tempos foram recalculados após cada corte e cada transição é uma função determinística do tempo.

## Montagem e imagem

- 15 pausas encurtadas: 80 quadros / 3,333333 s removidos.
- Velocidade 1,0×: nenhuma aceleração adicional da voz.
- Contraste e saturação moderados, redução discreta do predominante esverdeado e sharpen leve.
- Sem vinheta, zoom, reenquadramento, placeholders, mídia gerada ou alteração das telas originais.

## Áudio

- Cortes em limites de quadros, sem mudança de andamento ou tom.
- Loudnorm em duas passagens para −16 LUFS e true peak de −1,5 dBTP.
- AAC de 48 kHz estéreo codificado diretamente do PCM editado completo, em etapa separada do limite de quadros de vídeo.

## Revisão

O projeto é validado antes do render e o MP4 final é validado novamente. A revisão registra fatos técnicos e quadros observados; não declara escuta humana integral nem resultado de conversão.
