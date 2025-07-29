import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../drizzle/client";
import { gremios } from "../../drizzle/schema/gremios";
import { eq } from "drizzle-orm";
import z from "zod";
import { interlocutors, schools } from "../../drizzle";
import { MessageSchema, UpdateGremioSchema } from "../../utils/SchemasRoutes";

export const PatchGremioById: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    "/gremios/:id",
    {
      schema: {
        tags: ["gremios"],
        summary: "Atualiza um grêmio pelo ID",
        description: "Edita informações de um grêmio existente",
        params: z.object({
          id: z.string().min(6), // já valida que o ID é string válida
        }),
        body: UpdateGremioSchema,
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
      const body = UpdateGremioSchema.parse(request.body);

      if (Object.keys(body).length === 0) {
        return reply
          .status(400)
          .send({ message: "Nenhum campo fornecido para atualização." });
      }

      try { 
        const [gremio] = await db
          .select()
          .from(gremios)
          .where(eq(gremios.id, id));

        if (!gremio) {
          return reply.status(404).send({
            message: "Grêmio não encontrado.",
          });
        }
 
        if (body.school_id) {
          const [school] = await db
            .select()
            .from(schools)
            .where(eq(schools.id, body.school_id));
          if (!school) {
            return reply.status(400).send({
              message: "Escola não encontrada.",
            });
          }
        } 
        
        if (body.interlocutor_id) {
          const [interlocutor] = await db
            .select()
            .from(interlocutors)
            .where(eq(interlocutors.id, body.interlocutor_id));
          if (!interlocutor) {
            return reply.status(400).send({
              message: "Interlocutor não encontrado.",
            });
          }
        }

        const [updated] = await db
          .update(gremios)
          .set(body)
          .where(eq(gremios.id, id))
          .returning();

        console.log(updated);

        return reply.status(200).send({
          message: "Grêmio atualizado com sucesso",
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ message: "invalid request body!" });
        }
        console.log(error);
        return reply.status(500).send({ message: "internal server error" });
      }
    }
  );
};
