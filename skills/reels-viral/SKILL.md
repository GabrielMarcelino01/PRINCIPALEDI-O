---
name: reels-viral
description: Editar Reels, Shorts e TikToks verticais com cortes rítmicos, superlegendas palavra a palavra, fundo desfocado, progresso, CTA e motion graphics em Remotion.
---

# Reels Viral

Use para transformar um talking head ou outro vídeo em uma peça vertical 9:16. A base está em `../../recovered/motion-2/remotion/src/ReelsViralComposition.jsx` e a documentação em `../../recovered/motion-2/docs/REELS-VIRAL-PT-BR.md`.

## Antes de editar

1. Confirme duração, objetivo, público, CTA e plataforma.
2. Preserve o arquivo bruto e faça `ffprobe` antes de cortar.
3. Transcreva com tempos por palavra quando a legenda acompanhar fala. Não trate as frases de demonstração como transcrição.
4. Obtenha aprovação do roteiro/cortes quando a mudança editorial for relevante.

## Montagem

- Estrutura padrão: gancho → contexto → desenvolvimento → clímax → fechamento → CTA.
- Corte pausas sem função, mas preserve respiração e ritmo quando forem importantes.
- Posicione rosto, títulos e legendas dentro das safe zones da plataforma.
- Use o fundo desfocado para preencher 9:16 sem deformar o vídeo central.
- Destaque uma palavra por vez; não faça todas pularem continuamente.
- As barras de áudio da composição são decorativas. Não afirme que são análise de áudio.

## Render

```bash
cd recovered/motion-2/remotion
npm ci
node render.mjs --selfcontained --composition ReelsViral \
  --props '{"videoUrl":"/caminho/absoluto/original.mp4"}' \
  --output out/reels.mp4
```

Para textos próprios, passe `--props @props.json` conforme a documentação.

## Entrega

Revise o MP4 com som, verifique as seis passagens de cena e rode o QA:

```bash
python3 skills/video-quality/scripts/video_qa.py recovered/motion-2/remotion/out/reels.mp4 \
  --expected-width 1080 --expected-height 1920 --min-fps 60 \
  --contact-sheet recovered/motion-2/remotion/out/reels-contact.jpg
```

Não entregue sem conferir sincronia, ortografia, corte do rosto, loudness e o CTA.
