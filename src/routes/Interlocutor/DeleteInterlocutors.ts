import { eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { interlocutors } from "../../drizzle";
import { db } from "../../drizzle/client";

export const DeleteInterlocutors: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    "/interlocutors/:id",
    {
      schema: {
        tags: ["interlocutors"],
        summary: "Deleta um interlocutor pelo ID",
        description: "descrição da rota",
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
      try {
        const { id } = request.params;

        const deleted = await db
          .delete(interlocutors)
          .where(eq(interlocutors.id, id));

        if (!deleted.count) {
          return reply
            .status(404)
            .send({ message: "Interlocutor não encontrado" });
        }

        console.log("deleted", deleted);
        return reply.status(200).send({ message: "Interlocutor Deletado!" });
      } catch (error) {
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
};
