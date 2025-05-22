import { pgTable, pgEnum, text } from "drizzle-orm/pg-core";
import { students } from "./students";
import { gremios } from "./gremios";
import { generateShortId } from "../../utils/generate-id";
import { relations } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";
import { boolean } from "drizzle-orm/pg-core";
import { index } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "DIRETOR",
  "VICE-PRESIDENTE",
  "SECRETÁRIO GERAL I",
  "SECRETÁRIO GERAL II",
  "1° SECRETÁRIO",
  "TESOUREIRO GERAL",
  "1º TESOUREIRO",
  "DIRETOR SOCIAL",
  "DIRETOR DE COMUNICAÇÃO",
  "DIRETOR DE ESPORTES E CULTURA",
  "DIRETOR DE SAÚDE E MEIO AMBIENTE",
]);

export const studentsGremioMembers = pgTable(
  "students_gremio_members",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateShortId()),

    gremio_id: text("gremio_id")
      .notNull()
      .references(() => gremios.id, { onDelete: "cascade" }),

    student_id: text("student_id")
      .notNull()
      .unique()
      .references(() => students.id, { onDelete: "cascade" }),

    role: roleEnum("role").notNull(),
    status: boolean("status").default(true).notNull(),

    disabled_at: timestamp("disabled_at"),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at"),
    deleted_at: timestamp("deleted_at"),
  },
  (table) => {
    return {
      createdDateIdx: index("gremio_members_created_date_idx").on(
        table.created_at
      ),
      disabledDateIdx: index("gremio_members_disabled_date_idx").on(
        table.disabled_at
      ),
      updatedDateIdx: index("gremio_members_updated_date_idx").on(
        table.updated_at
      ),
      deletedDateIdx: index("gremio_members_deleted_date_idx").on(
        table.deleted_at
      ),
    };
  }
);

// Relacionamentos
export const studentsGremioMembersRelations = relations(
  studentsGremioMembers,
  ({ one }) => ({
    gremio: one(gremios, {
      fields: [studentsGremioMembers.gremio_id],
      references: [gremios.id],
    }),
    student: one(students, {
      fields: [studentsGremioMembers.student_id],
      references: [students.id],
    }),
  })
);
