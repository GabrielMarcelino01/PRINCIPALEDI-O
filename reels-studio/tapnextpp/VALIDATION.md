# Validação do checkpoint TAPNext++

Data: 2026-10-27.

## Resultado confirmado

A execução GitHub Actions **40591414180** terminou com sucesso em todas as etapas:

<https://github.com/GabrielMarcelino01/PRINCIPALEDI-O/actions/runs/40591414180>

- commit executado: `87f337ec6cfea6e19f6760c74275cebd67a4c2ed`;
- duração do job: 1 minuto e 29 segundos;
- instalação das dependências CPU: sucesso;
- download do checkpoint oficial de 512×512: sucesso;
- verificação do ZIP enviado e carregamento com `TAPNextPP.from_checkpoint`: sucesso;
- remoção do checkpoint ao final: sucesso;
- artifact `tapnextpp-smoke-40591414180`: 2.016 bytes, contendo somente diagnósticos, sem pesos.

O passo de carregamento usou o wrapper oficial com `weights_only=True`, `strict=True`, CPU e `input_resolution=512`. O hash, o tamanho e os demais detalhes medidos estão no `report.json` do artifact e no resumo do job. A rede desta sandbox bloqueou o host de download do artifact, portanto esses valores não foram copiados para este documento sem serem lidos diretamente.

## Limites do teste

- `forward=false`: não houve inferência, sequência sintética ou vídeo real.
- Não houve benchmark DAVIS nem avaliação de precisão, oclusão ou redetecção.
- Não houve medição de velocidade de tracking nem validação em GPU.
- O checkpoint não permanece nesta sandbox nem foi adicionado ao Git.

Este resultado confirma **disponibilidade do arquivo oficial e compatibilidade de carregamento com o código enviado**. Não confirma ainda que o tracking esteja integrado ou que funcione com a qualidade necessária nos takes do projeto.
