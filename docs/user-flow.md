# User Flow

## 1. Tujuan Dokumen

Dokumen ini menjelaskan **alur interaksi pengguna (user flow)** pada Sistem Informasi Terpadu POTIK TUS berdasarkan:

* SRS v1
* ERD v1

User flow digunakan sebagai dasar:

* perancangan UI/UX
* validasi fitur per role
* implementasi frontend & backend

---

## 2. Public User Flow (Tanpa Login)

**Aktor:** Public User

### Alur:

1. Mengakses landing page POTIK TUS
2. Melihat:

   * Profil organisasi
   * Struktur & divisi
   * Highlight kegiatan
   * Artikel, infografis, paper (published)
3. Mengunduh publikasi

**Batasan:**

* Tidak dapat mengakses dashboard
* Tidak dapat melihat data internal

---

## 3. Anggota Divisi Flow

**Aktor:** Anggota Divisi

### Alur:

1. Login ke sistem
2. Masuk ke dashboard anggota
3. Melihat:

   * Proker divisi
   * Task yang ditugaskan
   * Log aktivitas proker
4. Melakukan aksi:

   * Update status task
   * Menambahkan catatan/log aktivitas
   * Upload output proker (jika diberi izin)
5. Logout

---

## 4. Koordinator Divisi Flow

**Aktor:** Koordinator Divisi

### Alur:

1. Login ke sistem
2. Masuk ke dashboard koordinator
3. Mengelola proker:

   * Membuat / mengedit proker
   * Menentukan PIC
   * Menambahkan anggota terlibat
4. Mengelola task:

   * Membuat task
   * Assign ke anggota
   * Monitoring status
5. Mengelola log aktivitas:

   * Menambahkan update
   * Melihat kontribusi lintas divisi
6. Mengunggah laporan proker
7. (Opsional) Submit konten untuk publikasi

---

## 5. Ketua Flow

**Aktor:** Ketua

### Alur:

1. Login ke sistem
2. Masuk ke dashboard ketua
3. Melihat overview organisasi:

   * Seluruh proker
   * Status laporan
   * Ringkasan aktivitas
4. Review laporan proker
5. Approve / reject laporan
6. Review konten publik
7. Approve / reject publikasi konten

---

## 6. Sekretaris Flow

**Aktor:** Sekretaris

### Alur:

1. Login ke sistem
2. Masuk ke dashboard sekretaris
3. Mengelola notulensi:

   * Upload notulensi proker
   * Upload notulensi non-proker (BPH, dosen, internal)
   * Menentukan jenis rapat
4. Mengarsipkan dokumen organisasi
5. (Opsional) Upload laporan proker

---

## 7. Bendahara Flow

**Aktor:** Bendahara

### Alur:

1. Login ke sistem
2. Masuk ke dashboard bendahara
3. Mengelola keuangan:

   * Input anggaran proker
   * Mencatat pemasukan & pengeluaran
   * Mencatat pengeluaran umum (non-proker)
4. Upload LPJ keuangan
5. Monitoring status LPJ

---

## 8. Dosen Flow

**Aktor:** Dosen

### Alur:

1. Login ke sistem
2. Masuk ke dashboard dosen
3. Melihat:

   * Proker
   * Laporan proker
   * Ringkasan aktivitas
4. Review laporan
5. Approve laporan

---

## 9. Catatan Desain User Flow

* Setiap role memiliki dashboard berbeda
* Aksi user dibatasi oleh role-based access control
* Semua aktivitas tercatat (audit trail)
* User flow bersifat modular & scalable

---
