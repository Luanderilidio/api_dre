import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../drizzle/client";
import {
  GetProcessRedefinitionSchema,
  GetProcessRedefinitionWithStagesSchema,
  MessageSchema,
  Stages,
} from "../../utils/SchemasRoutes";
import { gremioProcessRedefinition } from "../../drizzle/schema/gremioProcessRedefinition";

export const GetGremioProcessRedefinition: FastifyPluginAsyncZod = async (
  app
) => {
  app.get(
    "/gremio-process-redefinition",
    {
      schema: {
        tags: ["process-redefinition"],
        summary: "Busca um Processo de Redefinição do Grêmio",
        description: "Essa rota procura processo de redefinição do Grêmio",
        querystring: z.object({
          filter: z
            .enum([
              "id_with_stages",
              "id_no_stages",
              "all_with_stages",
              "all_no_stages",
            ])
            .describe("Escolha o tipo de filtro")
            .optional(),
          gremio_process_id: z.string().min(6).optional(),
        }),
        response: {
          200: z.union([
            GetProcessRedefinitionSchema,
            z.array(GetProcessRedefinitionWithStagesSchema),
          ]),
          // 200: GetProcessRedefinitionSchema,
          400: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const { filter, gremio_process_id } = request.query;

      // verifica se gremio_process_id existe
      if (gremio_process_id) {
        const result = await db
          .select()
          .from(gremioProcessRedefinition)
          .where(eq(gremioProcessRedefinition.id, gremio_process_id));
        if (result.length === 0) {
          return reply.status(404).send({
            message: "gremio_process_id not exists",
          });
        }
      }

      switch (filter) {
        case "id_with_stages":
          try {
            const result_id_with_stages =
              await db.query.gremioProcessRedefinition.findFirst({
                where: eq(gremioProcessRedefinition.id, gremio_process_id!),
                with: { stages: true },
              });

            return reply.status(200).send(result_id_with_stages);
          } catch (error) {
            if (error instanceof z.ZodError) {
              return reply.status(400).send({
                message: "Invalid request query",
              });
            }

            console.log(error);

            return reply.status(500).send({
              message: "Internal server error",
            });
          }

        case "id_no_stages":
          try {
            const result_id_no_stages =
              await db.query.gremioProcessRedefinition.findFirst({
                where: eq(gremioProcessRedefinition.id, gremio_process_id!),
              });

            return reply.status(200).send(result_id_no_stages);
          } catch (error) {
            if (error instanceof z.ZodError) {
              return reply.status(400).send({
                message: "Invalid request query",
              });
            }

            console.log(error);

            return reply.status(500).send({
              message: "Internal server error",
            });
          }

        case "all_with_stages":
          try {
            const result_all_with_stages =
              await db.query.gremioProcessRedefinition.findMany({
                with: { stages: true },
              });

            return reply.status(200).send(result_all_with_stages);
          } catch (error) {
            if (error instanceof z.ZodError) {
              return reply.status(400).send({
                message: "Invalid request query",
              });
            }

            console.log(error);

            return reply.status(500).send({
              message: "Internal server error",
            });
          }

        case "all_no_stages":
          try {
            const result_all_no_stages =
              await db.query.gremioProcessRedefinition.findMany();

            return reply.status(200).send(result_all_no_stages);
          } catch (error) {
            if (error instanceof z.ZodError) {
              return reply.status(400).send({
                message: "Invalid request query",
              });
            }

            console.log(error);

            return reply.status(500).send({
              message: "Internal server error",
            });
          }

        default:
          return reply.status(500).send({
            message: "invalid request query",
          });
      }
    }
  );
};
