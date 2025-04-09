import { and, eq, not } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { interlocutors, schools } from "../../drizzle";
import { db } from "../../drizzle/client";

export const PathInterlocutorsById: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    "/interlocutors/:id",
    {
      schema: {
        tags: ["interlocutors"],
        summary: "Edita um interlocutor pelo ID",
        description: "descrição da rota",
        params: z.object({
          id: z.string().min(6),
        }),
        body: z.object({
          name: z
            .string()
            .min(1, { message: "O nome não pode ser vazio" })
            .refine((val) => val.trim().split(" ").length >= 2, {
              message: "O nome deve conter pelo menos nome e sobrenome",
            })
            .optional(),
          email: z.string().email().optional(),
          contact: z.string().optional(),
          status: z.boolean().optional(),
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
      try {
        const { id } = request.params;

        const { name, email, contact, status } = request.body;

        // Verifica se o Email existe
        if (email) {
          const emailExistis = await db
            .select()
            .from(interlocutors)
            .where(
              and(
                eq(interlocutors.email, email),
                not(eq(interlocutors.id, id)) // exclui o próprio usuário
              )
            );

          if (emailExistis.length > 0) {
            return reply
              .status(400)
              .send({ message: "Email já está cadastrado!" });
          }
        }
 
        // Atualiza o interlocutor
        const [update] = await db
          .update(interlocutors)
          .set({
            name,
            email,
            contact,
            status,
            updated_at: new Date()
          })
          .where(eq(interlocutors.id, id))
          .returning();

        
        if (!update) {
          return reply
            .status(404)
            .send({ message: "Interlocutor não encontrado" });
        }

        console.log("Update interlocutor", update);

        return reply.status(200).send({ message: "Interlocutor atualizado!" });
      } catch (error) {
        console.log(error);

        return reply
          .status(500)
          .send({ message: "Erro interno ao atualizar interlocutor." });
      }
    }
  );
};
