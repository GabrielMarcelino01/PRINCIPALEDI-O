---
name: audio
description: Pipeline de síntese e clonagem de voz com F5-TTS (e fallback compatível quando sem GPU/Hugging Face), preparação de áudio de referência, geração em PT-BR por cena, tratamento vocal, sidechain ducking com música/SFX e masterização EBU R128 para entrega de vídeos.
---

# Áudio & Clonagem de Voz (F5-TTS) para Produção de Vídeos

Guia completo e padronizado para geração, clonagem e pós-produção de voz com **[F5-TTS](https://github.com/SWivid/F5-TTS)** (`f5-tts >= 1.1.22`), integrado ao fluxo de vídeo do repositório (`skills/video-editing/SKILL.md`, `skills/captions/SKILL.md` e `skills/video-quality/SKILL.md`).

> **Script auxiliar já incluído:** `skills/audio-f5-tts/scripts/audio_pipeline.py` (com subcomandos `probe`, `prep-ref`, `master-voice` e `mix-master` usando FFmpeg/ffprobe).

---

## 1. Visão Geral do F5-TTS

- **F5-TTS** (*A Fairytaler that Fakes Fluent and Faithful Speech with Flow Matching*, [arXiv:2410.06885](https://arxiv.org/abs/2410.06885)): arquitetura **Diffusion Transformer (DiT)** com **ConvNeXt V2**, oferecendo treinamento e inferência rápidos e clonagem de voz *zero-shot* a partir de um áudio curto de referência.
- **E2 TTS**: implementação *Flat-UNet Transformer* baseada no artigo [arXiv:2406.18009](https://arxiv.org/abs/2406.18009).
- **Sway Sampling**: estratégia de amostragem em tempo de inferência (*Flow Matching*) controlada por `--sway_sampling_coef` (padrão `-1`), que melhora naturalidade e inteligibilidade.
- **Modelos oficiais (`SWivid/F5-TTS`)**:
  - `F5TTS_v1_Base` (recomendado a partir de 2025/03, 1.25M steps, vocoder `vocos`, treinado em chinês/inglês no Emilia 95K)
  - `F5TTS_Base` (v0, 1.2M steps, suporta vocoders `vocos` e `bigvgan`)
  - `E2TTS_Base` (1.2M steps)
- **Links oficiais**:
  - Repositório: <https://github.com/SWivid/F5-TTS>
  - Demos: <https://swivid.github.io/F5-TTS/> | [Atualizações v1](https://swivid.github.io/F5-TTS_updates)
  - Pesos: [Hugging Face (`SWivid/F5-TTS`)](https://huggingface.co/SWivid/F5-TTS) | [ModelScope](https://www.modelscope.cn/models/SWivid/F5-TTS_Emilia-ZH-EN) | [Wisemodel](https://wisemodel.cn/models/SJTU_X-LANCE/F5-TTS_Emilia-ZH-EN)
  - Espaços online: [Hugging Face Space](https://huggingface.co/spaces/mrfakename/E2-F5-TTS) | [ModelScope Studio](https://modelscope.cn/studios/AI-ModelScope/E2-F5-TTS)

---

## 2. Escolha do Motor por Ambiente (Regra Prática)

Antes de gerar locução para um vídeo, verifique onde o processo está rodando:

| Cenário | Motor recomendado | Observação |
| :--- | :--- | :--- |
| **Máquina local / Colab / Servidor com GPU (NVIDIA, AMD ROCm, Intel XPU, Apple Silicon) + acesso a `huggingface.co`** | **F5-TTS** (`f5-tts`) | Clonagem *zero-shot* com 3–12 s de referência. Para **PT-BR**, use checkpoint fine-tunado em português (Seção 5). |
| **Sandbox CPU-only ou rede sem acesso a `huggingface.co` (ex.: Arena Sandbox)** | **`add_voice` + `generate_speech`** (nativo) ou **`edge-tts`** (`skills/EDGE-TTS.md`, se online) | `f5-tts` exige PyTorch completo e download de checkpoints em `huggingface.co`. Use o fallback e aplique o mesmo pipeline de masterização da Seção 7. |

---

## 3. Instalação do F5-TTS

### 3.1 Ambiente Python e FFmpeg

Use **Python 3.10+** (recomendado **3.11**) e **FFmpeg** instalado no `PATH`:

```bash
# Com Conda
conda create -n f5-tts python=3.11 -y
conda activate f5-tts
conda install -c conda-forge ffmpeg -y

# Ou com venv padrão
python3.11 -m venv .venv-f5
source .venv-f5/bin/activate
```

### 3.2 Instalar PyTorch conforme o acelerador

**NVIDIA GPU (CUDA):**

```bash
# Exemplo CUDA 12.8 (PyTorch 2.8)
pip install torch==2.8.0+cu128 torchaudio==2.8.0+cu128 --extra-index-url https://download.pytorch.org/whl/cu128

# Alternativa CUDA 12.4
# pip install torch==2.4.0+cu124 torchaudio==2.4.0+cu124 --extra-index-url https://download.pytorch.org/whl/cu124
```

**AMD GPU (ROCm — Linux):**

```bash
pip install torch==2.9.1+rocm7.2 torchaudio==2.9.1+rocm7.2 --extra-index-url https://download.pytorch.org/whl/rocm7.2
# GPUs mais antigas (RDNA 1/2/3):
# pip install torch==2.5.1+rocm6.2 torchaudio==2.5.1+rocm6.2 --extra-index-url https://download.pytorch.org/whl/rocm6.2
```

> **Nota AMD:** GPUs **RDNA 3.5 e RDNA 4** (Radeon 8050S/8060S, RX 9060/9070) exigem **ROCm 7.x** (`gfx1151`/`gfx1201`). Usar ROCm 6.x causa `HIP error: invalid device function` ([issue #1236](https://github.com/SWivid/F5-TTS/issues/1236)).

**Intel GPU (XPU):**

```bash
pip install torch torchaudio --index-url https://download.pytorch.org/whl/test/xpu
# Ou via Intel Extension for PyTorch (IPEX)
```

**Apple Silicon (MPS) ou CPU:**

```bash
pip install torch torchaudio
```

### 3.3 Instalar o pacote `f5-tts`

```bash
# Opção 1: somente inferência (CLI, Gradio e Python API)
pip install f5-tts

# Opção 2: editável local (necessário para treino, fine-tuning e configs locais)
git clone https://github.com/SWivid/F5-TTS.git
cd F5-TTS
# git submodule update --init --recursive  # opcional: apenas se usar vocoder BigVGAN
pip install -e .
```

### 3.4 Docker e Docker Compose

```bash
# Build local a partir do Dockerfile oficial
docker build -t f5tts:v1 .

# Executar via GitHub Container Registry com cache persistente de modelos
docker container run --rm -it --gpus=all \
  --mount 'type=volume,source=f5-tts,target=/root/.cache/huggingface/hub/' \
  -p 7860:7860 ghcr.io/swivid/f5-tts:main

# Iniciar diretamente a interface web Gradio
docker container run --rm -it --gpus=all \
  --mount 'type=volume,source=f5-tts,target=/root/.cache/huggingface/hub/' \
  -p 7860:7860 ghcr.io/swivid/f5-tts:main \
  f5-tts_infer-gradio --host 0.0.0.0 --port 7860
```

<details>
<summary>Exemplo de docker-compose.yml para GPU NVIDIA</summary>

```yaml
services:
  f5-tts:
    image: ghcr.io/swivid/f5-tts:main
    ports:
      - "7860:7860"
    environment:
      GRADIO_SERVER_PORT: 7860
    entrypoint: ["f5-tts_infer-gradio", "--port", "7860", "--host", "0.0.0.0"]
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

volumes:
  f5-tts:
    driver: local
```

</details>

---

## 4. Regras de Ouro: Áudio de Referência e Roteiro PT-BR

A qualidade da voz clonada depende diretamente do preparo da referência e do texto antes da inferência:

### 4.1 Áudio de referência (`--ref_audio`)

- **Duração:** use entre **3 s e 11,4 s** (áudios acima de ~12 s são cortados automaticamente pelo F5-TTS).
- **Silêncio de segurança no final:** deixe **0,5 s a 1,0 s** de silêncio limpo ao término da frase de referência para evitar truncamento da última sílaba gerada.
- **Limpeza e formato:** áudio **mono, 24 kHz, WAV PCM 16-bit**, sem música de fundo, sem eco excessivo, sem ruído de vento/sala e sem clipping.
- **Transcrição exata (`--ref_text`):** sempre informe a transcrição literal do áudio de referência. Deixar `--ref_text ""` carrega um modelo ASR extra na memória e aumenta o risco de falhas de alinhamento.

Use o script do repositório para padronizar qualquer áudio ou vídeo em referência pronta:

```bash
python3 skills/audio-f5-tts/scripts/audio_pipeline.py prep-ref minha_voz_bruta.mp4 \
  --start 2.0 --max-duration 10.5 --tail-silence 0.6 \
  -o projects/meu-video/audio/ref_voz.wav
```

### 4.2 Normalização do texto (`--gen_text`) para PT-BR

1. **Números, moedas e símbolos por extenso:** escreva `"cem por cento"`, `"sessenta frames por segundo"`, `"noventa e sete reais"`, `"dois vírgula quatro milhões"` em vez de `"100%"`, `"60fps"`, `"R$ 97"`, `"2.4M"`.
2. **Siglas:** letras totalmente em maiúsculas (especialmente separadas por ponto como `"I.A."`) tendem a ser soletradas letra por letra; escreva palavras normais em capitalização comum (ex.: `"Arena Aí"` ou ajuste fonético conforme o modelo).
3. **Pontuação e pausas:** inclua vírgulas e pontos finais **sempre seguidos de espaço (`" "`)** para que o *chunker* divida corretamente e insira respirações naturais.
4. **Comprimento por chamada:** cada bloco individual do F5-TTS cobre até **~30 s totais** (`ref_audio + gen_text`). Para roteiros de vídeo (Reels, TikTok, VSL, Shorts), **gere uma faixa por cena** (Gancho, Agitação, Mecanismo, Prova, CTA) usando a mesma `seed` e o mesmo `ref_audio` — isso melhora o ritmo de edição, evita desvios de prosódia e facilita o corte exato na timeline.

---

## 5. Inferência (CLI, PT-BR, Python API, Multi-Voz e Gradio)

### 5.1 CLI oficial (`f5-tts_infer-cli`)

Equivale a `python src/f5_tts/infer/infer_cli.py`:

```bash
# Exemplo básico (inglês/chinês com modelo oficial v1)
f5-tts_infer-cli \
  --model F5TTS_v1_Base \
  --ref_audio "projects/meu-video/audio/ref_voz.wav" \
  --ref_text "Texto exatamente como falado no audio de referencia." \
  --gen_text "Texto que o modelo deve sintetizar com essa voz." \
  --output_dir "projects/meu-video/audio/raw" \
  --output_file "01_gancho.wav" \
  --remove_silence
```

**Flags principais suportadas (`src/f5_tts/infer/infer_cli.py`):**

| Flag | Curta | Descrição |
| :--- | :--- | :--- |
| `--model` | `-m` | Arquitetura base: `F5TTS_v1_Base`, `F5TTS_Base`, `F5TTS_Small`, `E2TTS_Base`, `E2TTS_Small` |
| `--model_cfg` | `-mc` | Caminho para `.yaml` customizado de arquitetura |
| `--ckpt_file` | `-p` | Caminho ou URI (`hf://...` / arquivo local `.safetensors` ou `.pt`) |
| `--vocab_file` | `-v` | Caminho para `vocab.txt` compatível com o checkpoint |
| `--ref_audio` | `-r` | Áudio de referência (3–12 s) |
| `--ref_text` | `-s` | Transcrição exata do áudio de referência |
| `--gen_text` | `-t` | Texto a sintetizar |
| `--gen_file` | `-f` | Arquivo `.txt` com o roteiro (ignora `--gen_text`) |
| `--output_dir` | `-o` | Diretório de saída |
| `--output_file` | `-w` | Nome do WAV de saída |
| `--remove_silence` | — | Remove silêncios longos gerados na saída |
| `--speed` | — | Fator de velocidade da fala (ex.: `1.0`, `1.08`) |
| `--nfe_step` | — | Passos de denoising (padrão `32`; `16–32` para velocidade vs detalhe) |
| `--cfg_strength` | — | Força de *classifier-free guidance* (padrão `2.0`) |
| `--sway_sampling_coef` | — | Coeficiente *Sway Sampling* (padrão `-1.0`) |
| `--cross_fade_duration` | — | Crossfade entre chunks em segundos (padrão `0.15`) |
| `--fix_duration` | — | Fixa duração total (`ref + gen`) em segundos |
| `--vocoder_name` | — | `vocos` (padrão) ou `bigvgan` (suportado em `F5TTS_Base`) |
| `--load_vocoder_from_local` | — | Carrega vocoder de `../checkpoints/vocos-mel-24khz` |
| `--config` | `-c` | Arquivo `.toml` de configuração |
| `--device` | — | Dispositivo explícito (`cuda`, `cuda:0`, `mps`, `cpu`) |

### 5.2 Português Brasileiro (PT-BR) — Checkpoint Especializado

O checkpoint oficial `SWivid/F5-TTS` (`F5TTS_v1_Base` / `F5TTS_Base`) foi treinado no dataset **Emilia (`zh` e `en`)**. Se você rodar texto em português diretamente nele sem ajuste, a pronúncia tende a soar com sotaque estrangeiro.

Para **Português do Brasil nativo**, use um checkpoint fine-tunado em PT-BR mantendo a arquitetura base `F5TTS_Base` e o mesmo `vocab.txt` do `SWivid/F5-TTS` (exemplo comunitário amplamente adotado: [`firstpixel/F5-TTS-pt-br`](https://huggingface.co/firstpixel/F5-TTS-pt-br), treinado sobre >200 h de fala PT-BR):

```bash
# Baixar checkpoint PT-BR e vocab.txt compatível (uma única vez)
mkdir -p models/f5-pt-br
curl -L -o models/f5-pt-br/model_last.safetensors \
  "https://huggingface.co/firstpixel/F5-TTS-pt-br/resolve/main/pt-br/model_last.safetensors"
curl -L -o models/f5-pt-br/vocab.txt \
  "https://huggingface.co/SWivid/F5-TTS/resolve/main/F5TTS_Base/vocab.txt"

# Inferência em PT-BR com voz clonada
f5-tts_infer-cli \
  --model F5TTS_Base \
  --ckpt_file models/f5-pt-br/model_last.safetensors \
  --vocab_file models/f5-pt-br/vocab.txt \
  --ref_audio projects/meu-video/audio/ref_voz.wav \
  --ref_text "Olá, tudo bem? Essa é a minha amostra de voz limpa em português." \
  --gen_text "Você já imaginou fazer esse modelo de vídeo de forma cem por cento gratuita?" \
  --output_dir projects/meu-video/audio/raw \
  --output_file 01_gancho.wav \
  --nfe_step 32 \
  --cfg_strength 2.0 \
  --remove_silence
```

> **Mais idiomas da comunidade:** consulte [SHARED.md](https://github.com/SWivid/F5-TTS/blob/main/src/f5_tts/infer/SHARED.md) (árabe, espanhol, francês, alemão, italiano, japonês, hindi, finlandês, letão, russo).

### 5.3 Python API — Geração em Lote por Cenas de Vídeo (`from f5_tts.api import F5TTS`)

Ideal para gerar todas as cenas de um criativo ou Reels mantendo **exatamente o mesmo timbre e `seed`**:

```python
from pathlib import Path
from f5_tts.api import F5TTS

# Para PT-BR: model="F5TTS_Base" com ckpt_file e vocab_file PT-BR.
# Para EN/ZH oficial: model="F5TTS_v1_Base", ckpt_file="", vocab_file="".
tts = F5TTS(
    model="F5TTS_Base",
    ckpt_file="models/f5-pt-br/model_last.safetensors",
    vocab_file="models/f5-pt-br/vocab.txt",
    use_ema=True,
)

ref_audio = "projects/meu-video/audio/ref_voz.wav"
ref_text = "Olá, tudo bem? Essa é a minha amostra de voz limpa em português."

cenas = [
    ("01_gancho", "Você já imaginou fazer esse modelo de vídeo de forma cem por cento gratuita?"),
    ("02_agitacao", "Sem nenhum tipo de esforço, de forma cem por cento automática."),
    ("03_mecanismo", "Eu utilizo o Arena A.I. Com Hyperframes e Antigraft, tudo ganha qualidade de cinema."),
    ("04_prova", "E eu decidi liberar todo o meu acervo, pronto para você plugar e rodar."),
    ("05_cta", "Clica no botão aqui embaixo e vem ver como funciona."),
]

out_dir = Path("projects/meu-video/audio/raw")
out_dir.mkdir(parents=True, exist_ok=True)

for nome, fala in cenas:
    tts.infer(
        ref_file=ref_audio,
        ref_text=ref_text,
        gen_text=fala,
        nfe_step=32,
        cfg_strength=2.0,
        sway_sampling_coef=-1.0,
        speed=1.0,
        remove_silence=True,
        seed=42,  # seed fixa preserva estabilidade tonal entre cenas
        file_wave=str(out_dir / f"{nome}.wav"),
    )
```

### 5.4 Multi-Voz / Diálogos com arquivo `.toml`

Crie um arquivo `cena_dialogo.toml` e use tags `[nome_da_voz]` dentro de `gen_file`:

```toml
model = "F5TTS_Base"
ckpt_file = "models/f5-pt-br/model_last.safetensors"
vocab_file = "models/f5-pt-br/vocab.txt"
ref_audio = "audio/ref_apresentador.wav"
ref_text = "Transcrição exata do apresentador."
gen_text = ""
gen_file = "roteiro_dialogo.txt"
remove_silence = true
output_dir = "projects/meu-video/audio/raw"
output_file = "dialogo_completo.wav"

[voices.convidado]
ref_audio = "audio/ref_convidado.wav"
ref_text = "Transcrição exata do convidado."
speed = 1.0
```

Conteúdo de `roteiro_dialogo.txt`:

```text
[main] Como você escala seus vídeos mantendo consistência?
[convidado] Tudo começa com uma referência limpa e pós-produção padronizada.
```

Execute:

```bash
f5-tts_infer-cli -c cena_dialogo.toml
```

### 5.5 Interface Web Gradio (`f5-tts_infer-gradio`)

Suporta TTS com divisão automática em blocos, multi-estilo/multi-falante, chat de voz (Qwen2.5-3B-Instruct) e modelos customizados:

```bash
f5-tts_infer-gradio --host 0.0.0.0 --port 7860
# Opcional: abrir navegador local automaticamente: --inbrowser
# Opcional: link compartilhável Gradio: --share
# Opcional: atrás de subpath reverso: --root_path "/f5tts"
```

---

## 6. Pós-Processamento, Mixagem e Qualidade para Vídeo

Nunca envie áudio bruto de TTS direto para o render do vídeo. Siga sempre estas **3 etapas obrigatórias** (compatíveis com F5-TTS, `generate_speech` e `edge-tts`):

### Etapa 1: Tratar cada stem de voz (`-16 LUFS`, 48 kHz stereo)

Compacta pausas mortas longas (preservando `0,16 s` de respiração natural), limpa subgraves (`highpass=80Hz`), ajusta ritmo sem alterar o timbre (`rubberband=tempo=...:pitch=1.0`), normaliza em `-16 LUFS` e já retorna os timestamps reais (`speech_segments`) para gerar/alinhar a legenda:

```bash
python3 skills/audio-f5-tts/scripts/audio_pipeline.py master-voice \
  projects/meu-video/audio/raw/01_gancho.wav \
  --tempo 1.15 --max-pause 0.22 \
  -o projects/meu-video/audio/tight/01_gancho.wav
```

### Etapa 2: Montar a timeline e gerar a legenda só **depois** da voz tratada

- Conforme `skills/captions/SKILL.md`, **nunca reutilize timestamps antigos** após remover silêncios ou alterar a velocidade da voz.
- Meça os segmentos falados finais dos WAVs tratados e valide o `.srt` contra o MP4 final:

```bash
python3 skills/captions/scripts/caption_qa.py projects/meu-video/captions.srt --video final.mp4 --strict
```

### Etapa 3: Mixar Voz + BGM/SFX com Ducking + EBU R128 (`-14 LUFS`, `<= -1.0 dBTP`)

O `mix-master` aplica compressor *sidechain* na trilha de fundo acionado pela voz, garante teto de true peak com `alimiter` e entrega dentro do padrão social de `skills/video-quality/SKILL.md`:

```bash
python3 skills/audio-f5-tts/scripts/audio_pipeline.py mix-master \
  --voice projects/meu-video/audio/voice_full.wav \
  --bgm projects/meu-video/audio/bgm_120bpm.wav \
  --bgm-volume 0.26 --duck-ratio 6.0 \
  --lufs -14.0 --true-peak -2.5 \
  -o projects/meu-video/audio/master_mix.wav
```

Ao muxar no MP4 final (`aac -b:a 192k -ar 48000`), valide com o gate estrito de qualidade:

```bash
python3 skills/video-quality/scripts/video_qa.py final.mp4 \
  --expected-width 1080 --expected-height 1920 --min-fps 30 \
  --target-loudness -14 --max-true-peak -1 \
  --contact-sheet final-contact.jpg --output final-qa.json --strict
```

---

## 7. Treinamento e Fine-Tuning

Consulte o [guia oficial de treinamento](https://github.com/SWivid/F5-TTS/tree/main/src/f5_tts/train) para detalhes avançados.

### 7.1 Preparar dataset customizado (CSV `audio_file|text`)

Prepare um CSV com cabeçalho obrigatório `audio_file|text` (caminhos de áudio absolutos, preferencialmente WAV 24 kHz entre 1 s e 30 s):

```bash
python src/f5_tts/train/datasets/prepare_csv_wavs.py /caminho/metadata.csv /caminho/dataset_preparado
```

Scripts prontos para datasets públicos também existem em `src/f5_tts/train/datasets/` (`prepare_emilia.py`, `prepare_wenetspeech4tts.py`, `prepare_libritts.py`, `prepare_ljspeech.py`).

### 7.2 Treino com Hugging Face Accelerate (CLI)

```bash
# 1. Configurar ambiente distribuído / precisão (salva em ~/.cache/huggingface/accelerate/default_config.yaml)
accelerate config

# 2. Lançar treino a partir dos configs em src/f5_tts/configs/
accelerate launch src/f5_tts/train/train.py --config-name F5TTS_v1_Base.yaml

# 3. Exemplo sobrescrevendo precisão e batch size por GPU
accelerate launch --mixed_precision=fp16 src/f5_tts/train/train.py \
  --config-name F5TTS_v1_Base.yaml ++datasets.batch_size_per_gpu=19200
```

Para fine-tuning direto via CLI sobre um checkpoint existente:

```bash
f5-tts_finetune-cli --help
```

### 7.3 Interface Gradio para Fine-Tuning

```bash
f5-tts_finetune-gradio
```

> **Dica crítica em checkpoints iniciais:** durante os primeiros passos de fine-tuning, o peso EMA (`use_ema=True`) ainda é dominado pelo modelo pré-treinado original. Teste `use_ema=False` no Gradio ou `F5TTS(..., use_ema=False)` para avaliar a voz adaptada mais cedo.

### 7.4 Logging (Weights & Biases)

Por padrão, o treino não envia logs se você não estiver autenticado no `wandb`. Para habilitar ou forçar modo offline:

```bash
# Modo online
wandb login
# ou: export WANDB_API_KEY="sua-chave"

# Modo offline (recomendado em ambientes isolados)
export WANDB_MODE=offline
```

---

## 8. Runtime (Triton + TensorRT-LLM) e Benchmark

Para implantação em produção de baixa latência com Triton Inference Server e TensorRT-LLM, siga as [instruções oficiais de runtime](https://github.com/SWivid/F5-TTS/tree/main/src/f5_tts/runtime/triton_trtllm).

**Resultados de referência oficiais** (GPU NVIDIA L20 única, 26 pares `prompt_audio` + `target_text`, `16` passos NFE):

| Modelo | Concorrência | Latência média | RTF | Modo |
| :--- | :---: | :---: | :---: | :--- |
| F5-TTS Base (Vocos) | 2 | 253 ms | 0,0394 | Cliente-Servidor (Triton/TRT-LLM) |
| F5-TTS Base (Vocos) | 1 (`batch_size`) | — | 0,0402 | TRT-LLM Offline |
| F5-TTS Base (Vocos) | 1 (`batch_size`) | — | 0,1467 | PyTorch Offline |

---

## 9. Desenvolvimento e Verificação Rápida

Para contribuições no repositório upstream do F5-TTS:

```bash
pip install pre-commit
pre-commit install
pre-commit run --all-files
```

*(Nota do upstream: alguns módulos de modelo mantêm exceção de lint `E722` para notação de tensores.)*

### Troubleshooting Rápido

| Sintoma | Causa provável | Correção |
| :--- | :--- | :--- |
| Áudio gerado sai mudo / vazio | FFmpeg ausente ou quebrado no `PATH` | Instalar `ffmpeg` (`conda install -c conda-forge ffmpeg` ou usar `tools/bin/ensure-video-env.sh`). |
| Última palavra da clonagem sai cortada | `ref_audio` cortado rente sem silêncio final | Rodar `prep-ref --tail-silence 0.6` e deixar pausa no fim da referência. |
| Pronúncia PT-BR com sotaque inglês/chinês | Uso do `F5TTS_v1_Base` puro (treinado em EN/ZH) | Usar checkpoint PT-BR (`firstpixel/F5-TTS-pt-br` com `--model F5TTS_Base` + `vocab.txt`). |
| Sotaque ou timbre muda entre cenas do vídeo | Mudança de `ref_audio` ou `seed` aleatória | Fixar `ref_audio`, `ref_text` e `seed` em todas as cenas do projeto. |
| True peak falha em `video_qa.py --strict` | Pico acima de `-1.0 dBTP` pós-encode AAC | Aplicar `loudnorm=I=-14:TP=-2.5` + `alimiter=limit=0.80:level=disabled` via `mix-master`. |
| `HIP error: invalid device function` (AMD) | GPU RDNA 3.5/4 rodando PyTorch ROCm 6.x | Atualizar para PyTorch `rocm7.2+`. |

---

## 10. Agradecimentos, Citação e Licenças

- **Agradecimentos do projeto F5-TTS:** [E2-TTS](https://arxiv.org/abs/2406.18009), datasets [Emilia](https://arxiv.org/abs/2407.05361), [WenetSpeech4TTS](https://arxiv.org/abs/2406.05763), [LibriTTS](https://arxiv.org/abs/1904.02882) e [LJSpeech](https://keithito.com/LJ-Speech-Dataset/), [lucidrains](https://github.com/lucidrains) e [bfs18](https://github.com/bfs18) pela base inicial de CFM, [SD3](https://arxiv.org/abs/2403.03206) e [Hugging Face diffusers](https://github.com/huggingface/diffusers), [torchdiffeq](https://github.com/rtqichen/torchdiffeq), vocoders [Vocos](https://huggingface.co/charactr/vocos-mel-24khz) e [BigVGAN](https://github.com/NVIDIA/BigVGAN), ferramentas de avaliação ([FunASR](https://github.com/modelscope/FunASR), [faster-whisper](https://github.com/SYSTRAN/faster-whisper), [UniSpeech](https://github.com/microsoft/UniSpeech), [SpeechMOS](https://github.com/tarepan/SpeechMOS), [ctc-forced-aligner](https://github.com/MahmoudAshraf97/ctc-forced-aligner)), [mrfakename](https://x.com/realmrfakename) pela demo no Hugging Face Space, [f5-tts-mlx](https://github.com/lucasnewman/f5-tts-mlx) (Lucas Newman), [F5-TTS-ONNX](https://github.com/DakeQQ/F5-TTS-ONNX) (DakeQQ) e Yuekai Zhang (suporte Triton/TensorRT-LLM).

```bibtex
@article{chen-etal-2024-f5tts,
      title={F5-TTS: A Fairytaler that Fakes Fluent and Faithful Speech with Flow Matching},
      author={Yushen Chen and Zhikang Niu and Ziyang Ma and Keqi Deng and Chunhui Wang and Jian Zhao and Kai Yu and Xie Chen},
      journal={arXiv preprint arXiv:2410.06885},
      year={2024},
}
```

> **Licença e uso comercial:** o código-fonte do `SWivid/F5-TTS` está sob licença **MIT**, porém os modelos pré-treinados oficiais treinados no dataset Emilia (e derivados que dependem dele) possuem licença **CC-BY-NC-4.0 (não comercial)**. Para campanhas comerciais pagas sem restrição NC, valide a licença do checkpoint utilizado ou utilize modelo próprio/licenciado comercialmente.
