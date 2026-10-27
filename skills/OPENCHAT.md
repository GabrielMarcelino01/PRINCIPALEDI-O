CoTracker3: Rastreamento de pontos mais simples e eficiente por meio de pseudo-rotulagem de vídeos reais.
Meta AI Research, GenAI ; Universidade de Oxford, VGG

Nikita Karaev , Iurii Makarov , Jianyuan Wang , Ignacio Rocco , Benjamin Graham , Natalia Neverova , Andrea Vedaldi , Christian Rupprecht

Página do Projeto | Artigo 1 | Artigo 2 | Tópico X | BibTeX
Abrir no Colab Espaços


O CoTracker é um modelo rápido baseado em transformadores que consegue rastrear qualquer ponto em um vídeo. Ele traz para o rastreamento alguns dos benefícios do fluxo óptico.

O CoTracker pode rastrear:

Qualquer pixel em um vídeo
Um conjunto quase denso de pixels juntos
Os pontos podem ser selecionados manualmente ou amostrados em uma grade em qualquer quadro de vídeo.
Experimente você mesmo esses modos de rastreamento com nossa demonstração no Colab ou no Espaço Hugging Face 🤗 .

Atualizações:

[21 de janeiro de 2025] 📦 O conjunto de dados Kubric usado no CoTracker3 já está disponível! Este conjunto de dados contém 6.000 sequências de alta resolução (512×512px, 120 frames) com leve movimento de câmera, renderizadas usando o mecanismo Kubric. Confira no Hugging Face Dataset .

[15 de outubro de 2024] 📣 Estamos lançando o CoTracker3! Rastreamento de pontos de última geração com uma arquitetura leve, treinada com 1000 vezes menos dados do que os modelos de melhor desempenho anteriores. O código dos modelos de referência e o pipeline de pseudo-rotulagem estão disponíveis no repositório, assim como os checkpoints dos modelos. Confira nosso artigo para mais detalhes.

[25 de setembro de 2024] O CoTracker 2.1 já está disponível! Este modelo apresenta melhor desempenho nos benchmarks TAP-Vid e segue a arquitetura do CoTracker original. Experimente!

[14 de junho de 2024] Lançamos o código do VGGSfM , um modelo para recuperar poses de câmera e estrutura 3D a partir de qualquer sequência de imagens com base no rastreamento de pontos! O VGGSfM é o primeiro framework SfM totalmente diferenciável que oferece escalabilidade e supera os métodos SfM convencionais em benchmarks padrão.

[27 de dezembro de 2023] O CoTracker2 já está disponível! Agora ele consegue rastrear muito mais pontos simultaneamente (até 265*265 !) e possui uma implementação mais limpa e eficiente em termos de memória. Ele também suporta processamento online. Veja o artigo atualizado para mais detalhes. A versão antiga continua disponível aqui .

[5 de setembro de 2023] Agora você pode executar nossa demonstração do Gradio localmente .

Início rápido
A maneira mais fácil de usar o CoTracker é carregar um modelo pré-treinado de torch.hub:

Modo offline:
pip install imageio[ffmpeg], então:

import torch
# Download the video
url = 'https://github.com/facebookresearch/co-tracker/raw/refs/heads/main/assets/apple.mp4'

import imageio.v3 as iio
frames = iio.imread(url, plugin="FFMPEG")  # plugin="pyav"

device = 'cuda'
grid_size = 10
video = torch.tensor(frames).permute(0, 3, 1, 2)[None].float().to(device)  # B T C H W

# Run Offline CoTracker:
cotracker = torch.hub.load("facebookresearch/co-tracker", "cotracker3_offline").to(device)
pred_tracks, pred_visibility = cotracker(video, grid_size=grid_size) # B T N 2,  B T N 1
Modo online:
cotracker = torch.hub.load("facebookresearch/co-tracker", "cotracker3_online").to(device)

# Run Online CoTracker, the same model with a different API:
# Initialize online processing
cotracker(video_chunk=video, is_first_step=True, grid_size=grid_size)  

# Process the video
for ind in range(0, video.shape[1] - cotracker.step, cotracker.step):
    pred_tracks, pred_visibility = cotracker(
        video_chunk=video[:, ind : ind + cotracker.step * 2]
    )  # B T N 2,  B T N 1
O processamento online é mais eficiente em termos de memória e permite o processamento de vídeos mais longos. No entanto, no exemplo acima, a duração do vídeo é conhecida! Veja a demonstração online para um exemplo de rastreamento a partir de um fluxo online com duração de vídeo desconhecida.

Visualize as trajetórias previstas:
Após instalar o CoTracker, você poderá visualizar as trilhas com:

from cotracker.utils.visualizer import Visualizer

vis = Visualizer(save_dir="./saved_videos", pad_value=120, linewidth=3)
vis.visualize(video, pred_tracks, pred_visibility)
Oferecemos diversas outras maneiras de interagir com o CoTracker:

Demonstração interativa do Gradio:
Uma demonstração está disponível no facebook/cotrackerHugging Face Space 🤗 .
Você pode usar a demonstração do Gradio localmente executando o seguinte comando python -m gradio_demo.appapós instalar os pacotes necessários: pip install -r gradio_demo/requirements.txt.
Notebook Jupyter:
Você pode executar o notebook no Google Colab .
Ou explore o caderno localizado em notebooks/demo.ipynb.
Você pode instalar o CoTracker localmente e então:
Execute uma demonstração offline com 10 è 10 pontos amostrados em uma grade no primeiro quadro de um vídeo (os resultados serão salvos em ./saved_videos/demo.mp4):

python demo.py --grid_size 10
Faça uma demonstração online :

python online_demo.py
É altamente recomendável o uso de uma GPU para utilizar o CoTracker localmente.



Instruções de Instalação
Você pode usar um modelo pré-treinado via PyTorch Hub, conforme descrito acima, ou instalar o CoTracker a partir deste repositório do GitHub. Esta é a melhor maneira se você precisar executar nossa demonstração local ou avaliar/treinar o CoTracker.

Certifique-se de ter o PyTorch e o TorchVision instalados em seu sistema. Siga as instruções aqui para a instalação. Recomendamos fortemente a instalação do PyTorch e do TorchVision com suporte a CUDA, embora para tarefas pequenas o CoTracker possa ser executado na CPU.

Instale uma versão de desenvolvimento.
git clone https://github.com/facebookresearch/co-tracker
cd co-tracker
pip install -e .
pip install matplotlib flow_vis tqdm tensorboard
Você pode baixar manualmente todos os checkpoints do CoTracker3 (modelos de referência e escalonados, bem como arquiteturas de janela única e deslizante) a partir dos links abaixo e colocá-los na checkpointspasta da seguinte forma:

mkdir -p checkpoints
cd checkpoints
# download the online (multi window) model
wget https://huggingface.co/facebook/cotracker3/resolve/main/scaled_online.pth
# download the offline (single window) model
wget https://huggingface.co/facebook/cotracker3/resolve/main/scaled_offline.pth
cd ..
Você também pode baixar os checkpoints do CoTracker3 treinados apenas no Kubric:

# download the online (sliding window) model
wget https://huggingface.co/facebook/cotracker3/resolve/main/baseline_online.pth
# download the offline (single window) model
wget https://huggingface.co/facebook/cotracker3/resolve/main/baseline_offline.pth
Para consultar os antigos pontos de controle, veja esta seção .

Avaliação
Para reproduzir os resultados apresentados no artigo, faça o download dos seguintes conjuntos de dados:

TAP-Vid
Réplica Dinâmica
E instale as dependências necessárias:

pip install hydra-core==1.1.0 mediapy
Em seguida, execute o seguinte comando para avaliar o modelo online no TAP-Vid DAVIS:

python ./cotracker/evaluation/evaluate.py --config-name eval_tapvid_davis_first exp_dir=./eval_outputs dataset_root=your/tapvid/path
E o modelo offline:

python ./cotracker/evaluation/evaluate.py --config-name eval_tapvid_davis_first exp_dir=./eval_outputs dataset_root=/fsx-repligen/shared/datasets/tapvid offline_model=True window_len=60 checkpoint=./checkpoints/scaled_offline.pth
Realizamos avaliações conjuntas em todos os pontos de destino simultaneamente para uma inferência mais rápida. Com essas avaliações, os números são semelhantes aos apresentados no artigo. Se você quiser reproduzir os números exatos do artigo, adicione a flag single_point=True.

Estes são os números que você deve conseguir reproduzir usando o checkpoint lançado e a versão atual do código-fonte:

Cinética,
δ
média
vis
DAVIS,
δ
média
vis
RoboTAP,
δ
média
vis
RGB-S,
δ
média
vis
CoTracker2, 27.12.23	61,8	74,6	69,6	73,4
CoTracker2.1, 25.09.24	63	76,1	70,6	79,6
CoTracker3 offline, 15.10.24	67,8	76,9	78,0	85,0
CoTracker3 online, 15.10.24	68,3	76,7	78,8	82,7
Treinamento
Linha de base
Para treinar o CoTracker conforme descrito em nosso artigo, você primeiro precisa gerar anotações para o conjunto de dados Google Kubric MOVI-f. As instruções para geração de anotações podem ser encontradas aqui . Você também pode encontrar uma discussão sobre a geração do conjunto de dados nesta edição .

Após obter o conjunto de dados anotado, certifique-se de ter seguido os passos para a configuração da avaliação e instalar as dependências de treinamento:

pip install pip==24.0
pip install pytorch_lightning==1.6.0 tensorboard opencv-python
Agora você pode iniciar o treinamento no Kubric. Nosso modelo foi treinado por 50.000 iterações em 32 GPUs (4 nós com 8 GPUs). Modifique os parâmetros `dataset_root` e `ckpt_path` de acordo com a sua necessidade antes de executar este comando. Para treinamento em 4 nós, adicione --num_nodes 4`.`

Aqui está um exemplo de como iniciar o treinamento do modelo online no Kubric:

 python train_on_kubric.py --batch_size 1 --num_steps 50000 \
 --ckpt_path ./ --model_name cotracker_three --save_freq 200 --sequence_len 64 \
  --eval_datasets tapvid_davis_first tapvid_stacking --traj_per_sample 384 \
  --sliding_window_len 16 --train_datasets kubric --save_every_n_epoch 5 \
  --evaluate_every_n_epoch 5 --model_stride 4 --dataset_root ${path_to_your_dataset} \
   --num_nodes 4 --num_virtual_tracks 64 --mixed_precision --corr_radius 3 \ 
   --wdecay 0.0005 --linear_layer_for_vis_conf --validate_at_start --add_huber_loss
Treinando o modelo offline no Kubric:

python train_on_kubric.py --batch_size 1 --num_steps 50000 \
 --ckpt_path ./ --model_name cotracker_three --save_freq 200 --sequence_len 60 \
 --eval_datasets tapvid_davis_first tapvid_stacking --traj_per_sample 512 \
 --sliding_window_len 60 --train_datasets kubric --save_every_n_epoch 5 \
 --evaluate_every_n_epoch 5 --model_stride 4 --dataset_root ${path_to_your_dataset} \
 --num_nodes 4 --num_virtual_tracks 64 --mixed_precision --offline_model \
 --random_frame_rate --query_sampling_method random --corr_radius 3 \
 --wdecay 0.0005 --random_seq_len --linear_layer_for_vis_conf \
 --validate_at_start --add_huber_loss
Ajuste fino com pseudo-rótulos
Para iniciar o treinamento com pseudo-rótulos, você precisa coletar seu próprio conjunto de dados de vídeos reais. Há uma classe de exemplo disponível cotracker/datasets/real_dataset.pycom filtragem baseada em palavras-chave que usamos para o treinamento. Sua classe deve implementar o carregamento de um vídeo e armazená-lo na CoTrackerDataclasse como um campo, enquanto os pseudo-rótulos serão gerados em train_on_real_data.py.

Você deve ter um modelo já treinado com Kubric para realizar o ajuste fino com pseudo-rótulos. Aqui está um exemplo de como você pode iniciar o ajuste fino do modelo online:

python ./train_on_real_data.py --batch_size 1 --num_steps 15000 \
 --ckpt_path ./ --model_name cotracker_three --save_freq 200 --sequence_len 64 \
 --eval_datasets tapvid_stacking tapvid_davis_first --traj_per_sample 384 \
 --save_every_n_epoch 15 --evaluate_every_n_epoch 15 --model_stride 4 \
 --dataset_root ${path_to_your_dataset} --num_nodes 4 --real_data_splits 0 \
 --num_virtual_tracks 64 --mixed_precision --random_frame_rate \
 --restore_ckpt ./checkpoints/baseline_online.pth \
 --lr 0.00005 --real_data_filter_sift --validate_at_start \
 --sliding_window_len 16 --limit_samples 15000
E o modelo offline:

python train_on_real_data.py --batch_size 1 --num_steps 15000 \
 --ckpt_path ./ --model_name cotracker_three --save_freq 200 --sequence_len 80 \
 --eval_datasets tapvid_stacking tapvid_davis_first --traj_per_sample 384 --save_every_n_epoch 15 \
 --evaluate_every_n_epoch 15 --model_stride 4 --dataset_root ${path_to_your_dataset} \
  --num_nodes 4 --real_data_splits 0 --num_virtual_tracks 64 --mixed_precision \
  --random_frame_rate --restore_ckpt ./checkpoints/baseline_offline.pth --lr 0.00005 \
  --real_data_filter_sift --validate_at_start --offline_model --limit_samples 15000
Desenvolvimento
Construindo a documentação
Para gerar a documentação do CoTracker, primeiro instale as dependências:

pip install sphinx
pip install sphinxcontrib-bibtex
Em seguida, você pode usar este comando para gerar a documentação na docs/_build/htmlpasta:

make -C docs html
Versões anteriores
CoTracker v2
Você pode usar o CoTracker v2 com o torch.hub tanto no modo offline quanto no online.

Modo offline:
pip install imageio[ffmpeg], então:

import torch
# Download the video
url = 'https://github.com/facebookresearch/co-tracker/blob/main/assets/apple.mp4'

import imageio.v3 as iio
frames = iio.imread(url, plugin="FFMPEG")  # plugin="pyav"

device = 'cuda'
grid_size = 10
video = torch.tensor(frames).permute(0, 3, 1, 2)[None].float().to(device)  # B T C H W

# Run Offline CoTracker:
cotracker = torch.hub.load("facebookresearch/co-tracker", "cotracker2").to(device)
pred_tracks, pred_visibility = cotracker(video, grid_size=grid_size) # B T N 2,  B T N 1
Modo online:
cotracker = torch.hub.load("facebookresearch/co-tracker", "cotracker2_online").to(device)

# Run Online CoTracker, the same model with a different API:
# Initialize online processing
cotracker(video_chunk=video, is_first_step=True, grid_size=grid_size)  

# Process the video
for ind in range(0, video.shape[1] - cotracker.step, cotracker.step):
    pred_tracks, pred_visibility = cotracker(
        video_chunk=video[:, ind : ind + cotracker.step * 2]
    )  # B T N 2,  B T N 1
O checkpoint para a versão 2 pode ser baixado com o seguinte comando:

wget https://huggingface.co/facebook/cotracker/resolve/main/cotracker2.pth
CoTracker v1
Está disponível diretamente através do hub do PyTorch:

import torch
import einops
import timm
import tqdm

cotracker = torch.hub.load("facebookresearch/co-tracker:v1.0", "cotracker_w8")
A versão antiga do código está disponível aqui . Você também pode baixar os respectivos checkpoints:

wget https://dl.fbaipublicfiles.com/cotracker/cotracker_stride_4_wind_8.pth
wget https://dl.fbaipublicfiles.com/cotracker/cotracker_stride_4_wind_12.pth
wget https://dl.fbaipublicfiles.com/cotracker/cotracker_stride_8_wind_16.pth
Licença
A maior parte do CoTracker está licenciada sob CC-BY-NC, porém partes do projeto estão disponíveis sob termos de licença separados: Particle Video Revisited está licenciado sob a licença MIT, TAP-Vid e LocoTrack estão licenciados sob a licença Apache 2.0.

Agradecimentos
Gostaríamos de agradecer ao PIPs , TAP-Vid e LocoTrack por disponibilizarem publicamente seu código e dados. Também agradecemos a Luke Melas-Kyriazi pela revisão do artigo, a Jianyuan Wang , Roman Shapovalov e Adam W. Harley pelas discussões esclarecedoras.

Citando CoTracker
Se você achar nosso repositório útil, considere dar uma estrela ⭐ e citar nossos artigos de pesquisa em seu trabalho:

@inproceedings{karaev23cotracker,
  title     = {CoTracker: It is Better to Track Together},
  author    = {Nikita Karaev and Ignacio Rocco and Benjamin Graham and Natalia Neverova and Andrea Vedaldi and Christian Rupprecht},
  booktitle = {Proc. {ECCV}},
  year      = {2024}
}
@inproceedings{karaev24cotracker3,
  title     = {CoTracker3: Simpler and Better Point Tracking by Pseudo-Labelling Real Videos},
  author    = {Nikita Karaev and Iurii Makarov and Jianyuan Wang and Natalia Neverova and Andrea Vedaldi and Christian Rupprecht},
  booktitle = {Proc. {arXiv:2410.11831}},
  year      = {2024}
}
