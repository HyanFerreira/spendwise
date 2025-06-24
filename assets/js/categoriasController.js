document.addEventListener("DOMContentLoaded", () => {
  configurarCriacaoCategoria();
  configurarAcoesCategorias();
  carregarCategorias();
});

// Configura o botão para abrir o formulário de criação
function configurarCriacaoCategoria() {
  const btnAdd = document.getElementById("btn-add-category");
  if (btnAdd) {
    btnAdd.addEventListener("click", abrirFormularioCategoria);
  }
}

// Configura os eventos de editar e excluir dentro do container de categorias
function configurarAcoesCategorias() {
  const categoriesContainer = document.querySelector(".categories");

  if (categoriesContainer) {
    categoriesContainer.addEventListener("click", event => {
      if (event.target.classList.contains("btn__edit")) {
        const categoriaId = event.target.getAttribute("data-id");
        abrirFormularioEdicaoCategoria(categoriaId);
      }

      if (event.target.classList.contains("btn__delete")) {
        const categoriaId = event.target.getAttribute("data-id");
        confirmarExclusaoCategoria(categoriaId);
      }
    });
  }
}

// Abre o formulário vazio para criação
function abrirFormularioCategoria() {
  renderizarFormularioCategoria();
}

// Abre o formulário preenchido para edição
async function abrirFormularioEdicaoCategoria(categoriaId) {
  try {
    const response = await fetch(
      `http://localhost:3000/categorias/find/${categoriaId}`
    );
    if (!response.ok) throw new Error("Erro ao carregar categoria.");

    const categoria = await response.json();
    renderizarFormularioCategoria(categoria);
  } catch (error) {
    console.error("Erro ao carregar categoria:", error);
    alert("Erro ao carregar categoria para edição.");
  }
}

// Renderiza o formulário (vazio para criação ou preenchido para edição)
function renderizarFormularioCategoria(categoria = null) {
  const formHtml = `
    <div class="form-overlay">
      <form id="form-categoria" class="form-categoria">
        <h2>${categoria ? "Editar Categoria" : "Adicionar Categoria"}</h2>

        <label>Nome da Categoria:</label>
        <input
          type="text"
          id="nome-categoria"
          value="${categoria ? categoria.nome_categoria : ""}"
          required
        />

        <div class="form-buttons">
          <button type="submit">${categoria
            ? "Salvar Alterações"
            : "Salvar"}</button>
          <button type="button" id="cancelar-form-categoria">Cancelar</button>
        </div>

        ${categoria
          ? `<input type="hidden" id="categoria-id" value="${categoria.id}" />`
          : ""}
      </form>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", formHtml);

  document
    .getElementById("form-categoria")
    .addEventListener(
      "submit",
      categoria ? atualizarCategoria : criarCategoria
    );

  document
    .getElementById("cancelar-form-categoria")
    .addEventListener("click", fecharFormularioCategoria);
}

// Fecha o formulário da categoria
function fecharFormularioCategoria() {
  const overlay = document.querySelector(".form-overlay");
  if (overlay) overlay.remove();
}

// Cria uma nova categoria
async function criarCategoria(event) {
  event.preventDefault();

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const nomeCategoria = document.getElementById("nome-categoria").value.trim();

  if (!nomeCategoria) {
    alert("Informe o nome da categoria.");
    return;
  }

  const novaCategoria = {
    nome_categoria: nomeCategoria,
    id_user: usuario.id
  };

  try {
    const response = await fetch("http://localhost:3000/categorias/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaCategoria)
    });

    if (!response.ok) throw new Error("Erro ao criar categoria.");

    fecharFormularioCategoria();
    alert("Categoria criada com sucesso!");
    carregarCategorias(); // Atualiza a lista
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    alert("Erro ao criar categoria.");
  }
}

// Atualiza categoria existente
async function atualizarCategoria(event) {
  event.preventDefault();

  const categoriaId = document.getElementById("categoria-id").value;
  const nomeCategoria = document.getElementById("nome-categoria").value.trim();

  if (!nomeCategoria) {
    alert("Informe o nome da categoria.");
    return;
  }

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const categoriaAtualizada = {
    nome_categoria: nomeCategoria,
    id_user: usuario.id
  };

  try {
    const response = await fetch(
      `http://localhost:3000/categorias/update/${categoriaId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoriaAtualizada)
      }
    );

    if (!response.ok) throw new Error("Erro ao atualizar categoria.");

    fecharFormularioCategoria();
    alert("Categoria atualizada com sucesso!");
    carregarCategorias();
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    alert("Erro ao atualizar categoria.");
  }
}

// Confirma exclusão
function confirmarExclusaoCategoria(categoriaId) {
  if (confirm("Tem certeza que deseja excluir esta categoria?")) {
    excluirCategoria(categoriaId);
  }
}

// Exclui a categoria
async function excluirCategoria(categoriaId) {
  try {
    const response = await fetch(
      `http://localhost:3000/categorias/delete/${categoriaId}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) throw new Error("Erro ao excluir categoria.");

    alert("Categoria excluída com sucesso!");
    carregarCategorias();
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    alert("Erro ao excluir categoria.");
  }
}

// Busca e renderiza as categorias na tela
async function carregarCategorias() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  try {
    const response = await fetch(
      `http://localhost:3000/categorias/user/${usuario.id}`
    );
    if (!response.ok) throw new Error("Erro ao carregar categorias.");

    const categorias = await response.json();
    renderizarCategorias(categorias);
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
  }
}

// Renderiza categorias no container
function renderizarCategorias(categorias) {
  const container = document.querySelector(".categories");
  container.innerHTML = ""; // Limpa antes de renderizar

  categorias.forEach(categoria => {
    const row = document.createElement("div");
    row.classList.add("categories__row", "grid--table");

    row.innerHTML = `
      <span class="categories__name">${categoria.nome_categoria}</span>
      <div class="categories__actions">
        <button class="btn__edit" data-id="${categoria.id}">Editar</button>
        <button class="btn__delete" data-id="${categoria.id}">Excluir</button>
      </div>
    `;

    container.appendChild(row);
  });
}
