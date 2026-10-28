# SPEC — Truque dos Mil Looks

GOAL: fazer a espectadora entender que o app cria possibilidades com o que ela já tem e conduzir ao clique.
OUTPUT: HyperFrames, 1080×1920, 60 fps, H.264/AAC, SDR.
TIME: 87 s × 60 = 5220 quadros; trilha original a 100 BPM; locução termina em 85.00 s.
LOOK: plum #250D18, cream #F6F0E8, coral #F26E64, sage #D9E8DF; fotografia editorial e UI real;
      EBGaramond 700 para display, Inter variável para leitura; grain estático a 5%;
      sombra de telefone 30 px/70 px/24%; light sweep de 1,05 s somente em mudanças de mundo.
OBJECTS: duas modelos fornecidas, três artes reais do app, recortes reais das telas, telefone,
         tipografia da marca, captions e CTA. Nenhum dashboard, botão ou tela de outro produto.
MOTION: câmera 1,00→1,16 por shot; entradas por clip-path de 0,52 s; rises de 0,46 s;
        rolagem de UI linear; um hero move por shot; captions estáveis após 0,18 s.
SHOTS: ver STORYBOARD.md; tempos derivados de build/timeline.json, nunca estimados no HTML.
BANNED: void preto com elementos pequenos; glow/neon; gradiente roxo; três cards genéricos;
        dashboard fictício; lip-sync de foto; logo no canto; texto abaixo de 28 px;
        movimento infinito; Math.random; timers; rede; CSS keyframes; alegação de download grátis.
QA: frame 0; cada corte; 40,8 s; 45,7 s; 49,5 s; 56,5 s; 66,5 s; 72,8 s; 82,5 s; 86,5 s;
    captions a 360 px; rolagem sem texto cortado; CTA estável; loudness e silêncio medidos.
