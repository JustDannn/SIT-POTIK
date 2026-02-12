"use server";

import { db } from "@/db";
import { users, roles, divisions } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface TeamMember {
  id: string;
  name: string;
  image: string | null;
  roleName: string;
  divisionName: string | null;
}

export async function getTeamMembers() {
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
      status: users.status,
      roleName: roles.roleName,
      divisionName: divisions.divisionName,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .leftJoin(divisions, eq(users.divisionId, divisions.id))
    .where(eq(users.status, "active"));

  const dosen: TeamMember[] = [];
  const agent: TeamMember[] = [];

  // Sort order for agent roles (leadership first)
  const roleOrder = [
    "Ketua",
    "Wakil Ketua",
    "Sekretaris",
    "Bendahara",
    "Koordinator",
    "Anggota",
  ];

  for (const u of allUsers) {
    const member: TeamMember = {
      id: u.id,
      name: u.name,
      image: u.image,
      roleName: u.roleName,
      divisionName: u.divisionName,
    };

    if (u.roleName === "Dosen") {
      dosen.push(member);
    } else {
      agent.push(member);
    }
  }

  // Sort agents by role importance
  agent.sort((a, b) => {
    const ai = roleOrder.indexOf(a.roleName);
    const bi = roleOrder.indexOf(b.roleName);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return { dosen, agent };
}
