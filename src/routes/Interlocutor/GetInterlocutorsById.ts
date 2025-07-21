import { eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { interlocutors } from "../../drizzle";
import {
  InterlocutorBaseSchema,
  MessageSchema,
  ValidationErrorSchema,
} from "../../utils/SchemasRoutes";

export const GetInterlocutorsById: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/interlocutors/:id",
    {
      schema: {
        tags: ["interlocutors"],
        summary: "Obtém um interlocutor pelo ID",
        params: z.object({ id: z.string().min(6) }),
        response: {
          200: InterlocutorBaseSchema,
          400: ValidationErrorSchema,
          404: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const interlocutor = await db.query.interlocutors.findFirst({
          where: eq(interlocutors.id, id),
        });

        if (!interlocutor) {
          return reply
            .status(404)
            .send({ message: "Interlocutor não encontrado" });
        }

        return reply.status(200).send(interlocutor);
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
