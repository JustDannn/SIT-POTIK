CREATE TYPE "public"."content_status" AS ENUM('draft', 'review', 'published');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('artikel', 'infografis', 'dokumentasi', 'paper');--> statement-breakpoint
CREATE TYPE "public"."finance_type" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TYPE "public"."meeting_type" AS ENUM('proker', 'bph', 'dosen', 'internal');--> statement-breakpoint
CREATE TYPE "public"."proker_status" AS ENUM('created', 'active', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('draft', 'submitted', 'approved');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('todo', 'ongoing', 'done');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"log_id" serial PRIMARY KEY NOT NULL,
	"proker_id" integer NOT NULL,
	"created_by" uuid NOT NULL,
	"log_date" timestamp DEFAULT now(),
	"notes" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contents" (
	"content_id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" "content_type" NOT NULL,
	"body_or_file" text NOT NULL,
	"created_by" uuid NOT NULL,
	"status" "content_status" DEFAULT 'draft',
	"published_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "divisions" (
	"division_id" serial PRIMARY KEY NOT NULL,
	"division_name" text NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "finance_records" (
	"finance_id" serial PRIMARY KEY NOT NULL,
	"proker_id" integer,
	"amount" numeric(15, 2) NOT NULL,
	"type" "finance_type" NOT NULL,
	"description" text NOT NULL,
	"recorded_by" uuid NOT NULL,
	"date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lpjs" (
	"lpj_id" serial PRIMARY KEY NOT NULL,
	"proker_id" integer NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"file_path" text NOT NULL,
	"status" "report_status" DEFAULT 'draft',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "minutes" (
	"notulensi_id" serial PRIMARY KEY NOT NULL,
	"proker_id" integer,
	"meeting_type" "meeting_type" NOT NULL,
	"title" text NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"file_path" text NOT NULL,
	"meeting_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prokers" (
	"proker_id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"pic_user_id" uuid NOT NULL,
	"division_id" integer NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"location" text,
	"output_description" text,
	"status" "proker_status" DEFAULT 'created',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "report_approvals" (
	"approval_id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"approved_by" uuid NOT NULL,
	"role" text NOT NULL,
	"approved_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"report_id" serial PRIMARY KEY NOT NULL,
	"proker_id" integer NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"file_path" text NOT NULL,
	"status" "report_status" DEFAULT 'draft',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"role_id" serial PRIMARY KEY NOT NULL,
	"role_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"task_id" serial PRIMARY KEY NOT NULL,
	"proker_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"assigned_user_id" uuid,
	"status" "task_status" DEFAULT 'todo',
	"deadline" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role_id" integer NOT NULL,
	"division_id" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_proker_id_prokers_proker_id_fk" FOREIGN KEY ("proker_id") REFERENCES "public"."prokers"("proker_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contents" ADD CONSTRAINT "contents_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_records" ADD CONSTRAINT "finance_records_proker_id_prokers_proker_id_fk" FOREIGN KEY ("proker_id") REFERENCES "public"."prokers"("proker_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_records" ADD CONSTRAINT "finance_records_recorded_by_users_user_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lpjs" ADD CONSTRAINT "lpjs_proker_id_prokers_proker_id_fk" FOREIGN KEY ("proker_id") REFERENCES "public"."prokers"("proker_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lpjs" ADD CONSTRAINT "lpjs_uploaded_by_users_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "minutes" ADD CONSTRAINT "minutes_proker_id_prokers_proker_id_fk" FOREIGN KEY ("proker_id") REFERENCES "public"."prokers"("proker_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "minutes" ADD CONSTRAINT "minutes_uploaded_by_users_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prokers" ADD CONSTRAINT "prokers_pic_user_id_users_user_id_fk" FOREIGN KEY ("pic_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prokers" ADD CONSTRAINT "prokers_division_id_divisions_division_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("division_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_approvals" ADD CONSTRAINT "report_approvals_report_id_reports_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("report_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_approvals" ADD CONSTRAINT "report_approvals_approved_by_users_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_proker_id_prokers_proker_id_fk" FOREIGN KEY ("proker_id") REFERENCES "public"."prokers"("proker_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_uploaded_by_users_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_proker_id_prokers_proker_id_fk" FOREIGN KEY ("proker_id") REFERENCES "public"."prokers"("proker_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_user_id_users_user_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_division_id_divisions_division_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("division_id") ON DELETE no action ON UPDATE no action;