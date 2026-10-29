Capturando uma carga útil de execução em lote do Flow
agent/services/flow_batch.pyO sistema só conhece os formatos RPC capturados de uma ação real da interface do usuário. Adicionar um desses formatos — como aumento de escala de vídeo, referência a vídeo, encadeamento de quadros inicial e final, ou edição de imagem base — começa observando o navegador executar a ação, pois adivinhar os payloads posicionais do Google não funciona. Trinta gerações foram gastas provando que uma imagem de referência no slot errado é aceita e, em seguida, ignorada silenciosamente.

O gravador não está incluído propositalmente na extensão fornecida: ele grava os corpos das solicitações em tempo real no disco, portanto, inicia uma sessão e encerra imediatamente.

O que já existe
etapa	rpcid	notas
gerar imagem	ogiZ0b	A URL da CDN assinada retorna em linha.
gerar vídeo	eb1hJf	Retorna um ID de operação
operação de votação	jwpduf	status CAEsignifica concluído
operação → id da mídia	Zzl0ze	projects/<id>; o arquivo tem aproximadamente 17 MB
ID da mídia → URLs	as29s	Assinado /video/+ pôster/image/
Carregar uma imagem	maseQ	base64 no payload, captcha como um gerador
Ausentes, e cada um bloqueado por trás de uma captura: ampliação de vídeo , r2v , encadeamento de quadros inicial e final , e a variante de imagem base da edição de imagem.

Gravação um
Adicionar extension/background.jstemporariamente:
const NETLOG_HOSTS = ['https://flow.google.com/_/*'];
const pending = new Map();

chrome.webRequest.onBeforeRequest.addListener((d) => {
  const body = d.requestBody?.raw?.length
    ? new TextDecoder().decode(new Uint8Array(d.requestBody.raw[0].bytes))
    : null;
  pending.set(d.requestId, { ts: new Date().toISOString(), url: d.url, body });
}, { urls: NETLOG_HOSTS }, ['requestBody']);

chrome.webRequest.onCompleted.addListener((d) => {
  const rec = pending.get(d.requestId);
  if (!rec) return;
  pending.delete(d.requestId);
  fetch('http://127.0.0.1:8100/api/ext/netlog', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...rec, statusCode: d.statusCode }),
  }).catch(() => {});
}, { urls: NETLOG_HOSTS });
Os cabeçalhos são omitidos propositalmente — o formato da carga útil é o que importa, e as credenciais são o que causaram o problema. Adicione um onBeforeSendHeadersouvinte somente se o cabeçalho em si for a questão em aberto e exclua o log em seguida.

Adicione uma rota descartável correspondente agent/main.pyque anexe as postagens a um arquivo no diretório temporário.
Recarregue a extensão, execute uma ação no Flow e, em seguida, recarregue novamente com o ouvinte removido.
Leia a f.reqsaída da captura: é [[[rpcid, "<inner payload as JSON string>", null, "generic"]]]. Compare a carga útil interna com o construtor mais próximo flow_batch.pypara descobrir qual slot foi alterado.
Exclua o arquivo de captura. Ele é uma evidência, não um documento fixo — use o que você aprendeu em um construtor e em um teste.
Duas coisas que vale a pena saber antes de você se diferenciar.
Aceito ≠ usado. Um arranjo incorreto dentro de um slot retorna 200 e é ignorado. Forneça uma imagem de referência com um prompt que nunca nomeie seu assunto; forneça uma proporção lendo o cabeçalho JPEG, não confiando no nome do campo.

Os slots não compartilham codificações. A proporção da imagem é 1 quadrada / 2 retrato / 3 paisagem / 4 3:4 / 5 4:3. A proporção do vídeo é 1 retrato / 2 paisagem, em seu próprio slot. Misturá-las renderiza o formato errado silenciosamente.

Notas sobre a atualização da interface do usuário de 23/09/2026
Uma flow.google.comcaptura ao vivo mostrou que dois detalhes de vídeo migrados do Omni haviam mudado em relação aos equipamentos mais antigos:

O recorte padrão do primeiro quadro agora ocorre [null, null, 1, 1]quando o usuário não reenquadrou a fonte;
A conversão de texto em vídeo 360p usa a *_360pchave do modelo, anexa o slot de opção de baixa resolução [4]e usa o tipo de descritor do cliente 2.
A mesma captura verificou a estrutura atual do primeiro quadro eb1hJfe foi seguida por um envio direto bem-sucedido ao FlowKit usando esse formato. Mantenha os pontos de referência alinhados com esses espaços capturados ao vivo; não restaure o recorte próximo à borda ou o descritor de texto-vídeo anterior 1sem uma captura de interface de usuário mais recente.
