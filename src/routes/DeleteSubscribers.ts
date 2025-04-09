import { eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../drizzle/client";
import { subscriptions } from "../drizzle/schema/subscriptions";

export const DeleteSubscribers: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    "/subscriptions/:id",
    {
      schema: {
        tags: ["subscriptions"],
        summary: "Deleta inscrição pelo ID",
        description: "descrição da rota",
        params: z.object({
          id: z.string().uuid(),
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
          .delete(subscriptions)
          .where(eq(subscriptions.id, id));

        if (!deleted.count) {
          return reply
            .status(404)
            .send({ message: "Inscrição não encontrada" });
        }

        console.log("deleted", deleted);
        return reply.status(200).send({ message: "Inscrição Deletada!" });
      } catch (error) {
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
};
