# Smoke test HyperFrames — vertical 60 fps

Composição técnica criada com `hyperframes init --resolution portrait` e adaptada para validar o ambiente local. **Não é um Reel de cliente nem um master para entrega.**

## Contrato do teste

- 1080×1920, 60 fps, 3 segundos e 180 quadros.
- Uma cena em `compositions/diagnostic.html`, montada por `index.html`.
- Câmera, tipografia, linha, progresso e órbita usam tweens absolutos em uma timeline GSAP pausada.
- Sem áudio, mídia externa, CDN, aleatoriedade, relógio de sistema, timers ou loops infinitos.
- GSAP 3.15.0 é servido pelo asset local `assets/gsap.min.js`, copiado sem alterações do runtime HyperFrames 0.8.206.

A partir de `hyperframes/`:

```bash
npm run check:smoke
npm run snapshot:smoke
npm run render:smoke
```

O MP4 técnico vai para `out/HYPERFRAMES-SMOKE.mp4`, fora do Git. Para abrir no Studio:

```bash
npm run preview:smoke
# http://localhost:3002/#project/smoke
```

Em uma revisão publicada pela Arena, usar a URL HTTPS da porta 3002 fornecida pela plataforma; o navegador do usuário não deve chamar `localhost` do sandbox.
