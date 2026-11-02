// =====================================
// 1. VALIDASI FORM DATA LAHAN
// =====================================

export function validateLahan(data) {
    const errors = {};

    // Validasi nama lahan
    if (!data.nama) {
        errors["error-nama-lahan"] =
            "Nama lahan wajib diisi.";
    } else if (data.nama.length < 3) {
        errors["error-nama-lahan"] =
            "Nama lahan minimal 3 karakter.";
    }

    // Validasi lokasi lahan
    if (!data.lokasi) {
        errors["error-lokasi-lahan"] =
            "Lokasi lahan wajib diisi.";
    } else if (data.lokasi.length < 3) {
        errors["error-lokasi-lahan"] =
            "Lokasi lahan minimal 3 karakter.";
    }

    // Validasi luas lahan
    if (
        data.luas === "" ||
        data.luas === null ||
        data.luas === undefined ||
        !Number.isFinite(data.luas)
    ) {
        errors["error-luas-lahan"] =
            "Luas lahan harus berupa angka.";
    } else if (data.luas <= 0) {
        errors["error-luas-lahan"] =
            "Luas lahan harus lebih dari 0 hektare.";
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
}

// =====================================
// 2. VALIDASI FORM DATA TANAMAN
// =====================================

export function validateTanaman(data) {
    const errors = {};

    // Validasi nama tanaman
    if (!data.nama) {
        errors["error-nama-tanaman"] =
            "Nama tanaman wajib diisi.";
    } else if (data.nama.length < 2) {
        errors["error-nama-tanaman"] =
            "Nama tanaman minimal 2 karakter.";
    }

    // Validasi jenis tanaman
    const jenisTanamanValid = [
        "Pangan",
        "Sayuran",
        "Buah",
        "Perkebunan",
        "Lainnya"
    ];

    if (!jenisTanamanValid.includes(data.jenis)) {
        errors["error-jenis-tanaman"] =
            "Silakan pilih jenis tanaman.";
    }

    // Validasi pilihan lahan
    if (
        data.lahanId === "" ||
        data.lahanId === null ||
        data.lahanId === undefined
    ) {
        errors["error-lahan-tanaman"] =
            "Silakan pilih lahan terlebih dahulu. " +
            "Tambahkan lahan jika belum ada.";
    }

    // Validasi tanggal tanam
    if (!data.tanggalTanam) {
        errors["error-tanggal-tanam"] =
            "Tanggal tanam wajib diisi.";
    } else {
        const tanggal = new Date(
            `${data.tanggalTanam}T00:00:00`
        );

        const hariIni = new Date();
        hariIni.setHours(0, 0, 0, 0);

        if (Number.isNaN(tanggal.getTime())) {
            errors["error-tanggal-tanam"] =
                "Format tanggal tanam tidak valid.";
        } else if (tanggal > hariIni) {
            errors["error-tanggal-tanam"] =
                "Tanggal tanam tidak boleh di masa depan.";
        }
    }

    // Validasi jumlah tanaman
    if (
        data.jumlah === "" ||
        data.jumlah === null ||
        data.jumlah === undefined
    ) {
        errors["error-jumlah-tanaman"] =
            "Jumlah tanaman wajib diisi.";
    } else if (!Number.isFinite(data.jumlah)) {
        errors["error-jumlah-tanaman"] =
            "Jumlah tanaman harus berupa angka.";
    } else if (data.jumlah <= 0) {
        errors["error-jumlah-tanaman"] =
            "Jumlah tanaman harus lebih dari 0.";
    } else if (!Number.isInteger(data.jumlah)) {
        errors["error-jumlah-tanaman"] =
            "Jumlah tanaman harus berupa bilangan bulat.";
    }

    // Validasi status pertumbuhan
    const statusValid = [
        "Baru Ditanam",
        "Dalam Perawatan",
        "Siap Panen",
        "Sudah Dipanen"
    ];

    if (!statusValid.includes(data.status)) {
        errors["error-status-tanaman"] =
            "Silakan pilih status pertumbuhan.";
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
}
