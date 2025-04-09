import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../drizzle/client";
import { subscriptions } from "../drizzle/schema/subscriptions";

export const GetAllSubscribers: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/subscriptions",
    {
      schema: {
        tags: ["subscriptions"],
        summary: "Lista todas as incrições",
        description: "descrição da rota",
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              email: z.string().email(),
              createAt: z.date(),
            })
          ),
        },
      },
    },
    async (request, reply) => {
      const result = await db.select().from(subscriptions)
      console.log("subscriptions", result)
      return reply.status(200).send(result);
    }
  );
};
