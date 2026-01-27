"use server";

import { db } from "@/db";
import { users, divisions, roles } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getOrganizationData() {
  // 1. Ambil Semua Member + Role + Divisi
  const allMembers = await db.query.users.findMany({
    with: {
      role: true,
      division: true,
    },
    orderBy: [asc(users.name)],
  });

  // 2. Ambil List Divisi buat Statistik
  const allDivisions = await db.query.divisions.findMany();

  // 3. Hitung member per divisi dari allMembers
  const divisionCounts = allDivisions.map((d) => ({
    id: d.id,
    name: d.divisionName,
    count: allMembers.filter((m) => m.divisionId === d.id).length,
  }));

  // 4. Kita proses datanya biar siap saji di Frontend
  // Pisahin BPH (Ketua, Sekre, Bendahara) dari Divisi
  const bphRoles = ["Ketua", "Sekretaris", "Bendahara", "Wakil Ketua"];

  const structure = {
    bph: allMembers.filter((m) => bphRoles.includes(m.role?.roleName || "")),
    staff: allMembers.filter((m) => !bphRoles.includes(m.role?.roleName || "")),
    stats: {
      totalMembers: allMembers.length,
      totalDivisions: allDivisions.length,
      divisionBreakdown: divisionCounts,
    },
  };

  return structure;
}

export async function updateMember(
  userId: string,
  data: { roleId?: number; divisionId?: number | null; status?: string },
) {
  try {
    await db.update(users).set(data).where(eq(users.id, userId));

    revalidatePath("/dashboard/overview");
    return { success: true };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, error: "Gagal update database" };
  }
}

// Helper buat ambil list options (Role & Divisi) buat Dropdown nanti
export async function getReferenceData() {
  const rolesData = await db.query.roles.findMany();
  const divisionsData = await db.query.divisions.findMany();
  return { roles: rolesData, divisions: divisionsData };
}

export async function getReferences() {
  const allRoles = await db.query.roles.findMany();
  const allDivisions = await db.query.divisions.findMany();

  return {
    roles: allRoles,
    divisions: allDivisions,
  };
}
