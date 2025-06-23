// Executa quando a página estiver totalmente carregada
document.addEventListener("DOMContentLoaded", () => {
  configurarCriacaoDespesa(); // Configura o botão de adicionar despesa
  configurarAcoesDespesas(); // Configura os botões de editar e excluir despesas
});

// Configura o evento de clique no botão de adicionar despesa
function configurarCriacaoDespesa() {
  const btnAdd = document.getElementById("btn-add-expenses-card");
  btnAdd.addEventListener("click", abrirFormularioDespesa);
}

// Configura os eventos para editar ou excluir despesas já existentes
function configurarAcoesDespesas() {
  const expensesContainer = document.querySelector(".expenses");

  expensesContainer.addEventListener("click", event => {
    // Se clicar no botão de editar
    if (event.target.classList.contains("btn__edit")) {
      const despesaId = event.target.getAttribute("data-id");
      abrirFormularioEdicaoDespesa(despesaId);
    }

    // Se clicar no botão de excluir
    if (event.target.classList.contains("btn__delete")) {
      const despesaId = event.target.getAttribute("data-id");
      confirmarExclusaoDespesa(despesaId);
    }
  });
}

// Abre o formulário vazio para adicionar uma nova despesa
function abrirFormularioDespesa() {
  renderizarFormularioDespesa();
}

// Busca a despesa no backend e abre o formulário preenchido para edição
async function abrirFormularioEdicaoDespesa(despesaId) {
  try {
    const response = await fetch(
      `http://localhost:3000/despesas/find/${despesaId}`
    );
    if (!response.ok) throw new Error("Erro ao carregar despesa.");

    const despesa = await response.json();
    renderizarFormularioDespesa(despesa); // Passa os dados para o formulário
  } catch (error) {
    console.error("Erro ao carregar despesa:", error);
    alert("Erro ao carregar despesa para edição.");
  }
}

// Renderiza o formulário de criação ou edição
function renderizarFormularioDespesa(despesa = null) {
  const formHtml = `
    <div class="form-overlay">
      <form id="form-despesa" class="form-despesa">
        <h2>${despesa ? "Editar Despesa" : "Adicionar Despesa"}</h2>

        <label>Nome da Despesa:</label>
        <input type="text" id="nome-despesa" value="${despesa
          ? despesa.nome_despesa
          : ""}" required />

        <label>Descrição:</label>
        <textarea id="desc-despesa" rows="3">${despesa
          ? despesa.desc_despesa || ""
          : ""}</textarea>

        <label>Categoria:</label>
        <input type="text" id="categoria-despesa" value="${despesa
          ? despesa.id_categoria || ""
          : ""}" />

        <label>Data:</label>
        <input type="date" id="data-despesa" value="${despesa
          ? despesa.data_despesa.split("T")[0]
          : ""}" required />

        <label>Valor:</label>
        <input type="number" id="valor-despesa" step="0.01" value="${despesa
          ? despesa.valor_despesa
          : ""}" required />

        <label>Método de Pagamento:</label>
        <select id="metodo-pagamento" required>
          <option value="">Selecione</option>
          <option value="debito" ${despesa &&
          despesa.metodo_pagamento === "debito"
            ? "selected"
            : ""}>Débito</option>
          <option value="credito" ${despesa &&
          despesa.metodo_pagamento === "credito"
            ? "selected"
            : ""}>Crédito</option>
        </select>

        <div class="form-buttons">
          <button type="submit">${despesa
            ? "Salvar Alterações"
            : "Salvar"}</button>
          <button type="button" id="cancelar-form-despesa">Cancelar</button>
        </div>

        ${despesa
          ? `<input type="hidden" id="despesa-id" value="${despesa.id}" />`
          : ""}
      </form>
    </div>
  `;

  // Insere o formulário na página
  document.body.insertAdjacentHTML("beforeend", formHtml);

  // Configura o submit para criar ou atualizar a despesa
  document
    .getElementById("form-despesa")
    .addEventListener("submit", despesa ? atualizarDespesa : criarDespesa);

  // Configura o botão de cancelar
  document
    .getElementById("cancelar-form-despesa")
    .addEventListener("click", fecharFormularioDespesa);
}

// Fecha o formulário da tela
function fecharFormularioDespesa() {
  const overlay = document.querySelector(".form-overlay");
  if (overlay) {
    overlay.remove();
  }
}

// Cria uma nova despesa no backend
async function criarDespesa(event) {
  event.preventDefault();

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // Formata a data para o padrão ISO yyyy-mm-dd
  const dataRaw = document.getElementById("data-despesa").value;
  const dataFormatada = new Date(dataRaw).toISOString().split("T")[0];

  // Prepara os dados da nova despesa
  const novaDespesa = {
    nome_despesa: document.getElementById("nome-despesa").value,
    desc_despesa: document.getElementById("desc-despesa").value || null,
    id_categoria: document.getElementById("categoria-despesa").value
      ? parseInt(document.getElementById("categoria-despesa").value)
      : null,
    data_despesa: dataFormatada,
    valor_despesa: parseFloat(document.getElementById("valor-despesa").value),
    metodo_pagamento: document.getElementById("metodo-pagamento").value,
    id_user: usuario.id
  };

  try {
    // Envia os dados da nova despesa para o backend
    const response = await fetch("http://localhost:3000/despesas/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaDespesa)
    });

    if (!response.ok) throw new Error("Erro ao criar despesa.");

    // Atualiza os valores dos cartões e da conta após adicionar a despesa
    const totalLimiteUsadoCartoes = await carregarCartoes(usuario.id);
    await carregarConta(usuario.id, totalLimiteUsadoCartoes);

    fecharFormularioDespesa();
    alert("Despesa criada com sucesso!");

    window.location.reload();
  } catch (error) {
    console.error("Erro ao criar despesa:", error);
    alert("Erro ao criar despesa.");
  }
}

// Atualiza uma despesa existente no backend
async function atualizarDespesa(event) {
  event.preventDefault();

  const despesaId = document.getElementById("despesa-id").value;

  // Formata a data para o padrão ISO
  const dataRaw = document.getElementById("data-despesa").value;
  const dataFormatada = new Date(dataRaw).toISOString().split("T")[0];
  const usuario = JSON.parse(localStorage.getItem("usuario")); // Captura o id_user

  // Prepara os dados atualizados da despesa
  const despesaAtualizada = {
    nome_despesa: document.getElementById("nome-despesa").value,
    desc_despesa: document.getElementById("desc-despesa").value || null,
    id_categoria: document.getElementById("categoria-despesa").value || null,
    data_despesa: dataFormatada,
    valor_despesa: parseFloat(document.getElementById("valor-despesa").value),
    metodo_pagamento: document.getElementById("metodo-pagamento").value,
    id_user: usuario.id
  };

  try {
    // Envia os dados atualizados para o backend
    const response = await fetch(
      `http://localhost:3000/despesas/update/${despesaId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(despesaAtualizada)
      }
    );

    if (!response.ok) throw new Error("Erro ao atualizar despesa.");

    fecharFormularioDespesa();
    alert("Despesa atualizada com sucesso!");

    window.location.reload();
  } catch (error) {
    console.error("Erro ao atualizar despesa:", error);
    alert("Erro ao atualizar despesa.");
  }
}

// Exibe confirmação antes de excluir a despesa
function confirmarExclusaoDespesa(despesaId) {
  if (confirm("Tem certeza que deseja excluir esta despesa?")) {
    excluirDespesa(despesaId);
  }
}

// Exclui a despesa no backend
async function excluirDespesa(despesaId) {
  try {
    const response = await fetch(
      `http://localhost:3000/despesas/delete/${despesaId}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) throw new Error("Erro ao excluir despesa.");

    alert("Despesa excluída com sucesso!");
    window.location.reload();
  } catch (error) {
    console.error("Erro ao excluir despesa:", error);
    alert("Erro ao excluir despesa.");
  }
}
