import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { interlocutors } from "../../drizzle";

export const GetAllInterlocutors: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/interlocutors",
    {
      schema: {
        tags: ["interlocutors"],
        summary: "Lista todos os interlocutores",
        description: "descrição da rota",
        response: {
          200: z.array(
            z.object({
              id: z.string().min(6),
              name: z.string().min(1),
              contact: z.string(),
              email: z.string().email(),
              status: z.boolean(),
              created_at: z.date(),
              updated_at: z.date().nullable().optional(),
              deleted_at: z.date().nullable().optional(),
            })
          ),
          500: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const Allinterlocutor = await db.select().from(interlocutors);
        
        console.log(Allinterlocutor);

        if (Allinterlocutor.length === 0) {
          return reply
            .status(404)
            .send({ message: "Nenhum interlocutor cadastrado" });
        }

        return reply.status(200).send(Allinterlocutor);
      } catch (error) {
        console.error("Erro ao buscar Interlocutores", error);
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
};
