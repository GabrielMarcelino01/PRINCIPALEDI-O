# CRIATIVO-3 — análise da fonte

## Fonte

- Entrada única do Google Drive: `CRIATIVO-3.mp4`.
- 48,000 s, 1.152 quadros, 720 × 1280, 24 fps, H.264 e AAC estéreo.
- O arquivo preservado em `assets/original.mp4` é byte a byte igual ao download; hashes constam no projeto e em `ENTREGA.md`.
- A decodificação integral da fonte não apresentou erros. O loudness original mediu −22,5 LUFS e −6,4 dBTP.

## Estrutura audiovisual

A peça usa duas imagens empilhadas, cada uma ocupando metade da tela. A apresentadora permanece na metade inferior, enquanto a metade superior alterna atuação, demonstrações do aplicativo, looks e a marca. A divisão horizontal em y=640 oferece um centro visual natural para o gradiente e as captions solicitados.

| Tempo aproximado | Função e conteúdo |
| --- | --- |
| 0–3 s | Gancho: casal em dúvida sobre o que vestir. |
| 3–18 s | Truque dos Mil Looks, combinações e indicações de peças no aplicativo. |
| 18–30 s | Closet Virtual, fotografia das roupas, ocasiões e sugestões. |
| 30–36 s | Uma camisa, variações com calça, blazer e acessórios. |
| 36–42 s | Exemplo externo do look e coordenação das peças. |
| 42–45 s | Interface, dor de “não ter nada” e apresentação da marca. |
| 45–48 s | Logotipo, botão “Saiba Mais” e gesto de clique. |

## Fala e ritmo

Foram executadas duas passagens independentes de Whisper small CTranslate2 int8 e uma terceira com vocabulário de domínio. As 149 unidades de tempo por palavra foram mantidas no projeto. A revisão confirmou `blazer` e `combiná-las`; a caption do aplicativo recebeu limpeza editorial de fluência sem alterar o áudio ou o sentido.

Os silêncios e os tempos por palavra foram cruzados. Um corte inicialmente candidato próximo a 38 s foi descartado porque tocava o início de “quando”. A montagem final remove somente 15 intervalos de pausa, preservando todas as frases, telas e etapas.

## Evidência visual

O Watch local gerou 39 quadros da fonte, com cobertura uniforme de quase todo o intervalo. Essa evidência foi complementada por revisão em resolução nativa e, depois do render, por 84 quadros do master: amostragem uniforme, todas as captions, extremos e os dois lados de cada corte. Na segunda revisão, foram inspecionados também quadros nativos das pílulas, sublinhados, legenda longa e CTA. Nenhum vídeo foi enviado a Gemini ou outro serviço externo de análise.
