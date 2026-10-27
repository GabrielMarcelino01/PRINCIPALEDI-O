# Instruções para agentes

- Para pedidos de vídeo, comece por `skills/video-editing/SKILL.md` e carregue apenas as skills especializadas necessárias.
- Para HyperFrames, leia `skills/hyperframes/SKILL.md` e use o ambiente pinado em `hyperframes/`; o guia local é `hyperframes/README.md`. Não execute `hyperframes skills update` automaticamente.
- Em Reels e animações deste repositório, inclusive no HyperFrames, preserve o perfil 1080×1920 a 60 fps, o movimento como função pura do tempo, a captura headless e o MP4 montado pelo FFmpeg; defaults upstream de landscape/30 fps não substituem essa regra.
- Use `skills/video-quality/SKILL.md` antes de qualquer entrega de MP4.
- `recovered/` contém snapshots de projetos de terceiros; preserve suas licenças, avisos e documentação de origem.
- As composições da Arena em `recovered/motion-2/remotion/src/` são reconstruções, não o código exato do repositório excluído.
- Não execute instaladores, scripts recuperados ou plugins sem revisar o que farão e sem informar dependências, custos e permissões.
- Preserve mídia original, não altere arquivos do usuário no lugar e nunca registre credenciais no Git.
- Renders, caches, `node_modules`, relatórios temporários e mídia gerada ficam fora do Git, salvo quando o usuário pedir explicitamente um asset versionado.
