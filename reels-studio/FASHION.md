# EDITE-ESSE — edição editorial de moda

## Entrega

- **Vídeo final:** `out/edite-esse-final.mp4`
- **Capa:** `out/edite-esse-capa.jpg`
- **Storyboard:** `out/edite-esse-storyboard.jpg`
- **Legendas separadas:** `fashion-captions.srt`
- **Transcrição revisada:** `fashion-transcript.json`
- **Timeline:** `fashion-project.json`
- **Relatório de QA:** `FASHION-QA.md`

Os vídeos originais, as referências, os intermediários e as saídas ficam fora do Git. Código, fontes licenciadas, timeline, SRT, transcrição e relatórios são versionados.

## Material recebido e recuperação

| Material | Origem no histórico do GitHub | SHA-256 |
| --- | --- | --- |
| EDITE-ESSE | Commit `32c0456a`, `Untitled_Scene_10-25_20_12_37_20261025171936.mp4` | `db9c93382b7d05b152a3dd9dce13c72c1634b74e5ba4125f79811ba98ed9bbc8` |
| Referência 1 | Commit `7c82cb98`, `snapinsta-1792986459605.mp4` | `9a26c9cd48e879fe380323cafd89ec34cae19ac6719de59dee60851372efefa8` |
| Referência 2 | Commit `780189b4`, `snapinsta-1792986748704.mp4` | `3a8d8f56966c3e362f76c14eba217a5b85515d70bf568daaf4bde79ee144adb3` |

Os arquivos renomeados no HEAD da `main` são placeholders CRLF de 2 bytes. Esta edição usa os **uploads originais preservados no histórico**, sem mesclar a `main` na branch de trabalho.

Para restaurar os arquivos localmente quando necessário:

```bash
mkdir -p assets/source assets/references
git show '32c0456a:Untitled_Scene_10-25_20_12_37_20261025171936.mp4' > assets/source/edite-esse.mp4
git show '7c82cb98:snapinsta-1792986459605.mp4' > assets/references/video-inspiracao-1.mp4
git show '780189b4:snapinsta-1792986748704.mp4' > assets/references/video-inspiracao-2.mp4
```

## Análise das referências

A análise foi feita por folhas de contato e quadros amostrados; não houve playback integral ou escuta das referências.

### Referência 1 — edição/tipografia

- mistura de sans serif forte com serifada itálica;
- palavras-chave ampliadas e conectores menores;
- texto centralizado sobre o apresentador;
- flashes claros e mudanças de escala como pontuação de corte.

### Referência 2 — moda/B-roll

- combinações de roupa como organização narrativa;
- títulos ligados às cores e ao estilo;
- colagens e B-roll como variação visual;
- CTA curto ligado ao tema.

### Adaptação ao EDITE-ESSE

- Inter + Playfair Display itálica, com licenças em `public/fonts/`;
- 13 grupos de captions, no máximo duas linhas, fiéis à fala;
- cores específicas para neon/laranja, verde/preto, bege/branco, azul/branco e vermelho/branco;
- zoom contínuo discreto e pequenos punch-ins nos adjetivos;
- flashes e whooshes curtos nos quatro cortes reais;
- CTA “QUAL LOOK VOCÊ USARIA?” no último look;
- **nenhum frame das referências foi inserido na edição**, evitando misturar pessoas e roupas que não pertencem ao vídeo principal.

## Cortes detectados

| Corte | Tempo | Mudança |
| --- | ---: | --- |
| 01 | 4,417643 s | Neon/laranja → verde/preto |
| 02 | 8,366667 s | Verde/preto → bege/branco |
| 03 | 11,613021 s | Bege/branco → azul/branco |
| 04 | 15,716667 s | Azul/branco → vermelho/branco |

Os tempos foram detectados por diferença de cena e conferidos contra os quadros e as pausas da fala.

## Imagem e áudio

- Fonte: 720×1280, aproximadamente 24 fps, H.264/AAC, 20,467 s.
- Normalização: **1080×1920, 30 fps**, upscale Lanczos e matriz BT.601 → BT.709.
- Tratamento: contraste e saturação discretos, sharpen leve, sem interpolação sintética de movimento.
- Entrega: H.264, `yuv420p`, faixa limitada, BT.709, CRF 16 e preset slow.
- Voz original: EQ, compressão e presença; loudness original medido em −21,1 LUFS.
- Música: composição procedural original, 112 BPM, sem samples.
- Efeitos: síntese original nos quatro cortes.
- Mix: ducking por sidechain e loudnorm em duas passagens.
- Master do render: WAV PCM 24 bits/48 kHz; **uma única codificação AAC** no MP4.

## Transcrição

Foi usado Whisper small/CTranslate2 int8 em inferência local e offline, com timestamps por palavra. O checksum do modelo foi validado antes do uso; o modelo não é versionado.

O ASR reconheceu “beijo” na terceira frase. Foi corrigido para **“bege”** pela combinação narrada e pelo look exibido. A validação automática compara todos os grupos de captions com os seis segmentos revisados.

## Reproduzir

Com FFmpeg/ffprobe, Chromium e NumPy disponíveis:

```bash
npm ci
npm run fashion:prepare
npm run fashion:render
npm run fashion:still
```

Preview interativa na porta 3000, incluindo o proxy de origem necessário para o HTTPS da Arena:

```bash
npm run fashion:studio
```

Se o navegador estiver fora do caminho padrão:

```bash
export REMOTION_BROWSER=/caminho/para/chromium
```

Quadros de controle sem renderizar o vídeo inteiro:

```bash
npm run fashion:storyboard
```

Overlay de safe zones:

```bash
node fashion-render.mjs --still --frame 285 --safe-zones --output out/fashion-safe-zones.jpg
```

## QA

```bash
npm run qa:fashion
```

O comando separa:

1. timeline/assets e fidelidade com a transcrição;
2. sintaxe, sobreposição e velocidade do SRT;
3. formato, fps, loudness, true peak, preto e congelamento do MP4 codificado.

A revisão visual e suas limitações são registradas em `FASHION-QA.md`.
