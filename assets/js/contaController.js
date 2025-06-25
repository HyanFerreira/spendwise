document.addEventListener("DOMContentLoaded", () => {
  configurarCriacaoConta();
  configurarAcoesConta();
  carregarConta();
});

// Configura o botão para abrir o formulário de criação
function configurarCriacaoConta() {
  const btnAdd = document.getElementById("btn-add-conta");
  if (btnAdd) {
    btnAdd.addEventListener("click", abrirFormularioConta);
  }
}

// Configura os eventos de editar e excluir dentro do container de conta
function configurarAcoesConta() {
  const contaContainer = document.querySelector(".conta");

  if (contaContainer) {
    contaContainer.addEventListener("click", event => {
      if (event.target.classList.contains("btn__edit")) {
        abrirFormularioConta(); // Apenas abre o formulário de edição da única conta
      }

      if (event.target.classList.contains("btn__delete")) {
        const contaId = event.target.getAttribute("data-id");
        confirmarExclusaoConta(contaId);
      }
    });
  }
}

// Abre o formulário preenchido para edição ou vazio para criação
async function abrirFormularioConta() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  try {
    const response = await fetch(
      `http://localhost:3000/conta/resumo/${usuario.id}`
    );

    let conta = null;

    if (response.ok) {
      conta = await response.json();
    }

    renderizarFormularioConta(conta);
  } catch (error) {
    console.error("Erro ao carregar conta:", error);
    renderizarFormularioConta(); // Caso não tenha conta, abrir formulário vazio
  }
}

// Renderiza o formulário (vazio para criação ou preenchido para edição)
function renderizarFormularioConta(conta = null) {
  const formHtml = `
    <div class="form-overlay">
      <form id="form-conta" class="form-conta">
        <h2>${conta ? "Editar Conta" : "Adicionar Conta"}</h2>

        <label>Nome da Conta:</label>
        <input
          type="text"
          id="nome-conta"
          value="${conta ? conta.nome : ""}"
          required
        />

        <label>Saldo da Conta:</label>
        <input
          type="number"
          id="saldo-conta"
          value="${conta ? conta.saldoInicial : 0}"
          min="0"
          step="0.01"
          required
        />

        <div class="form-buttons">
          <button type="submit">${conta
            ? "Salvar Alterações"
            : "Salvar"}</button>
          <button type="button" id="cancelar-form-conta">Cancelar</button>
        </div>

        ${conta
          ? `<input type="hidden" id="conta-id" value="${conta.id}" />`
          : ""}
      </form>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", formHtml);

  document
    .getElementById("form-conta")
    .addEventListener("submit", conta ? atualizarConta : criarConta);

  document
    .getElementById("cancelar-form-conta")
    .addEventListener("click", fecharFormularioConta);
}

// Fecha o formulário da conta
function fecharFormularioConta() {
  const overlay = document.querySelector(".form-overlay");
  if (overlay) overlay.remove();
}

// Cria uma nova conta
async function criarConta(event) {
  event.preventDefault();

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const nomeConta = document.getElementById("nome-conta").value.trim();
  const saldoConta = parseFloat(document.getElementById("saldo-conta").value);

  if (!nomeConta) {
    alert("Informe o nome da conta.");
    return;
  }

  const novaConta = {
    nome: nomeConta,
    saldo: saldoConta,
    id_user: usuario.id
  };

  try {
    const response = await fetch("http://localhost:3000/conta/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaConta)
    });

    if (!response.ok) throw new Error("Erro ao criar conta.");

    fecharFormularioConta();
    alert("Conta criada com sucesso!");
    carregarConta();
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    alert("Erro ao criar conta.");
  }
}

// Atualiza conta existente
async function atualizarConta(event) {
  event.preventDefault();

  const contaId = document.getElementById("conta-id").value;
  const nomeConta = document.getElementById("nome-conta").value.trim();
  const saldoConta = parseFloat(document.getElementById("saldo-conta").value);

  if (!nomeConta) {
    alert("Informe o nome da conta.");
    return;
  }

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const contaAtualizada = {
    nome: nomeConta,
    saldo: saldoConta,
    id_user: usuario.id
  };

  try {
    const response = await fetch(
      `http://localhost:3000/conta/update/${contaId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contaAtualizada)
      }
    );

    if (!response.ok) throw new Error("Erro ao atualizar conta.");

    fecharFormularioConta();
    alert("Conta atualizada com sucesso!");
    carregarConta();
  } catch (error) {
    console.error("Erro ao atualizar conta:", error);
    alert("Erro ao atualizar conta.");
  }
}

// Busca e renderiza a conta do usuário
async function carregarConta() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const container = document.querySelector(".conta");

  try {
    const response = await fetch(
      `http://localhost:3000/conta/resumo/${usuario.id}`
    );

    if (!response.ok) {
      container.innerHTML = "<p>Nenhuma conta encontrada.</p>";
      return;
    }

    const conta = await response.json();

    renderizarConta(conta);
  } catch (error) {
    console.error("Erro ao carregar conta:", error);
    container.innerHTML = "<p>Erro ao carregar conta.</p>";
  }
}

// Renderiza a conta no container
function renderizarConta(conta) {
  const container = document.querySelector(".conta");
  container.innerHTML = ""; // Limpa antes de renderizar

  const contaHtml = `
    <div class="conta__row grid--table">
      <span class="conta__name">${conta.nome}</span>
      <span class="conta__saldo">Saldo Atual: R$ ${conta.saldoInicial.toFixed(
        2
      )}</span>
      <div class="conta__actions">
        <button class="btn__edit" data-id="${conta.id}">Editar</button>
        <button class="btn__delete" data-id="${conta.id}">Excluir</button>
      </div>
    </div>
  `;

  container.insertAdjacentHTML("beforeend", contaHtml);
}

// Confirma exclusão
function confirmarExclusaoConta(contaId) {
  if (confirm("Tem certeza que deseja excluir esta conta?")) {
    excluirConta(contaId);
  }
}

// Exclui a conta
async function excluirConta(contaId) {
  try {
    const response = await fetch(
      `http://localhost:3000/conta/delete/${contaId}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) throw new Error("Erro ao excluir conta.");

    alert("Conta excluída com sucesso!");
    const container = document.querySelector(".conta");
    container.innerHTML = "<p>Nenhuma conta encontrada.</p>";
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    alert("Erro ao excluir conta.");
  }
}

async function exportarPdf() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario || !usuario.id) {
    alert("Usuário não encontrado. Faça login novamente.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/exportar/exportar-pdf?userId=${usuario.id}`, // Use query param para passar o ID
      {
        method: "GET",
        headers: {
          Accept: "application/pdf"
        }
      }
    );

    if (!response.ok) {
      throw new Error(
        `Erro ao exportar PDF: ${response.status} ${response.statusText}`
      );
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    // Cria o link de download e dispara o clique programaticamente
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_conta_${usuario.nome.toLowerCase()}.pdf`;
    document.body.appendChild(a);
    a.click();

    // Limpa a URL criada e remove o link do DOM
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Erro ao exportar PDF:", error);
    alert("Erro ao exportar PDF. Tente novamente.");
  }
}

// Vincular essa função ao clique do botão
document.getElementById("exportar-pdf").addEventListener("click", exportarPdf);
