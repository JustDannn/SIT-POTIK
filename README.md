# POTIK TUS – Integrated Web Platform

Platform resmi **Pojok Statistik Telkom University Surabaya (POTIK TUS)** yang berfungsi sebagai:

* **Media publikasi & portofolio organisasi** (public-facing)
* **Sistem internal terintegrasi** untuk manajemen program kerja, dokumentasi, dan keuangan

> Project ini **bukan demo / showcase**, melainkan **sistem yang benar-benar digunakan** oleh POTIK TUS.

---

## 🎯 Tujuan Proyek

Website ini dibangun untuk menjawab kebutuhan utama POTIK TUS:

* Menyediakan **platform resmi terpusat** (tidak hanya Instagram)
* Mendokumentasikan **aktivitas, riset, dan dampak organisasi** secara berkelanjutan
* Meningkatkan **produktivitas internal** melalui dashboard berbasis role
* Menjadi **arsip organisasi** yang rapi, dapat diaudit, dan kredibel secara institusional

---

## Ruang Lingkup Sistem

### Public Platform (Tanpa Login)

Digunakan oleh masyarakat umum untuk:

* Mengenal POTIK TUS
* Melihat kegiatan, program, dan dampak
* Mengakses publikasi (artikel, infografis, paper)

### Internal Platform (Dengan Login)

Digunakan oleh pengurus & anggota untuk:

* Manajemen program kerja (proker)
* Tracking aktivitas & notulensi rapat
* Pelaporan & approval
* Manajemen keuangan & LPJ
* Publikasi konten ke halaman publik

---

## 👥 Role Pengguna

Sistem menggunakan **role-based access control** dengan aturan:

> **1 user = 1 role**

| Role               | Deskripsi Singkat                    |
| ------------------ | ------------------------------------ |
| Public User        | Pengunjung website (tanpa login)     |
| Anggota Divisi     | Pelaksana kegiatan & task            |
| Koordinator Divisi | Pengelola proker & anggota divisi    |
| Ketua              | Pengambil keputusan & approver utama |
| Sekretaris         | Notulensi, arsip, dokumentasi        |
| Bendahara          | Manajemen keuangan & LPJ             |
| Dosen              | Supervisor & final approver          |

---

## Fitur Utama

### Public Features

* Landing page organisasi
* Halaman divisi (What We Do)
* Program & impact
* Publikasi (artikel, infografis, paper)

### Internal Features

* Program Kerja Management
* Task Management (opsional per proker)
* Log Aktivitas & Notulensi (proker & non-proker)
* Reporting & Approval Flow
* Financial Management & LPJ
* Content Management (Draft → Review → Publish)

---

## 🗂️ Dokumentasi Teknis

Dokumentasi sistem tersedia di folder `/docs`:

```
/docs
 ├─ srs.md        # Software Requirement Specification
 ├─ erd.md        # Entity Relationship Design
 └─ user-flow.md  # User Flow per role
```

Dokumen-dokumen ini menjadi **acuan utama pengembangan** frontend & backend.

---

## Prinsip Desain Sistem

* **Data-driven**, bukan UI-driven
* Proker sebagai pusat aktivitas
* Log aktivitas menggantikan konsep progress %
* Arsip & auditability sebagai prioritas
* UI publik ≠ dashboard internal

---

## 🚧 Status Pengembangan

* [x] Requirement Analysis (SRS v1)
* [x] System Design (ERD & User Flow)
* [ ] UI Wireframe
* [ ] Development (Frontend & Backend)
* [ ] Deployment
