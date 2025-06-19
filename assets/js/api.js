const API_URL = "http://localhost:3000";

// Buscar todas as postagens
async function getUsers() {
  try {
    const res = await fetch(`${API_URL}/users`);
    if (!res.ok) {
      throw new Error(`Erro na API: ${res.status}`);
    }
    const users = await res.json();
    return users;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
}

// Buscar conta
async function getConta() {
  try {
    const res = await fetch(`${API_URL}/conta`);
    if (!res.ok) {
      throw new Error(`Erro na API: ${res.status}`);
    }
    const conta = await res.json();
    return conta;
  } catch (error) {
    console.error("Erro ao buscar conta:", error);
    return [];
  }
}

