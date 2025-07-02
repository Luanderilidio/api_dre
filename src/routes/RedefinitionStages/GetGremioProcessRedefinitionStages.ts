import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../drizzle/client";
import {
  GetGremioProcessRedefinitionStagesSchema,
  MessageSchema,
} from "../../utils/SchemasRoutes";
import { gremioProcessRedefinitionStages } from "../../drizzle";

export const GetGremioProcessRedefinitionStages: FastifyPluginAsyncZod = async (
  app
) => {
  app.get(
    "/gremio-process-redefinition-stages/:gremio_process_id",
    {
      schema: {
        tags: ["process-redefinition-stages"],
        summary: "Busca um estágio de Processo de Redefinição do Grêmio",
        description:
          "Essa rota procura um estágio de processo de redefinição do Grêmio",
        params: z.object({
          gremio_process_id: z.string().min(6),
        }),
        response: {
          200: z.array(GetGremioProcessRedefinitionStagesSchema),
          // 200: GetProcessRedefinitionSchema,
          400: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const { gremio_process_id } = request.params; 
      // verifica se gremio_process_id existe

      try {
        const stages = await db.query.gremioProcessRedefinitionStages.findMany({
          where: eq(
            gremioProcessRedefinitionStages.gremio_process_id,
            gremio_process_id
          ),
          orderBy: (stages, { asc }) => [stages.order],
        });

        console.log(gremio_process_id);

        return reply.status(200).send(stages);
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
    }
  );
};
