import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { schools } from "./schools";
import { interlocutors } from "./interlocutors";
import { generateShortId } from "../../utils/generate-id";
import { relations } from "drizzle-orm";
import { studentsGremioMembers } from "./studentsGremioMembers";
import { gremioProcessRedefinition } from "./gremioProcessRedefinition";

export const gremios = pgTable(
  "gremios",
  {
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
    url_profile: text("url_profile"),

    // datas importantes
    validity_date: timestamp("validity_date"), // data de validade da chapa
    approval_date: timestamp("approval_date"), // quando foi aprovado

    // link para documentos ou arquivos do grêmio
    url_folder: text("url_folder"), // aqui estava incorretamente "school_id" como nome da coluna

    // metadados
    created_at: timestamp("created_at").defaultNow(),
    disabled_at: timestamp("disabled_at"),
    updated_at: timestamp("updated_at"),
    deleted_at: timestamp("deleted_at"),
  },
  (table) => {
    return {
      // Índice para buscas rápidas por status (ativos/inativos)
      statusIdx: index("gremio_status_idx").on(table.status),
      nameIdx: index("gremio_name_idx").on(table.name),

      // Índice para ordenações por data de aprovação
      approvalDateIdx: index("gremio_approval_date_idx").on(
        table.approval_date
      ),
      validityDateIdx: index("gremio_validity_date_idx").on(
        table.validity_date
      ),
    };
  }
);

export const gremioRelations = relations(gremios, ({ one, many }) => ({
  school: one(schools, {
    fields: [gremios.school_id],
    references: [schools.id],
  }),
  interlocutor: one(interlocutors, {
    fields: [gremios.interlocutor_id],
    references: [interlocutors.id],
  }),
  members: many(studentsGremioMembers),
  process: many(gremioProcessRedefinition),
}));
