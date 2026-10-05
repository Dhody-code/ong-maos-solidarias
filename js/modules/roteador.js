// Roteador da SPA baseado no hash da URL (#/projetos, #/cadastro?projeto=educacao).
// Troca apenas o conteúdo do <main>, sem recarregar a página.

const rotas = new Map();
let container = null;
let rotaPadrao = null;

// rota = { titulo, renderizar(parametros) -> HTML, aoMontar?(container, parametros) }
export function registrarRota(caminho, rota) {
  rotas.set(caminho, rota);
}

export function definirRotaNaoEncontrada(rota) {
  rotaPadrao = rota;
}

// Separa '#/cadastro?projeto=educacao' em caminho e parâmetros.
export function interpretarHash(hash) {
  const texto = hash.startsWith('#/') ? hash.slice(1) : '/';
  const [bruto, consulta = ''] = texto.split('?');
  // '/projetos/' e '/projetos' são a mesma rota.
  const caminho = bruto.length > 1 ? bruto.replace(/\/+$/, '') : bruto;
  return { caminho: caminho || '/', parametros: new URLSearchParams(consulta) };
}

export function navegar(caminho) {
  if (window.location.hash === `#${caminho}`) {
    renderizar();
  } else {
    window.location.hash = caminho;
  }
}

function marcarLinkAtivo(caminho) {
  document.querySelectorAll('[data-rota]').forEach((link) => {
    const ativo = link.dataset.rota === caminho;
    link.classList.toggle('menu__link--ativo', ativo);
    if (ativo) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

export function renderizar({ moverFoco = true } = {}) {
  const { caminho, parametros } = interpretarHash(window.location.hash);
  const rota = rotas.get(caminho) ?? rotaPadrao;

  container.innerHTML = rota.renderizar(parametros);
  document.title = `ONG Mãos Solidárias | ${rota.titulo}`;
  marcarLinkAtivo(caminho);
  rota.aoMontar?.(container, parametros);

  if (moverFoco) {
    // Leva o leitor de tela e o teclado para o novo conteúdo.
    window.scrollTo(0, 0);
    container.focus({ preventScroll: true });
  }
  document.dispatchEvent(new CustomEvent('rota:alterada', { detail: { caminho } }));
}

export function iniciarRoteador(elemento) {
  container = elemento;
  window.addEventListener('hashchange', () => {
    // Hashes que não são rotas (ex.: #conteudo do link "pular") são ignorados.
    const { hash } = window.location;
    if (hash && !hash.startsWith('#/')) return;
    renderizar();
  });
  renderizar({ moverFoco: false });
}
