import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import {
  users,
  divisions,
  designRequests,
  designRequestComments,
} from "@/db/schema";
import RequestDetailView from "./_components/RequestDetailView";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DesignRequestDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get user profile with division and role
  const profile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      role: true,
      division: true,
    },
  });

  if (!profile) redirect("/login");

  // Only Media/Branding division or Ketua can access
  const divisionName = profile.division?.divisionName?.toLowerCase() || "";
  const isMediaDivision =
    divisionName.includes("media") || divisionName.includes("branding");
  const isKetua = profile.role?.roleName === "Ketua";

  if (!isMediaDivision && !isKetua) {
    redirect("/dashboard");
  }

  // Fetch the request
  const requestId = parseInt(id, 10);
  if (isNaN(requestId)) {
    notFound();
  }

  const [request] = await db
    .select({
      id: designRequests.id,
      title: designRequests.title,
      description: designRequests.description,
      status: designRequests.status,
      priority: designRequests.priority,
      deadline: designRequests.deadline,
      attachmentUrl: designRequests.attachmentUrl,
      resultUrl: designRequests.deliverableUrl,
      createdAt: designRequests.createdAt,
      updatedAt: designRequests.updatedAt,
      requesterName: users.name,
      requesterId: users.id,
      requesterDivision: divisions.divisionName,
      assigneeId: designRequests.assignedTo,
    })
    .from(designRequests)
    .leftJoin(users, eq(designRequests.requesterId, users.id))
    .leftJoin(divisions, eq(users.divisionId, divisions.id))
    .where(eq(designRequests.id, requestId))
    .limit(1);

  if (!request) {
    notFound();
  }

  // Get assignee info if assigned
  let assignee = null;
  if (request.assigneeId) {
    const [a] = await db
      .select({
        id: users.id,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, request.assigneeId));
    assignee = a;
  }

  // Fetch comments
  const comments = await db
    .select({
      id: designRequestComments.id,
      message: designRequestComments.content,
      attachmentUrl: designRequestComments.attachmentUrl,
      createdAt: designRequestComments.createdAt,
      authorId: designRequestComments.userId,
      authorName: users.name,
    })
    .from(designRequestComments)
    .leftJoin(users, eq(designRequestComments.userId, users.id))
    .where(eq(designRequestComments.requestId, requestId))
    .orderBy(designRequestComments.createdAt);

  return (
    <RequestDetailView
      request={{
        ...request,
        assignee,
      }}
      comments={comments}
      currentUser={{
        id: profile.id,
        name: profile.name,
        role: profile.role?.roleName || null,
        divisionId: profile.divisionId,
        divisionName: profile.division?.divisionName || null,
      }}
    />
  );
}
