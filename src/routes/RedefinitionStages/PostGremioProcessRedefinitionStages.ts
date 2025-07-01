import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client"; 
import {
    GremioProcessRedefinitionStagesBaseSchema,
  MessageSchema, 
} from "../../utils/SchemasRoutes"; 
import { gremioProcessRedefinitionStages } from "../../drizzle";

export const PostGremioProcessRedefinitionStages: FastifyPluginAsyncZod = async (
  app
) => {
  app.post(
    "/gremio-process-redefinition-stages",
    {
      schema: {
        tags: ["process-redefinition-stages"],
        summary: "Cadastra um estágio do Processo de Redefinição do Grêmio",
        description:
          "Essa rota cadastra um novo estágio processo de redefinição do Grêmio",
        body: GremioProcessRedefinitionStagesBaseSchema,
        response: {
          201: MessageSchema,
          400: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const body = GremioProcessRedefinitionStagesBaseSchema.parse(request.body);

      try {
        const result = await db
          .insert(gremioProcessRedefinitionStages)
          .values(body)
          .returning();
        console.log(result);

        return reply.status(201).send({
          message: "cadastrado com sucesso",
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            message: "Invalid request body",
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
