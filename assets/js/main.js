// Quando o DOM estiver carregado, inicia a aplicação
document.addEventListener("DOMContentLoaded", () => {
  iniciarAplicacao();
});

// Função principal que organiza o carregamento inicial da página
async function iniciarAplicacao() {
  verificarAutenticacao(); // Verifica se o usuário está logado
  configurarLogout(); // Configura o botão de logout

  await carregarDespesas(); // Busca e exibe as despesas
  await carregarReceitas(); // Busca e exibe as receitas

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // Carrega os cartões e obtém o total de limite usado
  const totalLimiteUsadoCartoes = await carregarCartoes(usuario.id);

  // Busca as informações da conta e atualiza os saldos e visão geral
  carregarConta(usuario.id, totalLimiteUsadoCartoes);
}

// Verifica se o usuário está autenticado
function verificarAutenticacao() {
  const token = localStorage.getItem("token");

  // Se não estiver autenticado, redireciona para a página de login
  if (!token) {
    window.location.href = "/pages/login.html";
    return;
  }

  // Atualiza o nome do usuário no cabeçalho
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const nome = usuario && usuario.nome ? usuario.nome : "Visitante";
  document.getElementById("user-name").textContent = nome;
}

// Configura o botão de logout
function configurarLogout() {
  const logoutButton = document.getElementById("btn-logout");

  logoutButton.addEventListener("click", () => {
    // Remove token e informações do usuário
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    // Redireciona para a tela de login
    window.location.href = "/pages/login.html";
  });
}

// Busca as despesas do usuário e chama a função para renderizá-las
async function carregarDespesas() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  try {
    const response = await fetch(
      `http://localhost:3000/despesas/user/${usuario.id}`
    );
    if (!response.ok) throw new Error("Erro ao carregar despesas.");

    const despesas = await response.json();
    renderizarDespesas(despesas);
  } catch (error) {
    console.error("Erro ao carregar despesas:", error);
  }
}

// Renderiza as despesas na tela
function renderizarDespesas(despesas) {
  const expensesContainer = document.querySelector(".expenses");

  despesas.forEach(despesa => {
    const row = document.createElement("div");
    row.classList.add("expenses__row", "grid--table");

    row.innerHTML = `
      <div class="expenses__desc item--center gap--15">
        <span class="expenses__icon flex--center">
          <img src="./assets/img/icon-default.svg" alt="${despesa.nome_despesa}">
        </span>
        <span class="expenses__name">${despesa.nome_despesa}</span>
      </div>
      <span class="expenses__cell">${despesa.id_categoria || "Outros"}</span>
      <span class="expenses__cell">${formatarData(despesa.data_despesa)}</span>
      <span class="expenses__cell">R$ ${despesa.valor_despesa.toFixed(2)}</span>
      <div class="expenses__actions">
        <button class="btn__edit" data-id="${despesa.id}">Editar</button>
        <button class="btn__delete" data-id="${despesa.id}">Excluir</button>
      </div>
    `;

    expensesContainer.appendChild(row);
  });
}

// Função para formatar a data no padrão brasileiro
function formatarData(data) {
  const dataObj = new Date(data);
  return dataObj.toLocaleDateString("pt-BR");
}

// Busca as receitas do usuário e chama a função para renderizá-las
async function carregarReceitas() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  try {
    const response = await fetch(
      `http://localhost:3000/receitas/user/${usuario.id}`
    );
    if (!response.ok) throw new Error("Erro ao carregar receitas.");

    const receitas = await response.json();
    renderizarReceitas(receitas);
  } catch (error) {
    console.error("Erro ao carregar receitas:", error);
  }
}

// Renderiza as receitas na tela
function renderizarReceitas(receitas) {
  const incomeContainer = document.querySelector(".income");

  receitas.forEach(receita => {
    const row = document.createElement("div");
    row.classList.add("income__row", "grid--table");

    row.innerHTML = `
      <div class="income__desc item--center gap--15">
        <span class="income__icon flex--center">
          <img src="./assets/img/icon-default.svg" alt="${receita.nome_receita}">
        </span>
        <span class="income__name">${receita.nome_receita}</span>
      </div>
      <span class="income__cell">${receita.id_categoria || "Outros"}</span>
      <span class="income__cell">${formatarData(receita.data_receita)}</span>
      <span class="income__cell">R$ ${receita.valor_receita.toFixed(2)}</span>
      <div class="expenses__actions">
        <button class="btn__edit" data-id="${receita.id}">Editar</button>
        <button class="btn__delete" data-id="${receita.id}">Excluir</button>
      </div>
    `;

    incomeContainer.appendChild(row);
  });
}

// Busca os cartões de crédito e retorna o total de limite usado
async function carregarCartoes(userId) {
  try {
    const response = await fetch(`http://localhost:3000/cartao/user/${userId}`);
    if (!response.ok) throw new Error("Erro ao carregar cartões de crédito.");

    const cartoes = await response.json();
    renderCartoes(cartoes);

    // Soma o total de limite usado em todos os cartões
    const totalLimiteUsadoCartoes = cartoes.reduce(
      (acc, cartao) => acc + cartao.limite_usado,
      0
    );
    return totalLimiteUsadoCartoes;
  } catch (error) {
    console.error("Erro ao carregar cartões:", error);
    return 0; // Retorna zero para evitar erro se falhar
  }
}

// Renderiza os cartões de crédito na tela
function renderCartoes(cartoes) {
  const cardsContainer = document.querySelector(".credit-cards");

  cartoes.forEach(cartao => {
    const row = document.createElement("div");
    row.classList.add("credit-cards__row", "grid--table");

    row.innerHTML = `
      <div class="credit-cards__desc item--center gap--15">
        <span class="credit-cards__icon flex--center">
          <img src="${cartao.icone_cartao ||
            "./assets/img/icon-default.svg"}" alt="${cartao.nome_cartao}">
        </span>
        <span class="credit-cards__name">${cartao.nome_cartao}</span>
      </div>
      <span class="credit-cards__cell">R$ ${cartao.limite_cartao.toFixed(
        2
      )}</span>
      <span class="credit-cards__cell">R$ ${cartao.limite_usado.toFixed(
        2
      )}</span>
      <span class="credit-cards__cell">R$ ${cartao.limite_disponivel.toFixed(
        2
      )}</span>
      <div class="credit-cards__actions">
        <button class="btn__edit" data-id="${cartao.id}">Editar</button>
        <button class="btn__delete" data-id="${cartao.id}">Excluir</button>
      </div>
    `;

    cardsContainer.appendChild(row);
  });
}

// Busca os dados da conta e atualiza os saldos na tela
async function carregarConta(userId, totalLimiteUsadoCartoes) {
  try {
    const response = await fetch(
      `http://localhost:3000/conta/resumo/${userId}`
    );
    if (!response.ok) throw new Error("Erro ao carregar conta.");

    const conta = await response.json();

    // Atualiza o nome da conta no cabeçalho
    document.querySelector(".wallet__label").textContent = conta.nome;

    // Atualiza os saldos detalhados
    document.querySelector(
      ".wallet__item:nth-child(2) .wallet__value"
    ).textContent = `R$ ${conta.totalReceitas.toFixed(2)}`;

    document.querySelector(
      ".wallet__item:nth-child(3) .wallet__value"
    ).textContent = `R$ ${conta.totalDespesas.toFixed(2)}`;

    document.querySelector(
      ".wallet__item:nth-child(4) .wallet__value"
    ).textContent = `R$ ${conta.saldoAtual.toFixed(2)}`;

    document.querySelector(
      ".wallet__item:nth-child(5) .wallet__value"
    ).textContent = `R$ ${conta.saldoPrevisto.toFixed(2)}`;

    // Atualiza o resumo geral
    atualizarVisaoGeral(conta, totalLimiteUsadoCartoes);
  } catch (error) {
    console.error("Erro ao carregar conta:", error);
  }
}

// Atualiza os cards do resumo geral
function atualizarVisaoGeral(conta, totalLimiteUsadoCartoes) {
  const overviewCards = document.querySelectorAll(".overview__card");

  // Card 1 - Saldo Atual
  overviewCards[0].querySelector(
    ".overview__value"
  ).textContent = `R$ ${conta.saldoAtual.toFixed(2)}`;

  // Card 2 - Receitas
  overviewCards[1].querySelector(
    ".overview__value"
  ).textContent = `R$ ${conta.totalReceitas.toFixed(2)}`;

  // Card 3 - Despesas
  overviewCards[2].querySelector(
    ".overview__value"
  ).textContent = `R$ ${conta.totalDespesas.toFixed(2)}`;

  // Card 4 - Cartões de Crédito (Limite Usado)
  overviewCards[3].querySelector(
    ".overview__value"
  ).textContent = `R$ ${totalLimiteUsadoCartoes.toFixed(2)}`;
}
