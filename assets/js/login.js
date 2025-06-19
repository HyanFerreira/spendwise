const API_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const email = loginForm["login-email"].value.trim();
    const senha = loginForm["login-password"].value;

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, senha })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert("Erro: " + (errorData.message || "Falha no login."));
        return;
      }

      const userData = await response.json();

      // Armazena o usuário no localStorage (sessão simples)
      localStorage.setItem("token", userData.token);
      localStorage.setItem("usuario", JSON.stringify(userData.user));

      // Redireciona ou atualiza a página
      alert(`Bem-vindo, ${userData.user.nome}!`);
      window.location.href = "/index.html"; // ou qualquer página principal
    } catch (error) {
      console.error("Erro de conexão:", error);
      alert("Erro ao conectar com o servidor.");
    }
  });

  const registerForm = document.getElementById("register-form");

  registerForm.addEventListener("submit", async event => {
    event.preventDefault();

    const nome = registerForm["register-name"].value.trim();
    const email = registerForm["register-email"].value.trim();
    const senha = registerForm["register-password"].value;
    const confirmSenha = registerForm["register-confirm"].value;

    if (senha !== confirmSenha) {
      alert("As senhas não conferem!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, email, senha })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert("Erro: " + (errorData.message || "Falha ao cadastrar usuário."));
        return;
      }

      alert("Usuário cadastrado com sucesso! Agora faça login.");
      registerForm.reset();
      // Aqui pode chamar função para mostrar o form de login
    } catch (error) {
      alert("Erro ao conectar com o servidor.");
      console.error(error);
    }
  });
});
