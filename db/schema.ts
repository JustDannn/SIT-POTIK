import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  uuid,
  integer,
  pgEnum,
  decimal,
  bigint,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// MEDIA & BRANDING ENUMS
export const designRequestStatusEnum = pgEnum("design_request_status", [
  "pending",
  "in_progress",
  "review",
  "completed",
  "rejected",
]);

export const designRequestPriorityEnum = pgEnum("design_request_priority", [
  "low",
  "normal",
  "high",
  "urgent",
]);

export const mediaAssetTypeEnum = pgEnum("media_asset_type", [
  "image",
  "video",
  "document",
  "audio",
]);

export const brandKitCategoryEnum = pgEnum("brand_kit_category", [
  "logo",
  "font",
  "template",
  "guideline",
  "color_palette",
  "icon",
]);

export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "scheduled",
  "published",
  "archived",
]);

export const campaignPlatformEnum = pgEnum("campaign_platform", [
  "instagram",
  "tiktok",
  "linkedin",
  "website",
  "twitter",
  "youtube",
]);

export const siteConfigTypeEnum = pgEnum("site_config_type", [
  "text",
  "image",
  "rich_text",
  "link",
  "json",
]);

export const prokerStatusEnum = pgEnum("proker_status", [
  "created",
  "active",
  "completed",
  "archived",
]);
export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "ongoing",
  "done",
]);
export const reportStatusEnum = pgEnum("report_status", [
  "draft",
  "submitted",
  "approved",
  "rejected",
]);
export const contentTypeEnum = pgEnum("content_type", [
  "artikel",
  "infografis",
  "dokumentasi",
  "paper",
]);
export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "review",
  "published",
]);
export const financeTypeEnum = pgEnum("finance_type", ["income", "expense"]);
export const meetingTypeEnum = pgEnum("meeting_type", [
  "proker",
  "bph",
  "dosen",
  "internal",
]);
export const minuteStatusEnum = pgEnum("minute_status", ["draft", "published"]);
export const archiveCategoryEnum = pgEnum("archive_category", [
  "surat_masuk",
  "surat_keluar",
  "proposal",
  "sk",
  "lainnya",
]);
export const partnerCategoryEnum = pgEnum("partner_category", [
  "sponsor",
  "media_partner",
  "pemateri",
  "universitas",
  "pemerintah",
  "lainnya",
]);
export const partnerStatusEnum = pgEnum("partner_status", [
  "active",
  "inactive",
  "potential",
]);
export const serviceTypeEnum = pgEnum("service_type", [
  "permintaan_data",
  "konsultasi",
  "instalasi_software",
  "lainnya",
]);
export const programStatusEnum = pgEnum("program_status", [
  "planned",
  "ongoing",
  "completed",
  "canceled",
]);
export const roles = pgTable("roles", {
  id: serial("role_id").primaryKey(),
  roleName: text("role_name").notNull(), // Anggota, Ketua, dll.
});

export const divisions = pgTable("divisions", {
  id: serial("division_id").primaryKey(),
  divisionName: text("division_name").notNull(),
  isActive: boolean("is_active").default(true),
});

export const users = pgTable("users", {
  id: uuid("user_id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  image: text("image"),
  roleId: integer("role_id")
    .references(() => roles.id)
    .notNull(),
  divisionId: integer("division_id").references(() => divisions.id), // Nullable untuk Ketua/Dosen
  createdAt: timestamp("created_at").defaultNow(),
  status: text("status").default("active"),
});

export const prokers = pgTable("prokers", {
  id: serial("proker_id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  picUserId: uuid("pic_user_id")
    .references(() => users.id)
    .notNull(),
  divisionId: integer("division_id")
    .references(() => divisions.id)
    .notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  location: text("location"),
  outputDescription: text("output_description"),
  status: prokerStatusEnum("status").default("created"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("task_id").primaryKey(),
  prokerId: integer("proker_id").references(() => prokers.id),
  programId: integer("program_id").references(() => programs.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  description: text("description"),
  assignedUserId: uuid("assigned_user_id").references(() => users.id),
  status: taskStatusEnum("status").default("todo"),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("log_id").primaryKey(),
  prokerId: integer("proker_id")
    .references(() => prokers.id)
    .notNull(),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  logDate: timestamp("log_date").defaultNow(),
  notes: text("notes").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const minutes = pgTable("minutes", {
  id: serial("notulensi_id").primaryKey(),
  prokerId: integer("proker_id").references(() => prokers.id), // Nullable (bisa rapat umum tanpa proker)
  meetingType: meetingTypeEnum("meeting_type").default("internal"), // Default aja biar ga error
  title: text("title").notNull(),
  content: text("content"),
  attendees: text("attendees"), // Daftar hadir (string dipisah koma)
  status: minuteStatusEnum("status").default("draft"), // Draft vs Published
  uploadedBy: uuid("uploaded_by")
    .references(() => users.id)
    .notNull(),

  // Ubah filePath jadi nullable (opsional), karena mungkin cuma ngetik teks doang
  filePath: text("file_path"),

  meetingDate: timestamp("meeting_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()), // Tambah ini buat tracking edit
});

export const reports = pgTable("reports", {
  id: serial("report_id").primaryKey(),
  prokerId: integer("proker_id")
    .references(() => prokers.id)
    .notNull(),
  uploadedBy: uuid("uploaded_by")
    .references(() => users.id)
    .notNull(),
  filePath: text("file_path").notNull(),
  status: reportStatusEnum("status").default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  title: text("title"),
  type: text("type"),
  notes: text("notes"),
});

export const reportApprovals = pgTable("report_approvals", {
  id: serial("approval_id").primaryKey(),
  reportId: integer("report_id")
    .references(() => reports.id)
    .notNull(),
  approvedBy: uuid("approved_by")
    .references(() => users.id)
    .notNull(),
  role: text("role").notNull(),
  approvedAt: timestamp("approved_at").defaultNow(),
});

export const financeRecords = pgTable("finance_records", {
  id: serial("finance_id").primaryKey(),
  prokerId: integer("proker_id").references(() => prokers.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  type: financeTypeEnum("type").notNull(),
  description: text("description").notNull(),
  recordedBy: uuid("recorded_by")
    .references(() => users.id)
    .notNull(),
  date: timestamp("date").defaultNow(),
});

export const lpjs = pgTable("lpjs", {
  id: serial("lpj_id").primaryKey(),
  prokerId: integer("proker_id")
    .references(() => prokers.id)
    .notNull(),
  uploadedBy: uuid("uploaded_by")
    .references(() => users.id)
    .notNull(),
  filePath: text("file_path").notNull(),
  status: reportStatusEnum("status").default("draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const contents = pgTable("contents", {
  id: serial("content_id").primaryKey(),
  title: text("title").notNull(),
  type: contentTypeEnum("type").notNull(),
  bodyOrFile: text("body_or_file").notNull(),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  status: contentStatusEnum("status").default("draft"),
  publishedAt: timestamp("published_at"),
});

export const contentPlans = pgTable("content_plans", {
  id: serial("content_id").primaryKey(),
  title: text("title").notNull(),
  channel: text("channel").notNull(), // 'ig_feed', 'ig_story', 'tiktok'
  status: text("status").default("idea"), // 'idea', 'process', 'ready', 'published'
  scheduledDate: timestamp("scheduled_date"),
  caption: text("caption"),
  assetUrl: text("asset_url"),
  picId: uuid("pic_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const publications = pgTable("publications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  excerpt: text("excerpt"),
  content: text("content"),
  fileUrl: text("file_url"),
  thumbnailUrl: text("thumbnail_url"),
  category: text("category").notNull(), // 'Artikel', 'Infografis', 'Paper', 'Impact'
  status: text("status").default("draft"),
  authorId: uuid("author_id").references(() => users.id),
  divisionId: integer("division_id").references(() => divisions.id),
  programId: integer("program_id").references(() => programs.id), // Nullable — link ke event/program
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
export const archives = pgTable("archives", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: archiveCategoryEnum("category").notNull(),
  description: text("description"),
  fileUrl: text("file_url"), // URL file di storage
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Nama Instansi/Desa/Komunitas
  type: text("type").notNull(), // Desa, Instansi, Media, Kampus
  picContact: text("pic_contact"), // Nama & No HP PIC
  status: partnerStatusEnum("status").default("potential"),
  lastFollowUp: timestamp("last_follow_up"), // Untuk alert follow-up
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const guestBooks = pgTable("guest_books", {
  id: serial("guest_id").primaryKey(),

  // Data Diri Tamu
  name: text("name").notNull(),
  institution: text("institution").notNull(), // Asal Prodi / Instansi
  phone: text("phone"), // Opsional, buat follow up

  // Detail Layanan
  serviceType: serviceTypeEnum("service_type").default("permintaan_data"),
  needs: text("needs").notNull(), // Detail data yang diminta / topik konsultasi

  // Metadata
  servedBy: uuid("served_by").references(() => users.id), // Siapa petugas yang jaga
  visitDate: timestamp("visit_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"), // Zoom / Aula X
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  divisionId: integer("division_id").references(() => divisions.id),
  status: programStatusEnum("status").default("planned"),
  createdAt: timestamp("created_at").defaultNow(),
});

// TABEL PARTISIPAN (Siapa PIC, Siapa Anggota di Event ini)
// memungkinkan 1 Event punya banyak PIC, dan PIC bisa beda-beda tiap event.
export const programParticipants = pgTable("program_participants", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").references(() => programs.id, {
    onDelete: "cascade",
  }),
  userId: uuid("user_id").references(() => users.id),
  role: text("role").notNull(), // 'PIC', 'Anggota', 'Notulen'
  joinedAt: timestamp("joined_at").defaultNow(),
});
export const guestBooksRelations = relations(guestBooks, ({ one }) => ({
  officer: one(users, {
    fields: [guestBooks.servedBy],
    references: [users.id],
  }),
}));
export const publicationsRelations = relations(publications, ({ one }) => ({
  author: one(users, {
    fields: [publications.authorId],
    references: [users.id],
  }),

  division: one(divisions, {
    fields: [publications.divisionId],
    references: [divisions.id],
  }),

  program: one(programs, {
    fields: [publications.programId],
    references: [programs.id],
  }),
}));

export const contentPlansRelations = relations(contentPlans, ({ one }) => ({
  pic: one(users, {
    fields: [contentPlans.picId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  division: one(divisions, {
    fields: [users.divisionId],
    references: [divisions.id],
  }),
  prokers: many(prokers), // User sebagai PIC
  tasks: many(tasks), // User ngerjain task
}));

export const prokersRelations = relations(prokers, ({ one, many }) => ({
  pic: one(users, {
    fields: [prokers.picUserId],
    references: [users.id],
  }),
  division: one(divisions, {
    fields: [prokers.divisionId],
    references: [divisions.id],
  }),
  tasks: many(tasks),
  logs: many(activityLogs),
  reports: many(reports),
  financeRecords: many(financeRecords),
  lpjs: many(lpjs),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  proker: one(prokers, {
    fields: [reports.prokerId],
    references: [prokers.id],
  }),
  uploader: one(users, {
    fields: [reports.uploadedBy],
    references: [users.id],
  }),
}));

export const reportApprovalsRelations = relations(
  reportApprovals,
  ({ one }) => ({
    report: one(reports, {
      fields: [reportApprovals.reportId],
      references: [reports.id],
    }),
    approver: one(users, {
      fields: [reportApprovals.approvedBy],
      references: [users.id],
    }),
  }),
);

export const tasksRelations = relations(tasks, ({ one }) => ({
  proker: one(prokers, {
    fields: [tasks.prokerId],
    references: [prokers.id],
  }),
  program: one(programs, {
    fields: [tasks.programId],
    references: [programs.id],
  }),
  assignedUser: one(users, {
    fields: [tasks.assignedUserId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  proker: one(prokers, {
    fields: [activityLogs.prokerId],
    references: [prokers.id],
  }),
  user: one(users, {
    fields: [activityLogs.createdBy],
    references: [users.id],
  }),
}));

export const financeRecordsRelations = relations(financeRecords, ({ one }) => ({
  proker: one(prokers, {
    fields: [financeRecords.prokerId],
    references: [prokers.id],
  }),
  recorder: one(users, {
    fields: [financeRecords.recordedBy],
    references: [users.id],
  }),
}));

export const lpjsRelations = relations(lpjs, ({ one }) => ({
  proker: one(prokers, {
    fields: [lpjs.prokerId],
    references: [prokers.id],
  }),
  uploader: one(users, {
    fields: [lpjs.uploadedBy],
    references: [users.id],
  }),
}));

// MEDIA & BRANDING ECOSYSTEM TABLES

// 1. CMS Site Configuration (Key-Value Store for Dynamic Website Content)
export const siteConfig = pgTable("site_config", {
  id: serial("id").primaryKey(),
  section: text("section").notNull(), // e.g., 'home_hero', 'about', 'footer', 'contact'
  key: text("key").notNull(), // e.g., 'title', 'subtitle', 'cta_link', 'background_image'
  value: text("value").notNull(), // The actual text or image URL
  type: siteConfigTypeEnum("type").default("text"),
  label: text("label"), // Human-readable label for the CMS UI
  description: text("description"), // Helper text for editors
  sortOrder: integer("sort_order").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: uuid("updated_by").references(() => users.id),
});

// 2. Design & Publication Requests (Collaboration Ticket System)
export const designRequests = pgTable("design_requests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"), // What do they need?
  requesterDivisionId: integer("requester_division_id").references(
    () => divisions.id,
  ),
  requesterId: uuid("requester_id").references(() => users.id),
  assignedTo: uuid("assigned_to").references(() => users.id), // Assigned designer from Media team
  status: designRequestStatusEnum("status").default("pending"),
  priority: designRequestPriorityEnum("priority").default("normal"),
  deadline: timestamp("deadline"),
  attachmentUrl: text("attachment_url"), // Reference docs/drafts
  deliverableUrl: text("deliverable_url"), // Final designed asset
  notes: text("notes"), // Internal notes for designers
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// 3. Design Request Comments (Communication Thread)
export const designRequestComments = pgTable("design_request_comments", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id")
    .references(() => designRequests.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  content: text("content").notNull(),
  attachmentUrl: text("attachment_url"), // For revision files
  createdAt: timestamp("created_at").defaultNow(),
});

// 4. Media Assets (Digital Asset Management - DAM)
export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  size: bigint("size", { mode: "number" }), // in bytes
  type: mediaAssetTypeEnum("type").notNull(),
  mimeType: text("mime_type"),
  folder: text("folder").default("general"), // e.g., 'Event A', 'Event B', 'general'
  tags: text("tags"), // Comma-separated or JSON array for searchability
  programId: integer("program_id").references(() => programs.id), // Linked to specific event
  divisionId: integer("division_id").references(() => divisions.id),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// 5. Brand Kits (Official Assets)
export const brandKits = pgTable("brand_kits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., 'Official Logo Primary', 'Typography Guide'
  category: brandKitCategoryEnum("category").notNull(),
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  description: text("description"),
  version: text("version").default("1.0"), // Track versions of brand assets
  isActive: boolean("is_active").default(true), // Soft delete / archive
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// 6. Campaigns (Social Media & Website Publication Planning)
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  platform: campaignPlatformEnum("platform").notNull(),
  status: campaignStatusEnum("status").default("draft"),
  scheduledDate: timestamp("scheduled_date"),
  publishedDate: timestamp("published_date"),
  caption: text("caption"),
  content: text("content"), // Rich text for website content
  assetUrl: text("asset_url"), // Main visual
  additionalAssets: text("additional_assets"), // JSON array of additional images/videos
  externalLink: text("external_link"), // Link to live post
  picId: uuid("pic_id").references(() => users.id), // Person in charge (Media team)
  programId: integer("program_id").references(() => programs.id), // Related event/program
  designRequestId: integer("design_request_id").references(
    () => designRequests.id,
  ), // If created from a request
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// MEDIA & BRANDING RELATIONS

export const siteConfigRelations = relations(siteConfig, ({ one }) => ({
  editor: one(users, {
    fields: [siteConfig.updatedBy],
    references: [users.id],
  }),
}));

export const designRequestsRelations = relations(
  designRequests,
  ({ one, many }) => ({
    requester: one(users, {
      fields: [designRequests.requesterId],
      references: [users.id],
      relationName: "requester",
    }),
    assignee: one(users, {
      fields: [designRequests.assignedTo],
      references: [users.id],
      relationName: "assignee",
    }),
    requesterDivision: one(divisions, {
      fields: [designRequests.requesterDivisionId],
      references: [divisions.id],
    }),
    comments: many(designRequestComments),
  }),
);

export const designRequestCommentsRelations = relations(
  designRequestComments,
  ({ one }) => ({
    request: one(designRequests, {
      fields: [designRequestComments.requestId],
      references: [designRequests.id],
    }),
    user: one(users, {
      fields: [designRequestComments.userId],
      references: [users.id],
    }),
  }),
);

export const mediaAssetsRelations = relations(mediaAssets, ({ one }) => ({
  program: one(programs, {
    fields: [mediaAssets.programId],
    references: [programs.id],
  }),
  division: one(divisions, {
    fields: [mediaAssets.divisionId],
    references: [divisions.id],
  }),
  uploader: one(users, {
    fields: [mediaAssets.uploadedBy],
    references: [users.id],
  }),
}));

export const brandKitsRelations = relations(brandKits, ({ one }) => ({
  uploader: one(users, {
    fields: [brandKits.uploadedBy],
    references: [users.id],
  }),
}));

export const campaignsRelations = relations(campaigns, ({ one }) => ({
  pic: one(users, {
    fields: [campaigns.picId],
    references: [users.id],
  }),
  program: one(programs, {
    fields: [campaigns.programId],
    references: [programs.id],
  }),
  designRequest: one(designRequests, {
    fields: [campaigns.designRequestId],
    references: [designRequests.id],
  }),
}));
