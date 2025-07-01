import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../drizzle/client";
import { 
  MessageSchema, 
} from "../../utils/SchemasRoutes"; 
import { gremioProcessRedefinitionStages } from "../../drizzle";

export const DeleteGremioProcessRedefinitionStages: FastifyPluginAsyncZod = async (
  app
) => {
  app.delete(
    "/gremio-process-redefinition-stage/:id",
    {
      schema: {
        tags: ["process-redefinition-stages"],
        summary: "Exluí um estagio do Processo de Redefinição do Grêmio",
        description: "Essa rota excluí um estagio do processo de redefinição do Grêmio",
        params: z.object({
          id: z.string().min(6),
        }),
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

      try { 
        const result = await db
          .delete(gremioProcessRedefinitionStages)
          .where(eq(gremioProcessRedefinitionStages.id, id))
          .returning();
        
        if (!result.length) {
          return reply.status(404).send({
            message: "Estágio Processo de Redefinição não existe!",
          });
        }

        return reply.status(200).send({
          message: "Processo de Redefinição Exluido com Sucesso!",
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
