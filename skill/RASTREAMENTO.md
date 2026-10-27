Vídeo de rastreamento de objetos do Tensorflow
(Versão 0.3, Última atualização 10-03-2017)

texto alternativo texto alternativo texto alternativo texto alternativo

O projeto segue o índice abaixo :

Introdução ;
Requisitos e Instalação ;
Utilização do Script YOLO
Configuração de parâmetros ;
Utilização .
Utilização do script VID TENSORBOX
Configuração de parâmetros ;
Utilização .
Arquivos de teste do TENSORBOX ;
Scripts de conjunto de dados ;
Direitos autorais ;
Estado atual do projeto .
DOWNLOADS .
Agradecimentos .
Bibliografia .
1. Introdução
Este repositório é o meu projeto de mestrado: "Desenvolvendo um sistema de rastreamento de objetos em vídeo com a tecnologia TensorFlow". Ele ainda está em desenvolvimento, portanto, muitas atualizações serão feitas. Neste trabalho, utilizei a arquitetura e a estratégia de resolução de problemas do artigo T-CNN ( Arxiv ), vencedor do desafio VID do IMAGENET 2015. Assim, a arquitetura do script será composta por diversos componentes em cascata:

Detecção de imagem estática (retorna resultados de rastreamento em um único quadro);
Detecção de Informação Temporal (Introdução de Informação Temporal nos Resultados da DET);
Detecção de Informações de Contexto (Introdução de Informações de Contexto nos Resultados da DET);
Observe que o componente de Detecção de Imagem Estática pode ser único ou decomposto em dois subcomponentes:

Primeiro: determine "Onde" no Quadro;
Segundo: determine "O quê" no quadro.
Meu projeto utiliza diversos projetos online do TensorFlow, como:

YOLO Tensorflow ;
TensorBox .
A Origem .
2. Requisitos e Instalação
Para instalar o script, basta baixar o repositório. Para executar o script, você precisa ter instalado:

Tensorflow;
OpenCV;
Python;
Todas as bibliotecas Python necessárias podem ser instaladas facilmente através do comando `pip install nome-do-pacote`. Se você quiser seguir um guia para instalar os requisitos, aqui está o link para um tutorial que escrevi para mim e para um curso de Aprendizado Profundo na UPC.

3. Utilização do Script YOLO
You Only Look Once (YOLO) é um sistema de detecção de objetos em tempo real de última geração. ## i. Configurando Parâmetros Estes são os argumentos de terminal embutidos extraídos do script; a maioria deles não é obrigatória, apenas o caminho do vídeo deve ser especificado ao chamar o script:

  parser = argparse.ArgumentParser()
  parser.add_argument('--det_frames_folder', default='det_frames/', type=str)
  parser.add_argument('--det_result_folder', default='det_results/', type=str)
  parser.add_argument('--result_folder', default='summary_result/', type=str)
  parser.add_argument('--summary_file', default='results.txt', type=str)
  parser.add_argument('--output_name', default='output.mp4', type=str)
  parser.add_argument('--perc', default=5, type=int)
  parser.add_argument('--path_video', required=True, type=str)
Agora você precisa baixar os pesos para o YOLO e colocá-los em /YOLO_DET_Alg/weights/.

Para aprender sobre YOLO, aqui você encontra o código original (implementação em C) e o artigo.

ii. Utilização
Após definir os parâmetros, podemos prosseguir e executar o script:

  python VID_yolo.py --path_video video.mp4
Você verá uma saída no terminal semelhante a esta:

tag alt

Você verá uma saída de quadros em tempo real (como a abaixo) e, finalmente, tudo será incorporado à saída de vídeo (enviei os dois primeiros testes que fiz para a pasta /video_result; você pode baixá-los e conferir o resultado final. O primeiro apresenta problemas na ordem dos quadros, por isso você verá tanta cintilação na imagem do vídeo. O problema foi resolvido e o segundo teste não apresenta cintilação de quadros).

tag alt

4. Utilização do script VID TENSORBOX
i.Definindo parâmetros
Estes são os argumentos de terminal embutidos extraídos do script; a maioria deles não é necessária. Como antes, apenas o caminho do vídeo precisa ser especificado ao chamar o script:

  parser.add_argument('--output_name', default='output.mp4', type=str)
  parser.add_argument('--hypes', default='./hypes/overfeat_rezoom.json', type=str)
  parser.add_argument('--weights', default='./output/save.ckpt-1090000', type=str)
  parser.add_argument('--perc', default=2, type=int)
  parser.add_argument('--path_video', required=True, type=str)
Em breve disponibilizarei um arquivo de pesos para download. Para treinamento e especificação da implementação multiclasse, adicionarei os arquivos após a conclusão do meu projeto de tese.

ii. Utilização
Baixe os arquivos .zip disponíveis na seção de Downloads e substitua as pastas.

Em seguida, após definirmos os parâmetros, podemos prosseguir e executar o script:

  python VID_tensorbox_multi_class.py --path_video video.mp4
5. Testes do Tensorbox
Na pasta video_result_OVT você encontrará os arquivos resultantes da execução dos scripts VID TENSOBOX.

6. Scripts de Conjunto de Dados
Todos os scripts abaixo são para as classes VID, então, se você quiser adaptá-los para outras classes, basta alterar o arquivo Classes.py, onde são definidas as correspondências entre códigos e nomes. Todos os dados da imagem são formatados respeitando uma proporção específica, pois o TensorBox funciona apenas com imagens PNG de 640x480. Portanto, você precisará modificar um pouco o código para adaptá-lo às suas necessidades. Fornecerei quatro scripts:

Process_Dataset_heavy.py : Processe seu conjunto de dados com uma abordagem de força bruta; você obterá mais caixas delimitadoras e arquivos para cada classe;
Process_Dataset_lightweight.py : Processe seu conjunto de dados com uma abordagem leve, obtendo assim menos caixas delimitadoras e arquivos para cada classe;
Resize_Dataset.py : Redimensione seu conjunto de dados para imagens PNG de 640x480;
Test_Processed_Data.py : Irá testar se o processo termina bem, sem erros.
Adicionei também alguns scripts para pré-processar e preparar o conjunto de dados para treinar o último componente, o Modelo Inception. Você pode encontrá-los em uma subpasta da pasta de scripts do conjunto de dados.

7. Direitos autorais
De acordo com o arquivo LICENSE do código original,

Eu e o autor original não nos responsabilizamos por quaisquer danos;
Não utilize isso para fins comerciais!
8. Estado atual do projeto
Suporte ao algoritmo DET YOLO (SingleClass);
Treinamento de suporte APENAS para TENSOBOX e treinamento para INCEPTION ;
USO DE INFORMAÇÕES TEMPORAIS [Estas informações são obtidas através de um algoritmo de pós-processamento que implementei no arquivo Utils_Video.py. NÃO É TREINÁVEL ];
Arquitetura modular composta em cascata por: Tensorbox (como detector geral de objetos), Tracker e Smoother e Inception (como classificador de objetos);
9. Downloads
Segue abaixo o link para o arquivo de pesos do Inception e do Tensorbox, obtido a partir dos meus experimentos de re-treinamento:

COMEÇO
TENSORBOX
10. Agradecimentos
Agradecimentos aos professores:

Elena Baralis do Politécnico de Torino Dipartimento de Automática e Informática;
Jordi Torres, do Departamento de Ciência da Computação da BSC;
Xavi Giro “I” Nieto, do Departamento de Processamento de Imagens da UPC.
11. Bibliografia
i.Curso
Aprendizado profundo para visão computacional em Barcelona
Crie um ambiente de aprendizado profundo com TensorFlow, Python e OpenCV.
ii. Classificação
Alex Krizhevsky, Ilya Sutskever e Geoffrey E. Hinton. “Classificação ImageNet com Redes Neurais Convolucionais Profundas”.
Christian Szegedy e outros “Aprofundando-se nas convoluções”.
Christian Szegedy e outros, “Repensando a arquitetura Inception para visão computacional”.
Kaiming He e outros. “Aprofundando-se nos retificadores: superando o desempenho humano na classificação do ImageNet”.
iii. Detecção
Russell Stewart e Mykhaylo Andriluka. “Detecção de pessoas de ponta a ponta em cenas com aglomeração”.
Pierre Sermanet e outros. “OverFeat: Reconhecimento, localização e detecção integrados usando redes convolucionais”.
S. Ren et al. “Faster R-CNN: Rumo à detecção de objetos em tempo real com redes de proposta de região”.
iv. Rastreamento
Dinesh Jayaraman e Kristen Grauman. “Análise de Características Lentas e Constantes: Coerência Temporal de Ordem Superior em Vídeo”.
K. Kang et al. “T-CNN: Tubelets com Redes Neurais Convolucionais para Detecção de Objetos em Vídeos”.
W. Han et al. “Seq-NMS para Detecção de Objetos em Vídeo”. - J. Redmon et al. “Você Só Olha Uma Vez: Detecção Unificada de Objetos em Tempo Real”
