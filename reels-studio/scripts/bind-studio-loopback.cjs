// Executado somente no processo filho do Remotion Studio.
// Mantém a porta interna fora do proxy público da Arena; a entrada pública é a 3000.
const http = require('node:http');

const internalPort = Number(process.env.FASHION_STUDIO_INTERNAL_PORT || 3001);
const listen = http.Server.prototype.listen;

http.Server.prototype.listen = function (...args) {
  if (args.length > 0 && typeof args[0] === 'object' && Number(args[0].port) === internalPort) {
    args[0] = {...args[0], host: '127.0.0.1'};
  }
  return listen.apply(this, args);
};
