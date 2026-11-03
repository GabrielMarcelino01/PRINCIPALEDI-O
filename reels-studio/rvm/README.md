# Rotoscopia RVM ONNX

Pipeline local para separar uma pessoa do fundo e inserir uma camada RGBA **atrás dela**. O arquivo `rvm_mobilenetv3_fp32.onnx` na raiz do repositório já contém a rede completa e seus pesos: **não é necessário baixar nem copiar os antigos módulos PyTorch**.

## O que está implementado

- decodificação sequencial com PyAV;
- reset dos quatro estados recorrentes no início de cada take;
- atualização dos estados somente em ordem temporal;
- foreground RGB e alfa de 16 bits para cada quadro;
- manifesto com SHA-256 da fonte/modelo e de cada PNG, fps, dimensões, timestamps e parâmetros;
- composição `pessoa sobre camada RGBA sobre fundo`;
- MP4 H.264 de prévia, sem áudio;
- comparação de duas execuções para verificar determinismo.

Não é tracking de pontos e não inclui TAPNext++. Também não é uma garantia de recorte profissional: cabelo, mãos, tecido, movimento rápido e baixa luz exigem revisão visual no take real.

## Instalação

A partir da raiz do repositório:

```bash
python3 -m venv reels-studio/work/rvm-venv
reels-studio/work/rvm-venv/bin/pip install -r reels-studio/rvm/requirements.txt
```

As dependências testadas são ONNX Runtime 1.31.1, PyAV 16.1.0, NumPy 2.4.6 e Pillow 12.3.0. PyTorch não entra nessa rota. A implementação atual usa CPU; é adequada a pré-processamento offline, não a tempo real.

## Verificar o modelo

```bash
sha256sum rvm_mobilenetv3_fp32.onnx
```

Para o arquivo versionado, o resultado esperado é:

```text
88d4531297118f595bf2fd60f6f566aec2e559393802d1f436c380f0cbbd2828
```

Tamanho esperado: 14.975.696 bytes. Se o hash for diferente, não presuma que se trata do mesmo modelo.

## 1. Gerar alfa e foreground

Use sempre um **vídeo original**, não um MP4 já editado como fonte:

```bash
reels-studio/work/rvm-venv/bin/python reels-studio/rvm/matte.py \
  --input /caminho/para/original.mp4 \
  --output-dir reels-studio/work/rvm/meu-take \
  --downsample-ratio 0.375 \
  --expected-model-sha256 88d4531297118f595bf2fd60f6f566aec2e559393802d1f436c380f0cbbd2828
```

Para uma prévia curta:

```bash
reels-studio/work/rvm-venv/bin/python reels-studio/rvm/matte.py \
  --input /caminho/para/original.mp4 \
  --output-dir reels-studio/work/rvm/meu-teste \
  --start 5 --duration 1 --downsample-ratio 0.375
```

Se `--downsample-ratio` for omitido, o maior lado interno fica em aproximadamente 512 px. Esse valor é apenas um ponto de partida. Ajuste por take e compare visualmente; valores menores são mais rápidos, mas podem perder detalhes.

O diretório de saída precisa estar vazio. A estrutura gerada é:

```text
meu-take/
  manifest.json
  foreground/000000.png
  alpha/000000.png
  foreground/000001.png
  alpha/000001.png
  ...
```

Os PNGs de alfa usam 16 bits; o foreground usa RGB de 8 bits. Não reinicie os estados no meio de um take contínuo. Em cortes ou takes diferentes, execute um novo processo para começar com os estados zerados.

## 2. Inserir texto ou gráfico atrás da pessoa

Forneça uma PNG RGBA com **exatamente a largura e altura do vídeo de origem**. As regiões transparentes preservam o fundo; as regiões opacas ficam atrás do alfa da pessoa.

```bash
reels-studio/work/rvm-venv/bin/python reels-studio/rvm/compose.py \
  --input /caminho/para/original.mp4 \
  --matte-dir reels-studio/work/rvm/meu-take \
  --overlay /caminho/para/texto-720x1280.png \
  --output reels-studio/work/rvm/meu-take-preview.mp4 \
  --preview-png reels-studio/work/rvm/meu-take-preview.png
```

Para uma camada animada já rasterizada, use `--overlay-dir` em vez de `--overlay`. Os arquivos devem se chamar `000000.png`, `000001.png` e assim por diante, sem lacunas.

O MP4 desse comando é uma **prévia silenciosa**. Para entrega com áudio, monte o master com FFmpeg a partir do original e faça QA no arquivo codificado. Não trate essa prévia como master final.

## Relação com o render a 60 fps

O RVM é calculado na cadência do vídeo de origem; os estados recorrentes não devem ser usados dentro de um render headless paralelo ou fora de ordem. O projeto de motion/render permanece separado:

1. pré-calcular `foreground/` e `alpha/` sequencialmente;
2. calcular cada quadro de saída por seu tempo absoluto `t`;
3. mapear `t` para um quadro de matte de forma fixa, por exemplo `i = floor(t * fps_fonte + epsilon)`;
4. renderizar a animação e capturar cada quadro a **60 fps** no navegador headless;
5. montar o MP4 vertical com FFmpeg.

Assim, repetir um quadro de saída não depende de sorteio, ordem de workers ou estado ONNX acumulado. Em uma fonte de 30 fps entregue a 60 fps, cada matte normalmente se repete por dois quadros de saída; isso não cria novos movimentos intermediários da pessoa.

## Teste de determinismo

Execute o mesmo intervalo duas vezes, com os mesmos argumentos e diretórios diferentes:

```bash
reels-studio/work/rvm-venv/bin/python reels-studio/rvm/compare.py \
  reels-studio/work/rvm/passagem-a \
  reels-studio/work/rvm/passagem-b
```

O comparador exige igualdade de fonte, modelo, parâmetros, timestamps, quantidade de quadros e hashes de todos os PNGs. Apenas o tempo de processamento é ignorado.

Testes unitários das funções de composição e quantização:

```bash
reels-studio/work/rvm-venv/bin/python -m unittest discover \
  -s reels-studio/rvm -p 'test_*.py' -v
```

## Armazenamento e QA

- `reels-studio/work/` e `reels-studio/out/` já são ignorados pelo Git.
- Não versionar caches, sequências de PNG, prévias ou ambientes virtuais.
- Masters editados pertencem a `entregas/`; referências, a `referencias/`; mídia bruta e temporária permanece separada.
- Conferir alfa e composição em movimento, não apenas em um frame bonito.
- Fazer QA técnico e visual no MP4 final. A prévia de composição não substitui essa etapa.

## Validação registrada

Os resultados do teste real de 30 quadros, da repetição determinística e da prévia de composição estão em [`VALIDATION.md`](VALIDATION.md), incluindo as limitações visuais encontradas.

## Licença e limites de uso

Robust Video Matting e seu modelo são distribuídos pelo upstream sob **GPL-3.0**. O texto completo está em `LICENSE-RVM.txt`; a origem é <https://github.com/PeterL1n/RobustVideoMatting>. Preserve avisos e avalie as obrigações de copyleft antes de distribuir ou oferecer um produto/serviço comercial. Este README não é aconselhamento jurídico.
