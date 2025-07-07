// Importa funções utilitárias do drizzle-orm para criar filtros SQL
import { and, eq, not, or } from "drizzle-orm";
// Importa o tipo do plugin Fastify que integra com Zod
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
// Importa Zod para validação
import z from "zod";
// Importa a instância do banco (configurada no seu projeto)
import { db } from "../../drizzle/client";
// Importa a tabela students gerada pelo drizzle-kit
import { students } from "../../drizzle/schema/students";
// Importa schemas Zod para validação e resposta
import {
  MessageSchema,
  StudentUpdateSchema,
  ValidationErrorSchema,
} from "../../utils/SchemasRoutes";

// Define um plugin Fastify para a rota PATCH /students/:id
export const PathStudentsById: FastifyPluginAsyncZod = async (app) => {
  // Cria o handler PATCH
  app.patch(
    "/students/:id",
    {
      // Configuração do schema OpenAPI e validação automática
      schema: {
        tags: ["students"],
        summary: "Edita um estudante pelo ID",
        description: "descrição da rota",
        params: z.object({
          id: z.string().min(6), // O ID deve ter pelo menos 6 caracteres
        }),
        body: StudentUpdateSchema, // O corpo deve seguir o schema de atualização
        response: {
          200: MessageSchema, // Resposta de sucesso
          400: z.union([ValidationErrorSchema, MessageSchema]), // Requisição inválida
          404: MessageSchema, // Não encontrado
          500: MessageSchema, // Erro interno
        },
      },
    },
    // Função que executa quando a rota é chamada
    async (request, reply) => {
      const { id } = request.params; // Extrai o ID da URL

      // Valida o corpo da requisição usando safeParse
      const parsed = StudentUpdateSchema.safeParse(request.body);
      if (!parsed.success) {
        // Se inválido, retorna 400 com os erros
        return reply
          .status(400)
          .send({
            message: "Invalid request body!",
            errors: parsed.error.errors,
          });
      }

      const body = parsed.data; // Dados validados

      // Se o corpo estiver vazio, não tem nada para atualizar
      if (Object.keys(body).length === 0) {
        return reply
          .status(400)
          .send({ message: "Nenhum campo fornecido para atualização." });
      }

      try {
        // Cria uma lista de condições de verificação de duplicidade
        const conditions = [];
        if (body.email) {
          // Se veio email, adiciona condição
          conditions.push(eq(students.email, body.email));
        }
        if (body.registration) {
          // Se veio matrícula, adiciona condição
          conditions.push(eq(students.registration, body.registration));
        }

        // Só faz a busca se houver condições
        if (conditions.length > 0) {
          const existing = await db
            .select()
            .from(students)
            .where(
              and(
                or(...conditions), // Procura estudantes com mesmo email OU matrícula
                not(eq(students.id, id)) // Mas que não seja o próprio estudante
              )
            )
            .limit(1);

          // Se encontrou algum duplicado
          if (existing.length > 0) {
            const conflicts = [];
            // Verifica qual campo conflita
            if (body.email && existing[0].email === body.email) {
              conflicts.push("Email");
            }
            if (
              body.registration &&
              existing[0].registration === body.registration
            ) {
              conflicts.push("Matrícula");
            }

            // Retorna erro 400 com os campos conflitantes
            return reply
              .status(400)
              .send({ message: `${conflicts.join(" e ")} já cadastrado(s)!` });
          }
        }

        // Realiza o UPDATE no banco
        const update = await db
          .update(students)
          .set(body)
          .where(eq(students.id, id))
          .returning(); // Retorna os registros atualizados

        // update SEMPRE é um array; se estiver vazio, não encontrou o estudante
        if (update.length === 0) {
          return reply
            .status(404)
            .send({ message: "Estudante não encontrado." });
        }

        // Tudo certo, retorna sucesso
        return reply.status(200).send({ message: "Estudante atualizado!" });

      } catch (error) {
        // Loga no console
        console.error(error);
        // Retorna erro interno, incluindo detalhes em ambiente dev
        return reply.status(500).send({
          message: "Internal server error"
        });
      }
    }
  );
};
