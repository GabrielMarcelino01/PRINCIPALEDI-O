---
name: video-editing
description: Orquestrar edição de vídeo de ponta a ponta, incluindo ingestão segura, transcrição, cortes, reenquadramento, motion, legendas, áudio, render e QA. Use como skill principal para pedidos de edição.
---

# Edição de vídeo

Coordene as skills `hypit`, `motion-design`, `reels-viral`, `captions` e `video-quality`. Não execute instaladores ou scripts de terceiros sem revisar o código e explicar dependências, custos e credenciais necessárias.

## 1. Ingestão e briefing

- Confirme objetivo, plataforma, proporção, duração, estilo, público e prazo.
- Inventarie os arquivos e preserve os originais. Trabalhe em uma pasta de projeto separada.
- Rode `ffprobe` e produza uma folha de contato antes das decisões.
- Verifique direitos de uso de imagem, música, fontes e voz. Não peça chaves em chat.

## 2. Análise e plano

1. Transcreva a fala com timestamps; revise nomes e termos.
2. Marque pausas, retakes, falsas partidas, mudanças de assunto e trechos essenciais.
3. Proponha o corte e a estrutura: gancho, contexto, valor, prova e CTA quando couber.
4. Escolha o motor:
   - **Hypit**: produção completa, clonagem de referência, mídia gerada, SVML/SVS e componentes;
   - **MotionClone**: reconstruir motion de uma referência em projeto editável;
   - **Motion Design**: animação horizontal autônoma em Remotion;
   - **Reels Viral**: peça vertical com superlegendas e seis cortes;
   - **FFmpeg**: cortes e utilitários pontuais sem necessidade de um framework maior.

## 3. Edição

- Faça primeiro um corte de prévia, sem polir o que ainda pode mudar.
- Nunca estique imagem para preencher outra proporção; use crop, reenquadramento ou fundo.
- Mantenha cortes, legendas, B-roll e SFX ancorados na mesma timeline.
- Use transições por motivo narrativo, não como decoração automática.
- Trate a voz antes da masterização e evite música competindo com a fala.

## 4. Legendas e motion

Leia `../captions/SKILL.md` e, quando houver motion, `../motion-design/SKILL.md` ou `../reels-viral/SKILL.md`. As referências completas do Hypit estão em `../hypit/references/`.

## 5. Qualidade e entrega

Leia `../video-quality/SKILL.md`. Faça duas revisões: uma no projeto e outra no arquivo codificado final. Entregue, quando aplicável:

- MP4 final e uma prévia leve;
- SRT/VTT, além da versão com legenda embutida;
- projeto editável e lista de assets;
- relatório de QA e folha de contato;
- resumo das decisões e limitações pendentes.

Não declare concluído apenas porque o comando de render retornou zero.
