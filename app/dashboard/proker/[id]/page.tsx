import ProkerDetailView from "../_views/ProkerDetailView";
import { db } from "@/db";
import { prokers, divisions, users, tasks, activityLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProkerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const prokerId = parseInt(id, 10);

  if (isNaN(prokerId)) {
    notFound();
  }

  try {
    // Fetch proker with joins
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

    // Fetch tasks separately (with error handling)
    let taskList: {
      id: number;
      title: string;
      description: string | null;
      status: "todo" | "ongoing" | "done" | null;
      deadline: Date | null;
      assignedUserName: string | null;
    }[] = [];

    try {
      taskList = await db
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
        .where(eq(tasks.prokerId, prokerId));
    } catch (e) {
      console.error("Error fetching tasks:", e);
    }

    // Fetch activity logs separately (with error handling)
    let logList: {
      id: number;
      notes: string;
      createdAt: Date | null;
      userName: string | null;
    }[] = [];

    try {
      logList = await db
        .select({
          id: activityLogs.id,
          notes: activityLogs.notes,
          createdAt: activityLogs.createdAt,
          userName: users.name,
        })
        .from(activityLogs)
        .leftJoin(users, eq(activityLogs.createdBy, users.id))
        .where(eq(activityLogs.prokerId, prokerId))
        .orderBy(desc(activityLogs.createdAt));
    } catch (e) {
      // Log the actual error message
      if (e instanceof Error) {
        console.error("Error fetching activity logs:", e.message);
        // Check if table doesn't exist
        if (
          e.message.includes("does not exist") ||
          e.message.includes("relation")
        ) {
          console.warn(
            "The activity_logs table may not exist. Run: npx drizzle-kit push",
          );
        }
      }
    }

    // Calculate progress from tasks
    const totalTasks = taskList.length;
    const doneTasks = taskList.filter((t) => t.status === "done").length;
    const progress =
      totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // Transform data to match the view's expected format
    const data = {
      id: prokerData.id,
      title: prokerData.title,
      description: prokerData.description,
      status: prokerData.status,
      divisionName: prokerData.divisionName || "-",
      picName: prokerData.picName || "-",
      startDate: prokerData.startDate,
      endDate: prokerData.endDate,
      progress,
      tasks: taskList.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        deadline: t.deadline,
        assignedUser: t.assignedUserName ? { name: t.assignedUserName } : null,
      })),
      activityLogs: logList.map((l) => ({
        id: l.id,
        notes: l.notes,
        createdAt: l.createdAt,
        user: l.userName ? { name: l.userName } : null,
      })),
    };

    return <ProkerDetailView data={data} />;
  } catch (error) {
    console.error("Error fetching proker:", error);
    notFound();
  }
}
