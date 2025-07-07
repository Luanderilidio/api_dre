import { eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { schools } from "../../drizzle/schema/schools";
import { MessageSchema, SchoolUpdateSchema, ValidationErrorSchema } from "../../utils/SchemasRoutes";

export const PathSchoolsById: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    "/schools/:id",
    {
      schema: {
        tags: ["schools"],
        summary: "Edita uma escola pelo ID",
        description: "descrição da rota",
        params: z.object({
          id: z.string().min(6),
        }),
        body: SchoolUpdateSchema,
        response: {
          200: MessageSchema,
          400: ValidationErrorSchema,
          404: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;


        const body = SchoolUpdateSchema.partial().parse(request.body); 

        const update = await db
          .update(schools)
          .set(body)
          .where(eq(schools.id, id))
          .returning();

        if (!update) {
          return reply.status(404).send({ message: "Escola não existe!" });
        }

        return reply
          .status(200)
          .send({ message: "Escola atualizada com sucesso!" });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply
            .status(400)
            .send({ message: "invalid request body!", errors: error.errors });
        }
        console.log(error);
        return reply.status(500).send({ message: "internal server error" });
      }
    }
  );
};
