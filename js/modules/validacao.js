// Máscaras e regras de validação. Funções puras: não acessam o DOM,
// por isso podem ser testadas fora do navegador (ver js/testes).

export const apenasDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

/* ---------- Máscaras ---------- */

export function mascararCPF(valor) {
  const d = apenasDigitos(valor).slice(0, 11);
  const blocos = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean).join('.');
  return d.length > 9 ? `${blocos}-${d.slice(9)}` : blocos;
}

export function mascararTelefone(valor) {
  const d = apenasDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  const ddd = d.slice(0, 2);
  const numero = d.slice(2);
  if (numero.length <= 4) return `(${ddd}) ${numero}`;
  const corte = numero.length === 9 ? 5 : 4;
  return `(${ddd}) ${numero.slice(0, corte)}-${numero.slice(corte)}`;
}

export function mascararCEP(valor) {
  const d = apenasDigitos(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/* ---------- Regras ---------- */
// Cada regra devolve '' quando o valor é válido ou a mensagem de erro.

export function validarNome(valor) {
  const nome = String(valor ?? '').trim();
  if (!nome) return 'Informe seu nome completo.';
  if (nome.split(/\s+/).length < 2) return 'Informe nome e sobrenome.';
  if (nome.length < 5) return 'O nome está curto demais.';
  return '';
}

export function validarEmail(valor) {
  const email = String(valor ?? '').trim();
  if (!email) return 'Informe seu e-mail.';
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? '' : 'Informe um e-mail válido, como nome@exemplo.com.';
}

// Confere os dois dígitos verificadores do CPF.
export function cpfEhValido(valor) {
  const d = apenasDigitos(valor);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digito = (quantidade) => {
    let soma = 0;
    for (let i = 0; i < quantidade; i += 1) soma += Number(d[i]) * (quantidade + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
}

export function validarCPF(valor) {
  const d = apenasDigitos(valor);
  if (!d) return 'Informe seu CPF.';
  if (d.length !== 11) return 'O CPF deve ter 11 números.';
  return cpfEhValido(d) ? '' : 'CPF inválido. Confira os números digitados.';
}

export function validarTelefone(valor) {
  const d = apenasDigitos(valor);
  if (!d) return 'Informe seu telefone.';
  return d.length === 10 || d.length === 11 ? '' : 'Informe o telefone com DDD, como (11) 91234-5678.';
}

export function validarCEP(valor) {
  const d = apenasDigitos(valor);
  if (!d) return 'Informe seu CEP.';
  return d.length === 8 ? '' : 'O CEP deve ter 8 números, como 01310-100.';
}

export function calcularIdade(dataISO, hoje = new Date()) {
  const [ano, mes, dia] = String(dataISO).split('-').map(Number);
  let idade = hoje.getFullYear() - ano;
  const aindaNaoFezAniversario =
    hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia);
  if (aindaNaoFezAniversario) idade -= 1;
  return idade;
}

export function validarNascimento(valor, hoje = new Date()) {
  if (!valor) return 'Informe sua data de nascimento.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || Number.isNaN(new Date(valor).getTime())) {
    return 'Data inválida.';
  }
  const idade = calcularIdade(valor, hoje);
  if (idade < 0) return 'A data de nascimento não pode estar no futuro.';
  if (idade > 120) return 'Confira o ano de nascimento.';
  if (idade < 16) return 'É preciso ter pelo menos 16 anos para se cadastrar.';
  return '';
}

const obrigatorio = (mensagem) => (valor) => (String(valor ?? '').trim() ? '' : mensagem);

// Liga o atributo name de cada campo à sua regra.
export const REGRAS = {
  nome: validarNome,
  email: validarEmail,
  cpf: validarCPF,
  telefone: validarTelefone,
  nascimento: validarNascimento,
  cep: validarCEP,
  endereco: obrigatorio('Informe seu endereço.'),
  cidade: obrigatorio('Informe sua cidade.'),
  estado: obrigatorio('Selecione seu estado.'),
  apoio: obrigatorio('Escolha como deseja apoiar.'),
  consentimento: obrigatorio('É preciso autorizar o uso dos dados para enviar.'),
};

export function validarCampo(nome, valor) {
  const regra = REGRAS[nome];
  return regra ? regra(valor) : '';
}

// Recebe um objeto { campo: valor } e devolve só os campos com erro.
export function validarFormulario(dados) {
  const erros = {};
  Object.keys(REGRAS).forEach((nome) => {
    const mensagem = validarCampo(nome, dados[nome]);
    if (mensagem) erros[nome] = mensagem;
  });
  return erros;
}
