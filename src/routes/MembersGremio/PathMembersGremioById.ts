import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../drizzle/client";
import { gremios } from "../../drizzle/schema/gremios";
import { eq } from "drizzle-orm";
import z from "zod";
import { interlocutors, schools } from "../../drizzle";

export const PathMembersGremioById: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    "/members-gremio/:id",
    {
      schema: {
        tags: ["members-gremio"],
        summary: "Atualiza um membro do grêmio pelo ID",
        description: "Edita informações de um membro grêmio existente",
        params: z.object({
          id: z.string().min(6), // já valida que o ID é string válida
        }),
        body: z
          .object({
            name: z.string().min(1).optional(),
            status: z.boolean().optional(),
            url_profile: z.string().nullable().optional(),
            url_folder: z.string().nullable().optional(),
            validity_date: z
              .string()
              .transform((val) => new Date(val))
              .optional(),
            approval_date: z
              .string()
              .transform((val) => new Date(val))
              .optional(),
            interlocutor_id: z.string().min(6).optional(),
            school_id: z.string().min(6).optional(),
          })
          .refine((data) => Object.keys(data).length > 0, {
            message: "É necessário informar ao menos um campo para atualizar",
          }),
        response: {
          200: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
          500: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const updates = request.body;

      try {
        // Verifica se o grêmio existe
        const [gremio] = await db
          .select()
          .from(gremios)
          .where(eq(gremios.id, id));

        if (!gremio) {
          return reply.status(404).send({
            message: "Grêmio não encontrado.",
          });
        }

        // Se school_id foi enviado, verifica se existe
        if (updates.school_id) {
          const [school] = await db
            .select()
            .from(schools)
            .where(eq(schools.id, updates.school_id));
          if (!school) {
            return reply.status(400).send({
              message: "Escola não encontrada.",
            });
          }
        }

        // Se interlocutor_id foi enviado, verifica se existe
        if (updates.interlocutor_id) {
          const [interlocutor] = await db
            .select()
            .from(interlocutors)
            .where(eq(interlocutors.id, updates.interlocutor_id));
          if (!interlocutor) {
            return reply.status(400).send({
              message: "Interlocutor não encontrado.",
            });
          }
        }

        // Faz o update com os campos atualizados + updated_at
        const [updated] = await db
          .update(gremios)
          .set({
            ...updates,
          })
          .where(eq(gremios.id, id))
          .returning();

        return reply.status(200).send({
          message: "Grêmio atualizado com sucesso",
        });
      } catch (error) {
        console.error("Erro ao atualizar grêmio:", error);
        return reply.status(500).send({
          message: "Erro interno ao atualizar grêmio.",
        });
      }
    }
  );
};
