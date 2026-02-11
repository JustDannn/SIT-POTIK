CREATE TYPE "public"."archive_category" AS ENUM('surat_masuk', 'surat_keluar', 'proposal', 'sk', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."minute_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."partner_category" AS ENUM('sponsor', 'media_partner', 'pemateri', 'universitas', 'pemerintah', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."partner_status" AS ENUM('active', 'inactive', 'potential');--> statement-breakpoint
CREATE TYPE "public"."program_status" AS ENUM('planned', 'ongoing', 'completed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."service_type" AS ENUM('permintaan_data', 'konsultasi', 'instalasi_software', 'lainnya');--> statement-breakpoint
CREATE TABLE "archives" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" "archive_category" NOT NULL,
	"description" text,
	"file_url" text,
	"uploaded_by" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_plans" (
	"content_id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"channel" text NOT NULL,
	"status" text DEFAULT 'idea',
	"scheduled_date" timestamp,
	"caption" text,
	"asset_url" text,
	"pic_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "guest_books" (
	"guest_id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"institution" text NOT NULL,
	"phone" text,
	"service_type" "service_type" DEFAULT 'permintaan_data',
	"needs" text NOT NULL,
	"served_by" uuid,
	"visit_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"pic_contact" text,
	"status" "partner_status" DEFAULT 'potential',
	"last_follow_up" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "program_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"program_id" integer,
	"user_id" uuid,
	"role" text NOT NULL,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"location" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"division_id" integer,
	"status" "program_status" DEFAULT 'planned',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "publications" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text,
	"file_url" text,
	"thumbnail_url" text,
	"category" text NOT NULL,
	"status" text DEFAULT 'draft',
	"author_id" uuid,
	"division_id" integer,
	"program_id" integer,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "publications_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "minutes" ALTER COLUMN "meeting_type" SET DEFAULT 'internal';--> statement-breakpoint
ALTER TABLE "minutes" ALTER COLUMN "meeting_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "minutes" ALTER COLUMN "file_path" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "minutes" ALTER COLUMN "meeting_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "proker_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lpjs" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "lpjs" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "minutes" ADD COLUMN "content" text;--> statement-breakpoint
ALTER TABLE "minutes" ADD COLUMN "attendees" text;--> statement-breakpoint
ALTER TABLE "minutes" ADD COLUMN "status" "minute_status" DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "minutes" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "program_id" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" text DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "archives" ADD CONSTRAINT "archives_uploaded_by_users_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_plans" ADD CONSTRAINT "content_plans_pic_id_users_user_id_fk" FOREIGN KEY ("pic_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_books" ADD CONSTRAINT "guest_books_served_by_users_user_id_fk" FOREIGN KEY ("served_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_participants" ADD CONSTRAINT "program_participants_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_participants" ADD CONSTRAINT "program_participants_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_division_id_divisions_division_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("division_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications" ADD CONSTRAINT "publications_author_id_users_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications" ADD CONSTRAINT "publications_division_id_divisions_division_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("division_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications" ADD CONSTRAINT "publications_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;