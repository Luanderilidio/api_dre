import { and, eq, min } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { gremios } from "../../drizzle/schema/gremios";
import { schools } from "../../drizzle/schema/schools";
import { interlocutors } from "../../drizzle/schema/interlocutors";
import { students } from "../../drizzle";
import { studentsGremioMembers } from "../../drizzle/schema/studentsGremioMembers";
import { MemberBaseSchema, MemberCreateSchema, MessageSchema } from "../../utils/SchemasRoutes";

const roles = [
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
] as const;

// Cria o enum do Zod
export const RoleEnumZod = z.enum(roles);

// Tipo TypeScript gerado automaticamente
export type Role = z.infer<typeof RoleEnumZod>;

export const PostMembersGremio: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/members-gremio",
    {
      schema: {
        tags: ["members-gremio"],
        summary: "Cadastra um membro do Grêmio",
        description:
          "Cria um novo membro do grêmio vinculado a uma escola e interlocutor",
        body: MemberCreateSchema,
        response: {
          201: MessageSchema,
          400: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const body = MemberBaseSchema.parse(request.body);
      try {
        const gremioExistis = await db
          .select()
          .from(gremios)
          .where(eq(gremios.id, body.gremio_id));

        if (gremioExistis.length === 0) {
          return reply.status(400).send({
            message: "Gremio não encontrado",
          });
        }

        const studentExists = await db
          .select()
          .from(students)
          .where(eq(students.id, body.student_id));

        if (studentExists.length === 0) {
          return reply.status(400).send({
            message: "Estudante não encontrado",
          });
        }

        const maxStudentsGremioMembers = await db
          .select()
          .from(studentsGremioMembers)
          .where(eq(studentsGremioMembers.gremio_id, body.gremio_id));

        if (maxStudentsGremioMembers.length >= 11) {
          return reply
            .status(400)
            .send({ message: "Grêmio já possui 11 membros." });
        }

        const [studentGremioMember] = await db
          .insert(studentsGremioMembers)
          .values(body)
          .returning();

        console.log("Post membro", studentGremioMember);

        return reply
          .status(201)
          .send({ message: "Membro Cadastrado com Sucesso!" });
      } catch (error) {
        console.error("Erro ao criar Membro:", error);
        return reply
          .status(500)
          .send({ message: "Erro interno ao criar Membro." });
      }
    }
  );
};
