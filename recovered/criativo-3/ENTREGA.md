# CRIATIVO-3 — edição final

## Master

- **Arquivo:** `entregas/CRIATIVO-3-EDITADO.mp4`
- **SHA-256:** `4fd2da77fd40e45a0f3b6eea96c24889359c62be55705795fd7bd214f4ff3bb6`
- **Tamanho:** 13.855.794 bytes
- **Duração:** 44,666667 s
- **Vídeo:** H.264, 720 × 1280, 24 fps, 1.072 quadros, BT.709, faixa limitada
- **Áudio:** AAC, 48 kHz, estéreo, alvo de 256 kb/s
- **Legendas separadas:** `criativo-3-captions.srt`

## Pedido executado

- **Gradiente no meio:** gradiente de preto puro centrado na divisão das duas cenas, com 140 px de meia-altura e alfa máximo de 150/255, sem esconder o rosto ou o aplicativo.
- **Captions no meio:** 32 blocos de uma linha, centralizados, com Inter Caption de 40 px e um bloco de 37 px; 146 eventos de texto sincronizados, com 27 blocos de pílula na palavra ativa, 4 de sublinhado animado e um CTA com pílula própria. A paleta alterna champanhe, menta e rosa conforme a seção.
- **Ritmo:** 15 pausas encurtadas, totalizando 80 quadros / 3,333333 s removidos. Todas as frases e etapas foram preservadas.
- **Velocidade natural:** 1,0×, sem aceleração ou mudança de tom da voz.
- **Imagem:** contraste e saturação moderados, redução discreta do predominante esverdeado e sharpen leve; sem vinheta, zoom ou efeitos sobre a interface.
- **Áudio:** −16,0 LUFS e −1,5 dBTP, com AAC produzido diretamente do PCM editado; o áudio decodificado é idêntico ao da versão anterior.

## Revisão das captions

Foram usadas três passagens locais de ASR para revisar termos e tempos. `blazer` e `combiná-las` foram corrigidos. A frase exibida “O aplicativo encontra ideias para o momento.” recebeu limpeza editorial de fluência a partir de uma passagem ambígua do ASR, sem modificar a narração. As 149 unidades originais permanecem cobertas pelas captions.

## QA final

| Verificação | Resultado |
| --- | --- |
| Entrega consolidada | **34/34 PASS** |
| Projeto estático | **49/49 PASS** |
| Vídeo | **0 falhas / 0 avisos**; nenhum preto ou freeze detectado |
| Captions | **0 erros / 0 avisos**; CPS máximo 20,805 |
| Largura das captions | Máximo 639 px; uma linha em todos os blocos |
| Revisão visual do master | **84 quadros / 7 folhas**, mais quadros nativos direcionados aos formatos e ao CTA |
| Cobertura visual | 32 captions, 15 cortes, amostras uniformes, primeiro e último quadro |
| Sincronia do áudio | **0 amostras de deslocamento**; correlação 0,999995 |
| Loudness / true peak | **−16,0 LUFS / −1,5 dBTP** |
| Decodificação | Integral, sem erros |

Relatórios principais: `reports/delivery-qa.json`, `reports/video-qa.json`, `reports/caption-qa.json`, `reports/project-qa.json`, `reports/review-manifest.json` e `reports/delivery-review.json`.

## Fonte e preservação

- Fonte original do Drive: `CRIATIVO-3.mp4`, 45.813.600 bytes.
- Drive file ID: `1bjpLFCsFRe7USotUMYAwUk9CTljvckSU`.
- MD5 validado com o Drive: `fff3e8fbe6d0cff8fcda57364580391f`.
- SHA-256 da fonte preservada: `5a6096947b8b7e243a300d19a3e549b9d138e194857d57f5c87b8ecd0e722f57`.
- O original não foi substituído pelo editado. Fonte, PCM, caches, prévia e quadros de trabalho ficam fora do versionamento.

## Reprodução

Com FFmpeg/ffprobe no `PATH` e Pillow instalado, execute a partir desta pasta:

```bash
python3 scripts/prepare_criativo_3.py
python3 scripts/validate_criativo_3.py
python3 scripts/render_criativo_3.py --output ../../entregas/CRIATIVO-3-EDITADO.mp4
python3 scripts/review_delivery_criativo_3.py
```

O gate de entrega adicionalmente requer NumPy e SciPy e os relatórios de `caption_qa.py` e `video_qa.py` das skills do repositório. O gradiente é determinístico; não há sorteio, estado imprevisível ou chamada a modelos externos na reprodução.

## Limite da revisão

A entrega inclui análise técnica, medições de áudio e quadros extraídos do master, mas não equivale a escuta humana integral, aprovação estética em playback em tempo real ou evidência de conversão no Facebook Ads.
