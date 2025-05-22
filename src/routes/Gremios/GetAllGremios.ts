import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../drizzle/client";
import z from "zod";

export const GetAllGremios: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/gremios",
    {
      schema: {
        tags: ["gremios"],
        summary: "Lista todos os Grêmios",
        description:
          "Retorna todos os grêmios com suas escolas, interlocutores e, opcionalmente, estudantes membros",
        querystring: z.object({
          with_students: z
            .enum(["true", "false"])
            .optional()
            .default("false")
            .describe("Se 'true', retorna também os estudantes do grêmio"),
        }),
        response: {
          200: z.array(
            z.object({
              id: z.string().min(6),
              name: z.string(),
              status: z.boolean(),
              url_profile: z.string().nullable(),
              url_folder: z.string().nullable(),
              validity_date: z.date().nullable().optional(),
              approval_date: z.date().nullable().optional(),

              school: z.object({
                id: z.string(),
                name: z.string(),
                city: z.string(),
              }),
              interlocutor: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string().email(),
                contact: z.string(),
              }),
              members: z
                .array(
                  z.object({
                    id: z.string(),
                    student_id: z.string(),
                    role: z.string(),
                    status: z.boolean(),
                    created_at: z.date().nullable().optional(),
                    student: z.object({
                      id: z.string().min(6),
                      registration: z.string(),
                      name: z.string(),
                      contact: z.string().nullable().optional(),
                      email: z.string().email().nullable().optional(),
                      status: z.boolean(),
                      series: z.string().nullable().optional(),
                      shift: z.enum([
                        "matutino",
                        "vespertino",
                        "noturno",
                        "integral",
                      ]),
                      url_profile: z.string().nullable().optional(),
                      disabled_at: z.date().nullable().optional(),
                      created_at: z.date().nullable().optional(),
                      updated_at: z.date().nullable().optional(),
                      deleted_at: z.date().nullable().optional(),
                    }),
                  })
                )
                .optional(),
                
              created_at: z.date().nullable().optional(),
              updated_at: z.date().nullable().optional(),
              deleted_at: z.date().nullable().optional(),
              disabled_at: z.date().nullable().optional(),
            })
          ),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { with_students } = request.query;

      try {
        // 1. Executa a query com os relacionamentos
        const result = await db.query.gremios.findMany({
          with: {
            school: {
              columns: {
                id: true,
                name: true,
                city: true,
              },
            },
            interlocutor: {
              columns: {
                id: true,
                name: true,
                email: true,
                contact: true,
              },
            },
            ...(with_students === "true" && {
              members: {
                with: {
                  student: {
                    columns: {
                      id: true,
                      registration: true,
                      name: true,
                      contact: true,
                      email: true,
                      status: true,
                      series: true,
                      shift: true,
                      url_profile: true,
                      disabled_at: true,
                      created_at: true,
                      updated_at: true,
                      deleted_at: true,
                    },
                  },
                },
                columns: {
                  id: true,
                  student_id: true,
                  role: true,
                  status: true,
                  created_at: true,
                },
              },
            }),
          },
        });

        // 2. Transforma o resultado para corresponder ao schema Zod
        const formattedResult = result.map((gremio) => {
          // Para cada grêmio, processa os membros se existirem
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          const processedMembers = gremio.members?.map((member: any) => {
            return {
              id: member.id,
              student_id: member.student_id,
              role: member.role,
              status: member.status,
              created_at: member.created_at,
              student: member.student,
            };
          });

          return {
            ...gremio,
            members: processedMembers,
          };
        });

        // 3. Retorna o resultado formatado
        return reply.status(200).send(formattedResult);
      } catch (error) {
        console.error("Erro ao buscar grêmios:", error);
        return reply.status(500).send({
          message: "Erro interno ao buscar grêmios.",
        });
      }
    }
  );
};
