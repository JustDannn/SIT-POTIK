# Software Requirement Specification (SRS) v1

## 1. Introduction

### 1.1 Purpose

Dokumen ini mendeskripsikan kebutuhan fungsional dan non-fungsional dari **Sistem Informasi Terpadu POTIK TUS**, sebuah platform berbasis web yang bertujuan untuk:

* Menjadi **media publikasi resmi** POTIK TUS
* Menjadi **sistem internal organisasi** untuk mengelola program kerja, laporan, keuangan, dan dokumentasi
* Meningkatkan **produktivitas, transparansi, dan akuntabilitas organisasi**

Dokumen ini ditujukan untuk:

* Tim pengembang
* Pengurus POTIK TUS
* Dosen pembina
* Stakeholder institusi

---

### 1.2 Scope

Sistem ini mencakup dua area utama:

1. **Public Platform (tanpa login)**
   Digunakan untuk menampilkan profil, aktivitas, dan dampak POTIK TUS kepada publik.

2. **Internal Dashboard (dengan login & role-based access)**
   Digunakan untuk manajemen organisasi, termasuk:

   * Program kerja
   * Task & log aktivitas
   * Notulensi rapat
   * Laporan & approval
   * Manajemen keuangan
   * Publikasi konten

---

### 1.3 Definitions & Acronyms

| Istilah       | Definisi                                   |
| ------------- | ------------------------------------------ |
| POTIK TUS     | Pojok Statistik Telkom University Surabaya |
| Proker        | Program Kerja                              |
| Log Aktivitas | Catatan progres & update per proker        |
| Notulensi     | Catatan hasil rapat                        |
| LPJ           | Laporan Pertanggungjawaban                 |
| Role          | Hak akses pengguna                         |

---

## 2. Overall Description

### 2.1 Product Perspective

Sistem ini adalah **web-based application** yang berdiri sendiri dan dapat diakses melalui browser desktop maupun mobile.

Arsitektur sistem memisahkan:

* **Public content**
* **Internal organizational data**

---

### 2.2 User Classes & Characteristics

| Role               | Deskripsi                                      |
| ------------------ | ---------------------------------------------- |
| Public User        | Pengunjung umum, hanya mengakses konten publik |
| Anggota Divisi     | Melaksanakan proker & task                     |
| Koordinator Divisi | Mengelola proker & anggota divisi              |
| Ketua              | Pengambil keputusan & approver utama           |
| Sekretaris         | Dokumentasi, notulensi, arsip laporan          |
| Bendahara          | Manajemen keuangan & LPJ                       |
| Dosen              | Supervisor & final approver                    |

> **Aturan:**
> 1 user = 1 role

---

### 2.3 Organizational Structure

Struktur hirarki sistem mengikuti struktur organisasi nyata:

```
Dosen
 ↓
Ketua
 ↓
Koordinator Divisi
 ↓
Anggota Divisi
```

Sekretaris dan Bendahara memiliki **akses lintas divisi**, setara level Ketua (non-hirarkis).

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization

* Sistem menyediakan mekanisme login untuk user internal
* Public user tidak memerlukan akun
* Akses dashboard dibatasi berdasarkan role

---

### 3.2 Divisi Management

* Sistem menyimpan daftar divisi organisasi
* Divisi bersifat **default fixed**, namun dapat ditambah oleh admin (future-ready)
* Contoh divisi:

  * PR & SDM
  * Riset & Infografis
  * Media & Branding
  * Layanan Data
  * Edukasi & Pelatihan

---

### 3.3 Program Kerja (Proker) Management

Sistem memungkinkan:

* Pembuatan & pengelolaan proker

Setiap proker memiliki:

* Nama
* PIC
* Deskripsi
* Rentang waktu / tanggal
* Output
* Lokasi
* Divisi terkait

---

### 3.4 Task Management (Opsional)

* Proker dapat memiliki task list
* Task memiliki:
  * Nama Proker
  * Deskripsi
  * PIC
  * Status (Todo / Ongoing / Done)
  * Deadline
* Tidak semua proker wajib memiliki task

---

### 3.5 Log Aktivitas & Notulensi (Core Feature)

* Setiap proker **WAJIB** memiliki log aktivitas
* Log berisi:

  * Tanggal / minggu
  * Catatan rapat / update
  * Update per divisi

Sekretaris dapat:

* Upload notulensi rapat (Word / PDF)
* Mengaitkan notulensi ke proker

> Log aktivitas menggantikan konsep “progress %”.

---

### 3.6 Reporting & Approval System

* Proker yang selesai wajib memiliki laporan
* Laporan:

  * Di-upload oleh PIC / Koordinator / Sekretaris
  * Berupa file resmi (PDF/DOC)

**Approval flow:**

1. Ketua review & approve
2. Dosen review & approve

Sistem menyimpan:

* Status approval
* Timestamp
* Approver

---

### 3.7 Financial Management (Bendahara)

* Tracking dana per proker:

  * Anggaran
  * Pengeluaran
  * Sisa dana
* Upload LPJ
* Catatan keuangan umum (subscription, kebutuhan lintas divisi)

---

### 3.8 Content Management System (CMS)

* Jenis konten:

  * Artikel
  * Infografis
  * Dokumentasi
  * Paper

**Workflow konten:**
Draft → Review → Publish

Hanya konten berstatus **Published** yang tampil di landing page.

---

## 4. Non-Functional Requirements

### 4.1 Usability

* Antarmuka mudah digunakan oleh non-teknis
* Dashboard berbeda sesuai role

### 4.2 Performance

* Website responsif
* Load time landing page < 3 detik (normal traffic)

### 4.3 Security

* Role-based access control
* Data internal tidak dapat diakses publik
* File upload dibatasi tipe & ukuran

### 4.4 Compatibility

* Responsive design (desktop & mobile)
* Compatible dengan browser modern

---

## 5. System Workflow (High-Level)

### 5.1 Proker Lifecycle

```
Created → Active → Completed → Report Uploaded → Approved → Archived
```

### 5.2 Content Lifecycle

```
Draft → Review → Published
```

### 5.3 Financial Lifecycle

```
Budget Set → Expense Recorded → LPJ Uploaded → Approved
```

---

## 6. Assumptions & Constraints

### Assumptions

* Semua user internal memiliki akun
* Struktur organisasi stabil per periode

### Constraints

* Sistem berbasis web
* Pengembangan bertahap (MVP → iterasi)

