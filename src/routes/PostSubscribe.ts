import z from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../drizzle/client";
import { subscriptions } from "../drizzle/schema/subscriptions";

export const PostSubscribe: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/subscriptions",
    {
      schema: {
        tags: ["subscriptions"],
        summary: "Inscreve uma pessoa",
        description: "descrição da rota",
        body: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
        response: {
          201: z.object({
            subscriberId: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { name, email } = request.body;

      const result = await db
        .insert(subscriptions)
        .values({
          name,
          email,
        })
        .returning();

      const subscriber = result[0];

      return reply.status(201).send({
        subscriberId: subscriber.id,
      });
    }
  );
};
