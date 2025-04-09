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
  shifts: text("shifts").array().notNull(),
  img_profile: text(""),
  status: boolean("status").default(true).notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at"),
  deleted_at: timestamp("deleted_at"),
});
