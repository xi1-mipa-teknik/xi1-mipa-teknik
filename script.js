// ============================================================================
// XI-1 MIPA TEKNIK - CORE & INTERACTIVE SCRIPT
// ============================================================================

// 1. DATA SISWA (34 Siswa XI-1)
const students = [
  "Andi Pratama", "Bima", "Citra", "Dimas", "Eka", "Fajar", "Gina", "Hadi", "Intan", "Joko",
  "Kiki", "Lala", "Maya", "Nanda", "Oki", "Putri", "Raka", "Sinta", "Tio", "Udin",
  "Vina", "Wawan", "Yani", "Zaki", "Nama 25", "Nama 26", "Nama 27", "Nama 28", "Nama 29",
  "Nama 30", "Nama 31", "Nama 32", "Nama 33", "Nama 34"
];

// Helper: Format Rupiah (contoh: 350000 -> Rp350.000)
function formatRupiah(num) {
  return "Rp" + Math.abs(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ============================================================================
// 2. ANGGOTA KELAS & PENCARIAN
// ============================================================================
const memberGrid = document.getElementById("memberGrid");
const memberSearch = document.getElementById("memberSearch");

function renderMembers(list = students) {
  if (!memberGrid) return;
  memberGrid.innerHTML = list.map((name, i) => `
    <article class="member-card">
      <div class="avatar">${name.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase()}</div>
      <b>${name}</b>
      <small>Absen ${i + 1} · ${i % 2 ? "MIPA" : "Teknik"}</small>
    </article>
  `).join("");
}
renderMembers();

if (memberSearch) {
  memberSearch.addEventListener("input", e => {
    const q = e.target.value.toLowerCase().trim();
    renderMembers(students.filter(s => s.toLowerCase().includes(q)));
  });
}

// ============================================================================
// 3. STATUS PEMBAYARAN KAS (INTERAKTIF & LOCALSTORAGE)
// ============================================================================
const paymentGrid = document.getElementById("paymentGrid");
const paymentSummary = document.getElementById("paymentSummary");
const btnResetPayment = document.getElementById("btnResetPayment");
const STORAGE_PAYMENT = "xi1_payment_status_v3";

function getDefaultPaymentStatus() {
  // 27 Lunas pertama, 7 Belum bayar
  return students.map((_, i) => i < 27);
}

function loadPaymentStatus() {
  try {
    const saved = localStorage.getItem(STORAGE_PAYMENT);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === students.length) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Gagal memuat status pembayaran:", err);
  }
  return getDefaultPaymentStatus();
}

let paymentStatus = loadPaymentStatus();

function savePaymentStatus() {
  try {
    localStorage.setItem(STORAGE_PAYMENT, JSON.stringify(paymentStatus));
  } catch (err) {
    console.warn("Gagal menyimpan status pembayaran:", err);
  }
}

function renderPayments() {
  if (!paymentGrid) return;
  const paidCount = paymentStatus.filter(Boolean).length;
  const unpaidCount = paymentStatus.length - paidCount;

  if (paymentSummary) {
    paymentSummary.textContent = `${paidCount} Lunas · ${unpaidCount} Belum Bayar`;
  }

  paymentGrid.innerHTML = students.map((name, i) => {
    const isPaid = paymentStatus[i];
    return `
      <div class="payment ${isPaid ? "paid" : "unpaid"}" data-index="${i}" title="Klik untuk beralih status ${name}">
        <span class="payment-status-tag">${isPaid ? "✓ Sudah Bayar" : "☐ Belum Bayar"}</span>
        <span class="payment-name">${name}</span>
      </div>
    `;
  }).join("");

  paymentGrid.querySelectorAll(".payment").forEach(el => {
    el.addEventListener("click", () => {
      const idx = parseInt(el.getAttribute("data-index"), 10);
      if (!isNaN(idx)) {
        paymentStatus[idx] = !paymentStatus[idx];
        savePaymentStatus();
        renderPayments();
      }
    });
  });
}
renderPayments();

if (btnResetPayment) {
  btnResetPayment.addEventListener("click", () => {
    if (confirm("Reset seluruh status pembayaran kas ke status awal (27 Sudah Bayar, 7 Belum Bayar)?")) {
      paymentStatus = getDefaultPaymentStatus();
      savePaymentStatus();
      renderPayments();
    }
  });
}

// ============================================================================
// 4. KAS KELAS (TAMBAH KAS, PENGELUARAN, RIWAYAT & LOCALSTORAGE)
// ============================================================================
const STORAGE_KAS = "xi1_kas_transactions_v3";

const defaultTransactions = [
  { id: "tx_1", date: "12 Sep", desc: "Saldo awal kas kelas", amount: 350000, type: "income" },
  { id: "tx_2", date: "12 Sep", desc: "Iuran kas", amount: 50000, type: "income" },
  { id: "tx_3", date: "14 Sep", desc: "Beli spidol", amount: 15000, type: "expense" },
  { id: "tx_4", date: "18 Sep", desc: "Iuran kas", amount: 100000, type: "income" },
  { id: "tx_5", date: "20 Sep", desc: "Konsumsi & perlengkapan", amount: 135000, type: "expense" }
];

function loadKasTransactions() {
  try {
    const saved = localStorage.getItem(STORAGE_KAS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Gagal memuat riwayat kas:", err);
  }
  return defaultTransactions;
}

let kasTransactions = loadKasTransactions();

function saveKasTransactions() {
  try {
    localStorage.setItem(STORAGE_KAS, JSON.stringify(kasTransactions));
  } catch (err) {
    console.warn("Gagal menyimpan transaksi kas:", err);
  }
}

const saldoKasEl = document.getElementById("saldoKas");
const totalPemasukanEl = document.getElementById("totalPemasukan");
const totalPengeluaranEl = document.getElementById("totalPengeluaran");
const transactionTableBody = document.getElementById("transactionTableBody");

function renderKas() {
  let totalIncome = 0;
  let totalExpense = 0;

  kasTransactions.forEach(tx => {
    if (tx.type === "income") totalIncome += tx.amount;
    else if (tx.type === "expense") totalExpense += tx.amount;
  });

  const saldo = totalIncome - totalExpense;

  if (saldoKasEl) saldoKasEl.textContent = formatRupiah(saldo);
  if (totalPemasukanEl) totalPemasukanEl.textContent = formatRupiah(totalIncome);
  if (totalPengeluaranEl) totalPengeluaranEl.textContent = formatRupiah(totalExpense);

  if (transactionTableBody) {
    if (kasTransactions.length === 0) {
      transactionTableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: #8896ab; padding: 24px;">Belum ada riwayat transaksi kas.</td>
        </tr>
      `;
      return;
    }

    transactionTableBody.innerHTML = kasTransactions.map(tx => {
      const isIncome = tx.type === "income";
      return `
        <tr data-id="${tx.id}">
          <td>${tx.date}</td>
          <td>${tx.desc}</td>
          <td class="${isIncome ? "income" : "expense"}">${isIncome ? "+" : "-"}${formatRupiah(tx.amount)}</td>
          <td class="td-action">
            <button type="button" class="btn-delete-tx" data-id="${tx.id}" title="Hapus transaksi ini">Hapus</button>
          </td>
        </tr>
      `;
    }).join("");

    transactionTableBody.querySelectorAll(".btn-delete-tx").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const item = kasTransactions.find(t => t.id === id);
        if (item && confirm(`Hapus transaksi "${item.desc}" (${formatRupiah(item.amount)})?`)) {
          kasTransactions = kasTransactions.filter(t => t.id !== id);
          saveKasTransactions();
          renderKas();
        }
      });
    });
  }
}
renderKas();

// Modal Kas (Pemasukan & Pengeluaran)
const kasModal = document.getElementById("kasModal");
const kasModalTitle = document.getElementById("kasModalTitle");
const kasForm = document.getElementById("kasForm");
const kasTypeInput = document.getElementById("kasType");
const kasAmountInput = document.getElementById("kasAmount");
const kasDescInput = document.getElementById("kasDesc");
const kasDateInput = document.getElementById("kasDate");
const btnTambahKas = document.getElementById("btnTambahKas");
const btnPengeluaran = document.getElementById("btnPengeluaran");
const closeKasModal = document.getElementById("closeKasModal");
const cancelKasModal = document.getElementById("cancelKasModal");

function openKasModal(type) {
  if (!kasModal) return;
  kasTypeInput.value = type;
  if (type === "income") {
    kasModalTitle.textContent = "+ Tambah Kas (Pemasukan)";
    kasDescInput.placeholder = "Contoh: Iuran kas minggu ke-3";
  } else {
    kasModalTitle.textContent = "− Catat Pengeluaran";
    kasDescInput.placeholder = "Contoh: Beli spidol & penghapus papan";
  }

  // Isi tanggal hari ini otomatis (contoh: "22 Sep")
  const now = new Date();
  const dateFormatted = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(now);
  kasDateInput.value = dateFormatted;
  kasAmountInput.value = "";
  kasModal.classList.add("open");
  kasModal.setAttribute("aria-hidden", "false");
  setTimeout(() => kasAmountInput.focus(), 60);
}

function closeKasModalDialog() {
  if (!kasModal) return;
  kasModal.classList.remove("open");
  kasModal.setAttribute("aria-hidden", "true");
}

if (btnTambahKas) btnTambahKas.addEventListener("click", () => openKasModal("income"));
if (btnPengeluaran) btnPengeluaran.addEventListener("click", () => openKasModal("expense"));
if (closeKasModal) closeKasModal.addEventListener("click", closeKasModalDialog);
if (cancelKasModal) cancelKasModal.addEventListener("click", closeKasModalDialog);

if (kasModal) {
  kasModal.addEventListener("click", e => {
    if (e.target === kasModal) closeKasModalDialog();
  });
}

if (kasForm) {
  kasForm.addEventListener("submit", e => {
    e.preventDefault();
    const amount = parseInt(kasAmountInput.value, 10);
    const desc = kasDescInput.value.trim();
    let date = kasDateInput.value.trim();

    if (!date) {
      date = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date());
    }

    if (!amount || amount <= 0 || !desc) {
      alert("Harap masukkan nominal dan keterangan yang valid.");
      return;
    }

    const newTx = {
      id: "tx_" + Date.now(),
      date: date,
      desc: desc,
      amount: amount,
      type: kasTypeInput.value === "expense" ? "expense" : "income"
    };

    kasTransactions.unshift(newTx);
    saveKasTransactions();
    renderKas();
    closeKasModalDialog();
  });
}

// ============================================================================
// 5. PIKET HARI INI (TAMBAH NAMA, HAPUS PER NAMA, HAPUS SEMUA, RESET)
// ============================================================================
const STORAGE_PIKET = "xi1_today_piket_v3";
const defaultPiket = ["Andi", "Bima", "Citra", "Dimas", "Eka", "Fajar"];

function loadPiketNames() {
  try {
    const saved = localStorage.getItem(STORAGE_PIKET);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("Gagal memuat jadwal piket:", err);
  }
  return [...defaultPiket];
}

let piketNames = loadPiketNames();

function savePiketNames() {
  try {
    localStorage.setItem(STORAGE_PIKET, JSON.stringify(piketNames));
  } catch (err) {
    console.warn("Gagal menyimpan jadwal piket:", err);
  }
}

const piketTodayList = document.getElementById("piketTodayList");
const piketCountEl = document.getElementById("piketCount");
const btnToggleAddPiket = document.getElementById("btnToggleAddPiket");
const btnResetPiket = document.getElementById("btnResetPiket");
const addPiketForm = document.getElementById("addPiketForm");
const piketNameInput = document.getElementById("piketNameInput");
const btnCancelAddPiket = document.getElementById("btnCancelAddPiket");
const btnClearAllPiket = document.getElementById("btnClearAllPiket");

function renderPiket() {
  if (piketCountEl) {
    piketCountEl.textContent = `Kelompok 1 · ${piketNames.length} siswa`;
  }

  if (!piketTodayList) return;

  if (piketNames.length === 0) {
    piketTodayList.innerHTML = `
      <li style="padding: 14px; text-align: center; color: #8896ab; font-size: 13px;">
        Belum ada siswa piket hari ini. Klik tombol <b>+ Tambah Nama</b> untuk menambahkan.
      </li>
    `;
    return;
  }

  piketTodayList.innerHTML = piketNames.map((name, i) => `
    <li class="piket-today-item">
      <div class="piket-item-left">
        <span class="piket-num-badge">${i + 1}</span>
        <b>${name}</b>
      </div>
      <button type="button" class="piket-del-btn" data-index="${i}" title="Hapus ${name} dari daftar piket">&times;</button>
    </li>
  `).join("");

  piketTodayList.querySelectorAll(".piket-del-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-index"), 10);
      if (!isNaN(idx)) {
        piketNames.splice(idx, 1);
        savePiketNames();
        renderPiket();
      }
    });
  });
}
renderPiket();

if (btnToggleAddPiket) {
  btnToggleAddPiket.addEventListener("click", () => {
    if (addPiketForm) {
      const isHidden = addPiketForm.style.display === "none";
      addPiketForm.style.display = isHidden ? "flex" : "none";
      if (isHidden) {
        piketNameInput.value = "";
        piketNameInput.focus();
      }
    }
  });
}

if (btnCancelAddPiket) {
  btnCancelAddPiket.addEventListener("click", () => {
    if (addPiketForm) addPiketForm.style.display = "none";
  });
}

if (addPiketForm) {
  addPiketForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = piketNameInput.value.trim();
    if (!name) return;
    piketNames.push(name);
    savePiketNames();
    renderPiket();
    piketNameInput.value = "";
    piketNameInput.focus();
  });
}

if (btnClearAllPiket) {
  btnClearAllPiket.addEventListener("click", () => {
    if (piketNames.length === 0) return;
    if (confirm("Hapus seluruh siswa piket hari ini?")) {
      piketNames = [];
      savePiketNames();
      renderPiket();
    }
  });
}

if (btnResetPiket) {
  btnResetPiket.addEventListener("click", () => {
    if (confirm("Kembalikan daftar piket hari ini ke susunan awal?")) {
      piketNames = [...defaultPiket];
      savePiketNames();
      renderPiket();
    }
  });
}

// ============================================================================
// 6. GALERI & DOKUMENTASI MULTI-FOTO (SATU DOKUMENTASI = BANYAK FOTO)
// ============================================================================
const IDB_DOCS_NAME = "XI1MipaTeknikDocsDB_v2";
const IDB_DOCS_STORE = "documentations";
const STORAGE_DOCS_FALLBACK = "xi1_documentations_gallery_v4";

// Helper: Buat placeholder gambar SVG yang indah untuk foto dokumentasi bawaan
function generateDocPhotoSvg(title, number, total, theme) {
  const themes = {
    mpls: { bg1: "#1e3a8a", bg2: "#3b82f6", icon: "🏕️", tag: "MPLS XI-1" },
    classmeeting: { bg1: "#065f46", bg2: "#10b981", icon: "🏆", tag: "CLASSMEETING" },
    diesnatalis: { bg1: "#831843", bg2: "#ec4899", icon: "🎉", tag: "DIESNATALIS" },
    praktikum: { bg1: "#4c1d95", bg2: "#8b5cf6", icon: "🔬", tag: "LAB TEKNIK" },
    default: { bg1: "#0f172a", bg2: "#2563eb", icon: "📸", tag: "DOKUMENTASI" }
  };
  const t = themes[theme] || themes.default;
  const numPad = String(number).padStart(2, "0");
  const totPad = String(total).padStart(2, "0");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${t.bg1}"/>
        <stop offset="100%" stop-color="${t.bg2}"/>
      </linearGradient>
      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="600" height="400" fill="url(#g)"/>
    <rect width="600" height="400" fill="url(#grid)"/>
    <circle cx="300" cy="180" r="85" fill="rgba(255,255,255,0.1)"/>
    <text x="300" y="195" font-size="64" text-anchor="middle" dominant-baseline="middle">${t.icon}</text>
    <rect x="230" y="50" width="140" height="26" rx="13" fill="rgba(0,0,0,0.3)"/>
    <text x="300" y="67" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="1">${t.tag}</text>
    <text x="300" y="305" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="#ffffff" text-anchor="middle">${title}</text>
    <text x="300" y="335" font-family="system-ui, sans-serif" font-size="13" font-weight="500" fill="rgba(255,255,255,0.85)" text-anchor="middle">Foto ${number} dari ${total} Kegiatan</text>
    <rect x="25" y="25" width="55" height="24" rx="4" fill="rgba(0,0,0,0.4)"/>
    <text x="52" y="41" font-family="monospace, sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">#${numPad}</text>
    <rect x="510" y="25" width="65" height="24" rx="4" fill="rgba(0,0,0,0.4)"/>
    <text x="542" y="41" font-family="monospace, sans-serif" font-size="11" font-weight="600" fill="#e2e8f0" text-anchor="middle">${numPad}/${totPad}</text>
  </svg>`;

  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

// Data Dokumentasi Bawaan dengan Multi-Foto
const initialDocumentations = [
  {
    id: "doc_resmi_xi1",
    title: "Dokumentasi Resmi Kelas XI-1 MIPA Teknik",
    category: "KEGIATAN",
    date: "Semester Ganjil 2026",
    description: "Kumpulan foto kenangan resmi kebersamaan seluruh siswa-siswi dan wali kelas XI-1 MIPA Teknik.",
    isBuiltIn: true,
    photos: [
      { id: "p_resmi_1", title: "Foto Bersama Kelas XI-1", caption: "Potret formasi lengkap kelas XI-1 MIPA Teknik", dataUrl: "IMG_6432.jpeg", isRealImage: true },
      { id: "p_resmi_2", title: "Wali Kelas & Pengurus", caption: "Bimbingan Ibu Wali Kelas dan jajaran pengurus harian", dataUrl: generateDocPhotoSvg("Wali Kelas & Pengurus", 2, 6, "default") },
      { id: "p_resmi_3", title: "Ruang Kelas & Lab Teknik", caption: "Suasana nyaman ruang belajar XI-1 MIPA Teknik", dataUrl: generateDocPhotoSvg("Ruang Kelas & Lab", 3, 6, "default") },
      { id: "p_resmi_4", title: "Diskusi Kelompok Belajar", caption: "Kerja kelompok praktikum dan riset fisika terapan", dataUrl: generateDocPhotoSvg("Diskusi Kelompok", 4, 6, "default") },
      { id: "p_resmi_5", title: "Persiapan Lomba Sains", caption: "Bimbingan karya ilmiah remaja dan rekayasa teknologi", dataUrl: generateDocPhotoSvg("Persiapan Lomba Sains", 5, 6, "default") },
      { id: "p_resmi_6", title: "Kebersamaan Jam Istirahat", caption: "Canda tawa dan momen hangat saat jam istirahat", dataUrl: generateDocPhotoSvg("Kebersamaan Istirahat", 6, 6, "default") }
    ]
  },
  {
    id: "doc_mpls_2026",
    title: "Dokumentasi MPLS 2026",
    category: "MPLS",
    date: "18 - 20 Juli 2026",
    description: "Kegiatan Masa Pengenalan Lingkungan Sekolah, pembentukan karakter, dan makrab angkatan XI-1.",
    isBuiltIn: true,
    photos: [
      { id: "p_mpls_1", title: "Upacara Pembukaan MPLS", caption: "Apel pagi dan penyematan tanda peserta", dataUrl: generateDocPhotoSvg("Upacara Pembukaan MPLS", 1, 15, "mpls") },
      { id: "p_mpls_2", title: "Pengenalan Wali Kelas & Guru", caption: "Sambutan hangat dari dewan guru dan wali kelas", dataUrl: generateDocPhotoSvg("Pengenalan Guru", 2, 15, "mpls") },
      { id: "p_mpls_3", title: "Yel-Yel Kelas XI-1", caption: "Kekompakan yel-yel penuh semangat membara", dataUrl: generateDocPhotoSvg("Yel-Yel Semangat XI-1", 3, 15, "mpls") },
      { id: "p_mpls_4", title: "Tur Laboratorium Komputer", caption: "Pengenalan sarana lab komputer dan robotika", dataUrl: generateDocPhotoSvg("Tur Lab Komputer", 4, 15, "mpls") },
      { id: "p_mpls_5", title: "Game Kekompakan Baris", caption: "Latihan konsentrasi dan baris-berbaris ceria", dataUrl: generateDocPhotoSvg("Game Kekompakan", 5, 15, "mpls") },
      { id: "p_mpls_6", title: "Ice Breaking & Tebak Kata", caption: "Keseruan kuis beregu bersama kakak pendamping", dataUrl: generateDocPhotoSvg("Ice Breaking Seru", 6, 15, "mpls") },
      { id: "p_mpls_7", title: "Makan Siang Bersama di Aula", caption: "Menikmati bekal makan siang bersama teman baru", dataUrl: generateDocPhotoSvg("Makan Bersama di Aula", 7, 15, "mpls") },
      { id: "p_mpls_8", title: "Seminar Motivasi Belajar", caption: "Materi inspiratif motivasi belajar di jurusan teknik", dataUrl: generateDocPhotoSvg("Seminar Motivasi", 8, 15, "mpls") },
      { id: "p_mpls_9", title: "Outbound Lapangan Hijau", caption: "Permainan ketangkasan tali dan pipa estafet", dataUrl: generateDocPhotoSvg("Outbound Lapangan", 9, 15, "mpls") },
      { id: "p_mpls_10", title: "Tarik Tambang Antar Gugus", caption: "Adu kekuatan sportif antar gugus siswa", dataUrl: generateDocPhotoSvg("Tarik Tambang Seru", 10, 15, "mpls") },
      { id: "p_mpls_11", title: "Pentas Seni Kreatif", caption: "Penampilan musik akustik dan stand-up comedy", dataUrl: generateDocPhotoSvg("Pentas Seni Kreatif", 11, 15, "mpls") },
      { id: "p_mpls_12", title: "Api Unggun Malam Keakraban", caption: "Suasana syahdu lingkaran api unggun malam hari", dataUrl: generateDocPhotoSvg("Api Unggun Makrab", 12, 15, "mpls") },
      { id: "p_mpls_13", title: "Renungan & Doa Bersama", caption: "Momen refleksi diri untuk melangkah lebih maju", dataUrl: generateDocPhotoSvg("Renungan & Doa", 13, 15, "mpls") },
      { id: "p_mpls_14", title: "Foto Bersama Seluruh Angkatan", caption: "Potret ceria di depan panggung utama", dataUrl: generateDocPhotoSvg("Foto Bersama Angkatan", 14, 15, "mpls") },
      { id: "p_mpls_15", title: "Penutupan & Penyerahan Hadiah", caption: "Penyerahan piala gugus terkompak dan terfavorit", dataUrl: generateDocPhotoSvg("Penutupan & Juara", 15, 15, "mpls") }
    ]
  },
  {
    id: "doc_classmeeting_2026",
    title: "Dokumentasi Class Meeting 2026",
    category: "CLASSMEETING",
    date: "14 - 18 Desember 2026",
    description: "Pekan olahraga, seni, dan e-sports semester genap yang dimenangkan oleh kelas XI-1 MIPA Teknik.",
    isBuiltIn: true,
    photos: Array.from({ length: 20 }, (_, i) => {
      const activities = [
        "Babak Penyisihan Futsal", "Gol Spektakuler Menit Akhir", "Selebrasi Tim Futsal XI-1",
        "Pertandingan Basket Putri", "Tembakan 3 Poin Kemenangan", "Turnamen Catur Cepat",
        "Strategi Skakmat Catur", "Kompetisi Mobile Legends", "Final E-Sports MLBB",
        "Angkat Piala Juara E-Sports", "Lomba Tarik Tambang", "Sorak Suporter Kelas XI-1",
        "Banner & Maskot Kelas", "Lomba Nyanyi Solo Vokal", "Koreografi Modern Dance",
        "Lomba Estafet Karung Helm", "Duel Badminton Ganda Putra", "Smash Keras Badminton",
        "Penyerahan Medali Emas", "Pawai Juara Umum Kelas"
      ];
      const title = activities[i] || `Momen Classmeeting #${i + 1}`;
      return {
        id: `p_cm_${i + 1}`,
        title: title,
        caption: `Keseruan lomba classmeeting hari ke-${Math.floor(i / 4) + 1}`,
        dataUrl: generateDocPhotoSvg(title, i + 1, 20, "classmeeting")
      };
    })
  },
  {
    id: "doc_diesnatalis_2026",
    title: "Dokumentasi Diesnatalis Sekolah",
    category: "DIESNATALIS",
    date: "25 - 26 Januari 2026",
    description: "Gebyar Pensi HUT Sekolah: Stand bazar kuliner XI-1, pameran inovasi robotika, dan live music.",
    isBuiltIn: true,
    photos: Array.from({ length: 12 }, (_, i) => {
      const events = [
        "Dekorasi Gapura Pensi", "Stand Bazar Kuliner XI-1", "Menu Spesial Es Lemonade XI-1",
        "Antrean Pengunjung Bazar", "Pameran Inovasi Robotika", "Demo Sensor Otomasi Siswa",
        "Live Music Band XI-1", "Penampilan Solo Gitaris", "Lomba Fotografi & Sinema",
        "Karnaval Kostum Budaya", "Pemotongan Tumpeng Raksasa", "Pesta Kembang Api Spektakuler"
      ];
      const title = events[i] || `Momen Diesnatalis #${i + 1}`;
      return {
        id: `p_dn_${i + 1}`,
        title: title,
        caption: `Rangkaian perayaan Diesnatalis HUT ke-38`,
        dataUrl: generateDocPhotoSvg(title, i + 1, 12, "diesnatalis")
      };
    })
  }
];

let allDocumentations = [];
let customDocumentations = [];

// IndexedDB Storage Helpers
function openDocsDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error("IndexedDB tidak didukung"));
    const request = window.indexedDB.open(IDB_DOCS_NAME, 1);
    request.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_DOCS_STORE)) {
        db.createObjectStore(IDB_DOCS_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadDocumentationsAsync() {
  try {
    const db = await openDocsDB();
    const stored = await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_DOCS_STORE, "readonly");
      const store = tx.objectStore(IDB_DOCS_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    if (stored && stored.length > 0) {
      customDocumentations = stored;
      combineAndRenderDocs();
      return;
    }
  } catch (err) {
    console.warn("IndexedDB docs tidak aktif, fallback localStorage:", err);
  }

  try {
    const saved = localStorage.getItem(STORAGE_DOCS_FALLBACK);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        customDocumentations = parsed;
      }
    }
  } catch (err) {
    console.warn("Gagal parse localStorage:", err);
  }

  combineAndRenderDocs();
}

function combineAndRenderDocs() {
  // Dokumentasi kustom hasil unggahan siswa ditampilkan paling atas agar langsung terlihat
  allDocumentations = [...customDocumentations, ...initialDocumentations];
  renderDocumentationList();
}

async function persistCustomDocs() {
  try {
    const db = await openDocsDB();
    const tx = db.transaction(IDB_DOCS_STORE, "readwrite");
    const store = tx.objectStore(IDB_DOCS_STORE);
    store.clear();
    customDocumentations.forEach(doc => store.put(doc));
  } catch (e) {
    console.warn("Gagal simpan ke IndexedDB:", e);
  }

  try {
    localStorage.setItem(STORAGE_DOCS_FALLBACK, JSON.stringify(customDocumentations));
  } catch (e) {
    console.warn("Penyimpanan lokal penuh saat menyimpan foto:", e);
  }
}

// Kompresi gambar melalui HTML5 Canvas (ukuran proporsional max 1280px)
function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1280;
        let w = img.width;
        let h = img.height;

        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        resolve({
          name: file.name.replace(/\.[^/.]+$/, ""),
          dataUrl: dataUrl
        });
      };
      img.onerror = () => reject(new Error("File gambar rusak atau tidak dapat dibaca"));
      img.src = ev.target.result;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file dari perangkat"));
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// RENDER KARTU DOKUMENTASI (DOKUMENTASI DENGAN HORIZONTAL SCROLL REEL)
// ============================================================================
const docList = document.getElementById("docList");
const gallerySummaryText = document.getElementById("gallerySummaryText");

function renderDocumentationList() {
  if (!docList) return;

  const totalDocs = allDocumentations.length;
  const totalPhotos = allDocumentations.reduce((sum, d) => sum + (d.photos ? d.photos.length : 0), 0);

  if (gallerySummaryText) {
    gallerySummaryText.textContent = `${totalDocs} dokumentasi kegiatan · Total ${totalPhotos} foto · Geser foto secara horizontal`;
  }

  docList.innerHTML = allDocumentations.map((doc, docIdx) => {
    const photoCount = doc.photos ? doc.photos.length : 0;
    const isCustom = !doc.isBuiltIn;

    const photosHtml = (doc.photos || []).map((photo, pIdx) => {
      const numLabel = pIdx + 1;
      return `
        <div class="doc-photo-thumb" data-doc-id="${doc.id}" data-photo-idx="${pIdx}" title="${photo.title || `Foto ${numLabel}`} (Klik untuk perbesar)">
          <img src="${photo.dataUrl}" alt="${photo.title || doc.title}" loading="lazy">
          <div class="doc-photo-overlay">
            <span class="doc-photo-idx">#${numLabel}</span>
            <span class="doc-photo-zoom-icon">🔍</span>
          </div>
          ${isCustom ? `<button type="button" class="doc-photo-del-btn" data-doc-id="${doc.id}" data-photo-id="${photo.id}" title="Hapus foto ini">&times;</button>` : ""}
        </div>
      `;
    }).join("");

    return `
      <article class="doc-card" id="card_${doc.id}">
        <!-- HEADER KARTU DOKUMENTASI -->
        <div class="doc-card-head">
          <div class="doc-head-left">
            <div class="doc-title-row">
              <h3 class="doc-title">${doc.title}</h3>
              <span class="doc-badge">${doc.category || "KEGIATAN"}</span>
            </div>
            <div class="doc-meta-row">
              <span class="doc-date">📅 ${doc.date || "Dokumentasi XI-1"}</span>
              <span class="doc-count-badge">📷 ${photoCount} foto</span>
            </div>
          </div>
          <div class="doc-head-actions">
            <button type="button" class="btn-doc-action primary-doc btn-append-photo" data-doc-id="${doc.id}">
              <span>+</span> Tambah Foto
            </button>
            ${isCustom ? `
              <button type="button" class="btn-doc-action danger-doc btn-delete-doc" data-doc-id="${doc.id}">
                Hapus
              </button>
            ` : ""}
          </div>
        </div>

        <!-- REEL FOTO HORIZONTAL BISA DI-SCROLL -->
        <div class="doc-photos-reel-wrap">
          <button type="button" class="doc-reel-nav prev" data-target="reel_${doc.id}" aria-label="Geser ke kiri">&#8249;</button>
          <div class="doc-photos-reel" id="reel_${doc.id}">
            ${photosHtml}
          </div>
          <button type="button" class="doc-reel-nav next" data-target="reel_${doc.id}" aria-label="Geser ke kanan">&#8250;</button>
        </div>

        <!-- FOOTER KARTU DOKUMENTASI -->
        <div class="doc-card-footer">
          <div class="doc-desc">
            <strong>Keterangan:</strong> ${doc.description || "Dokumentasi kegiatan siswa-siswi kelas XI-1 MIPA Teknik."}
          </div>
          <div class="doc-hint">
            ← Geser foto ke samping (${photoCount} foto) · Klik untuk memperbesar →
          </div>
        </div>
      </article>
    `;
  }).join("");

  attachDocumentationCardEvents();
}

// Inisialisasi pemuatan data dokumentasi & galeri multi-foto
loadDocumentationsAsync();

function attachDocumentationCardEvents() {
  if (!docList) return;

  // 1. Klik foto dalam dokumentasi -> Buka Lightbox pada foto yang diklik
  docList.querySelectorAll(".doc-photo-thumb").forEach(thumb => {
    thumb.addEventListener("click", e => {
      if (e.target.closest(".doc-photo-del-btn")) return;
      const docId = thumb.getAttribute("data-doc-id");
      const pIdx = parseInt(thumb.getAttribute("data-photo-idx"), 10);
      openLightboxForDoc(docId, pIdx);
    });
  });

  // 2. Tombol Geser Reel Foto (< dan >) di Desktop
  docList.querySelectorAll(".doc-reel-nav").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const reel = document.getElementById(targetId);
      if (!reel) return;
      const isPrev = btn.classList.contains("prev");
      reel.scrollBy({ left: isPrev ? -360 : 360, behavior: "smooth" });
    });
  });

  // 3. Tombol "+ Tambah Foto" pada dokumentasi tertentu
  docList.querySelectorAll(".btn-append-photo").forEach(btn => {
    btn.addEventListener("click", () => {
      const docId = btn.getAttribute("data-doc-id");
      openAppendModalDialog(docId);
    });
  });

  // 4. Tombol "Hapus Dokumentasi"
  docList.querySelectorAll(".btn-delete-doc").forEach(btn => {
    btn.addEventListener("click", () => {
      const docId = btn.getAttribute("data-doc-id");
      const targetDoc = allDocumentations.find(d => d.id === docId);
      if (!targetDoc) return;
      if (confirm(`Hapus dokumentasi "${targetDoc.title}" beserta seluruh fotonya (${targetDoc.photos.length} foto)?`)) {
        customDocumentations = customDocumentations.filter(d => d.id !== docId);
        persistCustomDocs();
        combineAndRenderDocs();
      }
    });
  });

  // 5. Tombol Hapus 1 Foto tertentu dalam dokumentasi
  docList.querySelectorAll(".doc-photo-del-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const docId = btn.getAttribute("data-doc-id");
      const photoId = btn.getAttribute("data-photo-id");
      const targetDoc = customDocumentations.find(d => d.id === docId);
      if (!targetDoc) return;

      if (confirm(`Hapus foto ini dari "${targetDoc.title}"?`)) {
        targetDoc.photos = targetDoc.photos.filter(p => p.id !== photoId);
        persistCustomDocs();
        combineAndRenderDocs();
      }
    });
  });
}

// ============================================================================
// 7. LIGHTBOX DOKUMENTASI (ZOOM FOTO, INDIKATOR '7 / 15', SWIPE HP, MINI THUMBNAILS)
// ============================================================================
const lightboxModal = document.getElementById("lightboxModal");
const closeLightbox = document.getElementById("closeLightbox");
const prevLightbox = document.getElementById("prevLightbox");
const nextLightbox = document.getElementById("nextLightbox");
const lightboxMedia = document.getElementById("lightboxMedia");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxSubtitle = document.getElementById("lightboxSubtitle");
const lightboxIndexEl = document.getElementById("lightboxIndex");
const lightboxThumbsTrack = document.getElementById("lightboxThumbsTrack");

let activeDoc = null;
let activePhotoIndex = 0;

function openLightboxForDoc(docId, photoIdx) {
  activeDoc = allDocumentations.find(d => d.id === docId);
  if (!activeDoc || !activeDoc.photos || activeDoc.photos.length === 0) return;

  activePhotoIndex = Math.max(0, Math.min(photoIdx, activeDoc.photos.length - 1));
  updateLightboxView();
  renderLightboxThumbsForDoc();

  if (lightboxModal) {
    lightboxModal.classList.add("open");
    lightboxModal.setAttribute("aria-hidden", "false");
  }
}

function closeLightboxDialog() {
  if (!lightboxModal) return;
  lightboxModal.classList.remove("open");
  lightboxModal.setAttribute("aria-hidden", "true");
}

function updateLightboxView() {
  if (!activeDoc || !activeDoc.photos[activePhotoIndex]) return;
  const photo = activeDoc.photos[activePhotoIndex];
  const total = activeDoc.photos.length;

  if (lightboxTitle) lightboxTitle.textContent = activeDoc.title;
  if (lightboxSubtitle) {
    lightboxSubtitle.textContent = photo.title
      ? `${photo.title} — ${photo.caption || activeDoc.category}`
      : `Foto ke-${activePhotoIndex + 1} dari ${total} (${activeDoc.category})`;
  }
  if (lightboxIndexEl) {
    lightboxIndexEl.textContent = `${activePhotoIndex + 1} / ${total}`;
  }

  if (lightboxMedia) {
    lightboxMedia.innerHTML = `<img src="${photo.dataUrl}" alt="${photo.title || activeDoc.title}">`;
  }

  // Update highlight pada thumbnail track
  if (lightboxThumbsTrack) {
    const thumbs = lightboxThumbsTrack.querySelectorAll(".lightbox-thumb-item");
    thumbs.forEach((th, idx) => {
      if (idx === activePhotoIndex) {
        th.classList.add("active");
        th.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      } else {
        th.classList.remove("active");
      }
    });
  }
}

function renderLightboxThumbsForDoc() {
  if (!lightboxThumbsTrack || !activeDoc) return;
  lightboxThumbsTrack.innerHTML = activeDoc.photos.map((photo, idx) => {
    const isActive = idx === activePhotoIndex ? "active" : "";
    return `
      <div class="lightbox-thumb-item ${isActive}" data-photo-idx="${idx}" title="${photo.title || `Foto ${idx + 1}`}">
        <img src="${photo.dataUrl}" alt="Thumb ${idx + 1}">
      </div>
    `;
  }).join("");

  lightboxThumbsTrack.querySelectorAll(".lightbox-thumb-item").forEach(th => {
    th.addEventListener("click", () => {
      const idx = parseInt(th.getAttribute("data-photo-idx"), 10);
      if (!isNaN(idx)) {
        activePhotoIndex = idx;
        updateLightboxView();
      }
    });
  });
}

function prevLightboxPhoto() {
  if (!activeDoc || !activeDoc.photos || activeDoc.photos.length === 0) return;
  activePhotoIndex = (activePhotoIndex - 1 + activeDoc.photos.length) % activeDoc.photos.length;
  updateLightboxView();
}

function nextLightboxPhoto() {
  if (!activeDoc || !activeDoc.photos || activeDoc.photos.length === 0) return;
  activePhotoIndex = (activePhotoIndex + 1) % activeDoc.photos.length;
  updateLightboxView();
}

if (closeLightbox) closeLightbox.addEventListener("click", closeLightboxDialog);
if (prevLightbox) prevLightbox.addEventListener("click", prevLightboxPhoto);
if (nextLightbox) nextLightbox.addEventListener("click", nextLightboxPhoto);

if (lightboxModal) {
  lightboxModal.addEventListener("click", e => {
    if (e.target === lightboxModal) closeLightboxDialog();
  });

  // Touch Swipe di HP
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  lightboxModal.addEventListener("touchstart", e => {
    if (e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  lightboxModal.addEventListener("touchend", e => {
    if (e.changedTouches.length > 0) {
      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          nextLightboxPhoto(); // Swipe kiri -> foto berikutnya
        } else {
          prevLightboxPhoto(); // Swipe kanan -> foto sebelumnya
        }
      }
    }
  }, { passive: true });
}

// ============================================================================
// 8. MODAL TAMBAH DOKUMENTASI BARU (BANYAK FOTO SEKALIGUS)
// ============================================================================
const docModal = document.getElementById("docModal");
const btnOpenAddDoc = document.getElementById("btnOpenAddDoc");
const closeDocModal = document.getElementById("closeDocModal");
const cancelDocModal = document.getElementById("cancelDocModal");
const docForm = document.getElementById("docForm");
const docTitleInput = document.getElementById("docTitle");
const docCategoryInput = document.getElementById("docCategory");
const docDateInput = document.getElementById("docDate");
const docDescInput = document.getElementById("docDesc");
const docFilesInput = document.getElementById("docFilesInput");
const docErrorMsg = document.getElementById("docErrorMsg");
const docFilesPreviewSection = document.getElementById("docFilesPreviewSection");
const docFilesCountLabel = document.getElementById("docFilesCountLabel");
const docFilesPreviewGrid = document.getElementById("docFilesPreviewGrid");
const docProcessStatus = document.getElementById("docProcessStatus");
const docProcessStatusText = document.getElementById("docProcessStatusText");
const saveDocBtn = document.getElementById("saveDocBtn");

// Queue foto terpilih saat pengguna memilih banyak file
let stagedNewDocFiles = [];

function showDocError(msg) {
  if (docErrorMsg) {
    docErrorMsg.textContent = msg;
    docErrorMsg.style.display = "block";
  } else {
    alert(msg);
  }
}

function clearDocError() {
  if (docErrorMsg) {
    docErrorMsg.textContent = "";
    docErrorMsg.style.display = "none";
  }
}

function openDocModalDialog() {
  if (!docModal) return;
  clearDocError();
  docTitleInput.value = "";
  docDateInput.value = "";
  docDescInput.value = "";
  docFilesInput.value = "";
  stagedNewDocFiles = [];
  renderDocFilesPreview();
  if (docProcessStatus) docProcessStatus.style.display = "none";
  if (saveDocBtn) saveDocBtn.disabled = false;

  docModal.classList.add("open");
  docModal.setAttribute("aria-hidden", "false");
  setTimeout(() => docTitleInput.focus(), 60);
}

function closeDocModalDialog() {
  if (!docModal) return;
  clearDocError();
  docModal.classList.remove("open");
  docModal.setAttribute("aria-hidden", "true");
}

if (btnOpenAddDoc) btnOpenAddDoc.addEventListener("click", openDocModalDialog);
if (closeDocModal) closeDocModal.addEventListener("click", closeDocModalDialog);
if (cancelDocModal) cancelDocModal.addEventListener("click", closeDocModalDialog);

if (docModal) {
  docModal.addEventListener("click", e => {
    if (e.target === docModal) closeDocModalDialog();
  });
}

// Handler pemilihan BANYAK FOTO sekaligus
if (docFilesInput) {
  docFilesInput.addEventListener("change", e => {
    clearDocError();
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validExts = ["jpg", "jpeg", "png", "webp"];
    for (const f of files) {
      const ext = f.name.split(".").pop().toLowerCase();
      if (!validExts.includes(ext) && !f.type.startsWith("image/")) {
        showDocError(`File "${f.name}" bukan format gambar yang didukung (JPG, PNG, WEBP).`);
        return;
      }
      stagedNewDocFiles.push(f);
    }

    renderDocFilesPreview();
  });
}

function renderDocFilesPreview() {
  if (!docFilesPreviewSection || !docFilesPreviewGrid) return;
  if (stagedNewDocFiles.length === 0) {
    docFilesPreviewSection.style.display = "none";
    docFilesPreviewGrid.innerHTML = "";
    return;
  }

  docFilesPreviewSection.style.display = "block";
  if (docFilesCountLabel) {
    docFilesCountLabel.textContent = `${stagedNewDocFiles.length} foto dipilih`;
  }

  docFilesPreviewGrid.innerHTML = stagedNewDocFiles.map((file, idx) => {
    const objectUrl = URL.createObjectURL(file);
    return `
      <div class="upload-thumb-card">
        <img src="${objectUrl}" alt="Preview ${idx + 1}">
        <span class="upload-thumb-idx">#${idx + 1}</span>
        <button type="button" class="upload-thumb-del" data-idx="${idx}" title="Batalkan foto ini">&times;</button>
      </div>
    `;
  }).join("");

  docFilesPreviewGrid.querySelectorAll(".upload-thumb-del").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-idx"), 10);
      stagedNewDocFiles.splice(idx, 1);
      renderDocFilesPreview();
    });
  });
}

// Simpan Dokumentasi Baru
if (docForm) {
  docForm.addEventListener("submit", async e => {
    e.preventDefault();
    clearDocError();

    const title = docTitleInput.value.trim();
    const category = docCategoryInput.value;
    const date = docDateInput.value.trim() || "Dokumentasi XI-1";
    const desc = docDescInput.value.trim() || `Dokumentasi ${title} kelas XI-1 MIPA Teknik.`;

    if (!title) {
      showDocError("Harap masukkan judul dokumentasi.");
      return;
    }

    if (stagedNewDocFiles.length === 0) {
      showDocError("Pilih minimal 1 foto (bisa memilih banyak foto sekaligus).");
      return;
    }

    // Tampilkan status proses kompresi
    if (docProcessStatus) {
      docProcessStatus.style.display = "flex";
      docProcessStatusText.textContent = `Mengompresi dan menyimpan ${stagedNewDocFiles.length} foto...`;
    }
    if (saveDocBtn) saveDocBtn.disabled = true;

    try {
      const compressedPhotos = [];
      for (let i = 0; i < stagedNewDocFiles.length; i++) {
        if (docProcessStatusText) {
          docProcessStatusText.textContent = `Mengompresi foto ${i + 1} dari ${stagedNewDocFiles.length}...`;
        }
        const res = await compressImageFile(stagedNewDocFiles[i]);
        compressedPhotos.push({
          id: `photo_${Date.now()}_${i}`,
          title: `${title} #${i + 1}`,
          caption: res.name || `Dokumentasi ke-${i + 1}`,
          dataUrl: res.dataUrl
        });
      }

      const newDoc = {
        id: "doc_" + Date.now(),
        title: title,
        category: category,
        date: date,
        description: desc,
        isBuiltIn: false,
        photos: compressedPhotos
      };

      customDocumentations.unshift(newDoc);
      await persistCustomDocs();
      combineAndRenderDocs();
      closeDocModalDialog();

      // Scroll halus ke kartu baru
      setTimeout(() => {
        const el = document.getElementById("card_" + newDoc.id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      showDocError("Gagal menyimpan dokumentasi: " + (err.message || err));
      if (docProcessStatus) docProcessStatus.style.display = "none";
      if (saveDocBtn) saveDocBtn.disabled = false;
    }
  });
}

// ============================================================================
// 9. MODAL TAMBAH FOTO KE DOKUMENTASI YANG SUDAH ADA
// ============================================================================
const appendPhotoModal = document.getElementById("appendPhotoModal");
const closeAppendModal = document.getElementById("closeAppendModal");
const cancelAppendModal = document.getElementById("cancelAppendModal");
const appendForm = document.getElementById("appendForm");
const appendDocIdInput = document.getElementById("appendDocId");
const appendModalSubtitle = document.getElementById("appendModalSubtitle");
const appendFilesInput = document.getElementById("appendFilesInput");
const appendErrorMsg = document.getElementById("appendErrorMsg");
const appendPreviewSection = document.getElementById("appendPreviewSection");
const appendCountLabel = document.getElementById("appendCountLabel");
const appendPreviewGrid = document.getElementById("appendPreviewGrid");
const appendProcessStatus = document.getElementById("appendProcessStatus");
const appendProcessStatusText = document.getElementById("appendProcessStatusText");
const saveAppendBtn = document.getElementById("saveAppendBtn");

let stagedAppendFiles = [];

function showAppendError(msg) {
  if (appendErrorMsg) {
    appendErrorMsg.textContent = msg;
    appendErrorMsg.style.display = "block";
  } else {
    alert(msg);
  }
}

function clearAppendError() {
  if (appendErrorMsg) {
    appendErrorMsg.textContent = "";
    appendErrorMsg.style.display = "none";
  }
}

function openAppendModalDialog(docId) {
  if (!appendPhotoModal) return;
  clearAppendError();
  const targetDoc = allDocumentations.find(d => d.id === docId);
  if (!targetDoc) return;

  appendDocIdInput.value = docId;
  if (appendModalSubtitle) {
    appendModalSubtitle.textContent = `Tambahkan foto baru ke "${targetDoc.title}" (saat ini ${targetDoc.photos.length} foto)`;
  }
  appendFilesInput.value = "";
  stagedAppendFiles = [];
  renderAppendFilesPreview();
  if (appendProcessStatus) appendProcessStatus.style.display = "none";
  if (saveAppendBtn) saveAppendBtn.disabled = false;

  appendPhotoModal.classList.add("open");
  appendPhotoModal.setAttribute("aria-hidden", "false");
}

function closeAppendModalDialog() {
  if (!appendPhotoModal) return;
  clearAppendError();
  appendPhotoModal.classList.remove("open");
  appendPhotoModal.setAttribute("aria-hidden", "true");
}

if (closeAppendModal) closeAppendModal.addEventListener("click", closeAppendModalDialog);
if (cancelAppendModal) cancelAppendModal.addEventListener("click", closeAppendModalDialog);

if (appendPhotoModal) {
  appendPhotoModal.addEventListener("click", e => {
    if (e.target === appendPhotoModal) closeAppendModalDialog();
  });
}

if (appendFilesInput) {
  appendFilesInput.addEventListener("change", e => {
    clearAppendError();
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validExts = ["jpg", "jpeg", "png", "webp"];
    for (const f of files) {
      const ext = f.name.split(".").pop().toLowerCase();
      if (!validExts.includes(ext) && !f.type.startsWith("image/")) {
        showAppendError(`File "${f.name}" bukan format gambar yang didukung.`);
        return;
      }
      stagedAppendFiles.push(f);
    }

    renderAppendFilesPreview();
  });
}

function renderAppendFilesPreview() {
  if (!appendPreviewSection || !appendPreviewGrid) return;
  if (stagedAppendFiles.length === 0) {
    appendPreviewSection.style.display = "none";
    appendPreviewGrid.innerHTML = "";
    return;
  }

  appendPreviewSection.style.display = "block";
  if (appendCountLabel) {
    appendCountLabel.textContent = `${stagedAppendFiles.length} foto tambahan dipilih`;
  }

  appendPreviewGrid.innerHTML = stagedAppendFiles.map((file, idx) => {
    const objectUrl = URL.createObjectURL(file);
    return `
      <div class="upload-thumb-card">
        <img src="${objectUrl}" alt="Preview ${idx + 1}">
        <span class="upload-thumb-idx">#${idx + 1}</span>
        <button type="button" class="upload-thumb-del" data-idx="${idx}" title="Batalkan foto ini">&times;</button>
      </div>
    `;
  }).join("");

  appendPreviewGrid.querySelectorAll(".upload-thumb-del").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-idx"), 10);
      stagedAppendFiles.splice(idx, 1);
      renderAppendFilesPreview();
    });
  });
}

// Simpan Foto Tambahan ke Dokumentasi
if (appendForm) {
  appendForm.addEventListener("submit", async e => {
    e.preventDefault();
    clearAppendError();
    const docId = appendDocIdInput.value;
    const targetDoc = allDocumentations.find(d => d.id === docId);
    if (!targetDoc) {
      showAppendError("Dokumentasi target tidak ditemukan.");
      return;
    }

    if (stagedAppendFiles.length === 0) {
      showAppendError("Pilih minimal 1 file foto baru.");
      return;
    }

    if (appendProcessStatus) {
      appendProcessStatus.style.display = "flex";
      appendProcessStatusText.textContent = `Mengompresi ${stagedAppendFiles.length} foto tambahan...`;
    }
    if (saveAppendBtn) saveAppendBtn.disabled = true;

    try {
      const newPhotos = [];
      const currentCount = targetDoc.photos.length;

      for (let i = 0; i < stagedAppendFiles.length; i++) {
        const res = await compressImageFile(stagedAppendFiles[i]);
        newPhotos.push({
          id: `photo_appended_${Date.now()}_${i}`,
          title: `${targetDoc.title} #${currentCount + i + 1}`,
          caption: res.name || `Foto Tambahan ${i + 1}`,
          dataUrl: res.dataUrl
        });
      }

      // Jika dokumentasi bawaan pertama kali ditambah foto, kloning ke customDocumentations agar tersimpan
      let customTarget = customDocumentations.find(d => d.id === docId);
      if (!customTarget) {
        customTarget = JSON.parse(JSON.stringify(targetDoc));
        customTarget.isBuiltIn = false;
        customDocumentations.push(customTarget);
      }

      customTarget.photos.push(...newPhotos);
      await persistCustomDocs();
      combineAndRenderDocs();
      closeAppendModalDialog();

      // Scroll horizontal reel ke ujung kanan untuk melihat foto yang baru ditambahkan
      setTimeout(() => {
        const reel = document.getElementById("reel_" + docId);
        if (reel) reel.scrollTo({ left: reel.scrollWidth, behavior: "smooth" });
      }, 100);
    } catch (err) {
      showAppendError("Gagal menambahkan foto: " + (err.message || err));
      if (appendProcessStatus) appendProcessStatus.style.display = "none";
      if (saveAppendBtn) saveAppendBtn.disabled = false;
    }
  });
}

// Keyboard Shortcut Navigasi & Escape
document.addEventListener("keydown", e => {
  if (lightboxModal && lightboxModal.classList.contains("open")) {
    if (e.key === "Escape") closeLightboxDialog();
    if (e.key === "ArrowLeft") prevLightboxPhoto();
    if (e.key === "ArrowRight") nextLightboxPhoto();
  } else if (kasModal && kasModal.classList.contains("open")) {
    if (e.key === "Escape") closeKasModalDialog();
  } else if (docModal && docModal.classList.contains("open")) {
    if (e.key === "Escape") closeDocModalDialog();
  } else if (appendPhotoModal && appendPhotoModal.classList.contains("open")) {
    if (e.key === "Escape") closeAppendModalDialog();
  }
});

// Mulai muat dokumentasi saat script dijalankan
loadDocumentationsAsync();

// ============================================================================
// 7. JADWAL PIKET (TANDAI SELESAI TOGGLE)
// ============================================================================
document.querySelectorAll(".done-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("done");
    btn.textContent = btn.classList.contains("done") ? "✓ Selesai" : "Tandai selesai";
  });
});

// ============================================================================
// 8. TEMA GELAP / TERANG (DARK MODE & LOCALSTORAGE)
// ============================================================================
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "☀" : "☾";
    localStorage.setItem("classTheme", document.body.classList.contains("dark") ? "dark" : "light");
  });

  if (localStorage.getItem("classTheme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀";
  }
}

// Tanggal Hari ini pada Header
const todayDateEl = document.getElementById("todayDate");
if (todayDateEl) {
  todayDateEl.textContent = new Intl.DateTimeFormat("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  }).format(new Date());
}

// ============================================================================
// 9. MENU RESPONSIF (NAVBAR HP)
// ============================================================================
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

function toggleMenu(forceClose = false) {
  if (!nav || !menuToggle) return;
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

if (menuToggle) {
  menuToggle.addEventListener("click", e => {
    e.stopPropagation();
    toggleMenu();
  });
}

document.querySelectorAll("#nav a").forEach(link => {
  link.addEventListener("click", () => {
    toggleMenu(true);
    document.querySelectorAll("#nav a").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
  });
});

document.addEventListener("click", e => {
  if (nav && nav.classList.contains("open") && !nav.contains(e.target) && e.target !== menuToggle) {
    toggleMenu(true);
  }
});
