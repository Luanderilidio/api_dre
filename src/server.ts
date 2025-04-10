import { fastifyCors } from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import { ZodError } from "zod";

import fastifySwaggerUi from "@fastify/swagger-ui";
import { fastify } from "fastify";
import {
  type ZodTypeProvider,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { env } from "./env";

import { GetAllSchools } from "./routes/School/GetAllSchools";
import { GetSchoolsById } from "./routes/School/GetSchoolsById";
import { PostSchools } from "./routes/School/PostSchool";
import { PathSchoolsById } from "./routes/School/PathSchoolsById";
import { DeleteSchools } from "./routes/School/DeleteSchools";
import { GetAllInterlocutors } from "./routes/Interlocutor/GetAllInterlocutors";
import { GetInterlocutorsById } from "./routes/Interlocutor/GetInterlocutorsById";
import { PostInterlocutors } from "./routes/Interlocutor/PostInterlocutors";
import { PathInterlocutorsById } from "./routes/Interlocutor/PathInterlocutorsById";
import { DeleteInterlocutors } from "./routes/Interlocutor/DeleteInterlocutors";
import { GetAllStudents } from "./routes/Studants/GetAllStudants";
import { GetStudentsById } from "./routes/Studants/GetStudantsById";
import { PostStudents } from "./routes/Studants/PostStudants";
import { PathStudentsById } from "./routes/Studants/PathStudantsById";
import { DeleteStudents } from "./routes/Studants/DeleteStudants";
import { PostGremios } from "./routes/Gremios/PostGremios";



const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "nlw Connect",
      version: "0.0.1",
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

app.register(fastifyCors, {
  origin: true,
});

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(GetAllSchools)
app.register(GetSchoolsById)
app.register(PostSchools)
app.register(PathSchoolsById)
app.register(DeleteSchools)

app.register(GetAllInterlocutors)
app.register(GetInterlocutorsById)
app.register(PostInterlocutors)
app.register(PathInterlocutorsById)
app.register(DeleteInterlocutors)

app.register(GetAllStudents)
app.register(GetStudentsById)
app.register(PostStudents)
app.register(PathStudentsById)
app.register(DeleteStudents)

app.register(PostGremios)


app.listen({ port: env.PORT }).then(() => {
  console.log("HTTP server running!");
});
