import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { interlocutors } from "../../drizzle/schema/interlocutors";
import { eq } from "drizzle-orm";
import {
  InterlocutorCreateSchema,
  MessageSchema,
  ValidationErrorSchema,
} from "../../utils/SchemasRoutes";

export const PostInterlocutors: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/interlocutors",
    {
      schema: {
        tags: ["interlocutors"],
        summary: "cadastra um interlocutor",
        description: "descrição da rota",
        body: InterlocutorCreateSchema,
        response: {
          201: MessageSchema,
          400: ValidationErrorSchema,
          404: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const body = InterlocutorCreateSchema.parse(request.body);

      try {
        const emailExists = await db
          .select()
          .from(interlocutors)
          .where(eq(interlocutors.email, body.email));

        // se existir, dispara uma mensagem
        if (emailExists.length > 0) {
          return reply.status(404).send({
            message: "Email já está cadastrado.",
          });
        }

        const result = await db.insert(interlocutors).values(body).returning(); 
        console.log(result)
        return reply.status(201).send({
          message: "interlocutor cadastrado com sucesso!",
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply
            .status(400)
            .send({ message: "invalid request body!", errors: error.errors });
        }
        console.log(error);
        return reply.status(500).send({
          message: "Internal server error",
        });
      }
    }
  );
};
