CREATE TYPE "public"."stages" AS ENUM('Comissão Pró-Grêmio', 'Assembleia Geral', 'Comissão Eleitoral', 'Homologação das Chapas', 'Campanha Eleitoral', 'Votação', 'Posse');--> statement-breakpoint
CREATE TABLE "gremio_process_redefinition" (
	"id" text PRIMARY KEY NOT NULL,
	"gremio_id" text NOT NULL,
	"status" boolean DEFAULT true NOT NULL,
	"observation" text NOT NULL,
	"year" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"disabled_at" timestamp,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "gremio_process_redefinition_gremio_id_unique" UNIQUE("gremio_id"),
	CONSTRAINT "gremio_process_redefinition_year_unique" UNIQUE("year")
);
--> statement-breakpoint
CREATE TABLE "gremio_process_redefinition_stages" (
	"id" text PRIMARY KEY NOT NULL,
	"gremio_process_id" text NOT NULL,
	"order" serial NOT NULL,
	"stage" "stages" NOT NULL,
	"started_at" timestamp NOT NULL,
	"finished_at" timestamp NOT NULL,
	"observation" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"disabled_at" timestamp,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "gremio_process_redefinition" ADD CONSTRAINT "gremio_process_redefinition_gremio_id_gremios_id_fk" FOREIGN KEY ("gremio_id") REFERENCES "public"."gremios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gremio_process_redefinition_stages" ADD CONSTRAINT "gremio_process_redefinition_stages_gremio_process_id_gremio_process_redefinition_id_fk" FOREIGN KEY ("gremio_process_id") REFERENCES "public"."gremio_process_redefinition"("id") ON DELETE cascade ON UPDATE no action;