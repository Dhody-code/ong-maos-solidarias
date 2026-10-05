// Testes da escolha de tema. Executar com: npm test

import test from 'node:test';
import assert from 'node:assert/strict';

// tema.js importa armazenamento.js, que só usa localStorage dentro das funções,
// então o módulo pode ser carregado no Node sem navegador.
const { temaPreferido } = await import('../modules/tema.js');

const sistema = (ativas) => (consulta) => ativas.includes(consulta);

test('tema salvo tem prioridade sobre o sistema', () => {
  assert.equal(temaPreferido('escuro', sistema([])), 'escuro');
  assert.equal(temaPreferido('claro', sistema(['(prefers-color-scheme: dark)'])), 'claro');
});

test('sem tema salvo, segue a preferência do sistema', () => {
  assert.equal(temaPreferido(null, sistema([])), 'claro');
  assert.equal(temaPreferido(null, sistema(['(prefers-color-scheme: dark)'])), 'escuro');
  assert.equal(temaPreferido(null, sistema(['(prefers-contrast: more)', '(prefers-color-scheme: dark)'])), 'alto-contraste');
});

test('valor inválido salvo é ignorado', () => {
  assert.equal(temaPreferido('roxo', sistema([])), 'claro');
});
