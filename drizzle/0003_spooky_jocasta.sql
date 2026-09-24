CREATE TYPE "public"."priority_type_enum" AS ENUM('Low', 'Medium', 'High');--> statement-breakpoint
CREATE TYPE "public"."status_type_enum" AS ENUM('To Do', 'In progress', 'Done');--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"owner_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"status" "status_type_enum" DEFAULT 'To Do' NOT NULL,
	"priority" "priority_type_enum" NOT NULL,
	"project_id" integer NOT NULL,
	"member_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(50) NOT NULL,
	"password" varchar(100) NOT NULL,
	"password_reset_token" varchar(100),
	"password_reset_expires" timestamp with time zone,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "assignment" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "device" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "machine" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "production" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "section" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "state_log" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "state_option" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "assignment" CASCADE;--> statement-breakpoint
DROP TABLE "device" CASCADE;--> statement-breakpoint
DROP TABLE "machine" CASCADE;--> statement-breakpoint
DROP TABLE "production" CASCADE;--> statement-breakpoint
DROP TABLE "section" CASCADE;--> statement-breakpoint
DROP TABLE "state_log" CASCADE;--> statement-breakpoint
DROP TABLE "state_option" CASCADE;--> statement-breakpoint
DROP TABLE "user" CASCADE;--> statement-breakpoint
ALTER TABLE "refresh_token" DROP CONSTRAINT "refresh_token_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "refresh_token" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_member_id_users_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_projects_owner" ON "projects" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_project" ON "tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_user" ON "tasks" USING btree ("member_id");--> statement-breakpoint
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_refresh_token_user" ON "refresh_token" USING btree ("user_id");--> statement-breakpoint
DROP TYPE "public"."section_type_enum";--> statement-breakpoint
DROP TYPE "public"."state_type_enum";--> statement-breakpoint
DROP TYPE "public"."user_type_enum";