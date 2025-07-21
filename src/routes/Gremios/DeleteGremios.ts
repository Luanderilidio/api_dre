import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../drizzle/client";
import { gremios } from "../../drizzle/schema/gremios";
import { eq } from "drizzle-orm";
import z from "zod";
import { MessageSchema } from "../../utils/SchemasRoutes";

export const DeleteGremios: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    "/gremios/:id",
    {
      schema: {
        tags: ["gremios"],
        summary: "Deleta um grêmio pelo ID",
        description: "descricao",
        params: z.object({
          id: z.string().min(6),
        }),
        response: {
          200: MessageSchema,
          404: MessageSchema,
          500: MessageSchema,
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
