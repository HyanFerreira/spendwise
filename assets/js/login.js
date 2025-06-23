// Define a URL base da API
const API_URL = "http://localhost:3000";

// Aguarda o carregamento completo da página
document.addEventListener("DOMContentLoaded", () => {
  // Seleciona o formulário de login
  const loginForm = document.getElementById("login-form");

  // Configura o evento de envio (submit) do formulário de login
  loginForm.addEventListener("submit", async event => {
    event.preventDefault(); // Impede o recarregamento da página

    // Captura os valores dos campos de email e senha
    const email = loginForm["login-email"].value.trim();
    const senha = loginForm["login-password"].value;

    try {
      // Faz uma requisição POST para a rota de login
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, senha }) // Envia o email e a senha no corpo da requisição
      });

      // Se a resposta não for bem-sucedida, exibe a mensagem de erro
      if (!response.ok) {
        const errorData = await response.json();
        alert("Erro: " + (errorData.message || "Falha no login."));
        return;
      }

      // Se a resposta for OK, obtém os dados do usuário e token
      const userData = await response.json();

      // Salva o token e os dados do usuário no localStorage para manter a sessão
      localStorage.setItem("token", userData.token);
      localStorage.setItem("usuario", JSON.stringify(userData.user));

      // Exibe mensagem de boas-vindas e redireciona para a página inicial
      alert(`Bem-vindo, ${userData.user.nome}!`);
      window.location.href = "/index.html"; // Redireciona para a página principal
    } catch (error) {
      console.error("Erro de conexão:", error);
      alert("Erro ao conectar com o servidor.");
    }
  });

  // Seleciona o formulário de registro
  const registerForm = document.getElementById("register-form");

  // Configura o evento de envio (submit) do formulário de cadastro
  registerForm.addEventListener("submit", async event => {
    event.preventDefault(); // Impede o recarregamento da página

    // Captura os valores dos campos de nome, email, senha e confirmação
    const nome = registerForm["register-name"].value.trim();
    const email = registerForm["register-email"].value.trim();
    const senha = registerForm["register-password"].value;
    const confirmSenha = registerForm["register-confirm"].value;

    // Valida se as senhas digitadas são iguais
    if (senha !== confirmSenha) {
      alert("As senhas não conferem!");
      return;
    }

    try {
      // Faz uma requisição POST para criar um novo usuário
      const response = await fetch(`${API_URL}/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, email, senha }) // Envia os dados do usuário no corpo da requisição
      });

      // Se houver erro, exibe mensagem de erro
      if (!response.ok) {
        const errorData = await response.json();
        alert("Erro: " + (errorData.message || "Falha ao cadastrar usuário."));
        return;
      }

      // Se o cadastro for bem-sucedido, exibe mensagem de sucesso
      alert("Usuário cadastrado com sucesso! Agora faça login.");
      registerForm.reset(); // Limpa o formulário

    } catch (error) {
      alert("Erro ao conectar com o servidor.");
      console.error(error);
    }
  });
});
