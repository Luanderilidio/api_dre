import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../drizzle/client";
import z from "zod";
import { eq } from "drizzle-orm";
import { gremios } from "../../drizzle/schema/gremios";

export const GetGremioById: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/gremios/:id",
    {
      schema: {
        tags: ["gremios"],
        summary: "Busca um grêmio pelo ID",
        description: "Retorna um grêmio com seus relacionamentos",
        
        params: z.object({
          id: z.string().min(6),
        }),
        response: {
          200: z.object({
            id: z.string().min(6),
            name: z.string(),
            status: z.boolean(),
            url_profile: z.string().nullable(),
            url_folder: z.string().nullable(),
            validity_date: z.date().nullable(),
            approval_date: z.date().nullable(),
            created_at: z.date().nullable(),
            updated_at: z.date().nullable(),
            deleted_at: z.date().nullable(),
            disabled_at: z.date().nullable(),

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
        const gremio = await db.query.gremios.findFirst({
          where: eq(gremios.id, id),
          with: {
            school: true,
            interlocutor: true,
          },
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
