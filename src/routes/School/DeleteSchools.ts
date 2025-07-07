import { eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { schools } from "../../drizzle/schema/schools";
import {
  MessageSchema,
  ValidationErrorSchema,
} from "../../utils/SchemasRoutes";

export const DeleteSchools: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    "/schools/:id",
    {
      schema: {
        tags: ["schools"],
        summary: "Deleta uma escola pelo ID",
        description: "descrição da rota",
        params: z.object({
          id: z.string().min(6),
        }),
        response: {
          200: MessageSchema,
          400: ValidationErrorSchema,
          404: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const deleted = await db.delete(schools).where(eq(schools.id, id));

        if (!deleted) {
          return reply.status(404).send({ message: "Escola não encontrada" });
        }

        return reply
          .status(200)
          .send({ message: "Escola Deletada com sucesso!" });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            message: "invalid request body",
            errors: error.errors,
          });
        }
        console.error(error);
        return reply.status(500).send({ message: "internal server error" });
      }
    }
  );
};
