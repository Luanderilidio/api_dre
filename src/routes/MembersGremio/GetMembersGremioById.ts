import { eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { studentsGremioMembers } from "../../drizzle";
import { db } from "../../drizzle/client";
import { RoleEnumZod } from "./PostMembersGremio";

export const GetMembersGremioById: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/members-gremio/:id",
    {
      schema: {
        tags: ["members-gremio"],
        summary: "Busca um membro do grêmio pelo ID",
        description: "Retorna um membro do grêmio com seus relacionamentos",
        params: z.object({
          id: z.string().min(6),
        }), 
        response: {
          200: z.object({
            id: z.string().min(6),
            gremio_id: z.string().min(6),
            role: RoleEnumZod,
            status: z.boolean(),
            student: z.object({
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
            disabled_at: z.date().nullable().optional(),
            created_at: z.date().nullable().optional(),
            updated_at: z.date().nullable().optional(),
            deleted_at: z.date().nullable().optional(),
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
      const { id } = request.params;

      try {
        const memberGremio = await db.query.studentsGremioMembers.findFirst({
          where: eq(studentsGremioMembers.id, id),
          with: {
            student: true,
          },
        });

        if (!memberGremio) {
          return reply.status(404).send({
            message: "Membro do grêmio não encontrado",
          });
        }

        return reply.status(200).send(memberGremio);
      } catch (error) {
        console.error("Erro ao buscar Membro do gremio:", error);
        return reply.status(500).send({
          message: "Erro interno ao buscar Membro do gremio.",
        });
      }
    }
  );
};
