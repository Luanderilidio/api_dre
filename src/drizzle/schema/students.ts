import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { generateShortId } from "../../utils/generate-id";
import { pgEnum } from "drizzle-orm/pg-core";

export const shiftEnum = pgEnum("shift", [
  "matutino",
  "vespertino",
  "noturno",
  "integral",
]);

export const students = pgTable("students", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateShortId()),
  registration: text("registration").unique().notNull(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  email: text("email").unique().notNull(),
  series: text("series").notNull(),
  shift: shiftEnum("shift").notNull(),
  url_profile: text("url_profile"),
  status: boolean("status").default(true).notNull(),

  disabled_at: timestamp("disabled_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at"),
  deleted_at: timestamp("deleted_at"),
});
