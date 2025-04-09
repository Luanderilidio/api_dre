CREATE TABLE "interlocutors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contact" text NOT NULL,
	"email" text NOT NULL,
	"status" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "interlocutors_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "school" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"status" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "subscriptions_email_unique" UNIQUE("email")
);
