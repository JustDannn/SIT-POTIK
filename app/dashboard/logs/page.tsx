import React from "react";
import { getActivityLogs } from "./actions";
import LogsView from "./_views/LogsView";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function LogsPage() {
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

  // Fetch Logs
  const logs = await getActivityLogs(userProfile.divisionId);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <LogsView logs={logs} />
    </div>
  );
}
