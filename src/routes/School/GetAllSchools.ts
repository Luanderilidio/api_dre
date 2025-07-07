import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { schools } from "../../drizzle/schema/schools";
import { gremios } from "../../drizzle";
import { notInArray } from "drizzle-orm";
import {
  AllSchoolSchema,
  MessageSchema,
  ValidationErrorSchema,
} from "../../utils/SchemasRoutes";

export const GetAllSchools: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/schools",
    {
      schema: {
        tags: ["schools"],
        summary: "Lista todas as Escolas",
        description: "descrição da rota",
        querystring: z.object({
          free: z
            .enum(["true"])
            .optional()
            .describe("Filtra apenas as escolas que não estão tem um grêmio"),
        }),
        response: {
          200: AllSchoolSchema,
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
            const usedSchools = await db
              .select({ id: gremios.school_id })
              .from(gremios);

            const usedIds = usedSchools.map((schools) => schools.id);

            const availableSchools = await db
              .select()
              .from(schools)
              .where(notInArray(schools.id, usedIds));

            if (availableSchools.length === 0) {
              return reply.status(404).send({
                message: "Não foi encontrado nenhuma escola disponível",
              });
            }
            return reply.status(200).send(availableSchools);
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
            const result = await db.select().from(schools);
            if (!result) {
              return reply.status(404).send({
                message: "nenhuma escola encontrada",
              });
            }
            return reply.status(200).send(result);
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
