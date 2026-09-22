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

function toggleMenu(forceClose = false) {
  if (forceClose) {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  } else {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    menuToggle.textContent = isOpen ? "✕" : "☰";
  }
}

menuToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu();
});

document.querySelectorAll("#nav a").forEach(link => {
  link.addEventListener("click", () => {
    toggleMenu(true);
    document.querySelectorAll("#nav a").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
  });
});

document.addEventListener("click", (e) => {
  if (nav.classList.contains("open") && !nav.contains(e.target) && e.target !== menuToggle) {
    toggleMenu(true);
  }
});

