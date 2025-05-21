// document.addEventListener("DOMContentLoaded", () => {
//   // Alternar formulários
//   const btnLogin = document.querySelector(".btn-signin");
//   const btnCadastrar = document.querySelector(".btn-signup");
//   const contentLogin = document.querySelector(".content-signin-form");
//   const contentCadastrar = document.querySelector(".content-signup-form");
//   const contentSignIn = document.querySelector(".content-signin-welcome");
//   const contentSignUp = document.querySelector(".content-signup-welcome");

//   btnCadastrar.addEventListener("click", e => {
//     e.preventDefault();
//     contentCadastrar.style.transform = "translateX(0)";
//     contentCadastrar.style.opacity = "1";
//     contentSignUp.style.transform = "translateX(100%)";
//     contentSignUp.style.opacity = "0";
//     contentLogin.style.transform = "translateX(-100%)";
//     contentLogin.style.opacity = "0";
//     contentSignIn.style.transform = "translateX(0)";
//     contentSignIn.style.opacity = "1";
//   });

//   btnLogin.addEventListener("click", e => {
//     e.preventDefault();
//     contentCadastrar.style.transform = "translateX(100%)";
//     contentCadastrar.style.opacity = "0";
//     contentSignUp.style.transform = "translateX(0)";
//     contentSignUp.style.opacity = "1";
//     contentLogin.style.transform = "translateX(0)";
//     contentLogin.style.opacity = "1";
//     contentSignIn.style.transform = "translateX(-100%)";
//     contentSignIn.style.opacity = "0";
//   });

//   // Mostrar/ocultar senha
//   function togglePassword(inputId, imgId) {
//     const input = document.getElementById(inputId);
//     const img = document.getElementById(imgId);
//     const lock = "../images/password-lock.svg";
//     const unlock = "../images/password-unlock.svg";

//     img.addEventListener("click", () => {
//       const isVisible = input.type === "text";
//       input.type = isVisible ? "password" : "text";
//       img.src = isVisible ? lock : unlock;
//     });
//   }

//   togglePassword("senha-login", "toggle-signin-password");
//   togglePassword("senha", "toggle-signup-password");
// });
