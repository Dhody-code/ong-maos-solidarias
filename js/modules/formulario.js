// Comportamento do formulário de cadastro: máscaras, validação com feedback,
// rascunho automático e envio.

import {
  mascararCPF,
  mascararTelefone,
  mascararCEP,
  validarCampo,
  validarFormulario,
  apenasDigitos,
} from './validacao.js';
import { lerRascunho, salvarRascunho, limparRascunho } from './armazenamento.js';

const MASCARAS = { cpf: mascararCPF, telefone: mascararTelefone, cep: mascararCEP };

// Dados sensíveis (CPF, nascimento, CEP e endereço) nunca vão para o rascunho.
const CAMPOS_DO_RASCUNHO = ['nome', 'email', 'telefone', 'cidade', 'estado', 'apoio', 'areas', 'mensagem'];

export function lerDados(formulario) {
  const dados = Object.fromEntries(new FormData(formulario));
  dados.areas = new FormData(formulario).getAll('areas');
  return dados;
}

// Aplica a máscara sem jogar o cursor para o fim do campo: conta quantos
// dígitos havia antes do cursor e o reposiciona depois do mesmo dígito.
function aplicarMascara(controle, mascara) {
  const digitosAntesDoCursor = apenasDigitos(controle.value.slice(0, controle.selectionStart)).length;
  controle.value = mascara(controle.value);
  let posicao = 0;
  let contados = 0;
  while (posicao < controle.value.length && contados < digitosAntesDoCursor) {
    if (/\d/.test(controle.value[posicao])) contados += 1;
    posicao += 1;
  }
  if (digitosAntesDoCursor === apenasDigitos(controle.value).length) posicao = controle.value.length;
  controle.setSelectionRange(posicao, posicao);
}

function exibirErro(formulario, nome, mensagem) {
  const grupo = formulario.querySelector(`[data-campo="${nome}"]`);
  const saida = formulario.querySelector(`#erro-${nome}`);
  if (!grupo || !saida) return;
  saida.textContent = mensagem;
  grupo.classList.toggle('campo--erro', Boolean(mensagem));
  grupo.classList.toggle('campo--valido', !mensagem);
  formulario.querySelectorAll(`[name="${nome}"]`).forEach((controle) => {
    controle.setAttribute('aria-invalid', String(Boolean(mensagem)));
  });
}

function limparFeedback(formulario) {
  formulario.querySelectorAll('[data-campo]').forEach((grupo) => {
    grupo.classList.remove('campo--erro', 'campo--valido');
  });
  formulario.querySelectorAll('.campo__erro').forEach((saida) => {
    saida.textContent = '';
  });
  formulario.querySelectorAll('[aria-invalid]').forEach((controle) => controle.removeAttribute('aria-invalid'));
}

function validarUmCampo(formulario, nome) {
  const mensagem = validarCampo(nome, lerDados(formulario)[nome]);
  exibirErro(formulario, nome, mensagem);
  return mensagem;
}

function atualizarContador(formulario) {
  const mensagem = formulario.elements.mensagem;
  formulario.querySelector('#contador-mensagem').textContent =
    `${mensagem.value.length} de ${mensagem.maxLength} caracteres`;
}

function preencher(formulario, dados) {
  Object.entries(dados).forEach(([nome, valor]) => {
    const controles = formulario.querySelectorAll(`[name="${nome}"]`);
    controles.forEach((controle) => {
      if (controle.type === 'radio' || controle.type === 'checkbox') {
        controle.checked = [].concat(valor).includes(controle.value);
      } else {
        controle.value = valor;
      }
    });
  });
}

function guardarRascunho(formulario) {
  const dados = lerDados(formulario);
  const rascunho = {};
  CAMPOS_DO_RASCUNHO.forEach((nome) => {
    if (dados[nome] && dados[nome].length) rascunho[nome] = dados[nome];
  });
  salvarRascunho(rascunho);
}

function mostrarResumo(formulario, erros) {
  const resumo = document.querySelector('#resumo-erros');
  const total = Object.keys(erros).length;
  resumo.hidden = total === 0;
  if (total === 0) return;
  resumo.innerHTML = `<p><strong>${total === 1 ? 'Há 1 campo' : `Há ${total} campos`} para corrigir.</strong> Revise os campos destacados em vermelho.</p>`;
}

// opcoes = { areaInicial, aoEnviar(dados), aoRestaurar() }
export function iniciarFormulario(formulario, { areaInicial, aoEnviar, aoRestaurar } = {}) {
  const rascunho = lerRascunho();
  if (Object.keys(rascunho).length) {
    preencher(formulario, rascunho);
    aoRestaurar?.();
  }
  if (areaInicial) {
    const area = formulario.querySelector(`[name="areas"][value="${areaInicial}"]`);
    if (area) area.checked = true;
  }
  atualizarContador(formulario);

  let temporizador = null;

  // input: aplica a máscara, revalida campos que já estavam com erro e salva o rascunho.
  formulario.addEventListener('input', (evento) => {
    const { name } = evento.target;
    if (MASCARAS[name]) aplicarMascara(evento.target, MASCARAS[name]);
    if (name === 'mensagem') atualizarContador(formulario);
    const grupo = evento.target.closest('[data-campo]');
    if (grupo?.classList.contains('campo--erro')) validarUmCampo(formulario, grupo.dataset.campo);
    clearTimeout(temporizador);
    temporizador = setTimeout(() => guardarRascunho(formulario), 400);
  });

  // change: radios, checkboxes e select.
  formulario.addEventListener('change', (evento) => {
    const { name } = evento.target;
    if (['apoio', 'consentimento', 'estado'].includes(name)) validarUmCampo(formulario, name);
  });

  // focusout: valida o campo quando a pessoa sai dele.
  formulario.addEventListener('focusout', (evento) => {
    const { name, type } = evento.target;
    if (!name || type === 'radio' || type === 'checkbox' || name === 'mensagem' || name === 'areas') return;
    if (evento.target.value.trim() === '' && !evento.target.closest('.campo--erro')) return;
    validarUmCampo(formulario, name);
  });

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const dados = lerDados(formulario);
    const erros = validarFormulario(dados);
    Object.keys(lerRegras(formulario)).forEach((nome) => exibirErro(formulario, nome, erros[nome] ?? ''));
    mostrarResumo(formulario, erros);

    const primeiroComErro = Object.keys(erros)[0];
    if (primeiroComErro) {
      formulario.querySelector(`[name="${primeiroComErro}"]`).focus();
      return;
    }

    clearTimeout(temporizador);
    limparRascunho();
    aoEnviar?.({ ...dados, cpf: apenasDigitos(dados.cpf) });
  });

  formulario.addEventListener('reset', () => {
    clearTimeout(temporizador);
    limparRascunho();
    limparFeedback(formulario);
    mostrarResumo(formulario, {});
    setTimeout(() => atualizarContador(formulario), 0);
  });
}

// Campos presentes no formulário que possuem área de erro.
function lerRegras(formulario) {
  const nomes = {};
  formulario.querySelectorAll('[data-campo]').forEach((grupo) => {
    if (formulario.querySelector(`#erro-${grupo.dataset.campo}`)) nomes[grupo.dataset.campo] = true;
  });
  return nomes;
}
