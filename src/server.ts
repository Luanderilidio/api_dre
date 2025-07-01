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
import { GetAllStudents } from "./routes/Students/GetAllStudants";
import { GetStudentsById } from "./routes/Students/GetStudantsById";
import { PostStudents } from "./routes/Students/PostStudants";
import { PathStudentsById } from "./routes/Students/PathStudantsById";
import { DeleteStudents } from "./routes/Students/DeleteStudants";
import { PostGremios } from "./routes/Gremios/PostGremios";
import { GetAllGremios } from "./routes/Gremios/GetAllGremios";
import { GetGremioById } from "./routes/Gremios/GetGremiosById";
import { PatchGremioById } from "./routes/Gremios/PathGremiosById";
import { DeleteGremios } from "./routes/Gremios/DeleteGremios";
import { PostMembersGremio } from "./routes/MembersGremio/PostMembersGremio";
import { GetAllMembersGremio } from "./routes/MembersGremio/GetAllMembersGremio";
import { GetMembersGremioById } from "./routes/MembersGremio/GetMembersGremioById";
import { PathMembersGremioById } from "./routes/MembersGremio/PathMembersGremioById";
import { DeleteMembersGremio } from "./routes/MembersGremio/DeleteMembersGremio";
import { PostGremioProcessRedefinition } from "./routes/ProcessRedefinition/PostGremioProcessRedefinition";
import { GetGremioProcessRedefinition } from "./routes/ProcessRedefinition/GetGremioProcessRedefinition";
import { PathGremioProcessRedefinition } from "./routes/ProcessRedefinition/PathGremioProcessRedefinition";
import { DeleteGremioProcessRedefinition } from "./routes/ProcessRedefinition/DeleteGremioProcessRedefinition";
import { PostGremioProcessRedefinitionStages } from "./routes/RedefinitionStages/PostGremioProcessRedefinitionStages";


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
  origin: "*", 
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(GetAllSchools);
app.register(GetSchoolsById);
app.register(PostSchools);
app.register(PathSchoolsById);
app.register(DeleteSchools);

app.register(GetAllInterlocutors);
app.register(GetInterlocutorsById);
app.register(PostInterlocutors);
app.register(PathInterlocutorsById);
app.register(DeleteInterlocutors);

app.register(GetAllStudents);
app.register(GetStudentsById);
app.register(PostStudents);
app.register(PathStudentsById);
app.register(DeleteStudents);

app.register(PostGremios);
app.register(GetAllGremios);
app.register(GetGremioById);
app.register(PatchGremioById);
app.register(DeleteGremios);

app.register(GetAllMembersGremio)
app.register(GetMembersGremioById)
app.register(PostMembersGremio);
app.register(PathMembersGremioById);
app.register(DeleteMembersGremio)

app.register(PostGremioProcessRedefinition)
app.register(GetGremioProcessRedefinition)
app.register(PathGremioProcessRedefinition)
app.register(DeleteGremioProcessRedefinition)


app.register(PostGremioProcessRedefinitionStages)

app.listen({ port: env.PORT }).then(() => {
  console.log("🚀  HTTP server running! ✨");
});
