F5-TTS: Um contador de histórias que simula uma fala fluente e autêntica com correspondência de fluxo.
Python arXiv demonstração espaço de hf espaço ms laboratório laboratório laboratório

F5-TTS : Diffusion Transformer com ConvNeXt V2, treinamento e inferência mais rápidos.

E2 TTS : Transformador Flat-UNet, reprodução mais fiel do documento original .

Amostragem por oscilação : estratégia de amostragem de fluxo em tempo de inferência que melhora significativamente o desempenho.

Agradecemos a todos os colaboradores!
Notícias
12/03/2025 : 🔥 Modelo base F5-TTS v1 com melhor desempenho de treinamento e inferência. Algumas demonstrações .
2024/10/08 : Modelos base F5-TTS e E2 TTS em 🤗 Hugging Face , 🤖 Model Scope , 🟣 Wisemodel .
Instalação
Crie um ambiente separado, se necessário.
# Create a conda env with python_version>=3.10  (you could also use virtualenv)
conda create -n f5-tts python=3.11
conda activate f5-tts

# Install FFmpeg if you haven't yet
conda install ffmpeg
Instale o PyTorch com um dispositivo compatível.
GPU NVIDIA
GPU AMD
GPU Intel
Apple Silicon
Em seguida, você pode escolher uma das opções abaixo:
1. Como um pacote pip (mesmo que seja apenas para inferência)
pip install f5-tts
2. Editável localmente (caso também seja necessário treinamento e ajuste fino)
git clone https://github.com/SWivid/F5-TTS.git
cd F5-TTS
# git submodule update --init --recursive  # (optional, if use bigvgan as vocoder)
pip install -e .
O uso do Docker também está disponível.
# Build from Dockerfile
docker build -t f5tts:v1 .

# Run from GitHub Container Registry
docker container run --rm -it --gpus=all --mount 'type=volume,source=f5-tts,target=/root/.cache/huggingface/hub/' -p 7860:7860 ghcr.io/swivid/f5-tts:main

# Quickstart if you want to just run the web interface (not CLI)
docker container run --rm -it --gpus=all --mount 'type=volume,source=f5-tts,target=/root/.cache/huggingface/hub/' -p 7860:7860 ghcr.io/swivid/f5-tts:main f5-tts_infer-gradio --host 0.0.0.0
Tempo de execução
Solução de implantação com Triton e TensorRT-LLM.

Resultados de referência
Decodificação em uma única GPU L20, usando 26 pares diferentes de prompt_audio e target_text, 16 NFE.

Modelo	Concorrência	Latência média	RTF	Modo
Base F5-TTS (Vocos)	2	253 ms	0,0394	Cliente-Servidor
Base F5-TTS (Vocos)	1 (Tamanho do lote)	-	0,0402	TRT-LLM offline
Base F5-TTS (Vocos)	1 (Tamanho do lote)	-	0,1467	PyTorch offline
Consulte as instruções detalhadas para obter mais informações.

Inferência
Para obter o desempenho desejado, reserve um momento para ler as orientações detalhadas .
Ao pesquisar corretamente as palavras-chave do problema encontrado, as soluções são muito úteis.
1. Aplicativo Gradio
Funcionalidades atualmente suportadas:

TTS básico com inferência de blocos
Geração Multiestilo/Multi-Alto-falante
Bate-papo por voz com tecnologia Qwen2.5-3B-Instruct
Inferência personalizada com suporte a mais idiomas
# Launch a Gradio app (web interface)
f5-tts_infer-gradio

# Specify the port/host
f5-tts_infer-gradio --port 7860 --host 0.0.0.0

# Launch a share link
f5-tts_infer-gradio --share
Exemplo de arquivo docker-compose para dispositivo NVIDIA
2. Inferência de CLI
# Run with flags
# Leave --ref_text "" will have ASR model transcribe (extra GPU memory usage)
f5-tts_infer-cli --model F5TTS_v1_Base \
--ref_audio "provide_prompt_wav_path_here.wav" \
--ref_text "The content, subtitle or transcription of reference audio." \
--gen_text "Some text you want TTS model generate for you."

# Run with default setting. src/f5_tts/infer/examples/basic/basic.toml
f5-tts_infer-cli
# Or with your own .toml file
f5-tts_infer-cli -c custom.toml

# Multi voice. See src/f5_tts/infer/README.md
f5-tts_infer-cli -c src/f5_tts/infer/examples/multi/story.toml
Treinamento
1. Com o rosto abraçando, acelere
Consulte as orientações de treinamento e ajustes para obter as melhores práticas.

2. Com o aplicativo Gradio
# Quick start with Gradio web interface
f5-tts_finetune-gradio
Leia as orientações de treinamento e ajustes para obter mais instruções.

Avaliação
Desenvolvimento
Use o pre-commit para garantir a qualidade do código (executará linters e formatadores automaticamente):

pip install pre-commit
pre-commit install
Ao criar uma solicitação de pull request, antes de cada commit, execute:

pre-commit run --all-files
Nota: Alguns componentes do modelo possuem exceções de linting para E722 para acomodar a notação de tensores.

Agradecimentos
E2-TTS, trabalho brilhante, simples e eficaz.
Emilia , WenetSpeech4TTS , LibriTTS , LJSpeech são conjuntos de dados valiosos.
Estrutura inicial do CFM do LuciDRAIN , incluindo também o BFS18 para discussão.
Estrutura de código DiT e MMDiT para difusores SD3 e Hugging Face
torchdiffeq como solucionador de EDO, Vocos e BigVGAN como vocoder.
FunASR , faster-whisper , UniSpeech , SpeechMOS para ferramentas de avaliação
ctc-forced-aligner para teste de edição de fala
mrfakename embraceface demonstração espacial ~
Implementação do f5-tts-mlx com o framework MLX por Lucas Newman
F5-TTS-ONNX Versão ONNX Runtime por DakeQQ
Suporte para Triton e TensorRT-LLM de Yuekai Zhang ~
Citação
Se nosso trabalho e código-fonte forem úteis para você, por favor, cite-os da seguinte forma:

@article{chen-etal-2024-f5tts,
      title={F5-TTS: A Fairytaler that Fakes Fluent and Faithful Speech with Flow Matching}, 
      author={Yushen Chen and Zhikang Niu and Ziyang Ma and Keqi Deng and Chunhui Wang and Jian Zhao and Kai Yu and Xie Chen},
      journal={arXiv preprint arXiv:2410.06885},
      year={2024},
}
Licença
Nosso código é distribuído sob a licença MIT. Os modelos pré-treinados são licenciados sob a licença CC-BY-NC devido aos dados de treinamento, Emilia, que são dados obtidos em situações reais. Pedimos desculpas por qualquer inconveniente que isso possa causar.
