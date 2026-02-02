import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { prokers, divisions, users, tasks, activityLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

// Views
import ProkerDetailView from "../_views/ProkerDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProkerDetailPage({ params }: PageProps) {
  // 1. Handle Params (Next.js 15 Requirement)
  const { id } = await params;
  const prokerId = parseInt(id, 10);

  if (isNaN(prokerId)) {
    notFound();
  }

  // 2. Auth Check & Get User Profile
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  // Ambil profil user lengkap untuk dipassing ke View (buat keperluan aksi Add Task/Log)
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
    with: { role: true, division: true },
  });

  try {
    // 3. Fetch Proker Core Data
    const prokerResult = await db
      .select({
        id: prokers.id,
        title: prokers.title,
        description: prokers.description,
        status: prokers.status,
        startDate: prokers.startDate,
        endDate: prokers.endDate,
        divisionName: divisions.divisionName,
        picName: users.name,
      })
      .from(prokers)
      .leftJoin(divisions, eq(prokers.divisionId, divisions.id))
      .leftJoin(users, eq(prokers.picUserId, users.id))
      .where(eq(prokers.id, prokerId))
      .limit(1);

    if (prokerResult.length === 0) {
      notFound();
    }

    const prokerData = prokerResult[0];

    // 4. Fetch Tasks
    const taskList = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        deadline: tasks.deadline,
        assignedUserName: users.name,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedUserId, users.id))
      .where(eq(tasks.prokerId, prokerId))
      .orderBy(desc(tasks.createdAt)); // Task baru di atas

    // 5. Fetch Activity Logs
    const logList = await db
      .select({
        id: activityLogs.id,
        notes: activityLogs.notes,
        createdAt: activityLogs.createdAt,
        userName: users.name,
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.createdBy, users.id))
      .where(eq(activityLogs.prokerId, prokerId))
      .orderBy(desc(activityLogs.createdAt)); // Log baru di atas

    // 6. Calculate Progress
    const totalTasks = taskList.length;
    const doneTasks = taskList.filter((t) => t.status === "done").length;
    const progress =
      totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // 7. Format Data for View
    // Kita sesuaikan nama fieldnya agar cocok dengan ProkerDetailView
    const formattedProker = {
      id: prokerData.id,
      title: prokerData.title,
      description: prokerData.description,
      status: prokerData.status,
      divisionName: prokerData.divisionName || "Tanpa Divisi",
      picName: prokerData.picName || "Belum ada PIC",
      startDate: prokerData.startDate,
      endDate: prokerData.endDate,
      progress: progress,
      // Mapping Tasks
      tasks: taskList.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        deadline: t.deadline,
        assignedUser: t.assignedUserName ? { name: t.assignedUserName } : null,
      })),
      // Mapping Logs (Pastikan key-nya 'logs' bukan 'activityLogs' karena View minta 'logs')
      logs: logList.map((l) => ({
        id: l.id,
        notes: l.notes,
        createdAt: l.createdAt,
        user: l.userName ? { name: l.userName } : { name: "Unknown" },
      })),
    };

    // 8. Render View
    return <ProkerDetailView proker={formattedProker} user={userProfile} />;
  } catch (error) {
    console.error("Error fetching proker detail:", error);
    // Bisa return custom error UI disini
    notFound();
  }
}
