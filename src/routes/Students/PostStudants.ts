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
        summary: "Cadastra um estudante",
        description: "descrição da rota",
        body: z.object({
          registration: z.string(),
          name: z.string().min(1),
          contact: z.string(),
          email: z.string().email(),
          series: z.string(),
          shift: z.enum(["matutino", "vespertino", "noturno", "integral"]),
          url_profile: z.string().nullable().optional(),
        }),
        response: {
          200: z.object({
            studentId: z.string(),
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
          shift,
          url_profile
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
        const [student] = await db
          .insert(students)
          .values({
            registration,
            name,
            email,
            contact,
            series,
            shift,
            url_profile
          })
          .returning();

        console.log("Post Estudante", student);

        return reply.status(200).send({ studentId: student.id });
      } catch (error) {
        console.log(error);
        return reply
          .status(500)
          .send({ message: "Erro interno ao atualizar Estudante." });
      }
    }
  );
};
