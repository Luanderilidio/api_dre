import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { schools } from "../../drizzle/schema/schools";

export const GetAllSchools: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/schools",
    {
      schema: {
        tags: ["schools"],
        summary: "Lista todas as Escolas",
        description: "descrição da rota",
        response: {
          200: z.array(
            z.object({
              id: z.string().min(6),
              name: z.string().min(1),
              city: z.string().min(1),
              status: z.boolean(),
              created_at: z.date(),
              updated_at: z.date().nullable().optional(),
              deleted_at: z.date().nullable().optional(),
            })
          ),
        },
      },
    },
    async (request, reply) => {
      const result = await db.select().from(schools);

      console.log("schools", result);

      return reply.status(200).send(result);
    }
  );
};
