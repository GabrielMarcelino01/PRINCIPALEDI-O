# Motion Design — composição autônoma

> **Status da recuperação:** esta implementação foi reconstruída a partir da descrição pública do commit `2e8078c` do PR `GabrielMarques181920/motion-2#2`. O código-fonte original do commit não está mais acessível; esta não é uma cópia byte a byte.

Composição Remotion autocontida de **20 segundos, 1920×1080 e 60 fps**. Não exige `project.json`, vídeo, fontes baixadas nem assets externos.

## O que contém

- entradas com easing **back** e **bounce**;
- coreografia escalonada e transições entre sete cenas;
- legenda karaokê com páginas de até três palavras;
- tela dividida entre código e prévia;
- transição líquida com filtro SVG `gooey`;
- composição 3D minimalista em CSS 3D;
- estilo **vox**, com 30 blocos volumétricos montados em sequência;
- tela final com especificações de entrega.

## Requisitos

- Node.js 22 ou superior;
- dependências de `remotion/` instaladas com `npm ci`;
- Chrome/Chromium para renderização, ou a variável `REMOTION_BROWSER` apontando para o navegador.

## Abrir no Remotion Studio

```bash
cd recovered/motion-2/remotion
npm ci
npm run studio:design
```

Selecione **MotionDesign**. A mesma entrada também registra **ReelsViral**.

## Renderizar

```bash
cd recovered/motion-2/remotion
npm run render:design
```

Saída: `out/motion-design.mp4`.

Comando equivalente com todos os parâmetros explícitos:

```bash
node render.mjs \
  --selfcontained \
  --entry src/design.jsx \
  --composition MotionDesign \
  --output out/motion-design.mp4
```

Use `--preview` para uma prévia com CRF 24 e escala reduzida:

```bash
node render.mjs --selfcontained --composition MotionDesign --output out/preview.mp4 --preview
```

## Personalizar

- `src/MotionDesignComposition.jsx`: textos, cores, cenas e coreografia;
- `src/design-utils.mjs`: durações globais, easing e utilitários de legendas;
- `src/design.jsx`: registro, resolução, fps e duração das composições.

A duração atual é `1200` quadros. Se alterar cortes ou duração, mantenha `SCENES`, `durationInFrames` e os tempos das legendas sincronizados.

## Verificação antes da entrega

```bash
npm test
python3 ../../../skills/video-quality/scripts/video_qa.py out/motion-design.mp4 \
  --expected-width 1920 --expected-height 1080 --min-fps 60 \
  --contact-sheet out/motion-design-contact.jpg \
  --output out/motion-design-qa.json
```

A composição autônoma não tem trilha; aviso de ausência de áudio é esperado. Assista ao MP4 final e à folha de contato. Não aprove apenas porque o render terminou sem erro.
