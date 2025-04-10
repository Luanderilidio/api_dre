import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../drizzle/client";
import z from "zod";

export const GetAllGremios: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/gremios",
    {
      schema: {
        tags: ["gremios"],
        summary: "Lista todos os Grêmios",
        description:
          "Retorna todos os grêmios com suas escolas e interlocutores",
        response: {
          200: z.array(
            z.object({
              id: z.string().min(6),
              name: z.string(),
              status: z.boolean(),
              url_profile: z.string().nullable(),
              url_folder: z.string().nullable(),
              validity_date: z.date().nullable().optional(),
              approval_date: z.date().nullable().optional(),
              created_at: z.date().nullable().optional(),
              updated_at: z.date().nullable().optional(),
              deleted_at: z.date().nullable().optional(),
              disabled_at: z.date().nullable().optional(),

              school: z.object({
                id: z.string(),
                name: z.string(),
                city: z.string(),
              }),

              interlocutor: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string().email(),
                contact: z.string(),
              }),
            })
          ),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await db.query.gremios.findMany({
          with: {
            school: true,
            interlocutor: true,
          },
        });

        return reply.status(200).send(result);
      } catch (error) {
        console.error("Erro ao buscar grêmios:", error);
        return reply.status(500).send({
          message: "Erro interno ao buscar grêmios.",
        });
      }
    }
  );
};
