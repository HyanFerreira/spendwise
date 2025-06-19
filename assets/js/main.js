document.addEventListener("DOMContentLoaded", function() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/pages/login.html"; // ajuste conforme sua estrutura
    return; // para evitar continuar o script
  }

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const nome = usuario && usuario.nome ? usuario.nome : "Visitante";
  document.getElementById("user-name").textContent = nome;

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/pages/login.html";
  }

  document.getElementById("btn-logout").addEventListener("click", logout);
});
