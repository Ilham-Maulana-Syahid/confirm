// ====== PEMUAT DATA TRANSAKSI ======
// Memuat data dari localStorage (jika ada) — hasil edit dari admin.html —
// jika tidak ada, memakai data bawaan dari config.js.
//
// PENTING: localStorage tersimpan di browser MESIN INI saja.
// Untuk mengubah data yang dilihat SEMUA orang, edit lewat dashboard
// admin (admin.html) lalu klik "Salin config.js" → paste ke config.js → push.

const STORAGE_KEY = 'DATA_TRANSAKSI_V1';

// Mengembalikan array data transaksi
function getDataTransaksi() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        // Hanya terima entri yang valid (semua field wajib terisi)
        return arr.filter(t => t && typeof t.id === 'string' && typeof t.nama === 'string'
          && typeof t.rekening === 'string' && typeof t.nominal === 'string');
      }
    }
  } catch (e) {
    // localStorage rusak/tidak bisa dibaca -> pakai bawaan config.js
  }
  return DATA_TRANSAKSI;
}

// Menyimpan data hasil edit admin ke localStorage browser ini
function saveDataTransaksi(arr) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (e) {
    // Penyimpanan penuh / dinonaktifkan — abaikan
  }
}

// Menghapus data edit -> kembali memakai bawaan config.js
function resetDataTransaksi() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) { /* abaikan */ }
}
