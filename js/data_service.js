// =====================================
// 1. DATA IN-MEMORY (SEMENTARA)
// =====================================
// Data awal: 3 lahan, masing-masing memiliki 3 tanaman (total 9 tanaman).
// Data disimpan di memori runtime (in-memory).

const LAHAN_KEY = "agrimanage_lahan";
const TANAMAN_KEY = "agrimanage_tanaman";

// Bersihkan data di localStorage lama jika ada
try {
    localStorage.removeItem(LAHAN_KEY);
    localStorage.removeItem(TANAMAN_KEY);
} catch (error) {
    console.warn("Storage tidak dapat diakses:", error);
}

// Data awal 3 lahan
let dataLahan = [
    {
        id: 1,
        nama: "Lahan Sawah Subur",
        lokasi: "Desa Sukamaju, Blok A",
        luas: 2.5
    },
    {
        id: 2,
        nama: "Lahan Perkebunan Bukit",
        lokasi: "Desa Makmur Jaya, Lereng Timur",
        luas: 4.2
    },
    {
        id: 3,
        nama: "Lahan Hortikultura Lembah",
        lokasi: "Desa Karanganyar, Blok C",
        luas: 1.8
    }
];

// Data awal 9 tanaman (setiap lahan memiliki 3 tanaman)
let dataTanaman = [
    // --- 3 Tanaman di Lahan 1 (Lahan Sawah Subur) ---
    {
        id: 1,
        nama: "Padi Ciherang",
        jenis: "Pangan",
        lahanId: 1,
        tanggalTanam: "2026-09-01",
        jumlah: 1200,
        status: "Siap Panen"
    },
    {
        id: 2,
        nama: "Jagung Manis",
        jenis: "Pangan",
        lahanId: 1,
        tanggalTanam: "2026-09-20",
        jumlah: 450,
        status: "Dalam Perawatan"
    },
    {
        id: 3,
        nama: "Cabai Rawit Merah",
        jenis: "Sayuran",
        lahanId: 1,
        tanggalTanam: "2026-09-10",
        jumlah: 250,
        status: "Dalam Perawatan"
    },

    // --- 3 Tanaman di Lahan 2 (Lahan Perkebunan Bukit) ---
    {
        id: 4,
        nama: "Kopi Robusta",
        jenis: "Perkebunan",
        lahanId: 2,
        tanggalTanam: "2026-05-10",
        jumlah: 280,
        status: "Dalam Perawatan"
    },
    {
        id: 5,
        nama: "Kakao Lindak",
        jenis: "Perkebunan",
        lahanId: 2,
        tanggalTanam: "2026-06-01",
        jumlah: 180,
        status: "Dalam Perawatan"
    },
    {
        id: 6,
        nama: "Teh Hijau",
        jenis: "Perkebunan",
        lahanId: 2,
        tanggalTanam: "2026-06-15",
        jumlah: 600,
        status: "Siap Panen"
    },

    // --- 3 Tanaman di Lahan 3 (Lahan Hortikultura Lembah) ---
    {
        id: 7,
        nama: "Tomat Servo",
        jenis: "Sayuran",
        lahanId: 3,
        tanggalTanam: "2026-09-12",
        jumlah: 300,
        status: "Siap Panen"
    },
    {
        id: 8,
        nama: "Bawang Merah Brebes",
        jenis: "Sayuran",
        lahanId: 3,
        tanggalTanam: "2026-08-20",
        jumlah: 500,
        status: "Sudah Dipanen"
    },
    {
        id: 9,
        nama: "Melon Madu",
        jenis: "Buah",
        lahanId: 3,
        tanggalTanam: "2026-09-25",
        jumlah: 140,
        status: "Baru Ditanam"
    }
];

// =====================================
// 2. MEMBUAT ID UNIK
// =====================================

function generateId(data) {
    const maxId = data.reduce((max, item) => {
        const id = Number(item.id);
        return Number.isFinite(id) ? Math.max(max, id) : max;
    }, 0);

    return maxId + 1;
}

// =====================================
// 3. CRUD DATA LAHAN (IN-MEMORY)
// =====================================

// Membaca seluruh data lahan
export function getLahan() {
    return [...dataLahan];
}

// Menambahkan atau memperbarui data lahan
export function saveLahan(lahan) {
    if (lahan.id !== "" && lahan.id !== null && lahan.id !== undefined) {
        const index = dataLahan.findIndex(
            (item) => String(item.id) === String(lahan.id)
        );

        if (index !== -1) {
            dataLahan[index] = {
                ...dataLahan[index],
                ...lahan
            };
            return true;
        } else {
            return false;
        }
    } else {
        const dataBaru = {
            ...lahan,
            id: generateId(dataLahan)
        };

        dataLahan.push(dataBaru);
        return true;
    }
}

// Menghapus data lahan
export function deleteLahan(id) {
    const initialLength = dataLahan.length;
    dataLahan = dataLahan.filter(
        (item) => String(item.id) !== String(id)
    );

    return dataLahan.length !== initialLength;
}

// =====================================
// 4. CRUD DATA TANAMAN (IN-MEMORY)
// =====================================

// Membaca seluruh data tanaman
export function getTanaman() {
    return [...dataTanaman];
}

// Menambahkan atau memperbarui data tanaman
export function saveTanaman(tanaman) {
    if (tanaman.id !== "" && tanaman.id !== null && tanaman.id !== undefined) {
        const index = dataTanaman.findIndex(
            (item) => String(item.id) === String(tanaman.id)
        );

        if (index !== -1) {
            dataTanaman[index] = {
                ...dataTanaman[index],
                ...tanaman
            };
            return true;
        } else {
            return false;
        }
    } else {
        const dataBaru = {
            ...tanaman,
            id: generateId(dataTanaman)
        };

        dataTanaman.push(dataBaru);
        return true;
    }
}

// Menghapus data tanaman
export function deleteTanaman(id) {
    const initialLength = dataTanaman.length;
    dataTanaman = dataTanaman.filter(
        (item) => String(item.id) !== String(id)
    );

    return dataTanaman.length !== initialLength;
}

// =====================================
// 5. MENGHAPUS SELURUH DATA
// =====================================

export function clearAllData() {
    dataLahan = [];
    dataTanaman = [];
    try {
        localStorage.removeItem(LAHAN_KEY);
        localStorage.removeItem(TANAMAN_KEY);
    } catch (error) {
        console.warn("Storage tidak dapat diakses:", error);
    }
    return true;
}
