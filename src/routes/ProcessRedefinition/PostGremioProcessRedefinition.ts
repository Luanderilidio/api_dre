import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { schools } from "../../drizzle/schema/schools";
import {
  MessageSchema,
  ProcessRedefinitionBaseSchema,
} from "../../utils/SchemasRoutes";
import { gremioProcessRedefinition } from "../../drizzle/schema/gremioProcessRedefinition";

export const PostGremioProcessRedefinition: FastifyPluginAsyncZod = async (
  app
) => {
  app.post(
    "/gremio-process-redefinition",
    {
      schema: {
        tags: ["process-redefinition"],
        summary: "Cadastra um Processo de Redefinição do Grêmio",
        description:
          "Essa rota cadastra um novo processo de redefinição do Grêmio",
        body: ProcessRedefinitionBaseSchema,
        response: {
          201: MessageSchema,
          400: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const body = ProcessRedefinitionBaseSchema.parse(request.body);

      try {
        const result = await db
          .insert(gremioProcessRedefinition)
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
