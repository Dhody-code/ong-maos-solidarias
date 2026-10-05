// Integração com a biblioteca externa Chart.js (js/vendor/chart.umd.min.js).
// Este é o único módulo que conhece a biblioteca: o restante da aplicação
// chama apenas desenharGraficoDeApoio().

const URL_DA_BIBLIOTECA = '../js/vendor/chart.umd.min.js';

let grafico = null;
let ultimoDesenho = null; // guarda canvas e dados para redesenhar ao trocar o tema
let carregamento = null;

// A biblioteca (cerca de 200 kB) só é baixada quando a tela do gráfico é aberta,
// e uma única vez. As outras páginas não pagam esse custo.
function carregarBiblioteca() {
  if (typeof window.Chart !== 'undefined') return Promise.resolve(true);
  carregamento ??= new Promise((resolver) => {
    const script = document.createElement('script');
    script.src = URL_DA_BIBLIOTECA;
    script.onload = () => resolver(true);
    script.onerror = () => {
      carregamento = null; // permite tentar de novo na próxima visita
      resolver(false);
    };
    document.head.append(script);
  });
  return carregamento;
}

export function contarPorApoio(apoiadores) {
  return apoiadores.reduce((contagem, apoiador) => {
    contagem[apoiador.apoio] = (contagem[apoiador.apoio] ?? 0) + 1;
    return contagem;
  }, {});
}

function destruirGrafico() {
  grafico?.destroy();
  grafico = null;
}

export async function desenharGraficoDeApoio(canvas, apoiadores) {
  // Remove o gráfico anterior: evita duplicatas e instâncias presas a um canvas que já saiu da tela.
  destruirGrafico();
  ultimoDesenho = canvas ? { canvas, apoiadores } : null;
  if (!canvas) return false;

  // Se a biblioteca não carregar, a página continua funcionando sem o gráfico
  // (os mesmos números aparecem em texto logo abaixo).
  if (!(await carregarBiblioteca())) return false;

  // Enquanto a biblioteca carregava, a rota pode ter mudado ou outro desenho pode ter começado.
  if (!canvas.isConnected || ultimoDesenho?.canvas !== canvas) return false;
  destruirGrafico();

  const contagem = contarPorApoio(apoiadores);
  const estilo = getComputedStyle(document.documentElement);
  const cor = (nome) => estilo.getPropertyValue(nome).trim();
  const semAnimacao = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  grafico = new window.Chart(canvas, {
    type: 'bar',
    data: {
      labels: Object.keys(contagem),
      datasets: [
        {
          label: 'Cadastros',
          data: Object.values(contagem),
          backgroundColor: cor('--cor-primaria'),
          hoverBackgroundColor: cor('--cor-primaria-escura'),
          borderRadius: 6,
          maxBarThickness: 64,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: semAnimacao ? false : { duration: 400 },
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: cor('--cor-neutra-900') } },
        y: { beginAtZero: true, ticks: { precision: 0, color: cor('--cor-neutra-700') } },
      },
    },
  });
  return true;
}

// As cores do gráfico vêm das variáveis CSS; ao trocar o tema ele é redesenhado.
document.addEventListener('tema:alterado', () => {
  if (ultimoDesenho?.canvas.isConnected) {
    desenharGraficoDeApoio(ultimoDesenho.canvas, ultimoDesenho.apoiadores);
  }
});
