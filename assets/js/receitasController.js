// Busca e renderiza as receitas do usuário
async function carregarReceitas() {
  // Recupera o usuário logado do localStorage
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  try {
    // Faz uma requisição GET para buscar as receitas do usuário
    const response = await fetch(
      `http://localhost:3000/receitas/user/${usuario.id}`
    );

    // Se a resposta não for OK, lança erro
    if (!response.ok) throw new Error("Erro ao carregar receitas.");

    // Converte a resposta em JSON
    const receitas = await response.json();

    // Renderiza as receitas na tela
    renderizarReceitas(receitas);
  } catch (error) {
    console.error("Erro ao carregar receitas:", error);
  }
}

// Quando o DOM estiver carregado, configura os botões e eventos
document.addEventListener("DOMContentLoaded", () => {
  configurarCriacaoReceita();
  configurarAcoesReceitas();
});

// Configura o botão de adicionar receita
function configurarCriacaoReceita() {
  const btnAdd = document.getElementById("btn-add-income-card");
  btnAdd.addEventListener("click", abrirFormularioReceita);
}

// Configura os eventos de editar e excluir para as receitas
function configurarAcoesReceitas() {
  const incomeContainer = document.querySelector(".income");

  incomeContainer.addEventListener("click", event => {
    // Se clicar no botão de editar
    if (event.target.classList.contains("btn__edit")) {
      const receitaId = event.target.getAttribute("data-id");
      abrirFormularioEdicaoReceita(receitaId);
    }

    // Se clicar no botão de excluir
    if (event.target.classList.contains("btn__delete")) {
      const receitaId = event.target.getAttribute("data-id");
      confirmarExclusaoReceita(receitaId);
    }
  });
}

// Abre o formulário para adicionar receita
function abrirFormularioReceita() {
  renderizarFormularioReceita();
}

// Abre o formulário para edição de uma receita específica
async function abrirFormularioEdicaoReceita(receitaId) {
  try {
    const response = await fetch(
      `http://localhost:3000/receitas/find/${receitaId}`
    );
    if (!response.ok) throw new Error("Erro ao carregar receita.");

    const receita = await response.json();
    renderizarFormularioReceita(receita);
  } catch (error) {
    console.error("Erro ao carregar receita:", error);
    alert("Erro ao carregar receita para edição.");
  }
}

// Renderiza o formulário de criar ou editar receita
async function renderizarFormularioReceita(receita = null) {
  const categorias = await carregarCategoriasOptions();

  const opcoesCategorias = categorias
    .map(categoria => {
      const selecionada =
        receita && receita.id_categoria === categoria.id ? "selected" : "";
      return `<option value="${categoria.id}" ${selecionada}>${categoria.nome_categoria}</option>`;
    })
    .join("");

  const formHtml = `
    <div class="form-overlay">
      <form id="form-receita" class="form-receita">
        <h2>${receita ? "Editar Receita" : "Adicionar Receita"}</h2>

        <label>Nome da Receita:</label>
        <input type="text" id="nome-receita" value="${receita
          ? receita.nome_receita
          : ""}" required />

        <label>Descrição:</label>
        <textarea id="desc-receita" rows="3">${receita
          ? receita.desc_receita || ""
          : ""}</textarea>

        <label>Categoria:</label>
        <select id="categoria-receita">
          <option value="">Outros</option>
          ${opcoesCategorias}
        </select>

        <label>Data:</label>
        <input type="date" id="data-receita" value="${receita
          ? receita.data_receita.split("T")[0]
          : ""}" required />

        <label>Valor:</label>
        <input type="number" id="valor-receita" step="0.01" value="${receita
          ? receita.valor_receita
          : ""}" required />

        <label>Método de Pagamento:</label>
        <select id="metodo-pagamento" required>
          <option value="">Selecione</option>
          <option value="debito" ${receita &&
          receita.metodo_pagamento === "debito"
            ? "selected"
            : ""}>Débito</option>
          <option value="credito" ${receita &&
          receita.metodo_pagamento === "credito"
            ? "selected"
            : ""}>Crédito</option>
        </select>

        <div class="form-buttons">
          <button type="submit">${receita
            ? "Salvar Alterações"
            : "Salvar"}</button>
          <button type="button" id="cancelar-form-receita">Cancelar</button>
        </div>

        ${receita
          ? `<input type="hidden" id="receita-id" value="${receita.id}" />`
          : ""}
      </form>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", formHtml);

  document
    .getElementById("form-receita")
    .addEventListener("submit", receita ? atualizarReceita : criarReceita);

  document
    .getElementById("cancelar-form-receita")
    .addEventListener("click", fecharFormularioReceita);
}

// Fecha (remove) o formulário da página
function fecharFormularioReceita() {
  const overlay = document.querySelector(".form-overlay");
  if (overlay) overlay.remove();
}

// Envia uma nova receita para o backend
async function criarReceita(event) {
  event.preventDefault();

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // Prepara a data no formato ISO
  const dataRaw = document.getElementById("data-receita").value;
  const dataFormatada = new Date(dataRaw).toISOString().split("T")[0];

  // Monta o objeto da nova receita
  const novaReceita = {
    nome_receita: document.getElementById("nome-receita").value,
    desc_receita: document.getElementById("desc-receita").value || null,
    id_categoria: document.getElementById("categoria-receita").value
      ? parseInt(document.getElementById("categoria-receita").value)
      : null,
    data_receita: dataFormatada,
    valor_receita: parseFloat(document.getElementById("valor-receita").value),
    metodo_pagamento: document.getElementById("metodo-pagamento").value,
    id_user: usuario.id
  };

  try {
    // Envia a nova receita para o backend
    const response = await fetch("http://localhost:3000/receitas/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaReceita)
    });

    if (!response.ok) throw new Error("Erro ao criar receita.");

    fecharFormularioReceita();
    alert("Receita criada com sucesso!");

    // Atualiza a conta e os cartões
    const totalLimiteUsadoCartoes = await carregarCartoes(usuario.id);
    await carregarConta(usuario.id, totalLimiteUsadoCartoes);

    window.location.reload();
  } catch (error) {
    console.error("Erro ao criar receita:", error);
    alert("Erro ao criar receita.");
  }
}

// Atualiza uma receita existente no backend
async function atualizarReceita(event) {
  event.preventDefault();

  const receitaId = document.getElementById("receita-id").value;

  // Prepara a data no formato ISO
  const dataRaw = document.getElementById("data-receita").value;
  const dataFormatada = new Date(dataRaw).toISOString().split("T")[0];

  // Monta o objeto com os dados atualizados
  const receitaAtualizada = {
    nome_receita: document.getElementById("nome-receita").value,
    desc_receita: document.getElementById("desc-receita").value || null,
    id_categoria: document.getElementById("categoria-receita").value
      ? parseInt(document.getElementById("categoria-receita").value)
      : null,
    data_receita: dataFormatada,
    valor_receita: parseFloat(document.getElementById("valor-receita").value),
    metodo_pagamento: document.getElementById("metodo-pagamento").value,
    id_user: JSON.parse(localStorage.getItem("usuario")).id
  };

  try {
    // Envia a atualização para o backend
    const response = await fetch(
      `http://localhost:3000/receitas/update/${receitaId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(receitaAtualizada)
      }
    );

    if (!response.ok) throw new Error("Erro ao atualizar receita.");

    fecharFormularioReceita();
    alert("Receita atualizada com sucesso!");
    window.location.reload();
  } catch (error) {
    console.error("Erro ao atualizar receita:", error);
    alert("Erro ao atualizar receita.");
  }
}

// Exibe um alerta de confirmação antes de excluir uma receita
function confirmarExclusaoReceita(receitaId) {
  if (confirm("Tem certeza que deseja excluir esta receita?")) {
    excluirReceita(receitaId);
  }
}

// Exclui a receita no backend
async function excluirReceita(receitaId) {
  try {
    const response = await fetch(
      `http://localhost:3000/receitas/delete/${receitaId}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) throw new Error("Erro ao excluir receita.");

    alert("Receita excluída com sucesso!");
    window.location.reload();
  } catch (error) {
    console.error("Erro ao excluir receita:", error);
    alert("Erro ao excluir receita.");
  }
}

async function carregarCategoriasOptions() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  try {
    const response = await fetch(
      `http://localhost:3000/categorias/user/${usuario.id}`
    );
    if (!response.ok) throw new Error("Erro ao carregar categorias.");

    const categorias = await response.json();
    return categorias;
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
    return [];
  }
}
