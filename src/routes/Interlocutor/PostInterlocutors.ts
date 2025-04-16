import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { interlocutors } from "../../drizzle/schema/interlocutors";
import { eq } from "drizzle-orm";

export const PostInterlocutors: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/interlocutors",
    {
      schema: {
        tags: ["interlocutors"],
        summary: "cadastra um interlocutor",
        description: "descrição da rota",
        body: z.object({
          name: z.string().min(1, "Nome é obrigatório"),
          email: z.string().email().nonempty(),
          contact: z.string().nonempty(),
        }),
        response: {
          201: z.object({
            id: z.string().min(6),
            name: z.string().min(1),
            contact: z.string(),
            email: z.string().email(),
            status: z.boolean(),
            disabled_at: z.date().nullable().optional(),
            created_at: z.date().nullable().optional(),
            updated_at: z.date().nullable().optional(),
            deleted_at: z.date().nullable().optional(),
          }),
          500: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { name, email, contact } = request.body;

        // verifica se já existe esse email
        const emailExists = await db
          .select()
          .from(interlocutors)
          .where(eq(interlocutors.email, email));

        // se existir, dispara uma mensagem
        if (emailExists.length > 0) {
          return reply.status(400).send({
            message: "Email já está cadastrado.",
          });
        }

        // faz o cadastro do novo interlocutor
        const result = await db
          .insert(interlocutors)
          .values({
            name,
            email,
            contact,
          })
          .returning();

        const interlocutor = result[0];

        console.log(interlocutor);

        // envia uma mensagem que o interlocutor foi cadastrado
        return reply.status(201).send(interlocutor);
      } catch (error) {
        return reply.status(500).send({
          message: "internal error database ",
        });
      }
    }
  );
};
