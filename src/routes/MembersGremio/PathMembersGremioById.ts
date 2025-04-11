import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../drizzle/client";
import { gremios } from "../../drizzle/schema/gremios";
import { eq } from "drizzle-orm";
import z from "zod";
import {
  interlocutors,
  schools,
  students,
  studentsGremioMembers,
} from "../../drizzle";
import { RoleEnumZod } from "./PostMembersGremio";

export const PathMembersGremioById: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    "/members-gremio/:id",
    {
      schema: {
        tags: ["members-gremio"],
        summary: "Atualiza um membro do grêmio pelo ID",
        description: "Edita informações de um membro grêmio existente",
        params: z.object({
          id: z.string().min(6),
        }),
        body: z.object({
          gremio_id: z.string().min(6).optional(),

          student_id: z.string().min(6).optional(),

          role: RoleEnumZod.optional(),
          status: z.boolean().optional(),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
          500: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { gremio_id, student_id, role, status } = request.body;

      try {
        if (gremio_id) {
          const [gremio] = await db
            .select()
            .from(gremios)
            .where(eq(gremios.id, gremio_id));

          if (!gremio) {
            return reply.status(404).send({
              message: "Grêmio não encontrado.",
            });
          }
        }

        if (student_id) {
          const [student] = await db
            .select()
            .from(students)
            .where(eq(students.id, student_id));
          if (!student) {
            return reply.status(400).send({
              message: "Estudante não encontrado.",
            });
          }
        }

        const [memberGremio] = await db
          .update(studentsGremioMembers)
          .set({
            gremio_id,
            student_id,
            role,
            status,
          })
          .where(eq(studentsGremioMembers.id, id))
          .returning();

        console.log("update", memberGremio);

        return reply.status(200).send({
          message: "Grêmio atualizado com sucesso",
        });
      } catch (error) {
        console.error("Erro ao atualizar grêmio:", error);
        return reply.status(500).send({
          message: "Erro interno ao atualizar grêmio.",
        });
      }
    }
  );
};
