import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../drizzle/client";
import {
  GetProcessRedefinitionSchema,
  GetProcessRedefinitionWithStagesSchema,
  MessageSchema,
  ProcessRedefinitionBaseSchema,
  Stages,
} from "../../utils/SchemasRoutes";
import { gremioProcessRedefinition } from "../../drizzle/schema/gremioProcessRedefinition";

export const PathGremioProcessRedefinition: FastifyPluginAsyncZod = async (
  app
) => {
  app.patch(
    "/gremio-process-redefinition/:id",
    {
      schema: {
        tags: ["process-redefinition"],
        summary: "Edita um Processo de Redefinição do Grêmio",
        description: "Essa rota edita processo de redefinição do Grêmio",
        params: z.object({
          id: z.string().min(6),
        }),
        body: ProcessRedefinitionBaseSchema.partial(),
        response: {
          200: MessageSchema,
          400: MessageSchema,
          404: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const body = ProcessRedefinitionBaseSchema.partial().parse(request.body);

      console.log(body);

      try {
        console.log("aqui");
        const update = await db
          .update(gremioProcessRedefinition)
          .set(body)
          .where(eq(gremioProcessRedefinition.id, id))
          .returning();

        if (!update) {
          return reply.status(404).send({
            message: "Processo de Redefinição não existe!",
          });
        }

        return reply.status(200).send({
          message: "Processo de Redefinição Editado com Sucesso!",
        });
      } catch (error) {
        console.log("aqui");
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
