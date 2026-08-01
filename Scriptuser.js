// ==========================================
// 1. MANAJEMEN DATABASE LOCALSTORAGE
// ==========================================
function getUsers() {
  const users = localStorage.getItem("app_users");
  if (!users) {
    const defaultData = [
      {
        fullname: "Administrator Utama",
        username: "RhyoTama",
        password: "SatrioIsna123!",
        role: "admin",
        status: "active"
      }
    ];
    localStorage.setItem("app_users", JSON.stringify(defaultData));
    return defaultData;
  }
  return JSON.parse(users);
}

function saveUsers(usersArray) {
  localStorage.setItem("app_users", JSON.stringify(usersArray));
}

// Cek Otomatis: Jika user sudah login, langsung alihkan ke user-dashboard
(function checkExistingUserSession() {
  const session = JSON.parse(sessionStorage.getItem("loggedUser"));
  if (session) {
    if (session.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "user-dashboard.html";
    }
  }
})();

// ==========================================
// 2. NAVIGASI TAMPILAN FORM
// ==========================================
function switchForm(target) {
  document.getElementById("box-login").classList.add("hidden");
  document.getElementById("box-daftar").classList.add("hidden");
  document.getElementById("box-lupa").classList.add("hidden");

  if (target === 'login') document.getElementById("box-login").classList.remove("hidden");
  if (target === 'daftar') document.getElementById("box-daftar").classList.remove("hidden");
  if (target === 'lupa') document.getElementById("box-lupa").classList.remove("hidden");
}

// ==========================================
// 3. FITUR SHOW / HIDE PASSWORD
// ==========================================
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

// ==========================================
// 4. VALIDASI ATURAN PASSWORD KETAT
// ==========================================
// Aturan: Min 8 Karakter, Huruf Besar, Huruf Kecil, Angka, dan Simbol (? ! : ; + - &)
const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[?!:;+\-&])[A-Za-z\d?!:;+\-&]{8,}$/;

function validatePasswordRequirement() {
  const pass = document.getElementById("reg-password").value;
  const hint = document.getElementById("pass-hint");

  if (passRegex.test(pass)) {
    hint.style.color = "#4ade80"; // Hijau
    hint.innerText = "✓ Password memenuhi syarat kriteria!";
    return true;
  } else {
    hint.style.color = "#f87171"; // Merah
    hint.innerText = "*Min. 8 karakter: kombinasikan huruf besar, kecil, angka, dan simbol (? ! : ; + - &)";
    return false;
  }
}

function checkPasswordMatch() {
  const pass = document.getElementById("reg-password").value;
  const confirmPass = document.getElementById("reg-confirm-password").value;
  const hint = document.getElementById("confirm-hint");

  if (confirmPass === "") {
    hint.innerText = "";
    return false;
  }

  if (pass === confirmPass) {
    hint.style.color = "#4ade80";
    hint.innerText = "✓ Password cocok!";
    return true;
  } else {
    hint.style.color = "#f87171";
    hint.innerText = "✗ Password tidak sama persis!";
    return false;
  }
}

// ==========================================
// 5. PROSES PENDAFTARAN USER
// ==========================================
function handleDaftar(e) {
  e.preventDefault();

  const fullname = document.getElementById("reg-fullname").value.trim();
  const username = document.getElementById("reg-username").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const phone = document.getElementById("reg-phone").value.trim();
  const password = document.getElementById("reg-password").value;
  const confirmPassword = document.getElementById("reg-confirm-password").value;

  const mother = document.getElementById("reg-mother").value.trim().toLowerCase();
  const father = document.getElementById("reg-father").value.trim().toLowerCase();
  const pob = document.getElementById("reg-pob").value.trim().toLowerCase();

  // Validasi Kombinasi Password
  if (!passRegex.test(password)) {
    alert("Password tidak memenuhi kriteria keamanan! Periksa petunjuk di bawah kolom password.");
    return;
  }

  // Validasi Kesamaan Password
  if (password !== confirmPassword) {
    alert("Konfirmasi password tidak cocok dengan password baru!");
    return;
  }

  let users = getUsers();

  // Cek duplikasi username
  if (users.find(u => u.username === username)) {
    alert("Username sudah terdaftar! Gunakan username lain.");
    return;
  }

  // Simpan data akun baru
  users.push({
    fullname,
    username,
    email,
    phone,
    password,
    mother,
    father,
    pob,
    role: "user",
    status: "active",
    muted: false,
    warning: ""
  });

  saveUsers(users);
  alert("Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.");
  document.getElementById("form-daftar").reset();
  switchForm('login');
}

// ==========================================
// 6. PROSES LOGIN & REDIRECT OTOMATIS
// ==========================================
function handleLogin(e) {
  e.preventDefault();

  const u = document.getElementById("login-username").value.trim();
  const p = document.getElementById("login-password").value.trim();

  const users = getUsers();
  const foundUser = users.find(user => user.username === u && user.password === p);

  if (!foundUser) {
    alert("Username atau Password salah!");
    return;
  }

  // Cek Status Banned dari Admin
  if (foundUser.status === "banned") {
    alert("AKUN DIBLOKIR! Anda tidak dapat masuk karena telah dibanned oleh admin.");
    return;
  }

  // Simpan Sesi Login
  sessionStorage.setItem("loggedUser", JSON.stringify(foundUser));

  // Pengarahan Halaman Otomatis
  if (foundUser.role === "admin") {
    window.location.href = "admin.html";
  } else {
    // LANGSUNG ARAHKAN KE DASHBOARD USER
    window.location.href = "user-dashboard.html";
  }
}

// ==========================================
// 7. PROSES LUPA PASSWORD
// ==========================================
let targetUserForReset = null;

function verifyUserForReset() {
  const u = document.getElementById("forget-username").value.trim();
  const users = getUsers();

  targetUserForReset = users.find(user => user.username === u && user.role !== "admin");

  if (!targetUserForReset) {
    alert("Username tidak ditemukan!");
    return;
  }

  document.getElementById("forget-step-1").classList.add("hidden");
  document.getElementById("forget-step-2").classList.remove("hidden");
}

function handleResetPassword() {
  const ansMother = document.getElementById("forget-ans-mother").value.trim().toLowerCase();
  const newPass = document.getElementById("forget-new-password").value;

  if (ansMother !== targetUserForReset.mother) {
    alert("Nama ibu kandung salah! Verifikasi gagal.");
    return;
  }

  if (!passRegex.test(newPass)) {
    alert("Password baru harus mengandung minimal 8 karakter dengan kombinasi huruf besar, kecil, angka, dan simbol khusus (? ! : ; + - &)!");
    return;
  }

  let users = getUsers();
  let idx = users.findIndex(u => u.username === targetUserForReset.username);

  users[idx].password = newPass;
  saveUsers(users);

  alert("Password berhasil diperbarui! Silakan masuk dengan password baru Anda.");
  location.reload();
}
