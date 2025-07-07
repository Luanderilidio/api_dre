import { eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { students } from "../../drizzle/schema/students"; 
import { MessageSchema, StudentBaseSchema } from "../../utils/SchemasRoutes";

export const GetStudentsById: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/students/:id",
    {
      schema: {
        tags: ["students"],
        summary: "Obtém um estudante pelo ID",
        params: z.object({ id: z.string().min(6) }),
        response: {
          200: StudentBaseSchema,
          404: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;


      try {
        const [result] = await db
          .select()
          .from(students)
          .where(eq(students.id, id))
          .limit(1);

        if (!result) {
          return reply
            .status(404)
            .send({ message: "Estudante não encontrado" });
        } 

        return reply.status(200).send(result);
      } catch (error) {
        console.error("Erro ao buscar Estudante:", error);
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
};
