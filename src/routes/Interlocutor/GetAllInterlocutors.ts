import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { gremios, interlocutors } from "../../drizzle";
import { notInArray } from "drizzle-orm";
import {
  AllInterlocutorSchema,
  MessageSchema,
  ValidationErrorSchema,
} from "../../utils/SchemasRoutes";

export const GetAllInterlocutors: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/interlocutors",
    {
      schema: {
        tags: ["interlocutors"],
        summary: "Lista todos os interlocutores",
        description: "descrição da rota",
        querystring: z.object({
          free: z
            .enum(["true"])
            .optional()
            .describe(
              "Filtra apenas interlocutores que não estão em um grêmio"
            ),
        }),
        response: {
          200: AllInterlocutorSchema,
          400: ValidationErrorSchema,
          404: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const { free } = request.query;

      switch (free) {
        case "true":
          try {
            const usedInterlocutors = await db
              .select({ id: gremios.interlocutor_id })
              .from(gremios);

            const usedIds = usedInterlocutors.map(
              (interlocutor) => interlocutor.id
            );

            const availableInterlocutors = await db
              .select()
              .from(interlocutors)
              .where(notInArray(interlocutors.id, usedIds));

            if (availableInterlocutors.length === 0) {
              return reply.status(404).send({
                message: "Nenhum interlocutor disponível!",
              });
            }
            return reply.status(200).send(availableInterlocutors);
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
        default:
          try {
            const allInterlocutors = await db.select().from(interlocutors);

            if (!allInterlocutors) {
              return reply.status(404).send({
                message: "Nenhum interlocutor encontrado!",
              });
            }
            return reply.status(200).send(allInterlocutors);
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
    }
  );
};
