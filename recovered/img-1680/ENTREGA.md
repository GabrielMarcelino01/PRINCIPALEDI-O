# IMG_1680 — criativo editado para Facebook Ads

## Master

- **Arquivo:** `entregas/IMG-1680-EDITADO.mp4`
- **SHA-256:** `eb2f2174a026e6f5516bbeea750aec6484d3654a3c743724418a0add9f5339c5`
- **Tamanho:** 42.590.886 bytes
- **Duração:** 35,183333 s
- **Vídeo:** H.264, 1080 × 1920, 60 fps, 2.111 quadros, BT.709, faixa limitada
- **Áudio:** AAC, 48 kHz, estéreo, 256 kb/s; PCM editado usado diretamente no acabamento

## Edição executada

- Transcrição e revisão específicas de IMG_1680: 11 segmentos e 112 palavras.
- 22 grupos de superlegendas revisados; 21 sobrepostos, sem duplicar o CTA já incorporado ao take final.
- Cortes de quatro pausas (`9,18–9,72`, `14,22–14,48`, `21,68–21,80` e `24,22–24,50`), total nominal de 1,20 s removido.
- Dupla cena “ANTES / AGORA” entre 3,70 e 7,266667 s, usando o take preservado do início e o look seguinte.
- Zooms determinísticos discretos, de 1,00× a 1,10×; telas do aplicativo mantidas sem zoom para preservar leitura.
- Melhoria conservadora de imagem e upscale para 1080 × 1920, sem alegar recuperação generativa de detalhes inexistentes.
- Estrutura de retenção e conversão com hook, contraste visual, demonstração do aplicativo e CTA “TOQUE EM SAIBA MAIS”. Não há garantia de performance de campanha.

## QA final

| Verificação | Resultado |
|---|---|
| Entrega | **18/18 PASS** |
| Vídeo | **0 falhas / 0 avisos**; sem preto ou freeze detectados |
| Superlegendas | **0 erros / 0 avisos**; CPS máximo 21,79 |
| Projeto estático | **33/33 PASS** |
| Revisão visual do master | **40 quadros / 5 folhas**, sem overflow ou corte de rosto observado |
| Sincronia do áudio | **0 amostras de deslocamento**; correlação 0,999997675 |
| Loudness | Fonte −16,9 LUFS; master −16,9 LUFS; pico −1,6 dBTP |
| Decodificação | Integral, sem erros |

Relatórios: `reports/img-1680-delivery-qa.json`, `reports/img-1680-video-qa.json`, `reports/img-1680-caption-qa.json`, `reports/img-1680-project-qa.json`, `reports/storyboard-review.json` e `reports/delivery-review.json`.

## Reprodução

Com FFmpeg/ffprobe no `PATH` e dependências instaladas:

```bash
python3 scripts/prepare_img_1680.py
python3 scripts/validate_img_1680.py
node img-1680-render.mjs --output ../../entregas/IMG-1680-EDITADO.mp4
python3 scripts/validate_delivery_1680.py
```

A fonte, os intermediários e os masters anteriores foram preservados. O original não é substituído por nenhum MP4 editado. Assets binários locais, caches e renders intermediários estão fora do versionamento; o preparador regenera os intermediários a partir da fonte preservada.

## Limite da revisão

As verificações acima são técnicas e baseadas também em quadros extraídos. Elas não equivalem a escuta humana integral, aprovação estética ou validação de conversão em campanha.
