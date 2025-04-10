// Tipagem do Fastify com validação Zod
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod"; // Biblioteca para validação de schemas
import { db } from "../../drizzle/client"; // Instância do banco configurada com Drizzle
import { students } from "../../drizzle/schema/students"; // Tabela de estudantes

// Lista de turnos válidos que o estudante pode ter
const validShifts = ["matutino", "vespertino", "noturno", "integral"] as const;

// Tipo baseado no array acima, usado pra validar tipos
type ValidShift = (typeof validShifts)[number];

// Função que verifica se um shift (turno) é válido
function isValidShift(value: string): value is ValidShift {
  return validShifts.includes(value as ValidShift);
}

// Plugin Fastify para rota GET /students
export const GetAllStudents: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/students",
    {
      schema: {
        tags: ["students"], // Usado na documentação Swagger
        summary: "Lista todos os estudantes",
        description: "descrição da rota",
        response: {
          200: z.array( // Resposta de sucesso é um array de estudantes
            z.object({
              id: z.string().min(6),
              registration: z.string(),
              name: z.string().min(1),
              contact: z.string(),
              email: z.string().email(),
              status: z.boolean(),
              shifts: z.array(
                z.enum(["matutino", "vespertino", "noturno", "integral"])
              ),
              created_at: z.date(),
              updated_at: z.date().nullable().optional(),
              deleted_at: z.date().nullable().optional(),
            })
          ),
          500: z.object({ // Resposta de erro
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        // Busca todos os registros da tabela students
        const AllstudentsQuery = await db.select().from(students);

        // Se não houver estudantes, retorna erro 404
        if (AllstudentsQuery.length === 0) {
          return reply
            .status(404)
            .send({ message: "Nenhum estudante cadastrado" });
        }

        // Filtra os turnos  inválidos (caso venha algum que não esteja na enum)
        const AllStudants = AllstudentsQuery.map((student) => ({
          ...student,
          shifts: student.shifts.filter(isValidShift),
        }));

        // Retorna a lista de estudantes válida
        return reply.status(200).send(AllStudants);
      } catch (error) {
        // Loga erro e retorna 500 se algo falhar
        console.error("Erro ao buscar estudantes", error);
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
};
