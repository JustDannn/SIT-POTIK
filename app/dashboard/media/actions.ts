"use server";

import { db } from "@/db";
import {
  siteConfig,
  designRequests,
  designRequestComments,
  mediaAssets,
  brandKits,
  campaigns,
  users,
  divisions,
  programs,
  publications,
} from "@/db/schema";
import {
  eq,
  desc,
  and,
  count,
  gte,
  lt,
  like,
  or,
  inArray,
  SQL,
} from "drizzle-orm";

type DesignRequestStatus =
  | "pending"
  | "in_progress"
  | "review"
  | "completed"
  | "rejected";
type MediaAssetType = "image" | "video" | "document" | "audio";
type BrandKitCategory =
  | "logo"
  | "font"
  | "template"
  | "guideline"
  | "color_palette"
  | "icon";
type CampaignStatus = "draft" | "scheduled" | "published" | "archived";
type CampaignPlatform =
  | "instagram"
  | "tiktok"
  | "linkedin"
  | "website"
  | "twitter"
  | "youtube";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getMediaDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Content velocity - posts published this month
  const publishedThisMonth = await db
    .select({ count: count() })
    .from(campaigns)
    .where(
      and(
        eq(campaigns.status, "published"),
        gte(campaigns.publishedDate, startOfMonth),
        lt(campaigns.publishedDate, endOfMonth),
      ),
    );

  // Pending requests queue
  const pendingRequests = await db
    .select({ count: count() })
    .from(designRequests)
    .where(
      inArray(designRequests.status, ["pending", "in_progress", "review"]),
    );

  // Total media assets
  const totalAssets = await db.select({ count: count() }).from(mediaAssets);

  // Scheduled campaigns
  const scheduledCampaigns = await db
    .select({ count: count() })
    .from(campaigns)
    .where(eq(campaigns.status, "scheduled"));

  return {
    contentVelocity: Number(publishedThisMonth[0]?.count || 0),
    pendingQueue: Number(pendingRequests[0]?.count || 0),
    totalAssets: Number(totalAssets[0]?.count || 0),
    scheduledPosts: Number(scheduledCampaigns[0]?.count || 0),
  };
}

// CMS / SITE CONFIG
export async function getSiteConfig(section?: string) {
  if (section) {
    return await db.query.siteConfig.findMany({
      where: eq(siteConfig.section, section),
      orderBy: [siteConfig.sortOrder],
      with: { editor: true },
    });
  }
  return await db.query.siteConfig.findMany({
    orderBy: [siteConfig.section, siteConfig.sortOrder],
    with: { editor: true },
  });
}

export async function getSiteConfigValue(section: string, key: string) {
  const config = await db.query.siteConfig.findFirst({
    where: and(eq(siteConfig.section, section), eq(siteConfig.key, key)),
  });
  return config?.value || null;
}

export async function getSiteConfigSections() {
  const sections = await db
    .selectDistinct({ section: siteConfig.section })
    .from(siteConfig)
    .orderBy(siteConfig.section);
  return sections.map((s) => s.section);
}

export async function updateSiteConfig(id: number, value: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .update(siteConfig)
    .set({
      value,
      updatedAt: new Date(),
      updatedBy: user.id,
    })
    .where(eq(siteConfig.id, id));

  revalidatePath("/");
  revalidatePath("/dashboard/media/cms");
  return { success: true };
}

export async function createSiteConfig(data: {
  section: string;
  key: string;
  value: string;
  type?: "text" | "image" | "rich_text" | "link" | "json";
  label?: string;
  description?: string;
  sortOrder?: number;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const result = await db
    .insert(siteConfig)
    .values({
      ...data,
      updatedBy: user.id,
    })
    .returning();

  revalidatePath("/dashboard/media/cms");
  return result[0];
}

export async function deleteSiteConfig(id: number) {
  await db.delete(siteConfig).where(eq(siteConfig.id, id));
  revalidatePath("/dashboard/media/cms");
  return { success: true };
}

// DESIGN REQUESTS (TICKETS)
export async function getDesignRequests(status?: string) {
  const whereClause = status
    ? eq(designRequests.status, status as DesignRequestStatus)
    : undefined;

  return await db.query.designRequests.findMany({
    where: whereClause,
    orderBy: [desc(designRequests.createdAt)],
    with: {
      requester: true,
      assignee: true,
      requesterDivision: true,
      comments: {
        with: { user: true },
        orderBy: [desc(designRequestComments.createdAt)],
      },
    },
  });
}

export async function getDesignRequestById(id: number) {
  return await db.query.designRequests.findFirst({
    where: eq(designRequests.id, id),
    with: {
      requester: true,
      assignee: true,
      requesterDivision: true,
      comments: {
        with: { user: true },
        orderBy: [designRequestComments.createdAt],
      },
    },
  });
}

export async function createDesignRequest(data: {
  title: string;
  description?: string;
  priority?: "low" | "normal" | "high" | "urgent";
  deadline?: Date;
  attachmentUrl?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // Get user's division
  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  const result = await db
    .insert(designRequests)
    .values({
      ...data,
      requesterId: user.id,
      requesterDivisionId: userRecord?.divisionId,
    })
    .returning();

  revalidatePath("/dashboard/media/requests");
  return result[0];
}

export async function updateDesignRequestStatus(
  id: number,
  status: "pending" | "in_progress" | "review" | "completed" | "rejected",
  assignedTo?: string,
) {
  const updateData: {
    status: DesignRequestStatus;
    assignedTo?: string;
    completedAt?: Date;
  } = { status };

  if (assignedTo) updateData.assignedTo = assignedTo;
  if (status === "completed") updateData.completedAt = new Date();

  await db
    .update(designRequests)
    .set(updateData)
    .where(eq(designRequests.id, id));

  revalidatePath("/dashboard/media/requests");
  return { success: true };
}

export async function updateDesignRequest(
  id: number,
  data: {
    title?: string;
    description?: string;
    priority?: "low" | "normal" | "high" | "urgent";
    deadline?: Date;
    attachmentUrl?: string;
    deliverableUrl?: string;
    notes?: string;
    assignedTo?: string;
  },
) {
  await db.update(designRequests).set(data).where(eq(designRequests.id, id));

  revalidatePath("/dashboard/media/requests");
  revalidatePath(`/dashboard/media/requests/${id}`);
  return { success: true };
}

export async function assignDesignRequest(requestId: number, userId: string) {
  await db
    .update(designRequests)
    .set({ assignedTo: userId })
    .where(eq(designRequests.id, requestId));

  revalidatePath("/dashboard/media/requests");
  revalidatePath(`/dashboard/media/requests/${requestId}`);
  return { success: true };
}

export async function addDesignRequestComment(
  requestId: number,
  content: string,
  attachmentUrl?: string,
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const result = await db
    .insert(designRequestComments)
    .values({
      requestId,
      userId: user.id,
      content,
      attachmentUrl,
    })
    .returning();

  revalidatePath(`/dashboard/media/requests/${requestId}`);
  return result[0];
}

// MEDIA ASSETS (DAM)
export async function getMediaAssets(filters?: {
  folder?: string;
  type?: string;
  programId?: number;
  divisionId?: number;
  search?: string;
}) {
  const conditions: SQL<unknown>[] = [];

  if (filters?.folder && filters.folder !== "all") {
    conditions.push(eq(mediaAssets.folder, filters.folder));
  }
  if (filters?.type && filters.type !== "all") {
    conditions.push(eq(mediaAssets.type, filters.type as MediaAssetType));
  }
  if (filters?.programId) {
    conditions.push(eq(mediaAssets.programId, filters.programId));
  }
  if (filters?.divisionId) {
    conditions.push(eq(mediaAssets.divisionId, filters.divisionId));
  }
  if (filters?.search) {
    const searchCondition = or(
      like(mediaAssets.filename, `%${filters.search}%`),
      like(mediaAssets.tags, `%${filters.search}%`),
    );
    if (searchCondition) conditions.push(searchCondition);
  }

  return await db.query.mediaAssets.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(mediaAssets.createdAt)],
    with: {
      program: true,
      division: true,
      uploader: true,
    },
  });
}

export async function getMediaFolders() {
  const folders = await db
    .selectDistinct({ folder: mediaAssets.folder })
    .from(mediaAssets)
    .orderBy(mediaAssets.folder);
  return folders.map((f) => f.folder).filter(Boolean) as string[];
}

export async function uploadMediaAsset(data: {
  filename: string;
  url: string;
  thumbnailUrl?: string;
  size?: number;
  type: "image" | "video" | "document" | "audio";
  mimeType?: string;
  folder?: string;
  tags?: string;
  programId?: number;
  divisionId?: number;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const result = await db
    .insert(mediaAssets)
    .values({
      ...data,
      uploadedBy: user.id,
    })
    .returning();

  revalidatePath("/dashboard/media/repository");
  return result[0];
}

export async function updateMediaAsset(
  id: number,
  data: {
    filename?: string;
    folder?: string;
    tags?: string;
    programId?: number;
    divisionId?: number;
  },
) {
  await db.update(mediaAssets).set(data).where(eq(mediaAssets.id, id));
  revalidatePath("/dashboard/media/repository");
  return { success: true };
}

export async function deleteMediaAsset(id: number) {
  await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  revalidatePath("/dashboard/media/repository");
  return { success: true };
}

// BRAND KITS
export async function getBrandKits(category?: string) {
  const whereClause = category
    ? and(
        eq(brandKits.category, category as BrandKitCategory),
        eq(brandKits.isActive, true),
      )
    : eq(brandKits.isActive, true);

  return await db.query.brandKits.findMany({
    where: whereClause,
    orderBy: [brandKits.category, desc(brandKits.updatedAt)],
    with: { uploader: true },
  });
}

export async function createBrandKit(data: {
  name: string;
  category:
    | "logo"
    | "font"
    | "template"
    | "guideline"
    | "color_palette"
    | "icon";
  fileUrl: string;
  thumbnailUrl?: string;
  description?: string;
  version?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const result = await db
    .insert(brandKits)
    .values({
      ...data,
      uploadedBy: user.id,
    })
    .returning();

  revalidatePath("/dashboard/media/brand-kit");
  return result[0];
}

export async function updateBrandKit(
  id: number,
  data: {
    name?: string;
    category?:
      | "logo"
      | "font"
      | "template"
      | "guideline"
      | "color_palette"
      | "icon";
    fileUrl?: string;
    thumbnailUrl?: string;
    description?: string;
    version?: string;
    isActive?: boolean;
  },
) {
  await db.update(brandKits).set(data).where(eq(brandKits.id, id));
  revalidatePath("/dashboard/media/brand-kit");
  return { success: true };
}

export async function deleteBrandKit(id: number) {
  // Soft delete
  await db
    .update(brandKits)
    .set({ isActive: false })
    .where(eq(brandKits.id, id));
  revalidatePath("/dashboard/media/brand-kit");
  return { success: true };
}

// CAMPAIGNS
export async function getCampaigns(filters?: {
  status?: string;
  platform?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const conditions: SQL<unknown>[] = [];

  if (filters?.status && filters.status !== "all") {
    conditions.push(eq(campaigns.status, filters.status as CampaignStatus));
  }
  if (filters?.platform && filters.platform !== "all") {
    conditions.push(
      eq(campaigns.platform, filters.platform as CampaignPlatform),
    );
  }
  if (filters?.startDate) {
    conditions.push(gte(campaigns.scheduledDate, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lt(campaigns.scheduledDate, filters.endDate));
  }

  return await db.query.campaigns.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(campaigns.scheduledDate), desc(campaigns.createdAt)],
    with: {
      pic: true,
      program: true,
      designRequest: true,
    },
  });
}

export async function getCampaignById(id: number) {
  return await db.query.campaigns.findFirst({
    where: eq(campaigns.id, id),
    with: {
      pic: true,
      program: true,
      designRequest: true,
    },
  });
}

export async function createCampaign(data: {
  title: string;
  platform:
    | "instagram"
    | "tiktok"
    | "linkedin"
    | "website"
    | "twitter"
    | "youtube";
  scheduledDate?: Date;
  caption?: string;
  content?: string;
  assetUrl?: string;
  additionalAssets?: string;
  programId?: number;
  designRequestId?: number;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const result = await db
    .insert(campaigns)
    .values({
      ...data,
      picId: user.id,
    })
    .returning();

  revalidatePath("/dashboard/media/campaigns");
  return result[0];
}

export async function updateCampaign(
  id: number,
  data: {
    title?: string;
    platform?:
      | "instagram"
      | "tiktok"
      | "linkedin"
      | "website"
      | "twitter"
      | "youtube";
    status?: "draft" | "scheduled" | "published" | "archived";
    scheduledDate?: Date;
    publishedDate?: Date;
    caption?: string;
    content?: string;
    assetUrl?: string;
    additionalAssets?: string;
    externalLink?: string;
    picId?: string;
    programId?: number;
  },
) {
  await db.update(campaigns).set(data).where(eq(campaigns.id, id));
  revalidatePath("/dashboard/media/campaigns");
  return { success: true };
}

export async function publishCampaign(id: number, externalLink?: string) {
  await db
    .update(campaigns)
    .set({
      status: "published",
      publishedDate: new Date(),
      externalLink,
    })
    .where(eq(campaigns.id, id));

  revalidatePath("/dashboard/media/campaigns");
  return { success: true };
}

export async function deleteCampaign(id: number) {
  await db.delete(campaigns).where(eq(campaigns.id, id));
  revalidatePath("/dashboard/media/campaigns");
  return { success: true };
}

// INCOMING INBOX (Cross-Division Requests)
export async function getIncomingInbox() {
  // Get recent design requests that are pending
  const requests = await db.query.designRequests.findMany({
    where: eq(designRequests.status, "pending"),
    orderBy: [desc(designRequests.createdAt)],
    limit: 10,
    with: {
      requester: true,
      requesterDivision: true,
    },
  });

  // Get recent publications awaiting media review
  const pendingPublications = await db.query.publications.findMany({
    where: eq(publications.status, "review"),
    orderBy: [desc(publications.createdAt)],
    limit: 5,
    with: {
      author: true,
      division: true,
    },
  });

  return {
    designRequests: requests,
    pendingPublications,
  };
}

// PUBLICATION CALENDAR
export async function getPublicationCalendar(startDate: Date, endDate: Date) {
  return await db.query.campaigns.findMany({
    where: and(
      gte(campaigns.scheduledDate, startDate),
      lt(campaigns.scheduledDate, endDate),
      inArray(campaigns.status, ["scheduled", "published"]),
    ),
    orderBy: [campaigns.scheduledDate],
    with: { pic: true },
  });
}

// DATA FETCHERS FOR FORMS
export async function getMediaTeamMembers() {
  // Get users from Media & Branding division
  const mediaDivision = await db.query.divisions.findFirst({
    where: or(
      like(divisions.divisionName, "%Media%"),
      like(divisions.divisionName, "%Branding%"),
    ),
  });

  if (!mediaDivision) return [];

  return await db.query.users.findMany({
    where: eq(users.divisionId, mediaDivision.id),
    with: { role: true },
  });
}

export async function getAllDivisions() {
  return await db.query.divisions.findMany({
    where: eq(divisions.isActive, true),
  });
}

export async function getAllPrograms() {
  return await db.query.programs.findMany({
    orderBy: [desc(programs.startDate)],
    limit: 50,
  });
}
