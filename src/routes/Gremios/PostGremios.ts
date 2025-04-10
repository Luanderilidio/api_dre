import { and, eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { gremios } from "../../drizzle/schema/gremios";
import { schools } from "../../drizzle/schema/schools";
import { interlocutors } from "../../drizzle/schema/interlocutors";

export const PostGremios: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/gremios",
    {
      schema: {
        tags: ["gremios"],
        summary: "Cadastra um Grêmio",
        description: "Cria um novo grêmio vinculado a uma escola e interlocutor",
        body: z.object({
          name: z.string().min(1),
          status: z.boolean(),
          url_profile: z.string().nullable().optional(),
          url_folder: z.string().nullable().optional(),
          validity_date: z.string().transform((val) => new Date(val)),
          approval_date: z.string().transform((val) => new Date(val)),
          school_id: z.string().min(6),
          interlocutor_id: z.string().min(6),
        }),
        response: {
          201: z.object({ 
            gremioId: z.string(),
          }),
          400: z.object({
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
        const {
          name,
          status,
          url_profile,
          url_folder,
          validity_date,
          approval_date,
          school_id,
          interlocutor_id,
        } = request.body;

        // 🏫 Verifica se a escola existe
        const school = await db
          .select()
          .from(schools)
          .where(eq(schools.id, school_id));

        if (school.length === 0) {
          return reply.status(400).send({
            message: "Escola não encontrada.",
          });
        }

        // 🗣️ Verifica se o interlocutor existe
        const interlocutor = await db
          .select()
          .from(interlocutors)
          .where(eq(interlocutors.id, interlocutor_id));

        if (interlocutor.length === 0) {
          return reply.status(400).send({
            message: "Interlocutor não encontrado.",
          });
        }

        // 🔍 Verifica se a escola já tem um grêmio
        const gremioExists = await db
          .select()
          .from(gremios)
          .where(eq(gremios.school_id, school_id));

        if (gremioExists.length > 0) {
          return reply.status(400).send({
            message: "Essa escola já possui um grêmio cadastrado.",
          });
        }

        // ✅ Criação do grêmio
        const [gremio] = await db
          .insert(gremios)
          .values({
            name,
            status,
            url_profile,
            url_folder,
            validity_date,
            approval_date,
            school_id,
            interlocutor_id,
          })
          .returning();

        return reply.status(201).send({
          gremioId: gremio.id,
        });
      } catch (error) {
        console.error("Erro ao criar grêmio:", error);
        return reply
          .status(500)
          .send({ message: "Erro interno ao criar grêmio." });
      }
    }
  );
};
