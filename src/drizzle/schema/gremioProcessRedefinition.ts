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

export const gremioProcessRedefinition = pgTable(
  "gremio_process_redefinition",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateShortId()),
    gremio_id: text("gremio_id")
      .references(() => gremios.id, { onDelete: "cascade" }).unique().notNull(),
    status: boolean("status").default(true).notNull(),
    observation: text("observation").notNull(),
    year: integer("year").unique().notNull(),

    created_at: timestamp("created_at").defaultNow(),
    disabled_at: timestamp("disabled_at"),
    updated_at: timestamp("updated_at"),
    deleted_at: timestamp("deleted_at"),
  }
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