CREATE TYPE "public"."section_type_enum" AS ENUM('hardware', 'software');--> statement-breakpoint
CREATE TYPE "public"."state_type_enum" AS ENUM('start', 'material', 'error', 'break', 'call');--> statement-breakpoint
CREATE TYPE "public"."user_type_enum" AS ENUM('employee', 'provider', 'supervisor');--> statement-breakpoint
CREATE TABLE "assignment" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"machine_id" varchar(50) NOT NULL,
	CONSTRAINT "uq_shift_machine" UNIQUE("machine_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "device" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"address" varchar(255) NOT NULL,
	"machine_id" varchar(50),
	CONSTRAINT "device_address_unique" UNIQUE("address")
);
--> statement-breakpoint
CREATE TABLE "machine" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"section_name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "production" (
	"id" serial PRIMARY KEY NOT NULL,
	"quantity" integer,
	"defective" integer,
	"machine_id" varchar(50) NOT NULL,
	"date" date DEFAULT now(),
	CONSTRAINT "uq_production_machine_date" UNIQUE("machine_id","date")
);
--> statement-breakpoint
CREATE TABLE "refresh_token" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" varchar(500) NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now(),
	"expiresAt" timestamp with time zone NOT NULL,
	CONSTRAINT "refresh_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "section" (
	"name" varchar(100) PRIMARY KEY NOT NULL,
	"type" "section_type_enum" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "state_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"type" "state_type_enum" NOT NULL,
	"start_time" timestamp with time zone DEFAULT now(),
	"end_time" timestamp with time zone,
	"option_id" integer,
	"user_note" varchar(500),
	"machine_id" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "state_option" (
	"id" serial PRIMARY KEY NOT NULL,
	"state_type" "state_type_enum" NOT NULL,
	"option" varchar(100) NOT NULL,
	CONSTRAINT "uq_state_option_per_type" UNIQUE("state_type","option")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(50) NOT NULL,
	"password" varchar(100) NOT NULL,
	"role" "user_type_enum" NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	"password_reset_token" varchar(100),
	"password_reset_expires" timestamp with time zone,
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_machine_id_machine_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machine"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "device" ADD CONSTRAINT "device_machine_id_machine_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machine"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "machine" ADD CONSTRAINT "machine_section_name_section_name_fk" FOREIGN KEY ("section_name") REFERENCES "public"."section"("name") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "production" ADD CONSTRAINT "production_machine_id_machine_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machine"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "state_log" ADD CONSTRAINT "state_log_option_id_state_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."state_option"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "state_log" ADD CONSTRAINT "state_log_machine_id_machine_id_fk" FOREIGN KEY ("machine_id") REFERENCES "public"."machine"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_assignment_user" ON "assignment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_device_machine" ON "device" USING btree ("machine_id");--> statement-breakpoint
CREATE INDEX "idx_state_log_machine_start_time" ON "state_log" USING btree ("machine_id","start_time");--> statement-breakpoint
CREATE INDEX "idx_state_option_type" ON "state_option" USING btree ("state_type");--> statement-breakpoint
CREATE INDEX "idx_user_password_reset_token" ON "user" USING btree ("password_reset_token");