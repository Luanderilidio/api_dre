import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { schools } from "./schools";
import { interlocutors } from "./interlocutors";
import { generateShortId } from "../../utils/generate-id";

export const gremio = pgTable("gremio", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateShortId()),

  name: varchar("name").notNull(), // é sempre bom definir o tamanho do varchar

  // FK para escola (cada escola só pode ter um grêmio)
  school_id: text("school_id")
    .notNull()
    .references(() => schools.id, { onDelete: "cascade" })
    .unique(), // garante um único grêmio por escola

  // FK para interlocutor (associado ao grêmio)
  interlocutor_id: text("interlocutor_id")
    .notNull()
    .references(() => interlocutors.id, { onDelete: "set null" }),

  // status do grêmio (ativo ou inativo)
  status: boolean("status").default(false).notNull(),
  url_profile: text("url_folder"),

  // datas importantes
  effective_date: timestamp("effective_date"), // quando começou a valer
  approval_date: timestamp("approval_date"), // quando foi aprovado

  // link para documentos ou arquivos do grêmio
  url_folder: text("url_folder"), // aqui estava incorretamente "school_id" como nome da coluna

  // metadados
  disabled_at: timestamp("disabled_at").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
