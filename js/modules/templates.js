// Sistema de templates: cada função recebe dados e devolve uma string de HTML.
// Componentes pequenos (etiqueta, cartão, campo) são reaproveitados pelas páginas.

const CARACTERES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

// Todo texto que vem do usuário passa por aqui antes de entrar no HTML.
export function escaparHTML(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (caractere) => CARACTERES[caractere]);
}

const IMAGENS = '../imagens';

/* ---------- Componentes ---------- */

export function etiqueta(texto, tipo = '') {
  const classe = tipo ? `etiqueta etiqueta--${tipo}` : 'etiqueta';
  return `<span class="${classe}">${escaparHTML(texto)}</span>`;
}

export function alerta(tipo, conteudoHTML) {
  return `<div class="alerta alerta--${tipo}" role="note"><p>${conteudoHTML}</p></div>`;
}

export function cartaoProjeto(projeto) {
  const situacao = projeto.situacao ? etiqueta(projeto.situacao.texto, projeto.situacao.tipo) : '';
  return `
    <article class="cartao col-md-6 col-lg-4">
      <picture>
        <source srcset="${IMAGENS}/${projeto.imagem}.webp" type="image/webp">
        <img class="cartao__imagem" src="${IMAGENS}/${projeto.imagem}.jpg" alt="${escaparHTML(projeto.alt)}" width="600" height="400">
      </picture>
      <div class="cartao__corpo">
        <div class="etiquetas">${etiqueta(projeto.categoria)}${situacao}</div>
        <h3>${escaparHTML(projeto.titulo)}</h3>
        <p>${escaparHTML(projeto.descricao)}</p>
        <div class="cartao__acoes">
          <a class="botao botao--contorno" href="#/cadastro?projeto=${projeto.id}">Quero participar<span class="sr-only"> do projeto ${escaparHTML(projeto.titulo)}</span></a>
        </div>
      </div>
    </article>`;
}

export function listaDeCartoes(projetos) {
  if (!projetos.length) {
    return '<p class="vazio">Nenhum projeto nesta categoria no momento.</p>';
  }
  return projetos.map(cartaoProjeto).join('');
}

export function botoesDeFiltro(categorias, ativa) {
  return categorias
    .map(
      (categoria) => `
      <button class="filtro" type="button" data-acao="filtrar" data-categoria="${escaparHTML(categoria)}"
        aria-pressed="${categoria === ativa}">${escaparHTML(categoria)}</button>`,
    )
    .join('');
}

function campo({ id, rotulo, coluna = '', controle, dica = '' }) {
  return `
    <div class="campo ${coluna}" data-campo="${id}">
      <label for="${id}">${rotulo}</label>
      ${controle}
      ${dica ? `<span class="campo__dica" id="dica-${id}">${dica}</span>` : ''}
      <span class="campo__erro" id="erro-${id}"></span>
    </div>`;
}

function entrada(id, tipo, atributos = '') {
  return `<input type="${tipo}" id="${id}" name="${id}" aria-describedby="erro-${id}" ${atributos}>`;
}

function cartaoApoiador(apoiador) {
  const data = new Date(apoiador.criadoEm).toLocaleDateString('pt-BR');
  const areas = (apoiador.areas ?? []).map((area) => etiqueta(area)).join('');
  return `
    <li class="cartao col-md-6 col-lg-4">
      <div class="cartao__corpo">
        <div class="etiquetas">${etiqueta(apoiador.apoio, 'destaque')}${areas}</div>
        <h3>${escaparHTML(apoiador.nome)}</h3>
        <p>${escaparHTML(apoiador.email)}<br>${escaparHTML(apoiador.telefone)}</p>
        <p>${escaparHTML(apoiador.cidade)}/${escaparHTML(apoiador.estado)} · cadastro em ${data}</p>
        <div class="cartao__acoes">
          <button class="botao botao--contorno" type="button" data-acao="remover-apoiador"
            data-id="${escaparHTML(apoiador.id)}" data-nome="${escaparHTML(apoiador.nome)}">Remover<span class="sr-only"> o cadastro de ${escaparHTML(apoiador.nome)}</span></button>
        </div>
      </div>
    </li>`;
}

/* ---------- Páginas ---------- */

export function paginaInicio(totalDeApoiadores) {
  const contador =
    totalDeApoiadores > 0
      ? `<strong>${totalDeApoiadores}</strong> ${totalDeApoiadores === 1 ? 'cadastro salvo' : 'cadastros salvos'} neste navegador. <a href="#/apoiadores">Ver cadastros</a>`
      : 'Ainda não há cadastros salvos neste navegador. <a href="#/cadastro">Seja o primeiro</a>.';
  return `
    <section class="hero">
      <div class="container">
        <h1>ONG Mãos Solidárias</h1>
        <p class="hero__texto">Apoiamos famílias em situação de vulnerabilidade social com educação, alimentação e cidadania.</p>
        <div class="hero__acoes">
          <a class="botao botao--destaque" href="#/cadastro">Quero ser voluntário</a>
          <button class="botao botao--contorno" type="button" data-acao="abrir-pix">Como doar</button>
        </div>
      </div>
    </section>

    <section class="secao secao--clara">
      <div class="container grade grade--centro">
        <div class="col-lg-6">
          <h2>Quem somos</h2>
          <p>A ONG Mãos Solidárias é uma organização sem fins lucrativos que apoia famílias em situação de vulnerabilidade social, promovendo educação, alimentação e cidadania.</p>
          ${alerta('info', contador)}
        </div>
        <picture class="col-lg-6">
          <source srcset="${IMAGENS}/voluntarios.webp" type="image/webp">
          <img src="${IMAGENS}/voluntarios.jpg" alt="Ilustração de cinco pessoas de mãos dadas sob um coração, representando a união dos voluntários da ONG" width="800" height="450">
        </picture>
      </div>
    </section>

    <section class="secao">
      <div class="container">
        <h2>Missão, visão e valores</h2>
        <div class="grade">
          ${[
            ['Missão', 'Transformar realidades por meio de projetos sociais e do trabalho voluntário.'],
            ['Visão', 'Ser referência regional em ações de impacto social sustentável.'],
            ['Valores', 'Solidariedade, transparência, respeito e compromisso com a comunidade.'],
          ]
            .map(
              ([titulo, texto]) => `
          <article class="cartao col-md-6 col-lg-4">
            <div class="cartao__corpo"><h3>${titulo}</h3><p>${texto}</p></div>
          </article>`,
            )
            .join('')}
        </div>
      </div>
    </section>`;
}

export function paginaProjetos(projetos, categorias, categoriaAtiva) {
  return `
    <section class="hero">
      <div class="container">
        <h1>Projetos sociais</h1>
        <p class="hero__texto">Conheça nossas frentes de atuação e escolha como participar.</p>
      </div>
    </section>

    <section class="secao">
      <div class="container">
        <h2>Nossos projetos</h2>
        <div class="filtros" role="group" aria-label="Filtrar projetos por categoria">
          ${botoesDeFiltro(categorias, categoriaAtiva)}
        </div>
        <p class="sr-only" id="resultado-filtro" role="status"></p>
        <div class="grade" id="lista-projetos">${listaDeCartoes(projetos)}</div>
      </div>
    </section>

    <section class="secao secao--clara">
      <div class="container grade">
        <div class="col-lg-6" id="voluntariado">
          <h2>Voluntariado</h2>
          <p>Qualquer pessoa com 16 anos ou mais pode doar parte do seu tempo aos nossos projetos.</p>
          <ol class="passos">
            <li>Escolha o projeto com o qual deseja colaborar.</li>
            <li><span>Preencha o <a href="#/cadastro">formulário de cadastro</a>.</span></li>
            <li>Aguarde o contato da equipe para a reunião de integração.</li>
          </ol>
        </div>
        <div class="col-lg-6" id="doacoes">
          <h2>Doações</h2>
          <p>Sua contribuição mantém os projetos em funcionamento.</p>
          <ul>
            <li><strong>PIX:</strong> chave doacoes@maossolidarias.org.br</li>
            <li><strong>Transferência bancária:</strong> dados enviados após o cadastro.</li>
            <li><strong>Doação de itens:</strong> alimentos, livros e material escolar em nossa sede.</li>
          </ul>
          <button class="botao botao--primario" type="button" data-acao="abrir-pix">Ver instruções do PIX</button>
        </div>
      </div>
    </section>`;
}

export function conteudoModalPix() {
  return `
    <ol class="passos">
      <li>Abra o aplicativo do seu banco e escolha a opção PIX.</li>
      <li>Informe a chave doacoes@maossolidarias.org.br.</li>
      <li>Confira o nome da ONG e confirme o valor.</li>
    </ol>
    ${alerta('sucesso', 'Toda doação é registrada e divulgada em nossa prestação de contas.')}`;
}

export function paginaCadastro({ estados, formasDeApoio, projetos }) {
  const opcoesDeEstado = estados
    .map(([sigla, nome]) => `<option value="${sigla}">${nome}</option>`)
    .join('');
  const radios = formasDeApoio
    .map(
      ({ valor, rotulo }) =>
        `<label class="opcao"><input type="radio" name="apoio" value="${valor}" required> ${rotulo}</label>`,
    )
    .join('');
  const areas = projetos
    .map(
      (projeto) =>
        `<label class="opcao"><input type="checkbox" name="areas" value="${projeto.id}"> ${escaparHTML(projeto.categoria)}</label>`,
    )
    .join('');

  return `
    <section class="hero">
      <div class="container">
        <h1>Cadastro de apoiadores</h1>
        <p class="hero__texto">Faça parte da ONG Mãos Solidárias como voluntário ou doador.</p>
      </div>
    </section>

    <section class="secao">
      <div class="container">
        <h2>Preencha seus dados</h2>
        ${alerta('aviso', 'Campos marcados com * são obrigatórios. Esta é uma demonstração: o cadastro fica salvo apenas neste navegador.')}
        <div id="resumo-erros" class="alerta alerta--erro" role="alert" tabindex="-1" hidden></div>

        <form class="formulario" id="form-cadastro" novalidate>
          <fieldset>
            <legend>Dados pessoais</legend>
            <div class="grade">
              ${campo({ id: 'nome', rotulo: 'Nome completo *', coluna: 'col-md-6', controle: entrada('nome', 'text', 'autocomplete="name" maxlength="100" required') })}
              ${campo({ id: 'email', rotulo: 'E-mail *', coluna: 'col-md-6', controle: entrada('email', 'email', 'autocomplete="email" placeholder="nome@exemplo.com" required') })}
              ${campo({ id: 'cpf', rotulo: 'CPF *', coluna: 'col-md-4', controle: entrada('cpf', 'text', 'inputmode="numeric" placeholder="000.000.000-00" maxlength="14" required') })}
              ${campo({ id: 'telefone', rotulo: 'Telefone *', coluna: 'col-md-4', controle: entrada('telefone', 'tel', 'autocomplete="tel" placeholder="(11) 91234-5678" maxlength="15" required') })}
              ${campo({ id: 'nascimento', rotulo: 'Data de nascimento *', coluna: 'col-md-4', controle: entrada('nascimento', 'date', 'autocomplete="bday" required') })}
            </div>
          </fieldset>

          <fieldset>
            <legend>Endereço</legend>
            <div class="grade">
              ${campo({ id: 'cep', rotulo: 'CEP *', coluna: 'col-md-4', controle: entrada('cep', 'text', 'inputmode="numeric" autocomplete="postal-code" placeholder="00000-000" maxlength="9" required') })}
              ${campo({ id: 'endereco', rotulo: 'Endereço *', coluna: 'col-md-8', controle: entrada('endereco', 'text', 'autocomplete="address-line1" placeholder="Rua, número e complemento" maxlength="120" required') })}
              ${campo({ id: 'cidade', rotulo: 'Cidade *', coluna: 'col-md-8', controle: entrada('cidade', 'text', 'autocomplete="address-level2" maxlength="60" required') })}
              ${campo({
                id: 'estado',
                rotulo: 'Estado *',
                coluna: 'col-md-4',
                controle: `<select id="estado" name="estado" autocomplete="address-level1" aria-describedby="erro-estado" required><option value="">Selecione</option>${opcoesDeEstado}</select>`,
              })}
            </div>
          </fieldset>

          <fieldset data-campo="apoio" aria-describedby="erro-apoio">
            <legend>Como deseja apoiar *</legend>
            <div class="opcoes">${radios}</div>
            <span class="campo__erro" id="erro-apoio"></span>
            <p>Áreas de interesse:</p>
            <div class="opcoes">${areas}</div>
            <div class="campo" data-campo="mensagem">
              <label for="mensagem">Mensagem (opcional)</label>
              <textarea id="mensagem" name="mensagem" rows="4" maxlength="500" aria-describedby="contador-mensagem"></textarea>
              <span class="campo__dica" id="contador-mensagem">0 de 500 caracteres</span>
            </div>
          </fieldset>

          <fieldset data-campo="consentimento">
            <legend>Consentimento</legend>
            <label class="opcao"><input type="checkbox" name="consentimento" value="sim" aria-describedby="erro-consentimento" required> Autorizo o uso dos meus dados para contato pela ONG. *</label>
            <span class="campo__erro" id="erro-consentimento"></span>
          </fieldset>

          <div class="formulario__acoes">
            <button class="botao botao--primario" type="submit">Enviar cadastro</button>
            <button class="botao botao--contorno" type="reset">Limpar</button>
          </div>
        </form>
      </div>
    </section>`;
}

// Versão em texto do gráfico, para quem não vê o canvas.
function resumoPorApoio(apoiadores) {
  const contagem = {};
  apoiadores.forEach((apoiador) => {
    contagem[apoiador.apoio] = (contagem[apoiador.apoio] ?? 0) + 1;
  });
  return Object.entries(contagem)
    .map(([apoio, total]) => `${apoio}: ${total}`)
    .join(', ');
}

export function paginaApoiadores(apoiadores) {
  const conteudo = apoiadores.length
    ? `<p>${apoiadores.length === 1 ? '1 cadastro salvo' : `${apoiadores.length} cadastros salvos`} neste navegador.</p>
       <h3>Cadastros por forma de apoio</h3>
       <div class="grafico">
         <canvas id="grafico-apoio" role="img" aria-label="Gráfico de barras: ${escaparHTML(resumoPorApoio(apoiadores))}"></canvas>
       </div>
       <p class="campo__dica">${escaparHTML(resumoPorApoio(apoiadores))}</p>
       <ul class="grade lista-simples">${apoiadores.map(cartaoApoiador).join('')}</ul>
       <div class="formulario__acoes">
         <button class="botao botao--contorno" type="button" data-acao="limpar-apoiadores">Remover todos</button>
       </div>`
    : `<p class="vazio">Nenhum cadastro salvo ainda. <a href="#/cadastro">Fazer o primeiro cadastro</a>.</p>`;
  return `
    <section class="hero">
      <div class="container">
        <h1>Cadastros salvos</h1>
        <p class="hero__texto">Dados gravados no localStorage deste navegador.</p>
      </div>
    </section>
    <section class="secao">
      <div class="container">
        <h2>Apoiadores</h2>
        ${conteudo}
      </div>
    </section>`;
}

export function paginaNaoEncontrada() {
  return `
    <section class="secao">
      <div class="container">
        <h1>Página não encontrada</h1>
        <p>O endereço acessado não existe.</p>
        <a class="botao botao--primario" href="#/">Voltar ao início</a>
      </div>
    </section>`;
}
