import { eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { students } from "../../drizzle/schema/students";

export const GetStudentsById: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/students/:id",
    {
      schema: {
        tags: ["students"],
        summary: "Obtém um estudante pelo ID",
        params: z.object({ id: z.string().min(6) }),
        response: {
          200: z.object({
            id: z.string().min(6),
            registration: z.string(),
            name: z.string().min(1),
            contact: z.string(),
            email: z.string().email(),
            series: z.string(),
            shifts: z.array(
              z.enum(["matutino", "vespertino", "noturno", "integral"])
            ),
            img_profile: z.string().nullable().optional(),
            status: z.boolean(),

            created_at: z.date(),
            updated_at: z.date().nullable().optional(),
            deleted_at: z.date().nullable().optional(),
          }),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const result = await db
          .select()
          .from(students)
          .where(eq(students.id, id))
          .limit(1);

        if (result.length === 0) {
          return reply
            .status(404)
            .send({ message: "Estudante não encontrado" });
        }
        console.log(result[0]);

        const student = {
          ...result[0],
          shifts: result[0].shifts as ("matutino" | "vespertino" | "noturno" | "integral")[],
        };

        return reply.status(200).send(student);
      } catch (error) {
        console.error("Erro ao buscar Estudante:", error);
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
};
