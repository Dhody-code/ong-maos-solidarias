// Componentes de interface controlados por JavaScript: menu, modal e aviso flutuante.

import { escaparHTML } from './templates.js';

/* ---------- Menu hambúrguer ---------- */

export function iniciarMenu() {
  const botao = document.querySelector('#menu-botao');
  const menu = document.querySelector('#menu');

  const definirAberto = (aberto) => {
    menu.classList.toggle('menu--aberto', aberto);
    botao.setAttribute('aria-expanded', String(aberto));
  };

  botao.addEventListener('click', () => {
    definirAberto(botao.getAttribute('aria-expanded') !== 'true');
  });

  // Fecha ao trocar de página e ao pressionar Esc.
  document.addEventListener('rota:alterada', () => definirAberto(false));
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && botao.getAttribute('aria-expanded') === 'true') {
      definirAberto(false);
      botao.focus();
    }
  });
}

/* ---------- Modal ---------- */

const FOCAVEIS = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
let elementoAnterior = null;
let aoFecharModal = null;

// Com o modal aberto, o restante da página fica inerte: não recebe foco,
// clique nem é lido pelo leitor de tela.
function definirFundoInerte(inerte) {
  document.querySelectorAll('body > :not(#modal):not(#toast):not(script)').forEach((elemento) => {
    elemento.inert = inerte;
  });
}

function prenderFoco(evento) {
  const modal = document.querySelector('#modal');
  if (evento.key === 'Escape') {
    fecharModal(false);
    return;
  }
  if (evento.key !== 'Tab') return;
  const focaveis = [...modal.querySelectorAll(FOCAVEIS)];
  const primeiro = focaveis[0];
  const ultimo = focaveis[focaveis.length - 1];
  if (evento.shiftKey && document.activeElement === primeiro) {
    evento.preventDefault();
    ultimo.focus();
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault();
    primeiro.focus();
  }
}

export function fecharModal(resultado = false) {
  const modal = document.querySelector('#modal');
  if (!modal.classList.contains('modal--aberto')) return;
  modal.classList.remove('modal--aberto');
  modal.setAttribute('aria-hidden', 'true');
  definirFundoInerte(false);
  document.body.classList.remove('sem-rolagem');
  document.removeEventListener('keydown', prenderFoco);
  elementoAnterior?.focus();
  aoFecharModal?.(resultado);
  aoFecharModal = null;
}

// acoes = [{ rotulo, classe, valor }]. Devolve uma Promise com o valor do botão clicado.
export function abrirModal({ titulo, conteudoHTML, acoes = [{ rotulo: 'Entendi', classe: 'botao--primario', valor: true }] }) {
  const modal = document.querySelector('#modal');
  elementoAnterior = document.activeElement;

  modal.querySelector('#modal-titulo').textContent = titulo;
  modal.querySelector('#modal-conteudo').innerHTML = conteudoHTML;
  modal.querySelector('#modal-acoes').innerHTML = acoes
    .map(
      (acao, indice) =>
        `<button class="botao ${acao.classe}" type="button" data-indice="${indice}">${escaparHTML(acao.rotulo)}</button>`,
    )
    .join('');

  modal.classList.add('modal--aberto');
  modal.setAttribute('aria-hidden', 'false');
  definirFundoInerte(true);
  document.body.classList.add('sem-rolagem'); // a página ao fundo não rola
  document.addEventListener('keydown', prenderFoco);
  modal.querySelector('#modal-acoes button').focus();

  return new Promise((resolver) => {
    aoFecharModal = resolver;
    modal.querySelector('#modal-acoes').onclick = (evento) => {
      const botao = evento.target.closest('button[data-indice]');
      if (botao) fecharModal(acoes[Number(botao.dataset.indice)].valor);
    };
  });
}

export function confirmar(titulo, mensagem, rotuloConfirmar = 'Confirmar') {
  return abrirModal({
    titulo,
    conteudoHTML: `<p>${escaparHTML(mensagem)}</p>`,
    acoes: [
      { rotulo: 'Cancelar', classe: 'botao--contorno', valor: false },
      { rotulo: rotuloConfirmar, classe: 'botao--primario', valor: true },
    ],
  });
}

export function iniciarModal() {
  const modal = document.querySelector('#modal');
  modal.addEventListener('click', (evento) => {
    // Fecha no botão "X" ou ao clicar no fundo escuro.
    if (evento.target === modal || evento.target.closest('[data-acao="fechar-modal"]')) {
      fecharModal(false);
    }
  });
}

/* ---------- Aviso flutuante (toast) ---------- */

let temporizador = null;

let duracaoAtual = 6000;

function agendarFechamento() {
  clearTimeout(temporizador);
  temporizador = setTimeout(esconderToast, duracaoAtual);
}

export function mostrarToast(mensagem, duracao = 6000) {
  const toast = document.querySelector('#toast');
  toast.querySelector('#toast-mensagem').textContent = mensagem;
  toast.classList.add('toast--visivel');
  duracaoAtual = duracao;
  agendarFechamento();
}

export function esconderToast() {
  document.querySelector('#toast').classList.remove('toast--visivel');
}

export function iniciarToast() {
  const toast = document.querySelector('#toast');
  document.querySelector('#toast-fechar').addEventListener('click', esconderToast);

  // O aviso não some enquanto o mouse ou o foco do teclado estiver sobre ele,
  // para dar tempo de leitura a quem precisa.
  ['mouseenter', 'focusin'].forEach((tipo) => toast.addEventListener(tipo, () => clearTimeout(temporizador)));
  ['mouseleave', 'focusout'].forEach((tipo) => toast.addEventListener(tipo, agendarFechamento));
}
