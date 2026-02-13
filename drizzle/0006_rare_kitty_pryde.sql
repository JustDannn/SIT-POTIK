CREATE TYPE "public"."brand_kit_category" AS ENUM('logo', 'font', 'template', 'guideline', 'color_palette', 'icon');--> statement-breakpoint
CREATE TYPE "public"."campaign_platform" AS ENUM('instagram', 'tiktok', 'linkedin', 'website', 'twitter', 'youtube');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'scheduled', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."design_request_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."design_request_status" AS ENUM('pending', 'in_progress', 'review', 'completed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."media_asset_type" AS ENUM('image', 'video', 'document', 'audio');--> statement-breakpoint
CREATE TYPE "public"."site_config_type" AS ENUM('text', 'image', 'rich_text', 'link', 'json');--> statement-breakpoint
CREATE TABLE "brand_kits" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" "brand_kit_category" NOT NULL,
	"file_url" text NOT NULL,
	"thumbnail_url" text,
	"description" text,
	"version" text DEFAULT '1.0',
	"is_active" boolean DEFAULT true,
	"uploaded_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"platform" "campaign_platform" NOT NULL,
	"status" "campaign_status" DEFAULT 'draft',
	"scheduled_date" timestamp,
	"published_date" timestamp,
	"caption" text,
	"content" text,
	"asset_url" text,
	"additional_assets" text,
	"external_link" text,
	"pic_id" uuid,
	"program_id" integer,
	"design_request_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "design_request_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"attachment_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "design_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"requester_division_id" integer,
	"requester_id" uuid,
	"assigned_to" uuid,
	"status" "design_request_status" DEFAULT 'pending',
	"priority" "design_request_priority" DEFAULT 'normal',
	"deadline" timestamp,
	"attachment_url" text,
	"deliverable_url" text,
	"notes" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"size" bigint,
	"type" "media_asset_type" NOT NULL,
	"mime_type" text,
	"folder" text DEFAULT 'general',
	"tags" text,
	"program_id" integer,
	"division_id" integer,
	"uploaded_by" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "site_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"section" text NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"type" "site_config_type" DEFAULT 'text',
	"label" text,
	"description" text,
	"sort_order" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now(),
	"updated_by" uuid
);
--> statement-breakpoint
ALTER TABLE "program_participants" ADD COLUMN "proker_id" integer;--> statement-breakpoint
ALTER TABLE "brand_kits" ADD CONSTRAINT "brand_kits_uploaded_by_users_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_pic_id_users_user_id_fk" FOREIGN KEY ("pic_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_design_request_id_design_requests_id_fk" FOREIGN KEY ("design_request_id") REFERENCES "public"."design_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_request_comments" ADD CONSTRAINT "design_request_comments_request_id_design_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."design_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_request_comments" ADD CONSTRAINT "design_request_comments_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_requests" ADD CONSTRAINT "design_requests_requester_division_id_divisions_division_id_fk" FOREIGN KEY ("requester_division_id") REFERENCES "public"."divisions"("division_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_requests" ADD CONSTRAINT "design_requests_requester_id_users_user_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_requests" ADD CONSTRAINT "design_requests_assigned_to_users_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_division_id_divisions_division_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("division_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_users_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_config" ADD CONSTRAINT "site_config_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_participants" ADD CONSTRAINT "program_participants_proker_id_prokers_proker_id_fk" FOREIGN KEY ("proker_id") REFERENCES "public"."prokers"("proker_id") ON DELETE cascade ON UPDATE no action;