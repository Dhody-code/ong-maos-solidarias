// Ponto de entrada da aplicação: apenas liga os módulos entre si.

import { iniciarRoteador } from './modules/roteador.js';
import { registrarPaginas } from './modules/paginas.js';
import { iniciarMenu, iniciarModal, iniciarToast } from './modules/interface.js';
import { iniciarTema } from './modules/tema.js';

function iniciar() {
  iniciarTema();
  iniciarMenu();
  iniciarModal();
  iniciarToast();
  registrarPaginas();
  iniciarRoteador(document.querySelector('#conteudo'));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciar);
} else {
  iniciar();
}
