// Camada única de acesso ao localStorage. Nenhum outro módulo chama
// localStorage diretamente: se o armazenamento mudar, só este arquivo muda.

const PREFIXO = 'maos-solidarias:';
const CHAVE_APOIADORES = `${PREFIXO}apoiadores`;
const CHAVE_RASCUNHO = `${PREFIXO}rascunho`;

function ler(chave, padrao) {
  try {
    const texto = localStorage.getItem(chave);
    return texto === null ? padrao : JSON.parse(texto);
  } catch (erro) {
    // Navegação privada, armazenamento bloqueado ou JSON corrompido.
    console.warn('Não foi possível ler o armazenamento local.', erro);
    return padrao;
  }
}

function gravar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (erro) {
    console.warn('Não foi possível gravar no armazenamento local.', erro);
    return false;
  }
}

function apagar(chave) {
  try {
    localStorage.removeItem(chave);
  } catch (erro) {
    console.warn('Não foi possível apagar do armazenamento local.', erro);
  }
}

/* ---------- Apoiadores cadastrados ---------- */

export function lerApoiadores() {
  const lista = ler(CHAVE_APOIADORES, []);
  return Array.isArray(lista) ? lista : [];
}

export function salvarApoiador(apoiador) {
  return gravar(CHAVE_APOIADORES, [...lerApoiadores(), apoiador]);
}

export function removerApoiador(id) {
  return gravar(CHAVE_APOIADORES, lerApoiadores().filter((apoiador) => apoiador.id !== id));
}

export function limparApoiadores() {
  apagar(CHAVE_APOIADORES);
}

/* ---------- Rascunho do formulário ---------- */

export function lerRascunho() {
  const rascunho = ler(CHAVE_RASCUNHO, {});
  return rascunho && typeof rascunho === 'object' ? rascunho : {};
}

export function salvarRascunho(dados) {
  return gravar(CHAVE_RASCUNHO, dados);
}

export function limparRascunho() {
  apagar(CHAVE_RASCUNHO);
}
