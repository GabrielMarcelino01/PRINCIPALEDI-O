# Uso da skill Watch neste repositório

A skill upstream `/watch` é um **auxiliar de evidência audiovisual**, não um substituto para revisão humana, playback em tempo real ou o QA dos masters.

## Política local

- Use `--engine local` por padrão. Não ative Gemini nem envie vídeo/áudio para Google, Groq ou OpenAI sem autorização explícita do usuário e um caminho de rede compatível.
- Não configure nem armazene chaves de API neste repositório.
- Use `--no-whisper` quando a transcrição local revisada já existir. Não instale o WhisperX automaticamente; o modelo e as dependências são grandes.
- O modo local gera quadros e transcrição. Ele não concede visão contínua nem escuta humana.
- O modo Gemini, se um dia for autorizado, produz uma resposta de outro modelo; essa resposta deve ser identificada como evidência externa, não como se o agente tivesse assistido ao vídeo.

## Limite observado no teste real

Em 2026-11-03, o modo `balanced` aplicado a `entregas/CRIATIVO-2-EDITADO.mp4` selecionou 10 quadros por mudança de cena. O último quadro selecionado foi em aproximadamente 38 s de um vídeo de 44,33 s, deixando o CTA final fora da amostra.

Portanto, **nunca use somente a seleção de cenas para aprovar um criativo**. Acresce pelo menos:

1. amostragem uniforme ou timestamps explícitos;
2. um quadro de cada bloco de superlegenda;
3. primeiro e último quadro;
4. quadros imediatamente antes e depois dos cortes;
5. revisão das telas de aplicativo e dos textos pequenos em resolução adequada;
6. QA de áudio, duração, loudness e decodificação do MP4 final.

Exemplo de extração local complementar:

```bash
python3 skills/watch/scripts/watch.py video.mp4 \
  --engine local --fps 1 --max-frames 60 --resolution 720 \
  --no-whisper --out-dir /tmp/watch-review
```

Para um cue específico, como o CTA:

```bash
python3 skills/watch/scripts/watch.py video.mp4 \
  --engine local --detail transcript --timestamps 43.9 \
  --resolution 720 --no-whisper --out-dir /tmp/watch-cta
```

Leia todos os quadros listados no relatório e registre as lacunas de evidência.

## Verificação da instalação

- Upstream: `bradautomates/claude-video`, versão 0.3.2.
- Código upstream preservado sem alterações.
- Suíte com FFmpeg atual: **249 testes aprovados**.
- Um FFmpeg de 2018 é incompatível com `scale=force_divisible_by`; use uma versão atual.
