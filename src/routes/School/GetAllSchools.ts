import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { schools } from "../../drizzle/schema/schools";
import { gremios } from "../../drizzle";
import { notInArray } from "drizzle-orm";

export const GetAllSchools: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/schools",
    {
      schema: {
        tags: ["schools"],
        summary: "Lista todas as Escolas",
        description: "descrição da rota",
        querystring: z.object({
          free: z
            .enum(["true"])
            .optional()
            .describe(
              "Filtra apenas as escolas que não estão tem um grêmio"
            ),
        }),
        response: {
          200: z.array(
              z.object({
                id: z.string().min(6),
                name: z.string().min(1),
                city: z.string().min(1),
                status: z.boolean(),
                created_at: z.date().nullable().optional(),
                updated_at: z.date().nullable().optional(),
                deleted_at: z.date().nullable().optional(),
                disabled_at: z.date().nullable().optional(),
              })
          ),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { free } = request.query;

      if (free === "true") {
        try {
          const usedSchools = await db
            .select({ id: gremios.school_id })
            .from(gremios);

          const usedIds = usedSchools.map((schools) => schools.id);

          const available = await db
            .select()
            .from(schools)
            .where(notInArray(schools.id, usedIds));

        
          if (available.length === 0) {
            return reply.status(404).send({
              message: "Não foi encontrado nenhuma disponível",
            });
          }
          return reply.status(200).send(available);
        } catch (error) {
          console.error("Erro ao buscar escolas disponíveis", error);
          return reply
            .status(500)
            .send({ message: "Erro interno do servidor" });
        }
      }
      try {
        const result = await db.select().from(schools);
        console.log("schools", result);
        return reply.status(200).send(result);
      } catch (error) {
        console.error("Erro ao buscar escolas disponíveis", error);
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
};
