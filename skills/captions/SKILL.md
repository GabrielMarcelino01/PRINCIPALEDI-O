---
name: captions
description: Criar, revisar e validar legendas SRT/VTT, karaokê e superlegendas verticais com sincronia por palavra, leitura confortável, safe zones e controle de qualidade.
---

# Legendas

Use para transcrever, revisar, temporizar ou embutir legendas. Para a produção completa do Hypit, leia também `../hypit/references/production/caption-authoring.md`, `caption-presentation.md` e `../hypit/references/playbooks/craft/captions.md`.

## Fluxo

1. Gere uma transcrição com timestamps por palavra; revise termos, nomes e pontuação.
2. Remapeie os tempos depois de cada corte. Nunca reutilize o SRT original sem verificar o deslocamento.
3. Divida por unidade de leitura, sem separar artigo do substantivo ou preposição do complemento.
4. Para SRT/VTT, prefira até duas linhas, cerca de 42 caracteres por linha e leitura confortável.
5. Para karaokê, mantenha a frase curta visível e destaque apenas a palavra ativa.
6. Em 9:16, deixe margem para a interface da plataforma e não cubra boca, olhos ou gestos essenciais.
7. Exporte sidecar SRT/VTT mesmo quando também entregar legenda embutida.
8. Assista com som e confira início, fim, cortes de cena e palavras destacadas.

## Validação automática

```bash
python3 skills/captions/scripts/caption_qa.py legendas.srt --output legendas-qa.json
python3 skills/captions/scripts/caption_qa.py legendas.srt --video final.mp4 --strict
```

O script detecta blocos inválidos, duração não positiva, sobreposição, linhas longas, excesso de caracteres por segundo e legendas além da duração do vídeo. Ele **não** substitui ouvir e revisar a transcrição.

## Render de superlegenda

A composição `../../recovered/motion-2/remotion/src/ReelsViralComposition.jsx` oferece um exemplo editável de pílula âmbar e destaque por palavra. Os textos incluídos são demonstrativos; substitua pelos dados reais da fala antes da entrega.
