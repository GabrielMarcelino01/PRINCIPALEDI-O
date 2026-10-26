# Reels Viral — vertical com superlegenda

> **Status da recuperação:** composição reconstruída a partir da descrição pública do segundo commit do PR `GabrielMarques181920/motion-2#2`. O código original não está mais acessível. A duração de 18 segundos e os textos de demonstração fazem parte da reconstrução.

Composição Remotion de **1080×1920, 60 fps e 18 segundos**, com seis cortes: gancho, meio 1/2, meio 2/2, clímax, fechamento e CTA.

## Recursos

- superlegenda palavra a palavra, com palavra ativa em âmbar e pílula animada;
- seis cortes rítmicos com etiqueta da seção;
- vídeo original central, leve zoom e fundo desfocado que preenche o vertical;
- barra de progresso e barras de áudio decorativas;
- card 3D flutuante de “Salve” no CTA;
- transição líquida entre os cortes;
- modo autônomo com fundo de demonstração quando não há vídeo.

**Importante:** as barras são decorativas, não uma análise do áudio. As legendas padrão também são demonstrativas. Para um vídeo real, substitua os textos e tempos pelos dados da transcrição antes de entregar.

## Studio

```bash
cd recovered/motion-2/remotion
npm ci
npm run studio:reels
```

Selecione **ReelsViral**.

## Render sem vídeo

```bash
npm run render:reels
```

Saída: `out/reels-viral.mp4`.

## Render com vídeo local

```bash
node render.mjs \
  --selfcontained \
  --composition ReelsViral \
  --props '{"videoUrl":"/caminho/absoluto/original.mp4"}' \
  --output out/reels-com-video.mp4
```

O render copia o vídeo local para a pasta pública do bundle com um nome controlado e usa `static://` no Remotion. O original não é alterado. URLs HTTP(S) também são aceitas, desde que acessíveis pelo navegador de renderização.

## Personalizar textos e cor

Crie `props.json`:

```json
{
  "videoUrl": "/caminho/absoluto/original.mp4",
  "accent": "#fbbf24",
  "showAudioBars": true,
  "scenes": [
    {"tag":"GANCHO","title":"SUA ABERTURA","words":["UMA","FRASE","FORTE"],"colors":["#4f46e5","#09090b"]},
    {"tag":"MEIO 1/2","title":"CONTEXTO","words":["AGORA","O","CONTEXTO"],"colors":["#0f766e","#09090b"]},
    {"tag":"MEIO 2/2","title":"DESENVOLVIMENTO","words":["MAIS","UMA","IDEIA"],"colors":["#be123c","#09090b"]},
    {"tag":"CLÍMAX","title":"PONTO PRINCIPAL","words":["AQUI","ESTÁ","O","PONTO"],"colors":["#7c3aed","#09090b"]},
    {"tag":"FECHAMENTO","title":"RECAPITULE","words":["REVISE","A","PROMESSA"],"colors":["#1d4ed8","#09090b"]},
    {"tag":"CTA","title":"CHAME PARA AÇÃO","words":["SALVE","PARA","DEPOIS"],"colors":["#b45309","#09090b"]}
  ]
}
```

Depois:

```bash
node render.mjs --selfcontained --composition ReelsViral --props @props.json --output out/reels.mp4
```

A reconstrução espera exatamente seis cenas de 180 quadros. Para duração individual por cena ou karaokê baseado em timestamps reais, adapte `ReelsViralComposition.jsx` e atualize `REELS_SETTINGS.durationInFrames`.

## Revisão obrigatória

- confira cada palavra com o áudio, inclusive após cortes;
- mantenha textos fora das interfaces de Reels/TikTok/Shorts;
- valide o áudio do vídeo central e evite duplicá-lo no fundo — o fundo já está mudo;
- use somente mídia que você tem direito de editar;
- gere folha de contato e relatório:

```bash
python3 ../../../skills/video-quality/scripts/video_qa.py out/reels.mp4 \
  --expected-width 1080 --expected-height 1920 --min-fps 60 \
  --contact-sheet out/reels-contact.jpg --output out/reels-qa.json
```
