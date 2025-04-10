import { and, eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { gremios } from "../../drizzle/schema/gremios";
import { schools } from "../../drizzle/schema/schools";
import { interlocutors } from "../../drizzle/schema/interlocutors";
import { students } from "../../drizzle";
import { studentsGremioMembers } from "../../drizzle/schema/studentsGremioMembers";

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
        body: z.object({
          gremio_id: z.string().min(6),

          student_id: z.string().min(6),

          role: RoleEnumZod,
          status: z.boolean(),
        }),
        response: {
          201: z.object({
            studentsGremioMembersId: z.string(),
          }),
          400: z.object({
            message: z.string(),
          }),
          500: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { gremio_id, student_id, role, status } = request.body;

       
        const gremioExistis = await db
          .select()
          .from(gremios)
          .where(eq(gremios.id, gremio_id));

        if (gremioExistis.length === 0) {
          return reply.status(400).send({
            message: "Gremio não encontrado",
          });
        }

        const studentExists = await db
          .select()
          .from(students)
          .where(eq(students.id, student_id));

        if (studentExists.length === 0) {
          return reply.status(400).send({
            message: "Estudante não encontrado",
          });
        }

        const [studentGremioMember] = await db
          .insert(studentsGremioMembers)
          .values({
            gremio_id,
            student_id,
            role,
            status,
          })
          .returning();

        return reply.status(201).send({
          studentsGremioMembersId: studentGremioMember.id,
        });
      } catch (error) {
        console.error("Erro ao criar Membro:", error);
        return reply
          .status(500)
          .send({ message: "Erro interno ao criar Membro." });
      }
    }
  );
};
