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
import { MemberUpdateSchema, MessageSchema } from "../../utils/SchemasRoutes";

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
        body: MemberUpdateSchema,
        response: {
          200: MessageSchema,
          404: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const body = MemberUpdateSchema.parse(request.body); 

      try {
        if (body.gremio_id) {
          const [gremio] = await db
            .select()
            .from(gremios)
            .where(eq(gremios.id, body.gremio_id));

          if (!gremio) {
            return reply.status(404).send({
              message: "Grêmio não encontrado.",
            });
          }
        }

        if (body.student_id) {
          const [student] = await db
            .select()
            .from(students)
            .where(eq(students.id, body.student_id));
          if (!student) {
            return reply.status(400).send({
              message: "Estudante não encontrado.",
            });
          }
        }

        const [memberGremio] = await db
          .update(studentsGremioMembers)
          .set(body)
          .where(eq(studentsGremioMembers.id, id))
          .returning();

        console.log(memberGremio);

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
