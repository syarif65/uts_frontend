// =====================================
// 1. FORMAT ANGKA DAN ELEMEN BANTU
// =====================================

function formatNumber(value) {
    return Number(value).toLocaleString("id-ID", {
        maximumFractionDigits: 2
    });
}

function setText(id, text) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = text;
    }
}

function findLahan(lahan, id) {
    return lahan.find(
        (item) => String(item.id) === String(id)
    );
}

function createBadge(label, modifier = "") {
    const badge = document.createElement("span");
    badge.classList.add("status");

    if (modifier) {
        badge.classList.add(modifier);
    }

    badge.textContent = label;
    return badge;
}

function createEmptyRow(colSpan, message) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = colSpan;
    cell.textContent = message;

    row.appendChild(cell);
    return row;
}

// Penyesuaian kelas badge dengan CSS (.status, .status.warning, .status.neutral)
const STATUS_MODIFIER = {
    "Baru Ditanam": "neutral",
    "Dalam Perawatan": "warning",
    "Siap Panen": "",
    "Sudah Dipanen": "neutral"
};

const JENIS_ICON = {
    Pangan: "\u{1F33E}",
    Sayuran: "\u{1F96C}",
    Buah: "\u{1F34E}",
    Perkebunan: "\u{1F331}",
    Lainnya: "\u{1F343}"
};

// =====================================
// 2. RENDER DASHBOARD
// =====================================

export function renderDashboard(lahan, tanaman) {
    const totalLahan = lahan.length;
    const totalTanaman = tanaman.length;

    const totalLuas = lahan.reduce(
        (total, item) => total + Number(item.luas || 0),
        0
    );

    const siapPanen = tanaman.filter(
        (item) => item.status === "Siap Panen"
    ).length;

    setText("stat-lahan", formatNumber(totalLahan));
    setText("stat-tanaman", formatNumber(totalTanaman));
    setText("stat-panen", formatNumber(siapPanen));

    const statLuas = document.getElementById("stat-luas");

    if (statLuas) {
        statLuas.innerHTML =
            `${formatNumber(totalLuas)} <small>Ha</small>`;
    }

    renderDashboardLahan(lahan, tanaman);
    renderDashboardTanaman(tanaman, lahan);
}

// Status lahan diturunkan dari data tanaman di dalamnya
function statusLahan(item, tanaman) {
    const terkait = tanaman.filter(
        (tanamanItem) =>
            String(tanamanItem.lahanId) === String(item.id)
    );

    if (terkait.length === 0) {
        return { label: "Belum Ditanami", modifier: "neutral" };
    }

    if (terkait.some((t) => t.status === "Siap Panen")) {
        return { label: "Siap Panen", modifier: "" };
    }

    return { label: "Dikelola", modifier: "warning" };
}

function renderDashboardLahan(lahan, tanaman) {
    const tbody = document.getElementById("dashboard-lahan");

    if (!tbody) return;
    tbody.replaceChildren();

    if (lahan.length === 0) {
        tbody.appendChild(createEmptyRow(4, "Belum ada data lahan."));
        return;
    }

    lahan.slice(-5).reverse().forEach((item) => {
        const row = document.createElement("tr");

        const nama = document.createElement("td");
        nama.textContent = item.nama;

        const lokasi = document.createElement("td");
        lokasi.textContent = item.lokasi;

        const luas = document.createElement("td");
        luas.textContent = `${formatNumber(item.luas)} ha`;

        const status = document.createElement("td");
        const info = statusLahan(item, tanaman);
        status.appendChild(createBadge(info.label, info.modifier));

        row.append(nama, lokasi, luas, status);
        tbody.appendChild(row);
    });
}

function renderDashboardTanaman(tanaman, lahan) {
    const container = document.getElementById("dashboard-tanaman");

    if (!container) return;
    container.replaceChildren();

    if (tanaman.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-note";
        empty.textContent = "Belum ada data tanaman.";
        container.appendChild(empty);
        return;
    }

    tanaman.slice(-5).reverse().forEach((item) => {
        const lahanTerkait = findLahan(lahan, item.lahanId);

        const activity = document.createElement("div");
        activity.className = "activity";

        const icon = document.createElement("div");
        icon.className = "crop-icon";
        icon.textContent = JENIS_ICON[item.jenis] || JENIS_ICON.Lainnya;

        const body = document.createElement("div");
        body.className = "activity-body";

        const title = document.createElement("strong");
        title.textContent = item.nama;

        const meta = document.createElement("small");
        meta.textContent =
            `${lahanTerkait ? lahanTerkait.nama : "Lahan tidak ditemukan"}` +
            ` \u00B7 ${item.tanggalTanam}`;

        body.append(title, meta);

        const badge = createBadge(
            item.status,
            STATUS_MODIFIER[item.status] || ""
        );

        activity.append(icon, body, badge);
        container.appendChild(activity);
    });
}

// =====================================
// 3. RENDER TABEL LAHAN
// =====================================

export function renderLahan(lahan) {
    const tbody = document.getElementById("lahan-table");

    if (!tbody) return;
    tbody.replaceChildren();

    if (lahan.length === 0) {
        tbody.appendChild(createEmptyRow(5, "Belum ada data lahan."));
        return;
    }

    lahan.forEach((item, index) => {
        const row = document.createElement("tr");

        const values = [
            index + 1,
            item.nama,
            item.lokasi,
            `${formatNumber(item.luas)} ha`
        ];

        values.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        // Kolom aksi
        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.className = "btn-edit";
        editButton.dataset.action = "edit-lahan";
        editButton.dataset.id = item.id;
        editButton.setAttribute(
            "aria-label",
            `Edit lahan ${item.nama}`
        );

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Hapus";
        deleteButton.className = "btn-delete";
        deleteButton.dataset.action = "delete-lahan";
        deleteButton.dataset.id = item.id;
        deleteButton.setAttribute(
            "aria-label",
            `Hapus lahan ${item.nama}`
        );

        actionCell.append(editButton, deleteButton);
        row.appendChild(actionCell);
        tbody.appendChild(row);
    });
}

// =====================================
// 4. RENDER PILIHAN LAHAN
// =====================================

export function renderLahanOptions(lahan, selectedId = "") {
    const select = document.getElementById("lahan-tanaman");

    // Select hanya ada saat dialog form tanaman dibuka
    if (!select) return;

    select.replaceChildren();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";

    if (lahan.length === 0) {
        defaultOption.textContent =
            "-- Belum ada lahan, tambahkan lahan dulu --";
    } else {
        defaultOption.textContent = "-- Pilih Lahan --";
    }

    select.appendChild(defaultOption);

    lahan.forEach((item) => {
        const option = document.createElement("option");

        option.value = String(item.id);
        option.textContent = `${item.nama} - ${item.lokasi}`;

        if (String(item.id) === String(selectedId)) {
            option.selected = true;
        }

        select.appendChild(option);
    });

    select.disabled = lahan.length === 0;

    const hint = document.getElementById("hint-lahan-tanaman");

    if (hint) {
        hint.textContent =
            lahan.length === 0
                ? "Belum ada data lahan. Tutup dialog ini, " +
                  "tambahkan lahan terlebih dahulu, lalu coba lagi."
                : "";
    }
}

// =====================================
// 5. RENDER TABEL TANAMAN
// =====================================

export function renderTanaman(tanaman, lahan) {
    const tbody = document.getElementById("tanaman-table");

    if (!tbody) return;
    tbody.replaceChildren();

    if (tanaman.length === 0) {
        tbody.appendChild(createEmptyRow(8, "Belum ada data tanaman."));
        return;
    }

    tanaman.forEach((item, index) => {
        const row = document.createElement("tr");

        const lahanTerkait = findLahan(lahan, item.lahanId);

        const namaLahan = lahanTerkait
            ? lahanTerkait.nama
            : "Lahan tidak ditemukan";

        const values = [
            index + 1,
            item.nama,
            item.jenis,
            namaLahan,
            item.tanggalTanam,
            `${formatNumber(item.jumlah)} batang`
        ];

        values.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        // Kolom status pertumbuhan
        const statusCell = document.createElement("td");
        statusCell.appendChild(
            createBadge(
                item.status,
                STATUS_MODIFIER[item.status] || ""
            )
        );
        row.appendChild(statusCell);

        // Kolom aksi
        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.className = "btn-edit";
        editButton.dataset.action = "edit-tanaman";
        editButton.dataset.id = item.id;
        editButton.setAttribute(
            "aria-label",
            `Edit tanaman ${item.nama}`
        );

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Hapus";
        deleteButton.className = "btn-delete";
        deleteButton.dataset.action = "delete-tanaman";
        deleteButton.dataset.id = item.id;
        deleteButton.setAttribute(
            "aria-label",
            `Hapus tanaman ${item.nama}`
        );

        actionCell.append(editButton, deleteButton);
        row.appendChild(actionCell);
        tbody.appendChild(row);
    });
}

// =====================================
// 6. RENDER TABEL PANEN
// =====================================

export function renderPanen(tanaman, lahan) {
    const tbody = document.getElementById("panen-table");

    if (!tbody) return;
    tbody.replaceChildren();

    const daftarPanen = tanaman.filter(
        (item) =>
            item.status === "Siap Panen" ||
            item.status === "Sudah Dipanen"
    );

    if (daftarPanen.length === 0) {
        tbody.appendChild(
            createEmptyRow(4, "Belum ada tanaman yang siap dipanen.")
        );
        return;
    }

    daftarPanen.forEach((item) => {
        const row = document.createElement("tr");

        const lahanTerkait = findLahan(lahan, item.lahanId);

        const nama = document.createElement("td");
        nama.textContent = item.nama;

        const namaLahan = document.createElement("td");
        namaLahan.textContent = lahanTerkait
            ? lahanTerkait.nama
            : "Lahan tidak ditemukan";

        const tanggal = document.createElement("td");
        tanggal.textContent = item.tanggalTanam;

        const status = document.createElement("td");
        status.appendChild(
            createBadge(
                item.status,
                STATUS_MODIFIER[item.status] || ""
            )
        );

        row.append(nama, namaLahan, tanggal, status);
        tbody.appendChild(row);
    });
}

// =====================================
// 7. MENAMPILKAN PESAN
// =====================================

export function showMessage(elementId, message, type = "success") {
    const element = document.getElementById(elementId);

    if (!element) return;

    element.textContent = message;

    element.classList.remove("success", "error");
    element.classList.add(type === "error" ? "error" : "success");
}
