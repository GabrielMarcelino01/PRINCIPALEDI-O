# CRIATIVO-2 — edição final

## Master

- **Arquivo:** `entregas/CRIATIVO-2-EDITADO.mp4`
- **SHA-256:** `afdacc103a966e478599c3802b1db8538f4bf1b3776a188223176adc57b0802c`
- **Tamanho:** 19.763.760 bytes
- **Duração:** 44,333333 s
- **Vídeo:** H.264, 720 × 1280, 24 fps, 1.064 quadros, BT.709, faixa limitada
- **Áudio:** AAC, 48 kHz, estéreo, 256 kb/s

## Pedido executado

- **Superlegendas:** 25 blocos revisados, fonte Inter Caption de 40 px, no máximo duas linhas, contorno discreto e destaques em champanhe. O tamanho é menor que o padrão dos criativos anteriores, sem sacrificar a leitura.
- **Luz cinematográfica:** contraste suave, realces levemente quentes, sombras frias, saturação contida e vinheta discreta. Não foram adicionados grão, desfoque ou escurecimento forte.
- **Cortes:** 12 intervalos de pausas/cauda removidos, totalizando 2,791667 s, sem cortar palavras ou eliminar etapas da narrativa.
- **Velocidade:** 1,2× aplicada depois dos cortes, com `atempo` para preservar o tom da voz. A velocidade efetiva é 1,200188× devido à quantização em 24 fps.
- **Áudio:** loudness ajustado para −16 LUFS e pico de −1,5 dBTP; AAC codificado diretamente do PCM editado completo.

## QA final

| Verificação | Resultado |
|---|---|
| Entrega consolidada | **31/31 PASS** |
| Vídeo | **0 falhas / 0 avisos**; sem preto ou freeze detectados |
| Superlegendas | **0 erros / 0 avisos**; CPS máximo 21,745 |
| Projeto estático | **29/29 PASS** |
| Revisão visual do master | **40 quadros / 5 folhas** |
| Sincronia do áudio | **0 amostras de deslocamento**; correlação 0,999341 |
| Loudness / true peak | **−16,0 LUFS / −1,5 dBTP** |
| Decodificação | Integral, sem erros |

Relatórios principais: `reports/delivery-qa.json`, `reports/video-qa.json`, `reports/caption-qa.json`, `reports/project-qa.json` e `reports/delivery-review.json`.

## Fonte e preservação

- Fonte original do Drive: `CRIATIVO-2.mp4`, 53.233.905 bytes.
- MD5 validado com o Drive: `41e1b52c3a27feb94a6ff89594cba2c8`.
- SHA-256 da fonte preservada: `94cbd37a9eb5255063f4f71aecc944521ddc0d4bf52fff7adba749c3c505ae9d`.
- O original não foi substituído pelo editado. Intermediários, caches e o PCM ficam fora do versionamento.

## Reprodução

Com FFmpeg/ffprobe no `PATH`, execute a partir desta pasta:

```bash
python3 scripts/prepare_criativo_2.py
python3 scripts/validate_criativo_2.py
python3 scripts/render_criativo_2.py --output ../../entregas/CRIATIVO-2-EDITADO.mp4
```

O renderer separa a imagem do acabamento do AAC para impedir que a contagem de quadros interrompa o áudio. O validador de entrega adicionalmente requer NumPy e SciPy.

## Limite da revisão

A revisão inclui análise técnica e quadros extraídos do master, mas não equivale a escuta humana integral, aprovação estética em playback ou validação de performance de campanha.
