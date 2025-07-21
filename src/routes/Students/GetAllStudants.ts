// Tipagem do Fastify com validação Zod
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod"; // Biblioteca para validação de schemas
import { db } from "../../drizzle/client"; // Instância do banco configurada com Drizzle
import { students } from "../../drizzle/schema/students"; // Tabela de estudantes
import { studentsGremioMembers } from "../../drizzle";
import { notInArray } from "drizzle-orm";
import { AllStudentSchema, MessageSchema } from "../../utils/SchemasRoutes";

export const GetAllStudents: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/students",
    {
      schema: {
        tags: ["students"],
        summary: "Lista todos os estudantes",
        description: "descrição da rota",
        querystring: z.object({
          not_participate_gremio: z
            .enum(["true"])
            .optional()
            .describe("filta apenas os estudantes que não são associados"),
        }),
        response: {
          200: AllStudentSchema,
          404: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const { not_participate_gremio } = request.query;

      switch (not_participate_gremio) {
        case "true":
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
            console.log(error)
          }
          break;

        default:
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
            return reply
              .status(500)
              .send({ message: "Erro interno do servidor" });
          }
      }
    }
  );
};
