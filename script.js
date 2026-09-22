const students = [
  "Andi Pratama","Bima","Citra","Dimas","Eka","Fajar","Gina","Hadi","Intan","Joko",
  "Kiki","Lala","Maya","Nanda","Oki","Putri","Raka","Sinta","Tio","Udin",
  "Vina","Wawan","Yani","Zaki","Nama 25","Nama 26","Nama 27","Nama 28","Nama 29",
  "Nama 30","Nama 31","Nama 32","Nama 33","Nama 34"
];

const memberGrid = document.getElementById("memberGrid");
function renderMembers(list = students) {
  memberGrid.innerHTML = list.map((name, i) => `
    <article class="member-card">
      <div class="avatar">${name.split(" ").map(x => x[0]).join("").slice(0,2).toUpperCase()}</div>
      <b>${name}</b>
      <small>Absen ${i + 1} · ${i % 2 ? "MIPA" : "Teknik"}</small>
    </article>
  `).join("");
}
renderMembers();

document.getElementById("memberSearch").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  renderMembers(students.filter(s => s.toLowerCase().includes(q)));
});

const payments = document.getElementById("paymentGrid");
payments.innerHTML = students.map((name, i) => `
  <div class="payment ${i < 27 ? "paid" : "unpaid"}">
    ${i < 27 ? "✓" : "○"} ${name}
  </div>
`).join("");

const tasks = [
  {subject:"Matematika", title:"Latihan halaman 45", deadline:"Jumat", status:"pending"},
  {subject:"Fisika", title:"Mengerjakan soal bab 2", deadline:"Senin depan", status:"pending"},
  {subject:"Bahasa Indonesia", title:"Membuat rangkuman", deadline:"Selesai", status:"done"}
];

const taskList = document.getElementById("taskList");
function renderTasks(filter = "all") {
  const filtered = tasks.filter(t => filter === "all" || t.status === filter);
  taskList.innerHTML = filtered.map(t => `
    <article class="task">
      <div><b>${t.title}</b><br><small>${t.subject} · Deadline: ${t.deadline}</small></div>
      <span class="status ${t.status === "done" ? "done" : ""}">${t.status === "done" ? "Selesai" : "Belum selesai"}</span>
    </article>
  `).join("");
}
renderTasks();

document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    renderTasks(btn.dataset.filter);
  });
});

document.querySelectorAll(".done-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("done");
    btn.textContent = btn.classList.contains("done") ? "✓ Selesai" : "Tandai selesai";
  });
});

document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.getElementById("themeToggle").textContent =
    document.body.classList.contains("dark") ? "☀" : "☾";
  localStorage.setItem("classTheme", document.body.classList.contains("dark") ? "dark" : "light");
});

if (localStorage.getItem("classTheme") === "dark") {
  document.body.classList.add("dark");
  document.getElementById("themeToggle").textContent = "☀";
}

document.getElementById("todayDate").textContent = new Intl.DateTimeFormat("id-ID", {
  weekday:"long", day:"numeric", month:"long", year:"numeric"
}).format(new Date());

const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
menuToggle.addEventListener("click", () => nav.classList.toggle("open"));

document.querySelectorAll("#nav a").forEach(link => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

