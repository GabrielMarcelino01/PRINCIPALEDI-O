# Validação da integração RVM ONNX

Data: 2026-10-27.

## Escopo executado

Teste técnico com o ONNX versionado e um intervalo de 5,0 a 6,0 segundos da referência já disponível no ambiente. A referência foi usada somente para validar o pipeline; não é um master nem uma nova fonte original de produção.

- Entrada: 720×1280, 30 fps.
- Intervalo: 30 quadros consecutivos.
- `downsample_ratio`: 0,375.
- Modelo: 14.975.696 bytes.
- SHA-256: `88d4531297118f595bf2fd60f6f566aec2e559393802d1f436c380f0cbbd2828`.
- Execução: CPU, ONNX Runtime 1.31.1, PyAV 16.1.0, NumPy 2.4.6 e Pillow 12.3.0.

## Resultados objetivos

1. **Inferência e arquivos:** 30 foregrounds RGB e 30 alfas de 16 bits gerados, com manifesto e hashes por quadro.
2. **Determinismo:** duas execuções independentes, ambas com reset e a mesma sequência de entrada, produziram manifests estáveis idênticos. O comparador releu e validou 60 arquivos de cada passagem (120 no total); `deterministic: true`.
3. **Tempo deste teste:** aproximadamente 14,6 s e 13,6 s por passagem, incluindo inferência, PNGs e hashes. É uma observação deste ambiente, não um benchmark garantido.
4. **Composição:** prévia H.264 de 1 segundo, 720×1280, 30 fps e 30 quadros decodificados. O arquivo é intencionalmente silencioso.
5. **Testes unitários:** 6 testes passaram, cobrindo quantização, alfa de 16 bits, formas inválidas, ordem das camadas e preservação dos pixels originais na composição no mesmo take.
6. **Sintaxe:** `py_compile` passou para todos os módulos Python da integração.

## Revisão visual e limites

Foram inspecionados o primeiro quadro e uma folha de contato com os quadros 0, 10, 20 e 29 da prévia. O texto aparece atrás da pessoa e o cenário original é preservado. Ainda há transparência indevida em parte do vestido; o recorte não deve ser considerado aprovado para produção sem ajuste e revisão dos takes reais.

Não foi feita revisão de playback integral em velocidade normal nem escuta de áudio. A prévia não tem áudio. Também não foi gerado um master 1080×1920 a 60 fps neste teste: a cadência de 60 fps pertence ao render de motion separado, que consumirá os mattes pré-calculados como função determinística do tempo.

TAPNext++ e tracking de pontos não fazem parte desta validação.
