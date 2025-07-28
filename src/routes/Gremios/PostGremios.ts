import { and, eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { gremios } from "../../drizzle/schema/gremios";
import { schools } from "../../drizzle/schema/schools";
import { interlocutors } from "../../drizzle/schema/interlocutors";
import { GremioCreateSchema, MessageSchema } from "../../utils/SchemasRoutes";

const roles = [
  "DIRETOR",
  "VICE-PRESIDENTE",
  "SECRETÁRIO GERAL I",
  "SECRETÁRIO GERAL II",
  "1° SECRETÁRIO",
  "TESOUREIRO GERAL",
  "1º TESOUREIRO",
  "DIRETOR SOCIAL",
  "DIRETOR DE COMUNICAÇÃO",
  "DIRETOR DE ESPORTES E CULTURA",
  "DIRETOR DE SAÚDE E MEIO AMBIENTE",
] as const;

export const RoleEnumZod = z.enum(roles);

export type Role = z.infer<typeof RoleEnumZod>;

export const PostGremios: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/gremios",
    {
      schema: {
        tags: ["gremios"],
        summary: "Cadastra um Grêmio",
        description:
          "Cria um novo grêmio vinculado a uma escola e interlocutor",
        body: GremioCreateSchema,
        response: {
          201: MessageSchema,
          400: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const body = GremioCreateSchema.parse(request.body);
      try {
        const schoolExists = await db
          .select()
          .from(schools)
          .where(eq(schools.id, body.school_id));

        if (schoolExists.length === 0) {
          return reply.status(400).send({
            message: "Escola não existe.",
          });
        }

        const interlocutor = await db
          .select()
          .from(interlocutors)
          .where(eq(interlocutors.id, body.interlocutor_id));

        if (interlocutor.length === 0) {
          return reply.status(400).send({
            message: "Interlocutor não existe.",
          });
        }

        const gremioExists = await db
          .select()
          .from(gremios)
          .where(eq(gremios.school_id, body.school_id));

        if (gremioExists.length > 0) {
          return reply.status(400).send({
            message: "Essa escola já possui um grêmio cadastrado.",
          });
        }

        const [gremio] = await db.insert(gremios).values(body).returning();

        console.log(gremio);

        return reply.status(201).send({
          message: "Gremio criado com sucesso"
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
