import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../drizzle/client";
import { gremios } from "../../drizzle/schema/gremios";
import { eq } from "drizzle-orm";
import z from "zod";

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
        const [deleted] = await db.delete(gremios).where(eq(gremios.id, id)).returning();

        if (!deleted) {
          return reply.status(404).send({
            message: "Grêmio não encontrado",
          });
        }

        return reply.status(200).send({
          message: "Grêmio foi deletado com sucesso",
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
