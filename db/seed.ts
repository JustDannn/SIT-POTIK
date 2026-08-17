import "dotenv/config";
import { db } from "./index";
import { roles, divisions, users } from "./schema";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Mulai seeding database dari data Supabase...");

  console.log("Injeksi tabel Roles...");
  await db
    .insert(roles)
    .values([
      { id: 7, roleName: "Anggota" },
      { id: 8, roleName: "Koordinator" },
      { id: 9, roleName: "Sekretaris" },
      { id: 10, roleName: "Bendahara" },
      { id: 11, roleName: "Ketua" },
      { id: 12, roleName: "Dosen" },
    ])
    .onConflictDoNothing();

  console.log("Injeksi tabel Divisions...");
  await db
    .insert(divisions)
    .values([
      { id: 1, divisionName: "Media & Branding", isActive: true },
      { id: 2, divisionName: "Riset & Infografis", isActive: true },
      { id: 3, divisionName: "Edukasi & Pelatihan", isActive: true },
      {
        id: 4,
        divisionName: "Public Relation & Hubungan Manusia",
        isActive: true,
      },
      { id: 5, divisionName: "Layanan Data", isActive: true },
    ])
    .onConflictDoNothing();

  // Password Default untuk semua akun: "Password@123!"
  const defaultPassword = await bcrypt.hash("Password@123!", 10);

  console.log("Injeksi tabel Users...");
  await db
    .insert(users)
    .values([
      // --- BPH ---
      {
        name: "Ketua Potiktus",
        email: "superadmin@potiktus.telkomuniversity.ac.id",
        password: defaultPassword,
        roleId: 11, // Ketua
        divisionId: null,
        status: "active",
      },
      {
        name: "Sekretaris Potiktus",
        email: "sekretaris@potiktus.telkomuniversity.ac.id",
        password: defaultPassword,
        roleId: 9, // Sekretaris
        divisionId: null,
        status: "active",
      },
      {
        name: "Bendahara Potiktus",
        email: "bendahara@potiktus.telkomuniversity.ac.id",
        password: defaultPassword,
        roleId: 10, // Bendahara
        divisionId: null,
        status: "active",
      },

      // --- KOORDINATOR 5 DIVISI ---
      {
        name: "Koordinator Media & Branding",
        email: "media@potiktus.telkomuniversity.ac.id",
        password: defaultPassword,
        roleId: 8, // Koordinator
        divisionId: 1,
        status: "active",
      },
      {
        name: "Koordinator Riset & Infografis",
        email: "riset@potiktus.telkomuniversity.ac.id",
        password: defaultPassword,
        roleId: 8, // Koordinator
        divisionId: 2,
        status: "active",
      },
      {
        name: "Koordinator Edukasi & Pelatihan",
        email: "edukasi@potiktus.telkomuniversity.ac.id",
        password: defaultPassword,
        roleId: 8, // Koordinator
        divisionId: 3,
        status: "active",
      },
      {
        name: "Koordinator PR & Hubungan Manusia",
        email: "pr@potiktus.telkomuniversity.ac.id",
        password: defaultPassword,
        roleId: 8, // Koordinator
        divisionId: 4,
        status: "active",
      },
      {
        name: "Koordinator Layanan Data",
        email: "layanan@potiktus.telkomuniversity.ac.id",
        password: defaultPassword,
        roleId: 8, // Koordinator
        divisionId: 5,
        status: "active",
      },

      // --- DOSEN PEMBINA ---
      {
        name: "Dosen Pembina",
        email: "dosen@potiktus.telkomuniversity.ac.id",
        password: defaultPassword,
        roleId: 12, // Dosen
        divisionId: null,
        status: "active",
      },
    ])
    .onConflictDoNothing();

  console.log("Seeding selesai! Akun 5 divisi dan BPH siap digunakan.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding gagal:", err);
  process.exit(1);
});
