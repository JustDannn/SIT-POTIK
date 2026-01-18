# Entity Relationship Design (ERD)

## 1. Tujuan ERD

Dokumen ini mendefinisikan **entitas, atribut utama, dan relasi** dalam Sistem Informasi Terpadu POTIK TUS. ERD menjadi dasar:

* desain database
* validasi workflow organisasi
* penurunan user flow & UI

---

## 2. Daftar Entitas Utama

### 2.1 User

Mewakili seluruh pengguna internal sistem.

**Atribut utama:**

* user_id (PK)
* name
* email
* password_hash
* role_id (FK)
* division_id (FK, nullable)
* created_at

**Catatan:**

* 1 user = 1 role
* division_id null untuk Ketua, Sekretaris, Bendahara, Dosen

---

### 2.2 Role

Mendefinisikan hak akses pengguna.

**Atribut utama:**

* role_id (PK)
* role_name

**Contoh role:**

* Anggota
* Koordinator
* Ketua
* Sekretaris
* Bendahara
* Dosen

---

### 2.3 Division

Mewakili divisi organisasi.

**Atribut utama:**

* division_id (PK)
* division_name
* is_active

---

### 2.4 Program Kerja (Proker)

**Atribut utama:**

* proker_id (PK)
* title
* description
* pic_user_id (FK → User)
* division_id (FK)
* start_date
* end_date
* location
* output_description
* status (created / active / completed / archived)
* created_at

---

### 2.5 Task (Opsional)

Digunakan untuk proker yang membutuhkan pembagian kerja teknis.

**Atribut utama:**

* task_id (PK)
* proker_id (FK)
* title
* description
* assigned_user_id (FK → User)
* status (todo / ongoing / done)
* deadline

---

### 2.6 Log Aktivitas

Mencatat progres berbasis aktivitas dan rapat.

**Atribut utama:**

* log_id (PK)
* proker_id (FK)
* created_by (FK → User)
* log_date
* notes

**Catatan:**

* Satu proker memiliki banyak log
* Log menggantikan progress %

---

### 2.7 Notulensi

File notulensi rapat resmi, baik yang terkain proker maupun rapat non-proker (rapat BPH, rapat bersama Dosen, maupun rapat Koordinasi)

**Atribut utama:**

* notulensi_id (PK)
* proker_id (FK, nullable)
* meering_type (proker/bph/dosen/internal)
* title
* uploaded_by (FK → User)
* file_path
* meeting_date
* created_at

Catatan: 
* proker_id boleh NUll untuk rapat non proker
* Notulensi non-proker tetap tersimpan sebagai arsip organisasi

---

### 2.8 Report (Laporan Proker)

Laporan akhir proker.

**Atribut utama:**

* report_id (PK)
* proker_id (FK)
* uploaded_by (FK → User)
* file_path
* status (draft / submitted / approved)
* created_at

---

### 2.9 Report Approval

Mencatat approval laporan.

**Atribut utama:**

* approval_id (PK)
* report_id (FK)
* approved_by (FK → User)
* role (Ketua / Dosen)
* approved_at

---

### 2.10 Finance Record

Mencatat transaksi keuangan.

**Atribut utama:**

* finance_id (PK)
* proker_id (FK, nullable)
* amount
* type (income / expense)
* description
* recorded_by (FK → User)
* date

**Catatan:**

* proker_id null untuk pengeluaran umum (subscription, dll)

---

### 2.11 LPJ

Laporan pertanggungjawaban keuangan.

**Atribut utama:**

* lpj_id (PK)
* proker_id (FK)
* uploaded_by (FK → User)
* file_path
* status (draft / submitted / approved)
* created_at

---

### 2.12 Content

Konten publik.

**Atribut utama:**

* content_id (PK)
* title
* type (artikel / infografis / dokumentasi / paper)
* body_or_file
* created_by (FK → User)
* status (draft / review / published)
* published_at

---

## 3. Relasi Antar Entitas

* Role 1 ─── * User
* Division 1 ─── * User
* Division 1 ─── * Proker
* User 1 ─── * Proker (PIC)
* Proker 1 ─── * Task
* Proker 1 ─── * Log Aktivitas
* Proker 1 ─── * Notulensi
* Proker 1 ─── 1 Report
* Report 1 ─── * Report Approval
* Proker 1 ─── * Finance Record
* Proker 1 ─── 1 LPJ
* User 1 ─── * Content

---

## 4. Design Notes

* Proker adalah pusat relasi sistem
* Log Aktivitas adalah sumber utama tracking progres
* Keuangan dipisah dari laporan kegiatan
* Content terpisah dari Proker agar fleksibel untuk publikasi

---

## 5. Status

**ERD v1 — APPROVED (Draft Internal)**

