# ARMÁRIO-8 — Superlegendas e + SEGUIR

Edição do `CLOSET-8.mp4` limitada exatamente a duas intervenções visuais: **superlegendas sincronizadas** e **+ SEGUIR no final**. O vídeo original ocupa 1080×1920 sem crop, cartão, zoom, filtro, backdrop ou transições adicionais. Não há cabeçalho, HUD, logotipo, paleta, textos editoriais ou cartão de perfil.

## Direção

- **Vídeo:** cinco sequências de looks preservadas de ponta a ponta, incluindo os cortes naturais e a pausa original.
- **Legendas:** 52 palavras em 13 blocos; somente a fala transcrita aparece na tela. Tipografia Inter/860 com Playfair itálica nos adjetivos finais, opacidade calculada por `t` e posição fixa na região central inferior.
- **Seguir:** uma única cápsula azul `+ SEGUIR`, de 250×80 px, aparece em **22,75 s**, dois segundos antes do fim. Permanece até o último quadro.
- **Biblioteca:** o botão deriva de `instagram-follow` do HyperFrames, revisão `85fdc9aa888b4d26c8150fd09acae7b23fb392f5`. Foram aproveitados a cápsula `#0095f6` e a entrada `power3.out`; avatar, nome, handle, contador, estado “following” e saída foram removidos. A animação é uma função pura de `t`, sem GSAP, timers ou histórico.
- **Áudio:** somente a faixa original, sem trilha ou efeitos adicionais, normalizada para −14 LUFS e true peak de −1,5 dBTP.
- **Master:** 1080×1920, 60 fps, 1.485 quadros, 24,75 s, H.264/AAC e `faststart`.

## Fonte e transcrição

- Fonte: `reels-studio/assets/armario-8/CLOSET-8.mp4`.
- Commit de origem: `4edf4a8cf9a68fbe94aee30da695ab46f80fc854`.
- SHA-256: `a42302bb65aa3cb5c8e21e65f239f525748d10dbefc7de2e8077ab0283bb26ed`.
- Transcrição local com faster-whisper 1.2.1 / Whisper small CTranslate2 int8; duas decodificações completas coincidentes e revisão adicional do trecho “lilás” para a grafia “fit”.

## Pipeline

- `prepare_project.py`: gera timeline, palavras, grupos, SRT e metadados.
- `normalize-source.mjs`: converte o original em 1.485 JPEGs indexados a 60 fps.
- `composition.js`: vídeo, legendas e seguir em função pura de `t`.
- `render.mjs`: captura cada `frame / 60` em Chromium headless.
- `encode.mjs`: H.264, áudio original normalizado e mux do MP4.
- `compare_determinism.py`: recaptura dez quadros fora de ordem e compara bytes/RGB.
- `validate.py`: contêiner, fonte, sequência, áudio, SRT, escopo visual e folha do MP4.

```bash
npm ci
python3 prepare_project.py
node normalize-source.mjs
node render.mjs
node encode.mjs
python3 validate.py
```

Entrega: `entregas/ARMARIO-8-EDITADO.mp4`. Preview HTTP com Range na porta **3005**; os projetos anteriores permanecem em suas portas.
