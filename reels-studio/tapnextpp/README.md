# TAPNext++: verificação remota do checkpoint

Este diretório contém um smoke test para o código oficial enviado em `tapnet-main.zip` e para o checkpoint TAPNext++ de 512×512. Ele ainda **não é uma integração de tracking nos vídeos do projeto**.

## Por que o checkpoint não está no Git

`tapnextpp_512.ckpt` tem gigabytes e não deve ser convertido em texto, dividido em arquivos ou commitado. O workflow baixa o arquivo diretamente da URL oficial no runner temporário:

<https://storage.googleapis.com/gresearch/tapnextpp/tapnextpp_512.ckpt>

O código e o checkpoint do upstream são Apache-2.0. O ZIP enviado é verificado por SHA-256 antes de qualquer importação. Os cinco módulos usados no carregamento foram comparados com o upstream e eram idênticos na auditoria de 2026-10-27.

## O que o workflow faz

1. usa um runner `ubuntu-24.04`, com timeout de 60 minutos;
2. instala versões fixadas de PyTorch/Torchvision **CPU**, NumPy e Einops;
3. baixa o checkpoint com retries no diretório temporário do runner;
4. verifica integridade do ZIP e a presença dos módulos necessários;
5. carrega o checkpoint com `weights_only=True` e `strict=True` no `load_state_dict`;
6. registra hash, tamanho, versões, duração, memória máxima e número de parâmetros;
7. envia como artifact somente um JSON pequeno, retido por sete dias;
8. remove o checkpoint mesmo quando o teste falha.

Não há benchmark DAVIS nem download de dataset. O teste de carregamento não demonstra qualidade de tracking.

## Execução

O workflow está em `.github/workflows/tapnextpp-smoke.yml`.

- **Manual:** em Actions, selecione `TAPNext++ checkpoint smoke`. A opção `forward` executa dois quadros sintéticos depois do carregamento; isso testa a passagem pelo modelo e o estado recorrente, não a precisão.
- **Por commit nesta branch:** somente commits que alteram os arquivos do smoke e contêm `[tapnextpp-smoke]` na mensagem disparam a execução. Isso evita downloads acidentais de gigabytes em commits comuns.
- **Checksum opcional:** depois que o hash oficial observado for registrado, ele pode ser exigido no campo `expected_checkpoint_sha256` da execução manual.

Execuções pesadas são serializadas por `concurrency`. O workflow usa somente `contents: read` e não precisa de credenciais externas.

## Resultado e limites

Consulte o artifact `tapnextpp-smoke-<run-id>` e o relatório de validação do projeto. O arquivo `report.json` distingue:

- `load_passed`: checkpoint carregado, sem inferência;
- `load_and_forward_passed`: carregamento e dois quadros sintéticos concluídos;
- `failed`: falha registrada com traceback.

O runner padrão não oferece GPU. Mesmo que o carregamento passe, velocidade e memória para vídeos reais em 512 ainda precisam ser medidas separadamente. Nenhum MP4, checkpoint ou cache de modelo é enviado como artifact.
