import { eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { interlocutors } from "../../drizzle";
import { db } from "../../drizzle/client";
import {
  MessageSchema,
  ValidationErrorSchema,
} from "../../utils/SchemasRoutes";

export const DeleteInterlocutors: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    "/interlocutors/:id",
    {
      schema: {
        tags: ["interlocutors"],
        summary: "Deleta um interlocutor pelo ID",
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
        const deleted = await db
          .delete(interlocutors)
          .where(eq(interlocutors.id, id));
        if (!deleted) {
          return reply.status(404).send({
            message: "Interlocutor não encontrado",
          });
        }
        return reply.status(200).send({
          message: "Escola deletada com sucesso!",
        });
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
