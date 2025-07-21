import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../drizzle/client";
import z from "zod";
import { AllGremioWithMembersSchema } from "../../utils/SchemasRoutes";

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
          200: AllGremioWithMembersSchema,
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { with_students } = request.query;

      try {
        // 1. Consulta o banco de dados, incluindo relacionamentos conforme necessário
        const result = await db.query.gremios.findMany({
          with: {
            school: {
              columns: {
                id: true,
                name: true,
                city: true,
                status: true,
                disabled_at: true,
                created_at: true,
                updated_at: true,
                deleted_at: true,
              },
            },
            interlocutor: {
              columns: {
                id: true,
                name: true,
                email: true,
                contact: true,
                status: true,
                disabled_at: true,
                created_at: true,
                updated_at: true,
                deleted_at: true,
              },
            },
            // Se for solicitado, incluir os membros e estudantes
            ...(with_students === "true" && {
              members: {
                with: {
                  
                  student: {
                    columns: {
                      id: true,
                      name: true,
                      registration: true,
                      contact: true,
                      email: true,
                      series: true,
                      shift: true,
                      url_profile: true,
                      status: true,
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
                  gremio_id: true,
                  role: true,
                  status: true,
                  created_at: true,
                  updated_at: true,
                  deleted_at: true,
                  disabled_at: true,
                },
              },
            }),
          },
        });
 

        // 2. Formata os dados para bater com o schema de resposta
        const formattedResult = result.map((gremio) => {
          const processedMembers =
            gremio.members?.map((member: any) => {
              return {
                MemberBaseSchema: {
                  id: member.id,
                  student_id: member.student_id,
                  gremio_id: member.gremio_id,
                  role: member.role,
                  status: member.status,
                  created_at: member.created_at,
                  updated_at: member.updated_at,
                  deleted_at: member.deleted_at,
                  disabled_at: member.disabled_at,
                },
                student: member.student,
              };
            }) ?? [];

          return {
            ...gremio,
            members: processedMembers,
          };
        });

        // 3. Retorna os dados formatados
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
