import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../drizzle/client";
import z from "zod";
import { RoleEnumZod } from "./PostMembersGremio";
import { eq } from "drizzle-orm";
import { studentsGremioMembers } from "../../drizzle/schema/studentsGremioMembers";
import { AllMemberSchema } from "../../utils/SchemasRoutes";

export const GetAllMembersGremio: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/members-gremio",
    {
      schema: {
        tags: ["members-gremio"],
        summary: "Lista todos os membros dos Grêmios",
        description: "Retorna todos os membros dos grêmios",
        querystring: z.object({
          only_roles: z
            .enum(["true", "false"])
            .optional()
            .default("false")
            .describe("Se 'true', retorna apenas os cargos dos membros"),
          gremio_id: z.string().min(6).describe("Digite o id do Grêmio"),
        }),
        response: {
          200: z.union([z.array(z.string()), AllMemberSchema]),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { only_roles, gremio_id } = request.query;

       
      if (only_roles === "true") {
        try {
          const roles: string[] = await db
            .select({ role: studentsGremioMembers.role })
            .from(studentsGremioMembers)
            .where(eq(studentsGremioMembers.gremio_id, gremio_id))
            .then((rows) => rows.map((row) => row.role));

          return reply.status(200).send(roles);
        } catch (error) {
          console.log(error);
          return reply.status(500).send({
            message: "Erro interno ao buscar cargos.",
          });
        }
      }

       
      if (gremio_id) {
        try {
          const members = await db.query.studentsGremioMembers.findMany({
            where: eq(studentsGremioMembers.gremio_id, gremio_id),
            with: {
              student: true,
            },
          });

          if (members.length === 0) {
            return reply.status(404).send({
              message: "Nenhum membro encontrado para este grêmio",
            });
          }

          return reply.status(200).send(members);
        } catch (error) {
          console.error("Erro ao buscar membros do grêmio:", error);
          return reply.status(500).send({
            message: "Erro interno ao buscar membros do grêmio.",
          });
        }
      } 
    }
  );
};
