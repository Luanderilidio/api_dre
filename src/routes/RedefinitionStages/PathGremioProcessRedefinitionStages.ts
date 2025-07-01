import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../drizzle/client";
import { 
  GremioProcessRedefinitionStagesBaseSchema,
  MessageSchema,
  ProcessRedefinitionBaseSchema, 
} from "../../utils/SchemasRoutes";
import { gremioProcessRedefinition } from "../../drizzle/schema/gremioProcessRedefinition";
import { gremioProcessRedefinitionStages } from "../../drizzle";

export const PathGremioProcessRedefinition: FastifyPluginAsyncZod = async (
  app
) => {
  app.patch(
    "/gremio-process-redefinition-stages/:id",
    {
      schema: {
        tags: ["process-redefinition-stages"],
        summary: "Edita um estágio do Processo de Redefinição do Grêmio",
        description: "Essa rota edita um estágio do processo de redefinição do Grêmio",
        params: z.object({
          id: z.string().min(6),
        }),
        body: GremioProcessRedefinitionStagesBaseSchema.partial(),
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
      const body = GremioProcessRedefinitionStagesBaseSchema.partial().parse(request.body);

      console.log(body);

      try { 
        const update = await db
          .update(gremioProcessRedefinitionStages)
          .set(body)
          .where(eq(gremioProcessRedefinitionStages.id, id))
          .returning();

        if (!update) {
          return reply.status(404).send({
            message: "Estágio do Processo de Redefinição não existe!",
          });
        }

        return reply.status(200).send({
          message: "Estágio do Processo de Redefinição Editado com Sucesso!",
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
