import { and, eq, not } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { interlocutors, schools } from "../../drizzle";
import { db } from "../../drizzle/client";
import {
  InterlocutorUpdateSchema,
  MessageSchema,
  ValidationErrorSchema,
} from "../../utils/SchemasRoutes";

export const PathInterlocutorsById: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    "/interlocutors/:id",
    {
      schema: {
        tags: ["interlocutors"],
        summary: "Edita um interlocutor pelo ID",
        description: "descrição da rota",
        params: z.object({
          id: z.string().min(6),
        }),
        body: InterlocutorUpdateSchema,
        response: {
          200: MessageSchema,
          400: z.union([ValidationErrorSchema, MessageSchema]),
          404: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;

        const body = InterlocutorUpdateSchema.partial().parse(request.body);

        if (body.email) {
          const emailExistis = await db
            .select()
            .from(interlocutors)
            .where(
              and(
                eq(interlocutors.email, body.email),
                not(eq(interlocutors.id, id))
              )
            );

          if (emailExistis.length > 0) {
            return reply
              .status(404)
              .send({ message: "Email já está cadastrado!" });
          }
        }

        const [update] = await db
          .update(interlocutors)
          .set(body)
          .where(eq(interlocutors.id, id))
          .returning();

        if (!update) {
          return reply
            .status(404)
            .send({ message: "Interlocutor não encontrado" });
        }

        return reply.status(200).send({ message: "Interlocutor atualizado!" });
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
