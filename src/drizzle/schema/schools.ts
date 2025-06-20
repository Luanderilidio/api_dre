import { boolean } from "drizzle-orm/pg-core";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { generateShortId } from "../../utils/generate-id";


export const schools = pgTable("school", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateShortId()),
  name: text("name").notNull(),
  city: text("city").notNull(),
  status: boolean("status").default(true).notNull(),

  created_at: timestamp("created_at").defaultNow(),
  disabled_at: timestamp("disabled_at"),
  updated_at: timestamp("updated_at"),
  deleted_at: timestamp("deleted_at"),
});
