---
name: video-quality
description: Validar vídeo final com ffprobe, loudness EBU R128, true peak, frames pretos/congelados, folha de contato, resolução, fps e checklist de entrega.
---

# Qualidade de vídeo

Faça QA no **arquivo final codificado**, não apenas no projeto ou no preview. Ferramentas necessárias: Python 3, FFmpeg e ffprobe no `PATH`.

## Gate técnico

```bash
python3 skills/video-quality/scripts/video_qa.py final.mp4 \
  --expected-width 1080 --expected-height 1920 --min-fps 30 \
  --target-loudness -14 --max-true-peak -1 \
  --contact-sheet final-contact.jpg --output final-qa.json --strict
```

- Em vídeos sociais com música/voz, `-14 LUFS` integrado e true peak máximo de `-1 dBTP` são pontos de partida, não uma regra universal. Siga a especificação real da plataforma ou do cliente.
- Ausência de áudio é um aviso; em motion intencionalmente mudo, aceite-o explicitamente.
- Eventos de preto ou congelamento são avisos porque podem ser intencionais. Inspecione cada ocorrência.
- `--strict` retorna erro para falhas objetivas de formato, duração, fps, loudness ou true peak.

## Revisão visual

Abra a folha de contato e também assista ao vídeo em velocidade normal. Verifique:

- resolução, proporção, fps e orientação corretos;
- rosto e elementos essenciais fora das safe zones ocupadas pela interface;
- ortografia, contraste, legibilidade em tela de celular e tempo de leitura;
- sincronia de legendas e ausência de texto cortado;
- frames pretos, congelados, piscadas e transições incompletas;
- cortes sem saltos acidentais de posição, cor ou exposição;
- B-roll e motion coerentes com a fala, sem assets quebrados.

## Revisão de áudio

Ouça com fone e em alto-falante de celular. Verifique voz inteligível, cliques nos cortes, dessintonia A/V, música com ducking, SFX sem excesso e ausência de clipping. Uma medição correta não compensa uma mixagem desagradável.

## Aprovação

Só aprove quando as falhas objetivas estiverem resolvidas e cada aviso tiver sido inspecionado. Registre no relatório as especificações usadas e as exceções intencionais. Entregue o JSON de QA e a folha de contato junto do master quando útil.
