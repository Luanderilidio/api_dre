import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { allSubscriptions } from "../functions/allSubscriptions";
import { db } from "../drizzle/client";
import { subscriptions } from "../drizzle/schema/subscriptions";
import { eq } from "drizzle-orm";

export const PathSubscribersById: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    "/subscriptions/:id",
    {
      schema: {
        tags: ["subscriptions"],
        summary: "Edita inscrição pelo ID",
        description: "descrição da rota",
        params: z.object({
          id: z.string().uuid(),
        }),
        body: z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;

        const { name, email } = request.body;

        const update = await db
          .update(subscriptions)
          .set({
            name,
            email,
          })
          .where(eq(subscriptions.id, id)).returning();
        if (!update) {
          return reply
            .status(404)
            .send({ message: "Inscrição não encontrada" });
        }
        console.log("subscriptions", update);
        return reply.status(200).send({ message: "Inscrição atualizada!" });
      } catch (error) {
        console.log("erro ao atualizar inscrição:", error);
      }
    }
  );
};
