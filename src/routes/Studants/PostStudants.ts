import { and, eq, or } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { students } from "../../drizzle/schema/students";

export const PostStudents: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/students/",
    {
      schema: {
        tags: ["students"],
        summary: "Cadastra um estudante pelo ID",
        description: "descrição da rota",
        body: z.object({
          registration: z.string(),
          name: z.string().min(1),
          contact: z.string(),
          email: z.string().email(),
          series: z.string(),
          shifts: z.array(
            z.enum(["matutino", "vespertino", "noturno", "integral"])
          ),
          img_profile: z.string().nullable().optional(),
          status: z.boolean(),
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
        const {
          registration,
          name,
          email,
          contact,
          series,
          shifts,
          img_profile,
          status,
        } = request.body;

        // verifica se o email ou a matricula já existem
        const existingEmailOrRegistration = await db
          .select()
          .from(students)
          .where(
            and(
              or(
                eq(students.email, email),
                eq(students.registration, registration)
              )
            )
          )
          .limit(1);

        // se encontrar, dispara uma mensagem
        if (existingEmailOrRegistration.length > 0) {
          return reply.status(400).send({ message: "Estudante já cadastrado" });
        }

        // Atualiza o estudante se tudo existiver ok
        const student = await db
          .insert(students)
          .values({
            registration,
            name,
            email,
            contact,
            series,
            shifts,
            img_profile,
            status,
          })
          .returning();

        console.log("Update Estudante", student[0]);

        return reply.status(200).send({ message: "Estudante atualizado!" });
      } catch (error) {
        console.log(error);
        return reply
          .status(500)
          .send({ message: "Erro interno ao atualizar Estudante." });
      }
    }
  );
};
