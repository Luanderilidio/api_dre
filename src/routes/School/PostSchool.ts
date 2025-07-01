import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { schools } from "../../drizzle/schema/schools";

export const PostSchools: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/schools",
    {
      schema: {
        tags: ["schools"],
        summary: "cadastra uma escola",
        description: "descrição da rota",
        body: z.object({
          name: z
            .string()
            .min(1, "Nome é obrigatório")
            .default("Luander Ilidio"),
          city: z.string().min(1, "Cidade é obrigatória").default("Cáceres"),
        }),
        response: {
          201: z.object({
            id: z.string().min(6),
            name: z.string().min(1),
            city: z.string().min(1),
            status: z.boolean(),
            disabled_at: z.date().nullable().optional(),
            created_at: z.date().nullable().optional(),
            updated_at: z.date().nullable().optional(),
            deleted_at: z.date().nullable().optional(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { name, city } = request.body;

      const result = await db
        .insert(schools)
        .values({
          name,
          city,
        })
        .returning();

        

      const school = result[0];

      return reply.status(201).send(school);
    }
  );
};
