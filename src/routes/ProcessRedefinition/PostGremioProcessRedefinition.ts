import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { schools } from "../../drizzle/schema/schools";

export const PostGremioProcessRedefinition: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/gremio-process-redefinition",
    {
      schema: {
        tags: ["process-redefinition"],
        summary: "Cadastra um Processo de Redefinição do Grêmio",
        description: "descrição da rota",
        body: z.object({

          gremio_id: z.string().min(6),
          status: z.boolean(),
          observation: z.string(),
          year: z.number(),

          disabled_at: z.date().nullable().optional(),
          created_at: z.date().nullable().optional(),
          updated_at: z.date().nullable().optional(),
          deleted_at: z.date().nullable().optional(),
        }),
        response: {
          201: z.object({
            id: z.string().min(6),
            name: z.string().min(1),
            city: z.string().min(1),
            status: z.boolean(),
            disabled_at: z.date().nullable().optional(),
            created_at: z.date().nullable().optional(),
            updated_at: z.date().nullable().optional(),
            deleted_at: z.date().nullable().optional(),
          }),
        },
      },
    },
    async (request, reply) => {
      console.log("hahaha")
    }
  );
};
