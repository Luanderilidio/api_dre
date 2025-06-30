import { pgTable, text, timestamp, serial, pgEnum } from "drizzle-orm/pg-core";
import { generateShortId } from "../../utils/generate-id";
import { gremioProcessRedefinition } from "./gremioProcessRedefinition";
import { relations } from "drizzle-orm";

export const StagesEnum = pgEnum("stages", [
  "Comissão Pró-Grêmio",
  "Assembleia Geral",
  "Comissão Eleitoral",
  "Homologação das Chapas",
  "Campanha Eleitoral",
  "Votação",
  "Posse",
]);

export const gremioProcessRedefinitionStages = pgTable(
  "gremio_process_redefinition_stages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateShortId()),
    gremio_process_id: text("gremio_process_id")
      .references(() => gremioProcessRedefinition.id, { onDelete: "cascade" })
      .notNull(),
    order: serial("order"),
    stage: StagesEnum("stage").notNull(),

    started_at: timestamp("started_at").notNull(),
    finished_at: timestamp("finished_at").notNull(),

    observation: text("observation").notNull(),

    created_at: timestamp("created_at").defaultNow(),
    disabled_at: timestamp("disabled_at"),
    updated_at: timestamp("updated_at"),
    deleted_at: timestamp("deleted_at"),
  }
);

export const gremioProcessRedefinitionStagesRelation = relations(
  gremioProcessRedefinitionStages,
  ({ one }) => ({
    process: one(gremioProcessRedefinition, {
      fields: [gremioProcessRedefinitionStages.gremio_process_id],
      references: [gremioProcessRedefinition.id],
    }),
  })
);
