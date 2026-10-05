// Testes automatizados das máscaras e regras de validação.
// Executar na raiz do projeto com: npm test  (ou: node --test js/testes/validacao.test.js)

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mascararCPF,
  mascararTelefone,
  mascararCEP,
  cpfEhValido,
  validarCPF,
  validarNome,
  validarEmail,
  validarTelefone,
  validarCEP,
  validarNascimento,
  calcularIdade,
  validarFormulario,
} from '../modules/validacao.js';

test('máscara de CPF formata durante a digitação', () => {
  assert.equal(mascararCPF('123'), '123');
  assert.equal(mascararCPF('1234'), '123.4');
  assert.equal(mascararCPF('1234567'), '123.456.7');
  assert.equal(mascararCPF('52998224725'), '529.982.247-25');
  assert.equal(mascararCPF('529.982.247-25999'), '529.982.247-25');
  assert.equal(mascararCPF('abc'), '');
});

test('máscara de telefone aceita fixo e celular', () => {
  assert.equal(mascararTelefone(''), '');
  assert.equal(mascararTelefone('11'), '(11');
  assert.equal(mascararTelefone('1198'), '(11) 98');
  assert.equal(mascararTelefone('1133334444'), '(11) 3333-4444');
  assert.equal(mascararTelefone('11912345678'), '(11) 91234-5678');
});

test('máscara de CEP', () => {
  assert.equal(mascararCEP('01310'), '01310');
  assert.equal(mascararCEP('01310100'), '01310-100');
  assert.equal(mascararCEP('01310-1009'), '01310-100');
});

test('CPF: confere os dígitos verificadores', () => {
  assert.equal(cpfEhValido('529.982.247-25'), true);
  assert.equal(cpfEhValido('529.982.247-26'), false);
  assert.equal(cpfEhValido('111.111.111-11'), false);
  assert.equal(validarCPF(''), 'Informe seu CPF.');
  assert.equal(validarCPF('123'), 'O CPF deve ter 11 números.');
  assert.equal(validarCPF('529.982.247-25'), '');
});

test('nome exige nome e sobrenome', () => {
  assert.notEqual(validarNome(''), '');
  assert.notEqual(validarNome('Maria'), '');
  assert.equal(validarNome('Maria Silva'), '');
});

test('e-mail', () => {
  assert.notEqual(validarEmail('maria'), '');
  assert.notEqual(validarEmail('maria@exemplo'), '');
  assert.equal(validarEmail('maria@exemplo.com'), '');
});

test('telefone e CEP', () => {
  assert.notEqual(validarTelefone('(11) 9123'), '');
  assert.equal(validarTelefone('(11) 91234-5678'), '');
  assert.notEqual(validarCEP('0131'), '');
  assert.equal(validarCEP('01310-100'), '');
});

test('data de nascimento: idade mínima de 16 anos', () => {
  const hoje = new Date(2026, 9, 3); // 03/10/2026
  assert.equal(calcularIdade('2010-10-03', hoje), 16);
  assert.equal(calcularIdade('2010-10-04', hoje), 15);
  assert.equal(validarNascimento('2010-10-03', hoje), '');
  assert.notEqual(validarNascimento('2010-10-04', hoje), '');
  assert.notEqual(validarNascimento('2030-01-01', hoje), '');
  assert.notEqual(validarNascimento('', hoje), '');
});

test('validarFormulario devolve apenas os campos com erro', () => {
  const dados = {
    nome: 'Maria Silva',
    email: 'maria@exemplo.com',
    cpf: '529.982.247-25',
    telefone: '(11) 91234-5678',
    nascimento: '1990-05-20',
    cep: '01310-100',
    endereco: 'Rua da Esperança, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    apoio: 'voluntario',
    consentimento: 'sim',
  };
  assert.deepEqual(validarFormulario(dados), {});
  const erros = validarFormulario({ ...dados, email: 'x', consentimento: undefined });
  assert.deepEqual(Object.keys(erros), ['email', 'consentimento']);
});
