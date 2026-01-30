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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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
  prokerId: integer("proker_id")
    .references(() => prokers.id)
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  assignedUserId: uuid("assigned_user_id").references(() => users.id),
  status: taskStatusEnum("status").default("todo"),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow(),
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
  prokerId: integer("proker_id").references(() => prokers.id),
  meetingType: meetingTypeEnum("meeting_type").notNull(),
  title: text("title").notNull(),
  uploadedBy: uuid("uploaded_by")
    .references(() => users.id)
    .notNull(),
  filePath: text("file_path").notNull(),
  meetingDate: timestamp("meeting_date"),
  createdAt: timestamp("created_at").defaultNow(),
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
  createdAt: timestamp("created_at").defaultNow(),
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
  category: text("category").notNull(), // 'Artikel', 'Infografis', 'Paper'
  status: text("status").default("draft"),
  authorId: uuid("author_id").references(() => users.id),
  divisionId: integer("division_id").references(() => divisions.id),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const publicationsRelations = relations(publications, ({ one }) => ({
  author: one(users, {
    fields: [publications.authorId],
    references: [users.id],
  }),
  division: one(divisions, {
    fields: [publications.divisionId],
    references: [divisions.id],
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
