// Gera a versão de produção em dist/:
// - CSS minificado
// - JavaScript empacotado em um único arquivo minificado
// - HTML minificado
// - imagens recomprimidas
// Uso: npm run build

import { build } from 'esbuild';
import { minify as minificarHTML } from 'html-minifier-terser';
import sharp from 'sharp';
import { gzipSync } from 'node:zlib';
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const RAIZ = path.resolve(import.meta.dirname, '..');
const DIST = path.join(RAIZ, 'dist');
const origem = (...partes) => path.join(RAIZ, ...partes);
const destino = (...partes) => path.join(DIST, ...partes);

const relatorio = [];

async function registrar(grupo, arquivosDeOrigem, arquivosDeDestino) {
  const somar = async (arquivos) => {
    let bytes = 0;
    let gzip = 0;
    for (const arquivo of arquivos) {
      const conteudo = await readFile(arquivo);
      bytes += conteudo.length;
      gzip += gzipSync(conteudo).length;
    }
    return { bytes, gzip };
  };
  relatorio.push({ grupo, antes: await somar(arquivosDeOrigem), depois: await somar(arquivosDeDestino) });
}

async function listar(pasta, filtro = () => true) {
  const itens = await readdir(pasta, { withFileTypes: true, recursive: true });
  return itens
    .filter((item) => item.isFile() && filtro(item.name))
    .map((item) => path.join(item.parentPath, item.name));
}

async function gerarCSS() {
  await build({
    entryPoints: [origem('css/style.css')],
    outfile: destino('css/style.min.css'),
    minify: true,
    logLevel: 'error',
  });
  await registrar('CSS', [origem('css/style.css')], [destino('css/style.min.css')]);
}

async function gerarJS() {
  // Os módulos ES são unidos em um único arquivo: 1 requisição no lugar de 11.
  await build({
    entryPoints: [origem('js/main.js')],
    outfile: destino('js/app.min.js'),
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2020'],
    logLevel: 'error',
  });
  const modulos = [origem('js/main.js'), ...(await listar(origem('js/modules')))];
  await registrar('JavaScript (aplicação)', modulos, [destino('js/app.min.js')]);

  // A biblioteca já vem minificada: é apenas copiada.
  await cp(origem('js/vendor'), destino('js/vendor'), { recursive: true });
}

async function gerarHTML() {
  const opcoes = {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    minifyCSS: true,
    minifyJS: true,
  };

  let pagina = await readFile(origem('html/index.html'), 'utf8');
  pagina = pagina
    .replace('href="../css/style.css"', 'href="../css/style.min.css"')
    .replace('<script type="module" src="../js/main.js"></script>', '<script src="../js/app.min.js" defer></script>');
  if (!pagina.includes('style.min.css') || !pagina.includes('app.min.js')) {
    throw new Error('As referências de CSS/JS em html/index.html não foram encontradas.');
  }
  await mkdir(destino('html'), { recursive: true });
  await writeFile(destino('html/index.html'), await minificarHTML(pagina, opcoes));

  const redirecionamento = await readFile(origem('index.html'), 'utf8');
  await writeFile(destino('index.html'), await minificarHTML(redirecionamento, opcoes));

  await registrar(
    'HTML',
    [origem('html/index.html'), origem('index.html')],
    [destino('html/index.html'), destino('index.html')],
  );
}

async function gerarImagens() {
  await mkdir(destino('imagens'), { recursive: true });
  const arquivos = await listar(origem('imagens'));

  for (const arquivo of arquivos) {
    const nome = path.basename(arquivo);
    const saida = destino('imagens', nome);
    const imagem = sharp(arquivo);

    if (nome.endsWith('.jpg')) {
      await imagem.jpeg({ quality: 76, mozjpeg: true }).toFile(saida);
    } else if (nome.endsWith('.webp')) {
      await imagem.webp({ quality: 74, effort: 6 }).toFile(saida);
    } else if (nome.endsWith('.png')) {
      // O logotipo é exibido a 48px: 96px bastam para telas de alta densidade.
      await imagem.resize(96, 96).png({ palette: true, compressionLevel: 9 }).toFile(saida);
    } else {
      await cp(arquivo, saida);
    }

    // Nunca publica um arquivo maior que o original.
    if ((await stat(saida)).size > (await stat(arquivo)).size) await cp(arquivo, saida);
  }

  await registrar('Imagens', arquivos, await listar(destino('imagens')));
}

function imprimirRelatorio() {
  const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`.padStart(9);
  const reducao = (antes, depois) => `${(100 - (depois / antes) * 100).toFixed(0)}%`.padStart(5);
  console.log('\nGrupo                     Antes     Depois  Redução   gzip antes  gzip depois');
  let antes = 0;
  let depois = 0;
  for (const linha of relatorio) {
    antes += linha.antes.bytes;
    depois += linha.depois.bytes;
    console.log(
      `${linha.grupo.padEnd(22)}${kb(linha.antes.bytes)}  ${kb(linha.depois.bytes)}  ${reducao(linha.antes.bytes, linha.depois.bytes)}    ${kb(linha.antes.gzip)}    ${kb(linha.depois.gzip)}`,
    );
  }
  console.log(`${'Total'.padEnd(22)}${kb(antes)}  ${kb(depois)}  ${reducao(antes, depois)}`);
  console.log('\nVersão de produção gerada em dist/');
}

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
await Promise.all([gerarCSS(), gerarJS(), gerarHTML(), gerarImagens()]);
relatorio.sort((a, b) => a.grupo.localeCompare(b.grupo));
imprimirRelatorio();
