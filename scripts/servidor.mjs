// Servidor estático mínimo para desenvolvimento, sem dependências.
// Uso: node scripts/servidor.mjs [pasta] [porta]   (padrão: pasta atual, porta 8000)

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const RAIZ = path.resolve(process.argv[2] ?? '.');
const PORTA = Number(process.argv[3] ?? process.env.PORT ?? 8000);

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.md': 'text/markdown; charset=utf-8',
};

createServer(async (requisicao, resposta) => {
  try {
    const caminhoDaURL = decodeURIComponent(new URL(requisicao.url, 'http://localhost').pathname);
    let arquivo = path.join(RAIZ, caminhoDaURL);
    // Impede o acesso a arquivos fora da pasta servida.
    if (!arquivo.startsWith(RAIZ)) throw new Error('fora da raiz');
    if ((await stat(arquivo)).isDirectory()) arquivo = path.join(arquivo, 'index.html');

    const conteudo = await readFile(arquivo);
    resposta.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo)] ?? 'application/octet-stream' });
    resposta.end(conteudo);
  } catch {
    resposta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    resposta.end('Arquivo não encontrado');
  }
}).listen(PORTA, () => {
  console.log(`Servindo ${RAIZ} em http://localhost:${PORTA}/`);
});
