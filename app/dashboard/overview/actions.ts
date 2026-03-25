"use server";

import { db } from "@/db";
import { users, roles, registrationTokens } from "@/db/schema"; // Import disatukan
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server"; // Pindah ke atas
import crypto from "crypto"; // Pindah ke atas

export async function getOrganizationData() {
  // 1. Ambil Semua Member + Role + Divisi
  const allMembers = await db.query.users.findMany({
    with: {
      role: true,
      division: true,
    },
    orderBy: [asc(users.name)],
  });

  const normalizedMembers = allMembers.map((member) => {
    const normalizedStatus: "active" | "inactive" =
      member.status === "inactive" ? "inactive" : "active";

    return {
      ...member,
      status: normalizedStatus,
    };
  });

  // 2. Ambil List Divisi buat Statistik
  const allDivisions = await db.query.divisions.findMany();

  // 3. Hitung member per divisi dari allMembers
  const divisionCounts = allDivisions.map((d) => ({
    id: d.id,
    name: d.divisionName,
    count: normalizedMembers.filter((m) => m.divisionId === d.id).length,
  }));

  // 4. Kita proses datanya biar siap saji di Frontend
  // Pisahin BPH (Ketua, Sekre, Bendahara) dari Divisi
  const bphRoles = ["Ketua", "Sekretaris", "Bendahara", "Wakil Ketua"];

  const structure = {
    bph: normalizedMembers.filter((m) =>
      bphRoles.includes(m.role?.roleName || ""),
    ),
    staff: normalizedMembers.filter(
      (m) => !bphRoles.includes(m.role?.roleName || ""),
    ),
    stats: {
      totalMembers: normalizedMembers.length,
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

export async function generateTokenAction(formData?: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  let roleId: number;
  let divisionId: number | null = null;

  if (formData) {
    roleId = Number(formData.get("roleId"));
    const divisionIdStr = formData.get("divisionId");
    divisionId = divisionIdStr ? Number(divisionIdStr) : null;

    if (!roleId) return { error: "Role ID wajib diisi" };
  } else {
    const defaultRole = await db.query.roles.findFirst({
      where: eq(roles.roleName, "Anggota"),
    });

    if (!defaultRole) {
      return { error: "Role 'Anggota' tidak ditemukan di sistem." };
    }

    roleId = defaultRole.id;
  }

  // Bikin token acak (format: POTIK-XXXX-XXXX)
  const randomStr = crypto.randomBytes(4).toString("hex").toUpperCase();
  const tokenString = `POTIK-${randomStr.slice(0, 4)}-${randomStr.slice(4, 8)}`;

  // Set expired 7 hari dari sekarang
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  try {
    await db.insert(registrationTokens).values({
      token: tokenString,
      roleId,
      divisionId,
      createdBy: user.id,
      expiresAt,
    });

    revalidatePath("/dashboard/overview");
    return {
      success: true,
      token: tokenString,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error) {
    console.error("Gagal generate token:", error);
    return { error: "Terjadi kesalahan pada server." };
  }
}
