import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../drizzle/client";
import z from "zod";
import { RoleEnumZod } from "./PostMembersGremio";

export const GetAllMembersGremio: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/members-gremio",
    {
      schema: {
        tags: ["members-gremio"],
        summary: "Lista todos os membros dos Grêmios",
        description: "Retorna todos os membros dos grêmios",
        response: {
          200: z.array(
            z.object({
              id: z.string().min(6),
              gremio_id: z.string().min(6),
              role: RoleEnumZod,
              status: z.boolean(),
              disabled_at: z.date().nullable().optional(),
              created_at: z.date().nullable().optional(),
              updated_at: z.date().nullable().optional(),
              deleted_at: z.date().nullable().optional(),
              student: z.object({
                id: z.string(),
                registration: z.string(),
                name: z.string(),
                contact: z.string(),
                email: z.string().email(),
                series: z.string(),
                shift: z.enum([
                  "matutino",
                  "vespertino",
                  "noturno",
                  "integral",
                ]),
                url_profile: z.string().nullable().optional(), // <- importante isso
                status: z.boolean(),
                disabled_at: z.date().nullable().optional(),
                created_at: z.date().nullable().optional(),
                updated_at: z.date().nullable().optional(),
                deleted_at: z.date().nullable().optional(),
              }),
            })
          ),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await db.query.studentsGremioMembers.findMany({
          with: {
            student: true,
          },
        });

        if (result.length === 0) {
          return reply.status(404).send({
            message: "Nenhum membro encontrado",
          });
        }

        return reply.status(200).send(result);
      } catch (error) {
        console.error("Erro ao buscar membros do grêmio:", error);
        return reply.status(500).send({
          message: "Erro interno ao buscar grêmios.",
        });
      }
    }
  );
};
