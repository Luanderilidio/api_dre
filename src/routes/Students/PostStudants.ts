import { and, eq, or } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { students } from "../../drizzle/schema/students";
import {
  MessageSchema,
  StudentBaseSchema,
  StudentCreateSchema,
  ValidationErrorSchema,
} from "../../utils/SchemasRoutes";

export const PostStudents: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/students",
    {
      schema: {
        tags: ["students"],
        summary: "Cadastra um estudante",
        description: "descrição da rota",
        body: StudentCreateSchema,
        response: {
          201: MessageSchema,
          400: z.union([ValidationErrorSchema, MessageSchema]),
          404: MessageSchema,
          500: MessageSchema,
        },
      },
    },
    async (request, reply) => {
      const body = StudentCreateSchema.parse(request.body);
      try {
        // verifica se o email ou a matricula já existem
        const existingEmailOrRegistration = await db
          .select()
          .from(students)
          .where(
            and(
              or(
                eq(students.email, body.email),
                eq(students.registration, body.registration)
              )
            )
          )
          .limit(1);

        // se encontrar, dispara uma mensagem
        if (existingEmailOrRegistration.length > 0) {
          return reply.status(400).send({ message: "Estudante já cadastrado" });
        }

        // Atualiza o estudante se tudo existiver ok
        const [student] = await db.insert(students).values(body).returning();

        console.log("Post Estudante", student);

        return reply.status(201).send({
          message: "Estudante criado com sucesso",
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply
            .status(400)
            .send({ message: "invalid request body!", errors: error.errors });
        }
        console.log(error);
        return reply.status(500).send({
          message: "Internal server error",
        });
      }
    }
  );
};
