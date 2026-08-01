// --- 1. INISIALISASI DATA AWAL (DEFAULT ADMIN) ---
function getUsers() {
  const users = localStorage.getItem("app_users");
  if (!users) {
    // Akun bawaan admin pertama kali
    const defaultData = [
      {
        username: "admin",
        password: "admin123",
        role: "admin",
        status: "active",
        question: "-",
        answer: "-",
        warning: ""
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

// --- 2. NAVIGASI TAMPILAN ---
function showForm(formType) {
  document.getElementById("box-login").classList.add("hidden");
  document.getElementById("box-daftar").classList.add("hidden");
  document.getElementById("box-lupa").classList.add("hidden");

  if (formType === 'login') document.getElementById("box-login").classList.remove("hidden");
  if (formType === 'daftar') document.getElementById("box-daftar").classList.remove("hidden");
  if (formType === 'lupa') document.getElementById("box-lupa").classList.remove("hidden");
}

// --- 3. FITUR DAFTAR AKUN ---
function daftar() {
  const u = document.getElementById("reg-username").value.trim();
  const p = document.getElementById("reg-password").value.trim();
  const q = document.getElementById("reg-question").value;
  const a = document.getElementById("reg-answer").value.trim();

  if (!u || !p || !a) return alert("Semua kolom wajib diisi!");

  let users = getUsers();
  if (users.find(user => user.username === u)) {
    return alert("Username sudah dipakai, cari yang lain!");
  }

  users.push({
    username: u,
    password: p,
    role: "user",
    status: "active",
    question: q,
    answer: a.toLowerCase(), // simpan jawaban kecil semua biar gak sensitif kapital
    warning: ""
  });

  saveUsers(users);
  alert("Pendaftaran Berhasil! Silakan Login.");
  showForm("login");
}

// --- 4. FITUR LOGIN ---
function login() {
  const u = document.getElementById("login-username").value.trim();
  const p = document.getElementById("login-password").value.trim();

  const users = getUsers();
  const foundUser = users.find(user => user.username === u && user.password === p);

  if (!foundUser) {
    return alert("Username atau Password salah!");
  }

  // Cek jika akun di-BAN oleh admin
  if (foundUser.status === "banned") {
    return alert("AKUN ANDA DIBLOKIR/BANNED OLEH ADMIN! Tidak dapat masuk.");
  }

  // Simpan sesi login sementara
  sessionStorage.setItem("loggedUser", JSON.stringify(foundUser));

  // Jika ADMIN
  if (foundUser.role === "admin") {
    window.location.href = "admin.html";
  } else {
    // Jika USER BIASA
    document.getElementById("box-login").classList.add("hidden");
    document.getElementById("box-user-dashboard").classList.remove("hidden");
    document.getElementById("user-welcome").innerText = "Halo, " + foundUser.username + "!";
    
    // Cek Apakah Ada Teguran dari Admin
    if (foundUser.warning) {
      const warnBox = document.getElementById("user-warning");
      warnBox.innerText = "TEGURAN ADMIN: " + foundUser.warning;
      warnBox.classList.remove("hidden");
    }
  }
}

function logout() {
  sessionStorage.removeItem("loggedUser");
  location.reload();
}

// --- 5. FITUR LUPA SANDI ---
let targetUserLupa = null;

function cekUsernameLupa() {
  const u = document.getElementById("forget-username").value.trim();
  const users = getUsers();
  targetUserLupa = users.find(user => user.username === u && user.role !== "admin");

  if (!targetUserLupa) {
    return alert("Username tidak ditemukan!");
  }

  document.getElementById("label-question").innerText = "Pertanyaan: " + targetUserLupa.question;
  document.getElementById("step-1").classList.add("hidden");
  document.getElementById("step-2").classList.remove("hidden");
}

function resetPassword() {
  const ans = document.getElementById("forget-answer").value.trim().toLowerCase();
  const newPass = document.getElementById("forget-new-pass").value.trim();

  if (!ans || !newPass) return alert("Semua kolom harus diisi!");

  if (ans !== targetUserLupa.answer) {
    return alert("Jawaban pertanyaan keamanan SALAH!");
  }

  let users = getUsers();
  let userIndex = users.findIndex(u => u.username === targetUserLupa.username);
  
  users[userIndex].password = newPass;
  saveUsers(users);

  alert("Password Berhasil Diubah! Silakan Login dengan Password Baru.");
  location.reload();
}

// --- 6. LOGIKA DASHBOARD ADMIN ---
function loadAdminPanel() {
  const users = getUsers();
  const tbody = document.getElementById("user-table-body");
  tbody.innerHTML = "";

  users.forEach((u, index) => {
    if (u.role === "admin") return; // Jangan tampilkan sesama admin di tabel moderasi

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><b>${u.username}</b></td>
      <td><span style="color:${u.status === 'banned' ? 'red' : 'lightgreen'}">${u.status.toUpperCase()}</span></td>
      <td>${u.warning || '-'}</td>
      <td>
        ${u.status === 'active' 
          ? `<button class="btn-ban" onclick="toggleBan(${index}, 'banned')">BAN</button>` 
          : `<button class="btn-unban" onclick="toggleBan(${index}, 'active')">UNBAN</button>`}
        <button class="btn-warn" onclick="kirimTeguran(${index})">Tegur</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function toggleBan(index, newStatus) {
  let users = getUsers();
  users[index].status = newStatus;
  saveUsers(users);
  loadAdminPanel();
}

function kirimTeguran(index) {
  const msg = prompt("Masukkan Pesan Teguran untuk pengguna ini:");
  if (msg !== null) {
    let users = getUsers();
    users[index].warning = msg;
    saveUsers(users);
    loadAdminPanel();
    alert("Teguran terkirim!");
  }
}
