# Changelog

Todas as mudanças relevantes deste projeto ficam registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e as versões seguem o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.1.0] - 2026-10-05

### Adicionado

- Temas escuro e de alto contraste, com seletor no topo da página. A escolha
  fica salva e, sem escolha, o site segue a preferência do sistema.
- Script de build (`npm run build`) com minificação de CSS, JavaScript e HTML e
  recompressão das imagens.
- Servidor local sem dependências (`npm start`).
- Workflows do GitHub Actions: testes e build nos pull requests e deploy
  automático no GitHub Pages.
- README com instalação, uso, build, deploy, acessibilidade e versionamento.

### Alterado

- O Chart.js passou a ser carregado só quando a tela do gráfico é aberta.
- O grid usa uma coluna em telas estreitas e 12 colunas a partir de 576 px.

### Corrigido

- O foco do teclado não entrava no modal ao abri-lo.
- Rolagem horizontal no formulário em telas de 320 px.
- Campos obrigatórios não eram anunciados como obrigatórios por leitores de tela.
- Links "Quero participar" e botões "Remover" tinham o mesmo nome para leitores
  de tela.

## [1.0.1] - 2026-10-05

### Corrigido

- O rodapé mudava de posição durante o carregamento da página (layout shift).
- Erro 404 no console por falta do ícone do site (favicon).

## [1.0.0] - 2026-10-05

### Adicionado

- Páginas em HTML semântico: início, projetos e cadastro.
- Design system em variáveis CSS, grid de 12 colunas e componentes responsivos.
- Single Page Application com roteador por hash e sistema de templates.
- Formulário com máscaras, validação e mensagens de erro por campo.
- Cadastros e rascunho do formulário salvos no `localStorage`.
- Gráfico de cadastros por forma de apoio com Chart.js.
- Testes automatizados das regras de validação e do roteador.
