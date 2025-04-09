import { eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../drizzle/client";
import { subscriptions } from "../drizzle/schema/subscriptions";

export const GetSubscribersById: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/subscriptions/:id",
    {
      schema: {
        tags: ["subscriptions"],
        summary: "Obtém uma inscrição pelo ID",
        params: z.object({ id: z.string().uuid("ID inválido") }),
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string().email(),
            createAt: z.date(),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const subscription = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.id, id))
          .limit(1);

        if (subscription.length === 0) {
          return reply
            .status(404)
            .send({ message: "Inscrição não encontrada" });
        }
        console.log(subscription[0]);
        return reply.status(200).send(subscription[0]);
      } catch (error) {
        console.error("Erro ao buscar inscrição:", error);
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
};
