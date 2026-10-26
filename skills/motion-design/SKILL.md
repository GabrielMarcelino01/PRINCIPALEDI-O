---
name: motion-design
description: Criar ou adaptar motion graphics em Remotion com easing, coreografia, karaokê, split screen, transições líquidas, CSS 3D e blocos volumétricos. Use para vídeos horizontais, animações explicativas e composições em código.
---

# Motion Design

Use a composição recuperada em `../../recovered/motion-2/remotion/src/MotionDesignComposition.jsx` como ponto de partida. Ela é autônoma, não precisa de assets e renderiza 20 s a 1920×1080/60 fps.

## Fluxo

1. Defina com o usuário objetivo, formato, duração, texto, identidade visual e se haverá narração/trilha.
2. Leia `../../recovered/motion-2/docs/MOTION-DESIGN-PT-BR.md`.
3. Preserve uma composição de referência antes de personalizar. Não altere os originais do usuário.
4. Planeje as cenas antes de renderizar. Uma cena deve ter uma função: gancho, explicação, prova, demonstração ou CTA.
5. Anime mais de uma propriedade com parcimônia; use easing e escalonamento. Evite movimento linear decorativo.
6. Faça um render de prévia, inspecione frames e só depois renderize a master.
7. Rode `../../skills/video-quality/scripts/video_qa.py` e assista ao resultado final.

## Comandos

```bash
cd recovered/motion-2/remotion
npm ci
npm run studio:design
npm run render:design
```

Para outro destino:

```bash
node render.mjs --selfcontained --composition MotionDesign --output out/motion-design.mp4
```

## Regras de qualidade

- Nenhum texto pode cortar nas bordas ou ficar escondido por outra camada.
- Cada palavra da legenda precisa acompanhar a fala; texto de demonstração não é transcrição.
- Não entregue frames pretos, congelados ou transições vazias sem intenção.
- Se adicionar áudio, meça loudness e true peak e revise o balanço entre voz, música e SFX.
- Entregue também o projeto editável e informe qualquer limitação da reconstrução.
