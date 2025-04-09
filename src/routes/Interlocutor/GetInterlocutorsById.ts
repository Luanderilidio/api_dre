import { eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { interlocutors } from "../../drizzle";

export const GetInterlocutorsById: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/interlocutors/:id",
    {
      schema: {
        tags: ["interlocutors"],
        summary: "Obtém um interlocutor pelo ID",
        params: z.object({ id: z.string().min(6) }),
        response: {
          200: z.object({
            id: z.string().min(6),
            name: z.string().min(1),
            contact: z.string(),
            email: z.string().email(),
            status: z.boolean(),
            created_at: z.date(),
            updated_at: z.date().nullable().optional(),
            deleted_at: z.date().nullable().optional(),
          }),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const interlocutor = await db
          .select()
          .from(interlocutors)
          .where(eq(interlocutors.id, id))
          .limit(1);

        if (interlocutor.length === 0) {
          return reply.status(404).send({ message: "Interlocutor não encontrado" });
        }
        console.log(interlocutor[0]);
        return reply.status(200).send(interlocutor[0]);
      } catch (error) {
        console.error("Erro ao buscar Interlocutor:", error);
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
};
