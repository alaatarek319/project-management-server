ALTER TABLE "refresh_token" ADD COLUMN "created_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "refresh_token" ADD COLUMN "expires_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "refresh_token" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "refresh_token" DROP COLUMN "expiresAt";