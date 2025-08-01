import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { schools } from "../../drizzle/schema/schools";
import {
  MessageSchema,
  SchoolCreateSchema,
  ValidationErrorSchema,
} from "../../utils/SchemasRoutes";

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
          201: MessageSchema,
          400: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const body = SchoolCreateSchema.parse(request.body);

      try {
        const result = await db.insert(schools).values(body).returning();

        const school = result[0];
        return reply.status(201).send({
          message: "Escola cadastrada com sucesso!",
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply
            .status(400)
            .send({ message: "invalid request body!"});
        }
        console.log(error);
        return reply.status(500).send({
          message: "Internal server error",
        });
      }
    }
  );
};
