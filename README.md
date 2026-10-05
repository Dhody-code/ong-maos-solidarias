# ONG Mãos Solidárias

Plataforma web de uma organização do terceiro setor: apresenta a ONG, divulga os
projetos sociais e recebe o cadastro de voluntários e doadores. É uma Single
Page Application feita com HTML, CSS e JavaScript puro, sem framework.

- **Site publicado:** https://dhody-code.github.io/ong-maos-solidarias/
- **Repositório:** https://github.com/Dhody-code/ong-maos-solidarias

> Projeto acadêmico da disciplina Desenvolvimento Front-End para Web. A ONG, os
> contatos e a chave PIX são fictícios, e os cadastros ficam salvos apenas no
> navegador de quem os preenche.

## Funcionalidades

- Navegação em página única por hash (`#/projetos`, `#/cadastro`), sem recarregar.
- Projetos gerados por templates a partir de dados, com filtro por categoria.
- Formulário com máscaras (CPF, telefone e CEP), validação com mensagens por
  campo, dígitos verificadores do CPF e idade mínima de 16 anos.
- Cadastros e rascunho do formulário guardados no `localStorage`. CPF, data de
  nascimento, CEP e endereço são validados, mas não são gravados.
- Gráfico de cadastros por forma de apoio (Chart.js, carregado só nessa tela).
- Três temas: claro, escuro e alto contraste.
- Layout responsivo com design system em variáveis CSS e grid de 12 colunas.

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Estrutura | HTML5 semântico |
| Estilo | CSS3 (variáveis, Grid, Flexbox), sem pré-processador |
| Comportamento | JavaScript (ES Modules), sem framework |
| Biblioteca | Chart.js 4.5.1 (cópia local em `js/vendor`) |
| Testes | `node:test`, o executor de testes do Node.js |
| Build | esbuild, html-minifier-terser e sharp |
| Deploy | GitHub Actions + GitHub Pages |

## Estrutura de pastas

```
.
├── html/index.html          página única da aplicação (casca da SPA)
├── index.html               redireciona para html/index.html
├── css/style.css            design system, layout, componentes e temas
├── imagens/                 logotipo e ilustrações (WebP e JPG)
├── js/
│   ├── main.js              ponto de entrada
│   ├── modules/             um módulo por responsabilidade
│   │   ├── roteador.js      rotas por hash e renderização
│   │   ├── templates.js     funções que geram o HTML
│   │   ├── paginas.js       liga cada rota a template, dados e eventos
│   │   ├── dados.js         projetos, categorias e estados
│   │   ├── validacao.js     máscaras e regras (funções puras)
│   │   ├── formulario.js    eventos e feedback do formulário
│   │   ├── armazenamento.js único acesso ao localStorage
│   │   ├── interface.js     menu, modal e aviso flutuante
│   │   ├── tema.js          temas claro, escuro e alto contraste
│   │   └── grafico.js       integração com o Chart.js
│   ├── vendor/              biblioteca de terceiros
│   └── testes/              testes automatizados
├── scripts/
│   ├── build.mjs            gera a versão de produção em dist/
│   └── servidor.mjs         servidor local sem dependências
└── .github/workflows/       CI (testes e build) e deploy
```

## Como executar

Requisito: [Node.js](https://nodejs.org/) 22 ou mais recente.

```bash
git clone https://github.com/Dhody-code/ong-maos-solidarias.git
cd ong-maos-solidarias
npm install
npm start
```

Abra http://localhost:8000/ no navegador.

Os módulos JavaScript só carregam por um servidor (http). Abrir
`html/index.html` com duplo clique mostra apenas um aviso.

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm start` | Serve o código-fonte em http://localhost:8000/ |
| `npm test` | Roda os 15 testes automatizados |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Serve a pasta `dist/` para conferir o build |

## Build de produção

`npm run build` cria a pasta `dist/` com:

- CSS minificado (`style.min.css`);
- os 11 arquivos JavaScript da aplicação unidos em um só e minificados (`app.min.js`);
- HTML minificado;
- imagens recomprimidas (o logotipo também é reduzido para 96 px).

Resultado do build (tamanho dos arquivos, sem contar a biblioteca Chart.js, que
já vem minificada):

| Grupo | Antes | Depois | Redução |
| --- | ---: | ---: | ---: |
| CSS | 23,9 kB | 17,5 kB | 27% |
| HTML | 4,4 kB | 3,7 kB | 18% |
| Imagens | 121,7 kB | 47,0 kB | 61% |
| JavaScript | 47,8 kB | 28,1 kB | 41% |
| **Total** | **197,8 kB** | **96,3 kB** | **51%** |

Medição com o Lighthouse (modo celular) na versão de produção, em servidor
local: desempenho 100, acessibilidade 100, boas práticas 100 e SEO 100, com LCP
de 1,3 s e CLS 0. A página inicial faz 6 requisições e transfere cerca de 61 kB.

## Deploy

O deploy é automático. A cada push na branch `main`, o workflow
`.github/workflows/deploy.yml` instala as dependências, roda os testes, executa
o build e publica a pasta `dist/` no GitHub Pages.

Configuração necessária uma única vez: em **Settings > Pages**, escolher
**GitHub Actions** em *Source*.

## Acessibilidade (WCAG 2.1, nível AA)

- **Teclado:** todas as funções funcionam sem mouse. Há link para pular ao
  conteúdo, foco sempre visível, submenu alcançável pelo Tab e modal que prende
  o foco, fecha com Esc e devolve o foco a quem o abriu.
- **Leitores de tela:** marcação semântica com regiões (`header`, `nav`, `main`,
  `footer`), título da página atualizado a cada rota, `aria-current` no link
  ativo, `aria-expanded` no menu, erros ligados aos campos por
  `aria-describedby` e avisos em regiões `role="status"` e `role="alert"`.
- **Contraste:** os três temas passam na verificação de contraste (mínimo de
  4,5:1). O tema inicial segue a preferência do sistema operacional e a escolha
  fica salva.
- **Adaptação:** sem rolagem horizontal em telas de 320 px, texto ampliável a
  200%, áreas de toque de 44 px e animações desligadas para quem usa
  `prefers-reduced-motion`.

Como foi verificado: auditoria automática com axe-core (39 combinações de tela,
tema e tamanho, nenhuma violação) e 31 verificações de teclado e foco com
Playwright. Ainda não foi feito teste manual com leitor de tela (NVDA ou
VoiceOver).

## Versionamento

O repositório segue o **GitFlow**:

| Branch | Uso |
| --- | --- |
| `main` | Versões publicadas. Cada merge gera uma tag e um deploy. |
| `develop` | Integração do que está em desenvolvimento. |
| `feature/*` | Uma funcionalidade por branch, criada a partir de `develop`. |
| `release/*` | Preparação de uma versão (número e changelog). |
| `hotfix/*` | Correção urgente feita a partir de `main`. |

Os commits seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/):
`tipo(escopo): descrição`, com os tipos `feat`, `fix`, `docs`, `refactor`,
`test`, `perf`, `build`, `ci` e `chore`.

As versões seguem o [Versionamento Semântico](https://semver.org/lang/pt-BR/) e
estão descritas no [CHANGELOG](CHANGELOG.md).

## Como contribuir

1. Crie uma branch a partir de `develop`: `git switch -c feature/minha-ideia develop`.
2. Faça commits pequenos, no padrão acima.
3. Rode `npm test` e `npm run build`.
4. Abra um pull request para `develop`. O workflow de CI roda os testes e o build.

## Créditos

- [Chart.js](https://www.chartjs.org/), licença MIT (texto em `js/vendor/chart.LICENSE.md`).
- Ilustrações criadas para este projeto.
