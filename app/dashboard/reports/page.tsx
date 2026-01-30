import React from "react";
import { getReportData } from "./actions";
import DivisionReportView from "./_views/DivisionReportView";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: { division: true },
  });

  if (!userProfile?.divisionId) return <div>Access Denied</div>;

  const reportData = await getReportData(userProfile.divisionId);

  return (
    <DivisionReportView
      data={reportData}
      divisionName={userProfile.division?.divisionName || "Divisi Riset"}
    />
  );
}
