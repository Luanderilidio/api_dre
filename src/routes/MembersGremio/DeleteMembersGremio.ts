import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../drizzle/client";
import { gremios } from "../../drizzle/schema/gremios";
import { eq } from "drizzle-orm";
import z from "zod";
import { studentsGremioMembers } from "../../drizzle";

export const DeleteMembersGremio: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    "/members-gremio/:id",
    {
      schema: {
        tags: ["members-gremio"],
        summary: "Deleta um membro do grêmio pelo ID",
        description: "descricao",
        params: z.object({
          id: z.string().min(6),
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

      try {
        const [deleted] = await db.delete(studentsGremioMembers).where(eq(studentsGremioMembers.id, id)).returning();

        if (!deleted) {
          return reply.status(404).send({
            message: "Membro do grêmio não encontrado",
          });
        }

        return reply.status(200).send({
          message: "Membro do grêmio foi deletado com sucesso",
        });
      } catch (error) {
        console.error("Erro ao deletar grêmio:", error);
        return reply.status(500).send({
          message: "Erro interno ao deletar grêmio.",
        });
      }
    }
  );
};
