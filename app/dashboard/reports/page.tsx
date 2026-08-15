import React from "react";
import { getReportData } from "./actions";
import DivisionReportView from "./_views/DivisionReportView";
import { getCurrentUser } from "@/utils/session";
import { db } from "@/db";
import { users, roles } from "@/db/schema"; // Pastikan import roles
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  // Ambil user profile + Role Name
  const userProfile = user;

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
