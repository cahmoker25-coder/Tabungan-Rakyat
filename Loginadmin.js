// Credential Kunci Khusus Admin
const ADMIN_USER = "RhyoTama";
const ADMIN_PASS = "SatrioIsna123!";

// Inisialisasi Akun Admin ke LocalStorage
function initAdminAccount() {
  let users = JSON.parse(localStorage.getItem("app_users")) || [];
  const adminExists = users.some(u => u.username === ADMIN_USER);

  if (!adminExists) {
    users.push({
      fullname: "Administrator Utama",
      username: ADMIN_USER,
      password: ADMIN_PASS,
      role: "admin",
      status: "active"
    });
    localStorage.setItem("app_users", JSON.stringify(users));
  }
}

initAdminAccount();

// Auto Check: Jika Admin Sudah Login, Langsung Lempar ke Dashboard
(function checkExistingAdminSession() {
  const session = JSON.parse(sessionStorage.getItem("loggedUser"));
  if (session && session.role === "admin") {
    window.location.href = "admin.html";
  }
})();

// Fitur Show/Hide Password
function togglePassword(inputId, eyeIcon) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    eyeIcon.innerText = "🙈";
  } else {
    input.type = "password";
    eyeIcon.innerText = "👁️";
  }
}

// Logika Login Admin -> LANGSUNG REDIRECT
function handleAdminLogin(e) {
  e.preventDefault();

  const inputUser = document.getElementById("admin-username").value.trim();
  const inputPass = document.getElementById("admin-password").value.trim();

  if (inputUser === ADMIN_USER && inputPass === ADMIN_PASS) {
    const adminSession = {
      username: ADMIN_USER,
      role: "admin",
      loginTime: new Date().getTime()
    };

    // Simpan Sesi Login
    sessionStorage.setItem("loggedUser", JSON.stringify(adminSession));

    // Langsung arahkan tanpa hambatan ke Dashboard Panel Admin
    window.location.href = "admin.html";
  } else {
    alert("AKSES DITOLAK! Username atau Password Admin salah.");
  }
}
