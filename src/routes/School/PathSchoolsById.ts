import { eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { schools } from "../../drizzle/schema/schools";

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
        body: z.object({
          name: z.string().optional(),
          city: z.string().optional(),
          status: z.boolean().optional(),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;

        const { name, city, status } = request.body;

        const update = await db
          .update(schools)
          .set({
            name,
            city,
            status,
          })
          .where(eq(schools.id, id))
          .returning();
        if (!update) {
          return reply
            .status(404)
            .send({ message: "Escola não encontrada" });
        }
        console.log("Escola", update);
        return reply.status(200).send({ message: "Escola atualizada!" });
      } catch (error) {
        console.log("erro ao atualizar Escola:", error);
      }
    }
  );
};
