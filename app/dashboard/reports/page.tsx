import React from "react";
import { getReportData } from "./actions";
import DivisionReportView from "./_views/DivisionReportView";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, roles } from "@/db/schema"; // Pastikan import roles
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Ambil user profile + Role Name
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      division: true,
      role: true, // Kita butuh nama role-nya
    },
  });

  if (!userProfile) return <div>User data not found</div>;

  const roleName = userProfile.role?.roleName;
  const isBPH =
    roleName === "Sekretaris" ||
    roleName === "Ketua" ||
    roleName === "Wakil Ketua";

  // --- LOGIC PERMISSION ---

  let reportData;
  let reportTitle;

  if (isBPH) {
    reportData = await getReportData();
    reportTitle = "Laporan Seluruh Organisasi";
  } else if (userProfile.divisionId) {
    reportData = await getReportData(userProfile.divisionId);
    reportTitle = `Laporan Divisi ${userProfile.division?.divisionName}`;
  } else {
    return (
      <div className="flex h-[50vh] items-center justify-center flex-col text-gray-500">
        <h3 className="text-lg font-bold">Access Denied</h3>
        <p>Anda tidak terdaftar dalam divisi manapun.</p>
      </div>
    );
  }

  return <DivisionReportView data={reportData} divisionName={reportTitle} />;
}
