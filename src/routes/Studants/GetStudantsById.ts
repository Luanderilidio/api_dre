import { eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { students } from "../../drizzle/schema/students";
import { ShiftsEnumZod } from "./PostStudants";

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
            id: z.string(),
            registration: z.string(),
            name: z.string(),
            contact: z.string(),
            email: z.string().email(),
            series: z.string(),
            shift: z.enum(["matutino", "vespertino", "noturno", "integral"]),
            url_profile: z.string().nullable().optional(), // <- importante isso
            status: z.boolean(),
            disabled_at: z.date().nullable().optional(),
            created_at: z.date().nullable().optional(),
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
        console.log(result);

        return reply.status(200).send(result);
      } catch (error) {
        console.error("Erro ao buscar Estudante:", error);
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
};
