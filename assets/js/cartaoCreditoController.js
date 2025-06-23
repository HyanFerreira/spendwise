// cartaoCreditoController.js

// Quando a página carregar, configura os botões e eventos
document.addEventListener("DOMContentLoaded", () => {
  configurarCriacaoCartao(); // Configura o botão de criar cartão
  configurarAcoesCartoes(); // Configura os botões de editar e excluir cartões
});

// Configura o botão de adicionar novo cartão
function configurarCriacaoCartao() {
  const btnAdd = document.getElementById("btn-add-credit-card");
  btnAdd.addEventListener("click", abrirFormularioCartao);
}

// Configura os eventos de editar e excluir cartões
function configurarAcoesCartoes() {
  const cardsContainer = document.querySelector(".credit-cards");

  cardsContainer.addEventListener("click", event => {
    // Se o botão clicado for de editar
    if (event.target.classList.contains("btn__edit")) {
      const cartaoId = event.target.getAttribute("data-id");
      abrirFormularioEdicao(cartaoId);
    }

    // Se o botão clicado for de excluir
    if (event.target.classList.contains("btn__delete")) {
      const cartaoId = event.target.getAttribute("data-id");
      confirmarExclusao(cartaoId);
    }
  });
}

// Abre o formulário para criar um novo cartão
function abrirFormularioCartao() {
  renderizarFormularioCartao();
}

// Busca os dados do cartão no backend e abre o formulário de edição
async function abrirFormularioEdicao(cartaoId) {
  try {
    const response = await fetch(
      `http://localhost:3000/cartao/find/${cartaoId}`
    );
    if (!response.ok) throw new Error("Erro ao carregar cartão.");

    const cartao = await response.json();

    // Renderiza o formulário preenchido com os dados do cartão
    renderizarFormularioCartao(cartao);
  } catch (error) {
    console.error("Erro ao carregar cartão:", error);
    alert("Erro ao carregar cartão para edição.");
  }
}

// Renderiza o formulário (para criar ou editar)
function renderizarFormularioCartao(cartao = null) {
  const formHtml = `
    <div class="form-overlay">
      <form id="form-cartao" class="form-cartao">
        <h2>${cartao ? "Editar Cartão" : "Adicionar Cartão de Crédito"}</h2>

        <label>Nome do Cartão:</label>
        <input type="text" id="nome-cartao" value="${cartao
          ? cartao.nome_cartao
          : ""}" required />

        <label>Ícone (URL):</label>
        <input type="text" id="icone-cartao" value="${cartao
          ? cartao.icone_cartao || ""
          : ""}" />

        <label>Limite do Cartão:</label>
        <input type="number" id="limite-cartao" step="0.01" value="${cartao
          ? cartao.limite_cartao
          : ""}" required />

        <div class="form-buttons">
          <button type="submit">${cartao
            ? "Salvar Alterações"
            : "Salvar"}</button>
          <button type="button" id="cancelar-form">Cancelar</button>
        </div>

        ${cartao
          ? `<input type="hidden" id="cartao-id" value="${cartao.id}" />`
          : ""}
      </form>
    </div>
  `;

  // Insere o formulário no body
  document.body.insertAdjacentHTML("beforeend", formHtml);

  // Configura o evento de submit: cria ou atualiza o cartão
  document
    .getElementById("form-cartao")
    .addEventListener("submit", cartao ? atualizarCartao : criarCartao);

  // Configura o evento de cancelar (fecha o formulário)
  document
    .getElementById("cancelar-form")
    .addEventListener("click", fecharFormularioCartao);
}

// Fecha o formulário de criação/edição
function fecharFormularioCartao() {
  const overlay = document.querySelector(".form-overlay");
  if (overlay) overlay.remove();
}

// Cria um novo cartão no backend
async function criarCartao(event) {
  event.preventDefault();

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // Prepara os dados do novo cartão
  const novoCartao = {
    nome_cartao: document.getElementById("nome-cartao").value,
    icone_cartao: document.getElementById("icone-cartao").value || null,
    limite_cartao: parseFloat(document.getElementById("limite-cartao").value),
    limite_disponivel: parseFloat(
      document.getElementById("limite-cartao").value
    ), // O limite disponível começa igual ao limite total
    limite_usado: 0, // Limite usado inicia zerado
    id_user: usuario.id
  };

  try {
    // Envia os dados para o backend
    const response = await fetch("http://localhost:3000/cartao/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoCartao)
    });

    if (!response.ok) throw new Error("Erro ao criar cartão.");

    fecharFormularioCartao();
    alert("Cartão criado com sucesso!");

    window.location.reload();
  } catch (error) {
    console.error("Erro ao criar cartão:", error);
    alert("Erro ao criar cartão.");
  }
}

// Atualiza um cartão no backend
async function atualizarCartao(event) {
  event.preventDefault();

  const cartaoId = document.getElementById("cartao-id").value;

  // Prepara os dados atualizados do cartão
  const cartaoAtualizado = {
    nome_cartao: document.getElementById("nome-cartao").value,
    icone_cartao: document.getElementById("icone-cartao").value || null,
    limite_cartao: parseFloat(document.getElementById("limite-cartao").value)
  };

  try {
    // Envia os dados atualizados para o backend
    const response = await fetch(
      `http://localhost:3000/cartao/update/${cartaoId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartaoAtualizado)
      }
    );

    if (!response.ok) throw new Error("Erro ao atualizar cartão.");

    fecharFormularioCartao();
    alert("Cartão atualizado com sucesso!");

    window.location.reload();
  } catch (error) {
    console.error("Erro ao atualizar cartão:", error);
    alert("Erro ao atualizar cartão.");
  }
}

// Exibe confirmação antes de excluir o cartão
function confirmarExclusao(cartaoId) {
  if (confirm("Tem certeza que deseja excluir este cartão?")) {
    excluirCartao(cartaoId);
  }
}

// Exclui um cartão no backend
async function excluirCartao(cartaoId) {
  try {
    const response = await fetch(
      `http://localhost:3000/cartao/delete/${cartaoId}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) throw new Error("Erro ao excluir cartão.");

    alert("Cartão excluído com sucesso!");
    window.location.reload();
  } catch (error) {
    console.error("Erro ao excluir cartão:", error);
    alert("Erro ao excluir cartão.");
  }
}
