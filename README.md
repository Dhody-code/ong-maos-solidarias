# ONG Mãos Solidárias

Plataforma web de uma organização do terceiro setor: apresenta a ONG, divulga os
projetos sociais e recebe o cadastro de voluntários e doadores. É uma Single
Page Application feita com HTML, CSS e JavaScript puro.

Projeto acadêmico da disciplina Desenvolvimento Front-End para Web. A ONG e os
contatos são fictícios.

## Como abrir

Os módulos JavaScript só carregam por um servidor (http). Abrir o arquivo com
duplo clique mostra apenas um aviso. Use uma das opções:

- VS Code: extensão Live Server, botão "Go Live", e abra a pasta `html/`.
- Terminal, na raiz do projeto: `python -m http.server 8000` e acesse
  http://localhost:8000/

## Testes

Com o Node.js 22 ou mais recente instalado, na raiz do projeto:

    npm test

## Pastas

- `html/` - index.html, a página única da aplicação
- `css/` - style.css
- `imagens/` - logotipo e ilustrações
- `js/main.js` - ponto de entrada
- `js/modules/` - um módulo por responsabilidade
- `js/vendor/` - biblioteca Chart.js (cópia local)
- `js/testes/` - testes automatizados

As mudanças de cada versão estão no [CHANGELOG](CHANGELOG.md).
