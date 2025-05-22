CREATE TYPE "public"."shift" AS ENUM('matutino', 'vespertino', 'noturno', 'integral');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('DIRETOR', 'VICE-PRESIDENTE', 'SECRETÁRIO GERAL I', 'SECRETÁRIO GERAL II', '1° SECRETÁRIO', 'TESOUREIRO GERAL', '1º TESOUREIRO', 'DIRETOR SOCIAL', 'DIRETOR DE COMUNICAÇÃO', 'DIRETOR DE ESPORTES E CULTURA', 'DIRETOR DE SAÚDE E MEIO AMBIENTE');--> statement-breakpoint
CREATE TABLE "gremios" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"school_id" text NOT NULL,
	"interlocutor_id" text NOT NULL,
	"status" boolean DEFAULT false NOT NULL,
	"url_profile" text,
	"validity_date" timestamp,
	"approval_date" timestamp,
	"url_folder" text,
	"created_at" timestamp DEFAULT now(),
	"disabled_at" timestamp,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "gremios_school_id_unique" UNIQUE("school_id")
);
--> statement-breakpoint
CREATE TABLE "interlocutors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contact" text NOT NULL,
	"email" text NOT NULL,
	"status" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"disabled_at" timestamp,
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
	"created_at" timestamp DEFAULT now(),
	"disabled_at" timestamp,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" text PRIMARY KEY NOT NULL,
	"registration" text NOT NULL,
	"name" text NOT NULL,
	"contact" text NOT NULL,
	"email" text NOT NULL,
	"series" text NOT NULL,
	"shift" "shift" NOT NULL,
	"url_profile" text,
	"status" boolean DEFAULT true NOT NULL,
	"disabled_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "students_registration_unique" UNIQUE("registration"),
	CONSTRAINT "students_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "students_gremio_members" (
	"id" text PRIMARY KEY NOT NULL,
	"gremio_id" text NOT NULL,
	"student_id" text NOT NULL,
	"role" "role" NOT NULL,
	"status" boolean DEFAULT true NOT NULL,
	"disabled_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "students_gremio_members_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
ALTER TABLE "gremios" ADD CONSTRAINT "gremios_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gremios" ADD CONSTRAINT "gremios_interlocutor_id_interlocutors_id_fk" FOREIGN KEY ("interlocutor_id") REFERENCES "public"."interlocutors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students_gremio_members" ADD CONSTRAINT "students_gremio_members_gremio_id_gremios_id_fk" FOREIGN KEY ("gremio_id") REFERENCES "public"."gremios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students_gremio_members" ADD CONSTRAINT "students_gremio_members_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gremio_status_idx" ON "gremios" USING btree ("status");--> statement-breakpoint
CREATE INDEX "gremio_name_idx" ON "gremios" USING btree ("name");--> statement-breakpoint
CREATE INDEX "gremio_approval_date_idx" ON "gremios" USING btree ("approval_date");--> statement-breakpoint
CREATE INDEX "gremio_validity_date_idx" ON "gremios" USING btree ("validity_date");--> statement-breakpoint
CREATE INDEX "gremio_members_created_date_idx" ON "students_gremio_members" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "gremio_members_disabled_date_idx" ON "students_gremio_members" USING btree ("disabled_at");--> statement-breakpoint
CREATE INDEX "gremio_members_updated_date_idx" ON "students_gremio_members" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "gremio_members_deleted_date_idx" ON "students_gremio_members" USING btree ("deleted_at");