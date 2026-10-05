// Seletor de tema: claro, escuro e alto contraste.
// O tema é um atributo data-tema no <html>; o CSS redefine as variáveis de cor.

import { lerTema, salvarTema } from './armazenamento.js';

export const TEMAS = ['claro', 'escuro', 'alto-contraste'];

// Sem escolha salva, segue a preferência do sistema operacional.
export function temaPreferido(salvo, consultar = (consulta) => window.matchMedia(consulta).matches) {
  if (TEMAS.includes(salvo)) return salvo;
  if (consultar('(prefers-contrast: more)')) return 'alto-contraste';
  if (consultar('(prefers-color-scheme: dark)')) return 'escuro';
  return 'claro';
}

export function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  // Avisa os módulos que dependem das cores (ex.: o gráfico).
  document.dispatchEvent(new CustomEvent('tema:alterado', { detail: { tema } }));
}

export function iniciarTema() {
  const seletor = document.querySelector('#tema');
  const tema = temaPreferido(lerTema());
  seletor.value = tema;
  aplicarTema(tema);

  seletor.addEventListener('change', () => {
    aplicarTema(seletor.value);
    salvarTema(seletor.value);
  });
}
