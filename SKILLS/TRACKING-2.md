Rastreamento de qualquer ponto (TAP)
[ TAP-Vid] [ TAPIR] [ RoboTAP] [ Blog Post] [ BootsTAP] [ TAPVid-3D] [ ] TAPNext[ TRAJAN] [ TAPNext++]

 tapir.mp4 
Bem-vindo ao repositório oficial do Google DeepMind para o Tracking Any Point (TAP), onde você encontra os conjuntos de dados TAP-Vid e TAPVid-3D, nosso modelo TAPIR de melhor desempenho e nossa extensão RoboTAP.

O TAP-Vid é um modelo de referência para executar essa tarefa, com uma coleção de pontos de referência para vídeos reais e sintéticos.
O TAPIR é um algoritmo de dois estágios que emprega duas etapas: (1) uma etapa de correspondência, que localiza independentemente um ponto candidato adequado para o ponto de consulta em cada segundo quadro, e (2) uma etapa de refinamento, que atualiza tanto a trajetória quanto as características da consulta com base em correlações locais. O modelo resultante é rápido e supera todos os métodos anteriores por uma margem significativa no benchmark TAP-Vid.
O RoboTAP é um sistema que utiliza o rastreamento de pontos do sensor TAPIR para executar tarefas de manipulação robótica por meio de imitação eficiente no mundo real. Ele também inclui um conjunto de dados com pontos de referência anotados em vídeos reais de manipulação robótica.
O BootsTAP (ou Treinamento com Bootstrap para TAP) utiliza um grande conjunto de dados de vídeos reais não rotulados para melhorar a precisão do rastreamento. Especificamente, o modelo é treinado para fornecer previsões consistentes em diferentes transformações espaciais e corrupções do vídeo, bem como em diferentes escolhas de pontos de consulta. Aplicamos esse método ao TAPIR para criar o BootsTAPIR, que é arquiteturalmente semelhante ao TAPIR, mas apresenta desempenho substancialmente superior no TAP-Vid.
TAPVid-3D é um benchmark e um conjunto de métricas para modelos que executam a tarefa de rastreamento de pontos em 3D. O benchmark contém mais de 1 milhão de trajetórias reais calculadas em mais de 4.000 vídeos do mundo real.
O TAPNext é o nosso rastreador mais recente, mais capaz, mais rápido e mais simples. Ele formula o problema TAP como uma previsão do próximo token e rastreia pontos simplesmente propagando informações por meio de uma rede. Observe que nosso melhor checkpoint do TAPNext foi otimizado usando o procedimento BootsTAP.
TRAJAN é o nosso primeiro Autoencoder de Trajetória de Pontos (TRAJAN). O TRAJAN condiciona-se a um conjunto de trajetórias de pontos de suporte e reconstrói as trajetórias de um conjunto reservado de pontos de consulta. O espaço de incorporação aprendido pelo TRAJAN pode ser usado para comparar distribuições de vídeos, comparar trajetórias de movimento em diferentes vídeos independentemente da aparência dos objetos e avaliar o realismo e a consistência dos vídeos gerados por modelos generativos de vídeo.
O TAPNext++ é um checkpoint TAPNext aprimorado que oferece desempenho de rastreamento estável 40 vezes maior, permite o rastreamento através de oclusões e apresenta fortes capacidades de redetecção. Ele foi otimizado em sequências sintéticas de 1024 frames com diversas estratégias de treinamento inovadoras.
Este repositório contém o seguinte:

Demonstrações do TAPNext / TAPNext++ / TAPIR / BootsTAPIR para demonstração online no Colab e demonstração offline em tempo real, disponíveis clonando este repositório.
Demonstração TRAJAN para demonstração colaborativa online
TAP-Vid Benchmark para conjunto de dados de avaliação e métricas de avaliação
Teste de desempenho RoboTAP para conjunto de dados de avaliação e código de agrupamento baseado em trajetórias de pontos.
TAPVid-3D Benchmark para as métricas de avaliação e código de avaliação de exemplo para o benchmark TAPVid-3D.
Pontos de verificação para os pesos dos modelos pré-treinados TAP-Net (a linha de base apresentada no artigo TAP-Vid), TAPIR e BootsTAPIR em Jax e PyTorch.
Instruções para treinamento da TAP-Net (a linha de base apresentada no artigo TAP-Vid) e da TAPIR no Kubric.
Demonstrações
A maneira mais simples de executar o TAPNext / TAPNext++ / TAPIR / BootsTAPIR é usar nossas demonstrações online no Colab. Você também pode clonar este repositório e executar em seu próprio hardware, incluindo uma demonstração em tempo real.

Demonstração do Colab
Você pode executar demonstrações no Colab para ver como o TAPIR funciona. Você também pode enviar seu próprio vídeo e testar o rastreamento de pontos com o TAPIR. Oferecemos algumas demonstrações no Colab:

TAPNext++ TAPNext++ : Este é um checkpoint BootsTAPNext otimizado, capaz de rastreamento de longo prazo, rastreamento de oclusão e re-detecção. Foi otimizado no PointOdyssey e no Kubric-1024.
BootsTAPNext BootsTAPNext : Este é o modelo TAPNext mais poderoso que funciona online (por quadro). Este é o modelo BootsTAPNext relatado no artigo.
BootsTAPNext PyTorch BootsTAPNext PyTorch : Este é o modelo TAPNext mais poderoso reimplementado em PyTorch, contendo a mesma arquitetura e pesos do modelo Jax.
TAPIR offline TAPIR padrão : Este é o modelo TAPIR/BootsTAPIR mais poderoso, capaz de processar um vídeo inteiro de uma só vez. Apresentamos principalmente os resultados deste modelo no artigo.
TAPIR online TAPIR online : Este é o modelo TAPIR causal sequencial / BootsTAPIR que permite o rastreamento online de pontos, podendo ser executado em tempo real em uma plataforma de GPU.
Visualização do Arco-Íris da TAPIR Visualização Arco-Íris : Esta visualização é usada em muitos dos nossos vídeos promocionais: ela realiza a segmentação automática de primeiro plano/plano de fundo e corrige os trajetos de acordo com o movimento da câmera, permitindo visualizar os caminhos que os objetos percorrem no espaço real.
PyTorch TAPIR offline TAPIR padrão do PyTorch : Este é o modelo TAPIR/BootsTAPIR reimplementado em PyTorch, que contém a mesma arquitetura e pesos do modelo Jax.
PyTorch TAPIR online TAPIR online em PyTorch : Este é o modelo BootsTAPIR causal sequencial reimplementado em PyTorch, que contém a mesma arquitetura e pesos do modelo Jax.
TRAJÃO TRAJAN : Este é o autoencoder de trajetória de pontos para reconstruir o movimento de trajetórias de pontos armazenadas previamente, condicionadas a um conjunto de trajetórias de pontos de entrada.
Agrupamento de pontos RoboTAP : Esta é uma demonstração do algoritmo de segmentação usado no RoboTAP.
Kubric Kubric para TAPVid(3D) : Esta visualização ilustra como gerar trajetórias de pontos de referência em 2D e 3D com sistema de coordenadas mundial usando o conjunto de dados Kubric.
Demonstração ao vivo
Clone o repositório:

git clone https://github.com/deepmind/tapnet.git
Acesse o diretório do projeto:

cd tapnet
Instale o tapnetpacote Python (e seus requisitos para executar a inferência):

pip install .
Baixe o checkpoint

mkdir checkpoints
wget -P checkpoints https://storage.googleapis.com/dm-tapnet/causal_tapir_checkpoint.npy
Adicione o caminho atual (diretório pai de onde o TapNet está instalado) a PYTHONPATH:

export PYTHONPATH=`(cd ../ && pwd)`:`pwd`:$PYTHONPATH
Se você deseja usar CUDA, certifique-se de instalar os drivers e uma versão do JAX compatível com suas versões de CUDA e CUDNN. Consulte o manual do JAX para instalar a versão correta do JAX com CUDA.

Em seguida, você pode executar um modelo TAPIR causal pré-treinado em uma câmera ao vivo e selecionar os pontos a serem rastreados:

cd ..
python3 ./tapnet/live_demo.py \
Em nossos testes, alcançamos cerca de 17 fps em imagens de 480x480 em uma Quadro RTX 4000 (uma GPU móvel de 2018).

Indicadores de desempenho
Este repositório hospeda três benchmarks distintos, porém relacionados: TAP-Vid, sua extensão posterior RoboTAP e TAPVid-3D.

TAP-Vid
 tap-vid.mp4 
O TAP-Vid é um conjunto de dados de vídeos com trajetórias de pontos, anotadas manualmente ou obtidas por meio de um simulador. O objetivo é avaliar o rastreamento de qualquer ponto rastreável em qualquer superfície física sólida. Os algoritmos recebem um único ponto de consulta em um determinado quadro e devem produzir o restante da trajetória, ou seja, incluindo para onde esse ponto se moveu (se visível) e se ele está visível, em todos os outros quadros. Isso requer precisão em nível de ponto (diferentemente de trabalhos anteriores sobre rastreamento de caixas e segmentos), potencialmente em superfícies deformáveis ​​(diferentemente da estrutura a partir do movimento), a longo prazo (diferentemente do fluxo óptico) e em potencialmente qualquer objeto (ou seja, independente da classe, ao contrário do rastreamento de pontos-chave específico de classe em humanos).

Mais detalhes sobre como baixar, usar e avaliar o benchmark TAP-Vid podem ser encontrados no arquivo README correspondente .

RoboTAP
RoboTAP é um trabalho subsequente ao TAP-Vid e ao TAPIR que demonstra a importância dos modelos de rastreamento de pontos para a robótica.

O conjunto de dados RoboTAP segue o mesmo formato de anotação do TAP-Vid, mas é disponibilizado como um complemento a ele. Em termos de domínio, o conjunto de dados RoboTAP é bastante similar ao TAP-Vid-RGB-Stacking, com a principal diferença de que todos os vídeos de robótica são reais e anotados manualmente. As fontes de vídeo e as categorias de objetos também são mais diversificadas. O conjunto de dados de referência inclui 265 vídeos, servindo apenas para fins de avaliação. Mais detalhes podem ser encontrados no arquivo README do TAP-Vid . Também disponibilizamos uma demonstração em notebook Colab do algoritmo de segmentação utilizado neste artigo.

TAPVid-3D
TAPVid-3D é um conjunto de dados e um benchmark para avaliar a tarefa de rastreamento de longo alcance de qualquer ponto em 3D (TAP-3D).

O benchmark apresenta mais de 4.000 vídeos do mundo real, juntamente com suas trajetórias métricas de pontos de posição 3D. O conjunto de dados contém três fontes de vídeo diferentes e abrange uma variedade de tipos de objetos, padrões de movimento e ambientes internos e externos. Esta pasta do repositório contém o código para baixar e gerar essas anotações e amostras do conjunto de dados para visualização. Observe que ele possui uma licença separada da do TAP-Vid.

Mais detalhes sobre como baixar, usar e avaliar o benchmark TAPVid-3D podem ser encontrados no arquivo README correspondente .

Uma nota sobre coordenadas
Em nossos conjuntos de dados armazenados, as coordenadas (x, y) são tipicamente coordenadas raster normalizadas: ou seja, (0, 0) é o canto superior esquerdo do pixel superior esquerdo e (1, 1) é o canto inferior direito do pixel inferior direito. Nosso código, no entanto, converte imediatamente esses valores para coordenadas raster regulares, correspondendo à saída do leitor Kubric: (0, 0) é o canto superior esquerdo do pixel superior esquerdo, enquanto (h, w) é o canto inferior direito do pixel inferior direito, onde h é a altura da imagem em pixels e w é a respectiva largura.

Ao trabalhar com coordenadas 2D, normalmente as armazenamos na ordem (x, y). No entanto, com coordenadas 3D, geralmente trabalhamos na ordem (t, y, x), onde y e x são coordenadas raster, como mencionado anteriormente, mas t representa coordenadas de quadro, ou seja, 0 refere-se ao primeiro quadro e 0,5 refere-se ao ponto médio entre o primeiro e o segundo quadro. Tenha cuidado com isso: um erro de um pixel pode fazer diferença de acordo com nossas métricas.

Pontos de controle
Pontos de controle

tapnet/checkpoint/Deve conter um arquivo checkpoint.npy que possa ser carregado usando nosso NumpyFileCheckpointer. Você pode baixar os checkpoints aqui ou no HuggingFace , que devem ser bem semelhantes aos usados ​​no artigo. Observação: os resultados da avaliação na tabela são apresentados com resolução de inferência de 256x256, mas resoluções mais altas podem trazer benefícios. Para o BootsTAPIR, geralmente obtemos os melhores resultados com resolução de 512x512 e, para o TAPIR, resoluções ainda maiores que 512x512 podem ser vantajosas.

modelo	ponto de verificação	configuração	espinha dorsal	resolução de treinamento	DAVIS Primeiro (AJ)	DAVIS Passou (AJ)	Cinética em primeiro lugar (AJ)	RoboTAP First (AJ)
Rede TAP	Jax	tapnet_config.py	TSM-ResNet18	256x256	33,0%	38,4%	38,5%	45,1%
ANTA	Jax e PyTorch	tapir_config.py	ResNet18	256x256	58,5%	63,3%	50,0%	59,6%
TAPIR online	Jax	causal_tapir_config.py	ResNet18	256x256	56,2%	58,3%	51,2%	59,1%
BootsTAPIR	Jax e PyTorch	tapir_bootstrap_config.py	ResNet18 + 4 Convs	256x256 + 512x512	62,4%	67,4%	55,8%	69,2%
BootsTAPIR Online	Jax e PyTorch	tapir_bootstrap_config.py	ResNet18 + 4 Convs	256x256 + 512x512	59,7%	61,2%	55,1%	69,1%
TAPNext	Jax	tapnext_demo.ipynb	TrecViT-B	256x256	65,25%	68,9%	57,3%	64,1%
TAPNext++	PyTorch	torch_tapnextpp_demo.ipynb	TrecViT-B	256x256	65,6%	-	53,9%	61,1%
TAPNext++ (512×512)	PyTorch	VOTSp2026 README	TrecViT-B	512x512	67,0%	71,2%	-	-
TRAJÃO	Jax	trajan_demo.ipynb						
Treinamento
Fornecemos uma estrutura de treinamento e avaliação Jax para TAP-Net e TAPIR no diretório de treinamento; consulte o arquivo README de treinamento .

Outros pesquisadores desenvolveram uma implementação de treinamento em PyTorch para o TAPIR , que pode ser de interesse; no entanto, este trabalho não está afiliado ao Google DeepMind e sua precisão não foi verificada por nós.

Citação desta obra
Por favor, utilize as seguintes entradas BibTeX para citar nosso trabalho:

@article{doersch2022tap,
  title={{TAP}-Vid: A Benchmark for Tracking Any Point in a Video},
  author={Doersch, Carl and Gupta, Ankush and Markeeva, Larisa and Recasens, Adria and Smaira, Lucas and Aytar, Yusuf and Carreira, Joao and Zisserman, Andrew and Yang, Yi},
  journal={Advances in Neural Information Processing Systems},
  volume={35},
  pages={13610--13626},
  year={2022}
}
@inproceedings{doersch2023tapir,
  title={{TAPIR}: Tracking any point with per-frame initialization and temporal refinement},
  author={Doersch, Carl and Yang, Yi and Vecerik, Mel and Gokay, Dilara and Gupta, Ankush and Aytar, Yusuf and Carreira, Joao and Zisserman, Andrew},
  booktitle={Proceedings of the IEEE/CVF International Conference on Computer Vision},
  pages={10061--10072},
  year={2023}
}
@article{vecerik2023robotap,
  title={{RoboTAP}: Tracking arbitrary points for few-shot visual imitation},
  author={Vecerik, Mel and Doersch, Carl and Yang, Yi and Davchev, Todor and Aytar, Yusuf and Zhou, Guangyao and Hadsell, Raia and Agapito, Lourdes and Scholz, Jon},
  journal={International Conference on Robotics and Automation},
  pages={5397--5403},
  year={2024}
}
@article{doersch2024bootstap,
  title={{BootsTAP}: Bootstrapped Training for Tracking-Any-Point},
  author={Doersch, Carl and Luc, Pauline and Yang, Yi and Gokay, Dilara and Koppula, Skanda and Gupta, Ankush and Heyward, Joseph and Rocco, Ignacio and Goroshin, Ross and Carreira, Jo{\~a}o and Zisserman, Andrew},
  journal={Asian Conference on Computer Vision},
  year={2024}
}
@article{koppula2024tapvid,
  title={{TAPVid}-{3D}: A Benchmark for Tracking Any Point in {3D}},
  author={Koppula, Skanda and Rocco, Ignacio and Yang, Yi and Heyward, Joe and Carreira, Jo{\~a}o and Zisserman, Andrew and Brostow, Gabriel and Doersch, Carl},
  journal={Advances in Neural Information Processing Systems},
  year={2024}
}
@article{zholus2025tapnext,
  title={TAPNext: Tracking Any Point (TAP) as Next Token Prediction},
  author={Zholus, Artem and Doersch, Carl and Yang, Yi and Koppula, Skanda and Patraucean, Viorica and He, Xu Owen and Rocco, Ignacio and Sajjadi, Mehdi S. M. and Chandar, Sarath and Goroshin, Ross},
  journal={arXiv preprint arXiv:2504.05579},
  year={2025}
}
@article{allen2025trajan,
  title={Direct Motion Models for Assessing Generated Videos},
  author={Allen, Kelsey and Doersch, Carl and Zhou, Guangyao and Suhail, Mohammed and Driess, Danny and Rocco, Ignacio and Rubanova, Yulia and Kipf, Thomas and Sajjadi, Mehdi S. M. and Murphy, Kevin and Carreira, Joao and van Steenkiste, Sjoerd},
  journal={arXiv preprint},
  year={2025}
}
Licença e Isenção de Responsabilidade
Direitos autorais 2022-2026 Google LLC

O software e outros materiais específicos do benchmark TAPVid-3D são cobertos pela licença descrita no arquivo tapvid3d/LICENSE.

Todo o software neste repositório está licenciado sob a Licença Apache, Versão 2.0 (Apache 2.0); você não pode usar este arquivo, exceto em conformidade com a licença Apache 2.0. Você pode obter uma cópia da licença Apache 2.0 em:

https://www.apache.org/licenses/LICENSE-2.0

Todos os checkpoints de modelos pré-treinados disponibilizados neste repositório e vinculados a partir deste README (incluindo TAP-Net, TAPIR, BootsTAPIR, TAPNext, TAPNext++ e pesos TRAJAN) também estão licenciados sob a licença Apache 2.0.

Todos os demais materiais não relacionados a software disponibilizados aqui para os conjuntos de dados TAP-Vid, ou seja, as anotações do TAP-Vid, bem como os vídeos de empilhamento RGB e os vídeos do RoboTAP, são disponibilizados sob uma licença Creative Commons BY . Você pode obter uma cópia da licença CC-BY em: https://creativecommons.org/licenses/by/4.0/legalcode .

Os vídeos originais do DAVIS provêm do conjunto de dados val e também estão licenciados sob licenças Creative Commons, conforme seus criadores; consulte o conjunto de dados DAVIS para obter detalhes. Os vídeos do Kinetics estão disponíveis publicamente no YouTube, mas estão sujeitos às suas próprias licenças individuais. Consulte a página do conjunto de dados Kinetics para obter detalhes.

A menos que exigido pela legislação aplicável ou acordado por escrito, todo o software e materiais distribuídos aqui sob as licenças Apache 2.0 ou CC-BY são distribuídos "NO ESTADO EM QUE SE ENCONTRAM", SEM GARANTIAS OU CONDIÇÕES DE QUALQUER TIPO, expressas ou implícitas. Consulte as licenças para obter informações sobre os termos e condições específicos que regem as permissões e limitações de cada uma delas.

Este não é um produto oficial do Googl
