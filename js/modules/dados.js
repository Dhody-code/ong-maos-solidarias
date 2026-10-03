// Dados usados pelos templates. Em um sistema real viriam de uma API.

export const PROJETOS = [
  {
    id: 'educacao',
    titulo: 'Educar para Transformar',
    categoria: 'Educação',
    imagem: 'projeto-educacao',
    alt: 'Ilustração de um livro aberto, símbolo do projeto de reforço escolar',
    descricao: 'Reforço escolar e oficinas de leitura para crianças e adolescentes.',
    situacao: { texto: 'Vagas abertas', tipo: 'sucesso' },
  },
  {
    id: 'alimentacao',
    titulo: 'Mesa Cheia',
    categoria: 'Alimentação',
    imagem: 'projeto-alimentacao',
    alt: 'Ilustração de uma cesta com alimentos, símbolo do projeto de distribuição de cestas básicas',
    descricao: 'Arrecadação e entrega mensal de cestas básicas a famílias cadastradas.',
    situacao: { texto: 'Mais procurado', tipo: 'destaque' },
  },
  {
    id: 'capacitacao',
    titulo: 'Futuro Profissional',
    categoria: 'Capacitação',
    imagem: 'projeto-capacitacao',
    alt: 'Ilustração de um computador portátil, símbolo do projeto de capacitação profissional',
    descricao: 'Cursos gratuitos de informática e preparação para o mercado de trabalho.',
    situacao: null,
  },
];

export const CATEGORIAS = ['Todos', ...new Set(PROJETOS.map((projeto) => projeto.categoria))];

export const FORMAS_DE_APOIO = [
  { valor: 'voluntario', rotulo: 'Voluntário' },
  { valor: 'doador', rotulo: 'Doador' },
  { valor: 'ambos', rotulo: 'Ambos' },
];

export const ESTADOS = [
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'],
  ['BA', 'Bahia'], ['CE', 'Ceará'], ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'],
  ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'], ['MS', 'Mato Grosso do Sul'],
  ['MG', 'Minas Gerais'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'],
  ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'],
  ['RS', 'Rio Grande do Sul'], ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'],
  ['SP', 'São Paulo'], ['SE', 'Sergipe'], ['TO', 'Tocantins'],
];
