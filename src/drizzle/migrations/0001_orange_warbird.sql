CREATE TYPE "public"."shift" AS ENUM('matutino', 'vespertino', 'noturno', 'integral');--> statement-breakpoint
CREATE TABLE "students" (
	"id" text PRIMARY KEY NOT NULL,
	"registration" text NOT NULL,
	"name" text NOT NULL,
	"contact" text NOT NULL,
	"email" text NOT NULL,
	"series" text NOT NULL,
	"shifts" text[] NOT NULL,
	"img_profile" text,
	"status" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "students_registration_unique" UNIQUE("registration"),
	CONSTRAINT "students_email_unique" UNIQUE("email")
);
