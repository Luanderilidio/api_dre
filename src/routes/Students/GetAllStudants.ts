// Tipagem do Fastify com validação Zod
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod"; // Biblioteca para validação de schemas
import { db } from "../../drizzle/client"; // Instância do banco configurada com Drizzle
import { students } from "../../drizzle/schema/students"; // Tabela de estudantes
import { studentsGremioMembers } from "../../drizzle";
import { notInArray } from "drizzle-orm";

export const GetAllStudents: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/students",
    {
      schema: {
        tags: ["students"], // Usado na documentação Swagger
        summary: "Lista todos os estudantes",
        description: "descrição da rota",
        querystring: z.object({
          not_participate_gremio: z
            .enum(["true"])
            .optional()
            .describe("filta apenas os estudantes que não são associados"),
        }),
        response: {
          200: z.array(
            // Resposta de sucesso é um array de estudantes
            z.object({
              id: z.string().min(6),
              registration: z.string(),
              name: z.string().min(1),
              contact: z.string(),
              email: z.string().email(),
              status: z.boolean(),
              series: z.string(),
              shift: z.enum(["matutino", "vespertino", "noturno", "integral"]),
              url_profile: z.string().nullable().optional(),
              disabled_at: z.date().nullable().optional(),
              created_at: z.date().nullable().optional(),
              updated_at: z.date().nullable().optional(),
              deleted_at: z.date().nullable().optional(),
            })
          ),
          404: z.object({
            // Resposta de erro
            message: z.string(),
          }),
          500: z.object({
            // Resposta de erro
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { not_participate_gremio } = request.query;

      if (not_participate_gremio === "true") {
        try {
          const usedStudents = await db
            .select({ id: studentsGremioMembers.student_id })
            .from(studentsGremioMembers);

          const usedIds = usedStudents.map((student) => student.id);
          console.log(usedIds);

          const available = await db
            .select()
            .from(students)
            .where(notInArray(students.id, usedIds));

          console.log(available);

          if (available.length === 0) {
            return reply.status(404).send({
              message: "nenhum estudante está liberado",
            });
          }
          return reply.status(200).send(available);
        } catch (error) {
          console.error("Erro ao buscar estudantes", error);
          return reply
            .status(500)
            .send({ message: "Erro interno do servidor" });
        }
      }

      try {
        const AllstudentsQuery = await db.select().from(students);

        if (AllstudentsQuery.length === 0) {
          return reply
            .status(404)
            .send({ message: "Nenhum estudante cadastrado" });
        }

        return reply.status(200).send(AllstudentsQuery);
      } catch (error) {
        console.error("Erro ao buscar estudantes", error);
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
};
