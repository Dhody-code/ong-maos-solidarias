// Integração com a biblioteca externa Chart.js (js/vendor/chart.umd.min.js).
// Este é o único módulo que conhece a biblioteca: o restante da aplicação
// chama apenas desenharGraficoDeApoio().

let grafico = null;

export function contarPorApoio(apoiadores) {
  return apoiadores.reduce((contagem, apoiador) => {
    contagem[apoiador.apoio] = (contagem[apoiador.apoio] ?? 0) + 1;
    return contagem;
  }, {});
}

export function desenharGraficoDeApoio(canvas, apoiadores) {
  // Remove o gráfico anterior: evita duplicatas e instâncias presas a um canvas que já saiu da tela.
  grafico?.destroy();
  grafico = null;

  // Se a biblioteca não carregou, a página continua funcionando sem o gráfico.
  if (!canvas || typeof window.Chart === 'undefined') return false;

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
