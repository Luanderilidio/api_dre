import { eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { students } from "../../drizzle/schema/students";

export const DeleteStudents: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    "/students/:id",
    {
      schema: {
        tags: ["students"],
        summary: "Deleta um estudante pelo ID",
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

        const [deleted] = await db
          .delete(students)
          .where(eq(students.id, id)).returning();

        if (!deleted) {
          return reply
            .status(404)
            .send({ message: "Estudante não encontrado" });
        }

        console.log("deleted estudante", deleted);
        return reply.status(200).send({ message: "Estudante Deletado!" });
      } catch (error) {
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
};
