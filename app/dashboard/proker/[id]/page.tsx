import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import {
  prokers,
  divisions,
  users,
  tasks,
  activityLogs,
  programParticipants,
} from "@/db/schema";
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
        divisionId: prokers.divisionId,
        divisionName: divisions.divisionName,
        picUserId: prokers.picUserId,
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

    // 4. Fetch Tasks (formatted to match EventTasks interface)
    const taskList = await db
      .select({
        id: tasks.id,
        prokerId: tasks.prokerId,
        programId: tasks.programId,
        title: tasks.title,
        description: tasks.description,
        assignedUserId: tasks.assignedUserId,
        assignedUserName: users.name,
        status: tasks.status,
        deadline: tasks.deadline,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedUserId, users.id))
      .where(eq(tasks.prokerId, prokerId))
      .orderBy(desc(tasks.createdAt));

    // 5. Fetch Activity Logs (formatted to match EventLogs interface)
    const logList = await db
      .select({
        id: activityLogs.id,
        notes: activityLogs.notes,
        logDate: activityLogs.logDate,
        userName: users.name,
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.createdBy, users.id))
      .where(eq(activityLogs.prokerId, prokerId))
      .orderBy(desc(activityLogs.logDate));

    // 6. Fetch Participants (from programParticipants with prokerId)
    const participantList = await db
      .select({
        id: programParticipants.id,
        role: programParticipants.role,
        joinedAt: programParticipants.joinedAt,
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
      })
      .from(programParticipants)
      .leftJoin(users, eq(programParticipants.userId, users.id))
      .where(eq(programParticipants.prokerId, prokerId));

    // 7. Calculate Progress
    const totalTasks = taskList.length;
    const doneTasks = taskList.filter((t) => t.status === "done").length;
    const progress =
      totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // 8. Format Data for View (matching event data shape)
    const formattedProker = {
      id: prokerData.id,
      type: "proker" as const,
      title: prokerData.title,
      description: prokerData.description,
      status: prokerData.status,
      divisionId: prokerData.divisionId,
      divisionName: prokerData.divisionName || "Tanpa Divisi",
      picName: prokerData.picName || "Belum ada PIC",
      startDate: prokerData.startDate
        ? prokerData.startDate.toISOString()
        : null,
      endDate: prokerData.endDate ? prokerData.endDate.toISOString() : null,
      progress: progress,
      // Participants (matching EventTeam interface)
      participants: participantList.map((p) => ({
        ...p,
        joinedAt: p.joinedAt
          ? p.joinedAt.toISOString()
          : new Date().toISOString(),
      })),
      // Tasks (matching EventTasks interface)
      tasks: taskList.map((t) => ({
        ...t,
        deadline: t.deadline ? t.deadline.toISOString() : null,
        createdAt: t.createdAt ? t.createdAt.toISOString() : null,
        updatedAt: t.updatedAt ? t.updatedAt.toISOString() : null,
      })),
      // Logs (matching EventLogs interface)
      logs: logList.map((l) => ({
        id: l.id,
        notes: l.notes,
        userName: l.userName || "Unknown",
        createdAt: l.logDate
          ? l.logDate.toISOString()
          : new Date().toISOString(),
      })),
    };

    // 9. Render View
    return <ProkerDetailView proker={formattedProker} user={userProfile} />;
  } catch (error) {
    console.error("Error fetching proker detail:", error);
    notFound();
  }
}
