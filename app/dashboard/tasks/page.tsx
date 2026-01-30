import React from "react";
import { getDivisionTasks, getFormOptions } from "./actions";
import TaskKanbanView from "./_views/TaskKanbanView";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Ambil user info buat tau divisi mana
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: { division: true },
  });

  if (!userProfile?.divisionId) {
    return (
      <div className="p-8 text-center text-gray-500">
        Anda tidak terdaftar dalam divisi manapun.
      </div>
    );
  }

  // Fetch Data Server Side (Parallel Fetching biar cepet)
  const [tasks, options] = await Promise.all([
    getDivisionTasks(userProfile.divisionId),
    getFormOptions(userProfile.divisionId),
  ]);

  return (
    <div className="h-[calc(100vh-120px)]">
      {/* Kita set height fix biar kanban-nya scrollable di dalam, bukan halamannya */}
      <TaskKanbanView
        initialTasks={tasks}
        prokerOptions={options.prokers}
        memberOptions={options.members}
      />
    </div>
  );
}
