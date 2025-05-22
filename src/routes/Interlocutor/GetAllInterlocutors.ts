import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { gremios, interlocutors } from "../../drizzle";
import { notInArray } from "drizzle-orm";

export const GetAllInterlocutors: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/interlocutors",
    {
      schema: {
        tags: ["interlocutors"],
        summary: "Lista todos os interlocutores",
        description: "descrição da rota",
        querystring: z.object({
          free: z
            .enum(["true"])
            .optional()
            .describe(
              "Filtra apenas interlocutores que não estão em um grêmio"
            ),
        }),
        response: {
          200: z.array(
            z.object({
              id: z.string().min(6),
              name: z.string().min(1),
              contact: z.string(),
              email: z.string().email(),
              status: z.boolean(),
              created_at: z.date().nullable().optional(),
              updated_at: z.date().nullable().optional(),
              deleted_at: z.date().nullable().optional(),
              disabled_at: z.date().nullable().optional(),
            })
          ),
          500: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { free } = request.query;

      if (free === "true") {
        try {
          // Busca todos os interlocutores que já estão em algum grêmio
          const usedInterlocutors = await db
            .select({ id: gremios.interlocutor_id })
            .from(gremios);

          const usedIds = usedInterlocutors.map(
            (interlocutor) => interlocutor.id
          );

          const available = await db
            .select()
            .from(interlocutors)
            .where(notInArray(interlocutors.id, usedIds));

          if (available.length === 0) {
            return reply
              .status(404)
              .send({
                message: "Não foi encontrado nenhum interlocutor disponível",
              });
          }

          return reply.status(200).send(available);
        } catch (error) {
          console.error("Erro ao buscar Interlocutores disponíveis", error);
          return reply
            .status(500)
            .send({ message: "Erro interno do servidor" });
        }
      }

      try {
        const Allinterlocutor = await db.select().from(interlocutors);

        console.log(Allinterlocutor);

        if (Allinterlocutor.length === 0) {
          return reply
            .status(404)
            .send({ message: "Nenhum interlocutor cadastrado" });
        }

        return reply.status(200).send(Allinterlocutor);
      } catch (error) {
        console.error("Erro ao buscar Interlocutores", error);
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    }
  );
};