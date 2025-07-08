ALTER TABLE "gremio_process_redefinition" DROP CONSTRAINT "gremio_process_redefinition_gremio_id_unique";--> statement-breakpoint
ALTER TABLE "gremio_process_redefinition" DROP CONSTRAINT "gremio_process_redefinition_year_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "gremio_process_redefinition_gremio_id_year_unique" ON "gremio_process_redefinition" USING btree ("gremio_id","year");