import {
    getLahan,
    saveLahan,
    deleteLahan,
    getTanaman,
    saveTanaman,
    deleteTanaman
} from "./data_service.js";

import {
    renderDashboard,
    renderLahan,
    renderTanaman,
    renderPanen,
    renderLahanOptions,
    showMessage
} from "./ui_renderer.js";

import {
    validateLahan,
    validateTanaman
} from "./form_validator.js";

// Ekspos ke objek window agar bisa diakses langsung via Developer Tools Console
window.getLahan = getLahan;
window.getTanaman = getTanaman;

// =====================================
// 1. KONFIGURASI FORM DINAMIS
// =====================================

const LAHAN_FIELDS = [
    {
        name: "id",
        type: "hidden"
    },
    {
        name: "nama",
        label: "Nama Lahan",
        type: "text",
        placeholder: "Contoh: Lahan Sawah Subur",
        errorId: "error-nama-lahan"
    },
    {
        name: "lokasi",
        label: "Lokasi Lahan",
        type: "text",
        placeholder: "Contoh: Desa Sukamaju, Blok A",
        errorId: "error-lokasi-lahan"
    },
    {
        name: "luas",
        label: "Luas (Hektare)",
        type: "number",
        step: "0.01",
        placeholder: "Contoh: 2.5",
        errorId: "error-luas-lahan"
    }
];

const TANAMAN_FIELDS = [
    {
        name: "id",
        type: "hidden"
    },
    {
        name: "nama",
        label: "Nama Tanaman",
        type: "text",
        placeholder: "Contoh: Padi Ciherang",
        errorId: "error-nama-tanaman"
    },
    {
        name: "jenis",
        label: "Jenis Tanaman",
        type: "select",
        placeholder: "-- Pilih Jenis Tanaman --",
        options: ["Pangan", "Sayuran", "Buah", "Perkebunan", "Lainnya"],
        errorId: "error-jenis-tanaman"
    },
    {
        name: "lahanId",
        label: "Lahan",
        type: "select",
        fieldId: "lahan-tanaman",
        hintId: "hint-lahan-tanaman",
        errorId: "error-lahan-tanaman"
    },
    {
        name: "tanggalTanam",
        label: "Tanggal Tanam",
        type: "date",
        errorId: "error-tanggal-tanam"
    },
    {
        name: "jumlah",
        label: "Jumlah (Batang)",
        type: "number",
        step: "1",
        placeholder: "Contoh: 1200",
        errorId: "error-jumlah-tanaman"
    },
    {
        name: "status",
        label: "Status Pertumbuhan",
        type: "select",
        placeholder: "-- Pilih Status --",
        options: [
            "Baru Ditanam",
            "Dalam Perawatan",
            "Siap Panen",
            "Sudah Dipanen"
        ],
        errorId: "error-status-tanaman"
    }
];

const PAGE_TITLES = {
    dashboard: "Dashboard",
    lahan: "Data Lahan",
    tanaman: "Data Tanaman",
    panen: "Data Panen"
};

// Status aplikasi
let currentFormType = null;
let toastTimer = null;
let keywordLahan = "";
let keywordTanaman = "";

// =====================================
// 2. INISIALISASI APLIKASI
// =====================================

function init() {
    // Penanda bahwa modul ES berhasil dimuat dan dijalankan
    window.agriManageReady = true;

    console.log("Aplikasi AgriManage berhasil dimuat.");

    // Menampilkan data awal ke Console saat halaman pertama kali dibuka
    console.log("=== Data Lahan Saat Ini ===");
    console.table(getLahan());

    console.log("=== Data Tanaman Saat Ini ===");
    console.table(getTanaman());

    setupNavigation();
    setupToday();
    setupDialog();
    setupAddButtons();
    setupSearch();
    setupTableActions();

    renderAll();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

// =====================================
// 3. MENAMPILKAN SEMUA DATA
// =====================================

function renderAll() {
    const lahan = getLahan();
    const tanaman = getTanaman();

    renderDashboard(lahan, tanaman);
    renderLahan(filterLahan(lahan, keywordLahan));
    renderLahanOptions(lahan);
    renderTanaman(filterTanaman(tanaman, lahan, keywordTanaman), lahan);
    renderPanen(tanaman, lahan);
}

function filterLahan(lahan, keyword) {
    if (!keyword) return lahan;

    return lahan.filter(
        (item) =>
            item.nama.toLowerCase().includes(keyword) ||
            item.lokasi.toLowerCase().includes(keyword)
    );
}

function filterTanaman(tanaman, lahan, keyword) {
    if (!keyword) return tanaman;

    return tanaman.filter((item) => {
        const terkait = lahan.find(
            (dataLahan) =>
                String(dataLahan.id) === String(item.lahanId)
        );

        const namaLahan = terkait ? terkait.nama : "";

        return (
            item.nama.toLowerCase().includes(keyword) ||
            item.jenis.toLowerCase().includes(keyword) ||
            namaLahan.toLowerCase().includes(keyword)
        );
    });
}

// =====================================
// 4. NAVIGASI HALAMAN
// =====================================

function setupNavigation() {
    document.querySelectorAll(".nav-link").forEach((button) => {
        button.addEventListener("click", () => {
            navigateTo(button.dataset.page);
        });
    });

    document.querySelectorAll("[data-goto]").forEach((button) => {
        button.addEventListener("click", () => {
            navigateTo(button.dataset.goto);
        });
    });
}

function navigateTo(page) {
    if (!PAGE_TITLES[page]) return;

    document.querySelectorAll(".page").forEach((section) => {
        section.classList.add("hidden");
    });

    const target = document.getElementById(`${page}-page`);

    if (target) {
        target.classList.remove("hidden");
    }

    document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.toggle("active", link.dataset.page === page);
    });

    setText("page-title", PAGE_TITLES[page]);
}

function setText(id, text) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = text;
    }
}

// =====================================
// 5. TANGGAL HARI INI
// =====================================

function setupToday() {
    const element = document.getElementById("today");

    if (!element) return;

    element.textContent = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

// =====================================
// 6. FORM DINAMIS (DIALOG)
// =====================================

function setupDialog() {
    const dialog = document.getElementById("data-dialog");
    const form = document.getElementById("data-form");

    document
        .getElementById("close-dialog")
        .addEventListener("click", () => dialog.close());

    document
        .getElementById("cancel-dialog")
        .addEventListener("click", () => dialog.close());

    form.addEventListener("submit", handleFormSubmit);

    dialog.addEventListener("close", () => {
        form.reset();
        currentFormType = null;
    });
}

function openDialog(type, data = null) {
    const dialog = document.getElementById("data-dialog");
    const form = document.getElementById("data-form");
    const fields = type === "lahan" ? LAHAN_FIELDS : TANAMAN_FIELDS;
    const isEdit = Boolean(data);

    currentFormType = type;

    form.reset();
    clearErrors(fields.map((field) => field.errorId).filter(Boolean));
    hideDialogMessage();
    buildFields(fields, data);

    setText(
        "dialog-title",
        isEdit
            ? type === "lahan"
                ? "Edit Data Lahan"
                : "Edit Data Tanaman"
            : type === "lahan"
              ? "Tambah Data Lahan"
              : "Tambah Data Tanaman"
    );

    if (type === "tanaman") {
        renderLahanOptions(
            getLahan(),
            data ? data.lahanId : ""
        );
    }

    if (!dialog.open) {
        dialog.showModal();
    }
}

function buildFields(fields, data) {
    const container = document.getElementById("form-fields");
    container.replaceChildren();

    fields.forEach((field) => {
        const inputId = field.fieldId || `field-${field.name}`;

        if (field.type === "hidden") {
            const input = document.createElement("input");
            input.type = "hidden";
            input.id = inputId;
            input.name = field.name;
            input.value = data ? data[field.name] ?? "" : "";
            container.appendChild(input);
            return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "field";

        const label = document.createElement("label");
        label.htmlFor = inputId;
        label.textContent = field.label;
        wrapper.appendChild(label);

        let input;

        if (field.type === "select") {
            input = document.createElement("select");
            input.id = inputId;
            input.name = field.name;

            // Isi pilihan lahan dikelola oleh renderLahanOptions
            if (field.name !== "lahanId") {
                const placeholder = document.createElement("option");
                placeholder.value = "";
                placeholder.textContent =
                    field.placeholder || "-- Pilih --";
                input.appendChild(placeholder);

                field.options.forEach((value) => {
                    const option = document.createElement("option");
                    option.value = value;
                    option.textContent = value;
                    input.appendChild(option);
                });

                if (data && data[field.name]) {
                    input.value = data[field.name];
                }
            }
        } else {
            input = document.createElement("input");
            input.type = field.type;
            input.id = inputId;
            input.name = field.name;

            if (field.step) input.step = field.step;
            if (field.placeholder) input.placeholder = field.placeholder;

            if (
                data &&
                data[field.name] !== undefined &&
                data[field.name] !== null
            ) {
                input.value = data[field.name];
            }
        }

        wrapper.appendChild(input);

        if (field.hintId) {
            const hint = document.createElement("small");
            hint.id = field.hintId;
            hint.className = "field-hint";
            wrapper.appendChild(hint);
        }

        if (field.errorId) {
            const error = document.createElement("small");
            error.id = field.errorId;
            error.className = "field-error";
            wrapper.appendChild(error);
        }

        container.appendChild(wrapper);
    });
}

function handleFormSubmit(event) {
    event.preventDefault();

    if (!currentFormType) return;

    const isLahan = currentFormType === "lahan";
    const data = isLahan ? collectLahan() : collectTanaman();
    const hasil = isLahan ? validateLahan(data) : validateTanaman(data);

    clearErrors(errorIdsOf(currentFormType));

    if (!hasil.valid) {
        displayErrors(hasil.errors);
        showDialogMessage(
            "Periksa kembali data yang diisi.",
            "error"
        );
        console.warn(
            `[Validasi Gagal - ${isLahan ? "Lahan" : "Tanaman"}]:`,
            hasil.errors
        );
        return;
    }

    const isEdit = Boolean(data.id);
    const tersimpan = isLahan ? saveLahan(data) : saveTanaman(data);

    if (!tersimpan) {
        showDialogMessage(
            "Data gagal disimpan. Silakan coba lagi.",
            "error"
        );
        return;
    }

    console.log(
        isEdit ? "[Data Diperbarui]:" : "[Data Ditambahkan]:",
        data
    );

    if (isLahan) {
        console.log("Daftar Lahan Saat Ini:");
        console.table(getLahan());
    } else {
        console.log("Daftar Tanaman Saat Ini:");
        console.table(getTanaman());
    }

    document.getElementById("data-dialog").close();

    renderAll();

    notify(
        isLahan
            ? isEdit
                ? "Data lahan berhasil diperbarui."
                : "Data lahan berhasil ditambahkan."
            : isEdit
              ? "Data tanaman berhasil diperbarui."
              : "Data tanaman berhasil ditambahkan.",
        "success"
    );
}

function collectLahan() {
    return {
        id: document.getElementById("field-id").value,
        nama: document.getElementById("field-nama").value.trim(),
        lokasi: document.getElementById("field-lokasi").value.trim(),
        luas: readNumber("field-luas")
    };
}

function collectTanaman() {
    return {
        id: document.getElementById("field-id").value,
        nama: document.getElementById("field-nama").value.trim(),
        jenis: document.getElementById("field-jenis").value,
        lahanId: document.getElementById("lahan-tanaman").value,
        tanggalTanam:
            document.getElementById("field-tanggalTanam").value,
        jumlah: readNumber("field-jumlah"),
        status: document.getElementById("field-status").value
    };
}

function readNumber(id) {
    const element = document.getElementById(id);
    const raw = element ? element.value.trim() : "";

    return raw === "" ? "" : Number(raw);
}

function errorIdsOf(type) {
    const fields = type === "lahan" ? LAHAN_FIELDS : TANAMAN_FIELDS;

    return fields
        .map((field) => field.errorId)
        .filter(Boolean);
}

// =====================================
// 7. TOMBOL TAMBAH DATA
// =====================================

function setupAddButtons() {
    document
        .getElementById("add-lahan")
        .addEventListener("click", () => openDialog("lahan"));

    document
        .getElementById("add-tanaman")
        .addEventListener("click", () => openDialog("tanaman"));
}

// =====================================
// 8. PENCARIAN DATA
// =====================================

function setupSearch() {
    document
        .getElementById("search-lahan")
        .addEventListener("input", (event) => {
            keywordLahan = event.target.value.trim().toLowerCase();
            renderAll();
        });

    document
        .getElementById("search-tanaman")
        .addEventListener("input", (event) => {
            keywordTanaman = event.target.value.trim().toLowerCase();
            renderAll();
        });
}

// =====================================
// 9. AKSI EDIT DAN HAPUS DATA
// =====================================

function setupTableActions() {
    // Aksi pada tabel lahan
    document
        .getElementById("lahan-table")
        .addEventListener("click", (event) => {
            const button = event.target.closest("button");

            if (!button) return;

            if (button.dataset.action === "edit-lahan") {
                editLahan(button.dataset.id);
            }

            if (button.dataset.action === "delete-lahan") {
                hapusLahan(button.dataset.id);
            }
        });

    // Aksi pada tabel tanaman
    document
        .getElementById("tanaman-table")
        .addEventListener("click", (event) => {
            const button = event.target.closest("button");

            if (!button) return;

            if (button.dataset.action === "edit-tanaman") {
                editTanaman(button.dataset.id);
            }

            if (button.dataset.action === "delete-tanaman") {
                hapusTanaman(button.dataset.id);
            }
        });
}

// =====================================
// 10. EDIT DATA
// =====================================

function editLahan(id) {
    const lahan = getLahan().find(
        (item) => String(item.id) === String(id)
    );

    if (!lahan) return;

    openDialog("lahan", lahan);
}

function editTanaman(id) {
    const tanaman = getTanaman().find(
        (item) => String(item.id) === String(id)
    );

    if (!tanaman) return;

    openDialog("tanaman", tanaman);
}

// =====================================
// 11. HAPUS DATA
// =====================================

function hapusLahan(id) {
    const tanamanTerkait = getTanaman().some(
        (item) => String(item.lahanId) === String(id)
    );

    if (tanamanTerkait) {
        notify(
            "Lahan tidak dapat dihapus karena masih memiliki data tanaman.",
            "error"
        );
        return;
    }

    const konfirmasi = confirm(
        "Apakah Anda yakin ingin menghapus data lahan ini?"
    );

    if (!konfirmasi) return;

    deleteLahan(id);

    console.log(`[Lahan Dihapus]: ID ${id}`);
    console.log("Daftar Lahan Saat Ini:");
    console.table(getLahan());

    renderAll();
    notify("Data lahan berhasil dihapus.", "success");
}

function hapusTanaman(id) {
    const konfirmasi = confirm(
        "Apakah Anda yakin ingin menghapus data tanaman ini?"
    );

    if (!konfirmasi) return;

    deleteTanaman(id);

    console.log(`[Tanaman Dihapus]: ID ${id}`);
    console.log("Daftar Tanaman Saat Ini:");
    console.table(getTanaman());

    renderAll();
    notify("Data tanaman berhasil dihapus.", "success");
}

// =====================================
// 12. FUNGSI BANTU PESAN
// =====================================

function notify(message, type = "success") {
    const toast = document.getElementById("toast");

    if (!toast) return;

    showMessage("toast", message, type);
    toast.classList.remove("hidden");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.add("hidden");
    }, 3500);
}

function showDialogMessage(message, type = "error") {
    showMessage("dialog-message", message, type);
}

function hideDialogMessage() {
    const element = document.getElementById("dialog-message");

    if (!element) return;

    element.textContent = "";
    element.classList.remove("success", "error");
}

// =====================================
// 13. FUNGSI BANTU VALIDASI
// =====================================

function clearErrors(ids) {
    ids.forEach((id) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = "";
        }
    });
}

function displayErrors(errors) {
    Object.entries(errors).forEach(([id, message]) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = message;
        }
    });
}
