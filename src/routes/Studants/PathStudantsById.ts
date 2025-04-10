import { and, eq, not, or } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../drizzle/client";
import { shiftEnum, students } from "../../drizzle/schema/students";

// Define um plugin Fastify para a rota PATCH /students/:id
export const PathStudentsById: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    "/students/:id", // Rota PATCH para atualizar um estudante pelo ID
    {
      schema: {
        tags: ["students"], // Tag de documentação Swagger
        summary: "Edita um estudante pelo ID",
        description: "descrição da rota",

        // Valida os parâmetros da rota (o ID do estudante)
        params: z.object({
          id: z.string().min(6),
        }),

        // Valida o corpo da requisição (os campos que podem ser atualizados)
        body: z.object({
          registration: z.string().optional(),
          name: z.string().min(1).optional(),
          contact: z.string().optional(),
          email: z.string().email().optional(),
          series: z.string().optional(),
          shifts: shiftEnum,
          img_profile: z.string().nullable().optional(),
          status: z.boolean().optional(),
        }),

        // Define os possíveis retornos da API (respostas)
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
    // Lógica da rota
    async (request, reply) => {
      try {
        // Extrai o ID do estudante da URL
        const { id } = request.params;

        // Extrai os campos do corpo da requisição
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

        // Verifica se está tentando atualizar email ou matrícula
        if (email || registration) {
          // Consulta se já existe outro estudante com o mesmo email ou matrícula
          const existing = await db
            .select()
            .from(students)
            .where(
              and(
                or(
                  ...(email ? [eq(students.email, email)] : []),
                  ...(registration
                    ? [eq(students.registration, registration)]
                    : [])
                ),
                not(eq(students.id, id)) // Garante que não está comparando com o próprio estudante
              )
            )
            .limit(1);

          // Se já existe, retorna erro 400 informando o campo em conflito
          if (existing.length > 0) {
            const conflictField =
              email && existing[0].email === email ? "Email" : "Matrícula";

            return reply
              .status(400)
              .send({ message: `${conflictField} já está cadastrado!` });
          }
        }

        // Realiza a atualização do estudante no banco de dados
        const [update] = await db
          .update(students)
          .set({
            registration,
            name,
            email,
            contact,
            series,
            shifts,
            img_profile,
            status,
            updated_at: new Date(), // Atualiza a data da última modificação
          })
          .where(eq(students.id, id))
          .returning(); // Retorna os dados atualizados

        // Se não encontrou o estudante para atualizar, retorna 404
        if (!update) {
          return reply
            .status(404)
            .send({ message: "Estudante não encontrado" });
        }

        // Loga no terminal (para debug)
        console.log("Update Estudante", update);

        // Retorna sucesso
        return reply.status(200).send({ message: "Estudante atualizado!" });
      } catch (error) {
        // Trata erros inesperados
        console.log(error);

        return reply
          .status(500)
          .send({ message: "Erro interno ao atualizar Estudante." });
      }
    }
  );
};
