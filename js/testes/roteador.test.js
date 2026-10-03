// Testes da interpretação do hash. Executar com: npm test

import test from 'node:test';
import assert from 'node:assert/strict';
import { interpretarHash } from '../modules/roteador.js';

test('hash vazio ou que não é rota cai na página inicial', () => {
  assert.equal(interpretarHash('').caminho, '/');
  assert.equal(interpretarHash('#conteudo').caminho, '/');
  assert.equal(interpretarHash('#/').caminho, '/');
});

test('separa caminho e parâmetros', () => {
  const { caminho, parametros } = interpretarHash('#/cadastro?projeto=educacao');
  assert.equal(caminho, '/cadastro');
  assert.equal(parametros.get('projeto'), 'educacao');
});

test('barra no final não muda a rota', () => {
  assert.equal(interpretarHash('#/projetos/').caminho, '/projetos');
  assert.equal(interpretarHash('#/projetos/?secao=doacoes').caminho, '/projetos');
});
