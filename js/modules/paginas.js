// Define as rotas da SPA: qual template cada página usa e o que acontece
// depois que o HTML entra na tela.

import { PROJETOS, CATEGORIAS, ESTADOS, FORMAS_DE_APOIO } from './dados.js';
import {
  paginaInicio,
  paginaProjetos,
  paginaCadastro,
  paginaApoiadores,
  paginaNaoEncontrada,
  listaDeCartoes,
  conteudoModalPix,
} from './templates.js';
import { registrarRota, definirRotaNaoEncontrada, navegar, renderizar } from './roteador.js';
import { lerApoiadores, salvarApoiador, removerApoiador, limparApoiadores } from './armazenamento.js';
import { iniciarFormulario } from './formulario.js';
import { abrirModal, confirmar, mostrarToast } from './interface.js';
import { desenharGraficoDeApoio } from './grafico.js';

const filtrarProjetos = (categoria) =>
  categoria === 'Todos' ? PROJETOS : PROJETOS.filter((projeto) => projeto.categoria === categoria);

function abrirModalPix() {
  abrirModal({ titulo: 'Doação por PIX', conteudoHTML: conteudoModalPix() });
}

// Monta o registro que será salvo. Guarda só o necessário para contato:
// CPF, nascimento, CEP e endereço são validados, mas não ficam no navegador.
function montarApoiador(dados) {
  const rotuloDoApoio = FORMAS_DE_APOIO.find((forma) => forma.valor === dados.apoio)?.rotulo ?? dados.apoio;
  const areas = PROJETOS.filter((projeto) => dados.areas.includes(projeto.id)).map((projeto) => projeto.categoria);
  return {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    nome: dados.nome.trim(),
    email: dados.email.trim(),
    telefone: dados.telefone,
    cidade: dados.cidade.trim(),
    estado: dados.estado,
    apoio: rotuloDoApoio,
    areas,
    mensagem: dados.mensagem.trim(),
    criadoEm: new Date().toISOString(),
  };
}

export function registrarPaginas() {
  registrarRota('/', {
    titulo: 'Início',
    renderizar: () => paginaInicio(lerApoiadores().length),
    aoMontar(container) {
      container.querySelector('[data-acao="abrir-pix"]').addEventListener('click', abrirModalPix);
    },
  });

  registrarRota('/projetos', {
    titulo: 'Projetos',
    renderizar: () => paginaProjetos(PROJETOS, CATEGORIAS, 'Todos'),
    aoMontar(container, parametros) {
      // Links do submenu (#/projetos?secao=doacoes) rolam até a seção pedida.
      const secao = container.querySelector(`#${CSS.escape(parametros.get('secao') ?? 'inexistente')}`);
      if (secao) requestAnimationFrame(() => secao.scrollIntoView());

      const lista = container.querySelector('#lista-projetos');
      const resultado = container.querySelector('#resultado-filtro');

      // Delegação de eventos: um único ouvinte para todos os botões de filtro.
      container.querySelector('.filtros').addEventListener('click', (evento) => {
        const botao = evento.target.closest('[data-acao="filtrar"]');
        if (!botao) return;
        const projetos = filtrarProjetos(botao.dataset.categoria);
        lista.innerHTML = listaDeCartoes(projetos);
        container.querySelectorAll('.filtro').forEach((filtro) => {
          filtro.setAttribute('aria-pressed', String(filtro === botao));
        });
        resultado.textContent = `${projetos.length} ${projetos.length === 1 ? 'projeto exibido' : 'projetos exibidos'}.`;
      });

      container.querySelector('[data-acao="abrir-pix"]').addEventListener('click', abrirModalPix);
    },
  });

  registrarRota('/cadastro', {
    titulo: 'Cadastro',
    renderizar: () => paginaCadastro({ estados: ESTADOS, formasDeApoio: FORMAS_DE_APOIO, projetos: PROJETOS }),
    aoMontar(container, parametros) {
      iniciarFormulario(container.querySelector('#form-cadastro'), {
        areaInicial: parametros.get('projeto'),
        aoRestaurar: () => mostrarToast('Recuperamos o rascunho que você havia começado.'),
        aoEnviar(dados) {
          const salvo = salvarApoiador(montarApoiador(dados));
          if (!salvo) {
            mostrarToast('Não foi possível salvar o cadastro neste navegador.');
            return;
          }
          navegar('/apoiadores');
          mostrarToast('Cadastro enviado. Entraremos em contato em breve.');
        },
      });
    },
  });

  registrarRota('/apoiadores', {
    titulo: 'Cadastros salvos',
    renderizar: () => paginaApoiadores(lerApoiadores()),
    aoMontar(container) {
      desenharGraficoDeApoio(container.querySelector('#grafico-apoio'), lerApoiadores());

      // O ouvinte fica na seção (recriada a cada renderização), não no <main>,
      // para não acumular ouvintes a cada visita à página.
      container.querySelector('.secao').addEventListener('click', async (evento) => {
        const remover = evento.target.closest('[data-acao="remover-apoiador"]');
        const limpar = evento.target.closest('[data-acao="limpar-apoiadores"]');

        if (remover) {
          const confirmado = await confirmar('Remover cadastro', `Remover o cadastro de ${remover.dataset.nome}?`, 'Remover');
          if (!confirmado) return;
          removerApoiador(remover.dataset.id);
          renderizar();
          mostrarToast('Cadastro removido.');
        }

        if (limpar) {
          const confirmado = await confirmar('Remover todos', 'Remover todos os cadastros salvos neste navegador?', 'Remover todos');
          if (!confirmado) return;
          limparApoiadores();
          renderizar();
          mostrarToast('Todos os cadastros foram removidos.');
        }
      });
    },
  });

  definirRotaNaoEncontrada({ titulo: 'Página não encontrada', renderizar: paginaNaoEncontrada });
}
