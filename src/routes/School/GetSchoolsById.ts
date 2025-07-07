import { eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { schools } from "../../drizzle/schema/schools";
import {
  MessageSchema,
  SchoolBaseSchema,
  ValidationErrorSchema,
} from "../../utils/SchemasRoutes";

export const GetSchoolsById: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/schools/:id",
    {
      schema: {
        tags: ["schools"],
        summary: "Obtém uma escola pelo ID",
        params: z.object({ id: z.string().min(6) }),
        response: {
          200: SchoolBaseSchema,
          400: ValidationErrorSchema,
          404: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;

        // const [school] = await db
        //   .select()
        //   .from(schools)
        //   .where(eq(schools.id, id))
        //   .limit(1);

        const school = await db.query.schools.findFirst({
          where: eq(schools.id, id),
        });

        if (!school) {
          return reply.status(404).send({ message: "Escola não encontrada" });
        }
        console.log(school);
        return reply.status(200).send(school);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply
            .status(400)
            .send({ message: "invalid request body!", errors: error.errors });
        }
        console.error(error);
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
};
