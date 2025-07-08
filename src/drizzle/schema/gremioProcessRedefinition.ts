import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { generateShortId } from "../../utils/generate-id";
import { gremios } from "./gremios";
import { relations } from "drizzle-orm";
import { gremioProcessRedefinitionStages } from "./gremioProcessRedefinitionStages";
import { uniqueIndex } from "drizzle-orm/pg-core";

export const gremioProcessRedefinition = pgTable(
  "gremio_process_redefinition",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateShortId()),
    gremio_id: text("gremio_id")
      .references(() => gremios.id, { onDelete: "cascade" })
      .notNull(),
    status: boolean("status").default(true).notNull(),
    observation: text("observation").notNull(),
    year: integer("year").notNull(),
    created_at: timestamp("created_at").defaultNow(),
    disabled_at: timestamp("disabled_at"),
    updated_at: timestamp("updated_at"),
    deleted_at: timestamp("deleted_at"),
  },
  // Aqui vai a UNIQUE CONSTRAINT composta:
  (table) => ({
    gremioYearUnique: uniqueIndex(
      "gremio_process_redefinition_gremio_id_year_unique"
    ).on(table.gremio_id, table.year),
  })
);

export const gremioProcessRedefinitionRelations = relations(
  gremioProcessRedefinition,
  ({ one, many }) => ({
    gremio: one(gremios, {
      fields: [gremioProcessRedefinition.gremio_id],
      references: [gremios.id],
    }),
    stages: many(gremioProcessRedefinitionStages),
  })
);
