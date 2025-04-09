import { eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { schools } from "../../drizzle/schema/schools";

export const GetSchoolsById: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/schools/:id",
    {
      schema: {
        tags: ["schools"],
        summary: "Obtém uma schools pelo ID",
        params: z.object({ id: z.string().min(6) }),
        response: {
          200: z.object({
            id: z.string().min(6),
            name: z.string().min(1),
            city: z.string().min(1),
            status: z.boolean(),
            created_at: z.date(),
            updated_at: z.date().nullable().optional(),
            deleted_at: z.date().nullable().optional(),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const school = await db
          .select()
          .from(schools)
          .where(eq(schools.id, id))
          .limit(1);

        if (school.length === 0) {
          return reply.status(404).send({ message: "Escola não encontrada" });
        }
        console.log(school[0]);
        return reply.status(200).send(school[0]);
      } catch (error) {
        console.error("Erro ao buscar Escola:", error);
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
};
