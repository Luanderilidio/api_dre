import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../drizzle/client";
import z from "zod";
import { eq } from "drizzle-orm";
import { gremios } from "../../drizzle/schema/gremios";
import { GremioBaseSchema, MessageSchema } from "../../utils/SchemasRoutes";

export const GetGremioById: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/gremios/:id",
    {
      schema: {
        tags: ["gremios"],
        summary: "Busca um grêmio pelo ID",
        description: "Retorna um grêmio",

        params: z.object({
          id: z.string().min(6),
        }),
        response: {
          200: GremioBaseSchema,
          404: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const gremio = await db.query.gremios.findFirst({
          where: eq(gremios.id, id),
        });

        if (!gremio) {
          return reply.status(404).send({
            message: "Grêmio não encontrado",
          });
        }
        return reply.status(200).send(gremio);
      } catch (error) {
        console.error("Erro ao buscar grêmio:", error);
        return reply.status(500).send({
          message: "Erro interno ao buscar grêmio.",
        });
      }
    }
  );
};
