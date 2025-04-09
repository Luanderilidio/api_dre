import { eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { schools } from "../../drizzle/schema/schools";

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
          200: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
          500: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;

        const deleted = await db
          .delete(schools)
          .where(eq(schools.id, id));

        if (!deleted.count) {
          return reply
            .status(404)
            .send({ message: "Escola não encontrada" });
        }

        console.log("deleted", deleted);
        return reply.status(200).send({ message: "Escola Deletada!" });
      } catch (error) {
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
};
