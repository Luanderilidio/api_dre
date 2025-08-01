import z from "zod";
import { faker } from "@faker-js/faker";

const stages = [
  "Comissão Pró-Grêmio",
  "Assembleia Geral",
  "Comissão Eleitoral",
  "Homologação das Chapas",
  "Campanha Eleitoral",
  "Votação",
  "Posse",
] as const;

export enum Stages {
  Comissão_Pró_Grêmio = "Comissão Pró-Grêmio",
  Assembleia_Geral = "Assembleia Geral",
  Comissão_Eleitoral = "Comissão Eleitoral",
  Homologação_das_Chapas = "Homologação das Chapas",
  Campanha_Eleitoral = "Campanha Eleitoral",
  Votação = "Votação",
  Posse = "Posse",
}

export const ROLES_ARRAY = [
  Stages.Comissão_Pró_Grêmio,
  Stages.Assembleia_Geral,
  Stages.Comissão_Eleitoral,
  Stages.Homologação_das_Chapas,
  Stages.Campanha_Eleitoral,
  Stages.Votação,
  Stages.Posse,
] as const;

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
export const StagesEnumZod = z.enum(stages);

export const zDateField = () =>
  z
    .union([z.string().datetime(), z.date(), z.null()])
    .transform((val) => (val ? new Date(val) : null));

export const TimestampsMetadata = z.object({
  created_at: zDateField(),
  updated_at: zDateField(),
  deleted_at: zDateField(),
  disabled_at: zDateField(),
});

// ================== SCHOOL SCHEMA ==============

export const SchoolBaseSchema = z
  .object({
    id: z.string().min(6),
    name: z
      .string()
      .min(1)
      .default(faker.person.fullName({ sex: "male" })),
    city: z.string().min(1),
    status: z.boolean().default(true),
  })
  .merge(TimestampsMetadata);

export const SchoolCreateSchema = SchoolBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  disabled_at: true,
});

export const SchoolUpdateSchema = SchoolCreateSchema.partial();

export const AllSchoolSchema = z.array(SchoolBaseSchema);

// ======================= SCHEMA STUDENTS =======================

export const StudentBaseSchema = z
  .object({
    id: z.string().min(6),
    name: z
      .string()
      .min(1)
      .default(faker.person.fullName({ sex: "male" })),
    registration: z.string(),
    contact: z.string(),
    email: z.string().email().default(faker.internet.email()),
    series: z.string(),
    shift: z.enum(["matutino", "vespertino", "noturno", "integral"]),
    url_profile: z.string().nullable(),
    status: z.boolean().default(true),
  })
  .merge(TimestampsMetadata);

export const StudentCreateSchema = StudentBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  disabled_at: true,
});

export const StudentUpdateSchema = StudentCreateSchema.partial();

export const AllStudentSchema = z.array(StudentBaseSchema);

// ======================= SCHEMA INTERLOCUTORS =======================

export const InterlocutorBaseSchema = z
  .object({
    id: z.string().min(6),
    name: z
      .string()
      .min(1)
      .default(faker.person.fullName({ sex: "male" })),
    email: z.string().email().default(faker.internet.email()),
    status: z.boolean().default(true),
    contact: z.string(),
  })
  .merge(TimestampsMetadata);

export const InterlocutorCreateSchema = InterlocutorBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  disabled_at: true,
});

export const InterlocutorUpdateSchema = InterlocutorCreateSchema.partial();

export const AllInterlocutorSchema = z.array(InterlocutorBaseSchema);

// SCHEMA PROCESS REDEFINITION STUDENTS ===========================================

export const GremioProcessRedefinitionStagesBaseSchema = z.object({
  gremio_process_id: z.string().min(6),
  stage: StagesEnumZod,
  status: z.boolean(),
  started_at: z.coerce.date(),
  finished_at: z.coerce.date(),
  observation: z.string(),
});

export const GetGremioProcessRedefinitionStagesSchema = z
  .object({
    id: z.string().min(6),
    order: z.number(),
  })
  .merge(GremioProcessRedefinitionStagesBaseSchema)
  .merge(TimestampsMetadata);

export const ProcessRedefinitionBaseSchema = z.object({
  gremio_id: z.string().min(6),
  status: z.boolean(),
  observation: z.string(),
  year: z.number(),
});

export const GetProcessRedefinitionSchema = z
  .object({
    id: z.string().min(6),
  })
  .merge(ProcessRedefinitionBaseSchema)
  .merge(TimestampsMetadata);

export const GetProcessRedefinitionWithStagesSchema = z
  .object({
    id: z.string().min(6),
    stages: z.array(GetGremioProcessRedefinitionStagesSchema).optional(),
  })
  .merge(ProcessRedefinitionBaseSchema)
  .merge(TimestampsMetadata);

// ======================= SCHEMA MEMBERS =======================

export const MemberBaseSchema = z
  .object({
    id: z.string().min(6),
    role: RoleEnumZod,
    status: z.boolean(),
    gremio_id: z.string().min(6),
    student_id: z.string().min(6),
  })
  .merge(TimestampsMetadata);

export const MemberCreateSchema = MemberBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  disabled_at: true,
});

export const MemberUpdateSchema = MemberCreateSchema.partial();

export const AllMemberSchema = z.array(MemberBaseSchema);
export const MemberWithStudent = MemberBaseSchema.extend({
  student: StudentBaseSchema,
});
export const AllMemberWithStudents = z.array(MemberWithStudent);

// ================== SCHEMA GREMIO ==================

export const GremioBaseSchema = z.object({
  id: z.string().min(6),
  name: z.string().min(1).default(faker.food.fruit()),
  status: z.boolean().default(true),
  url_profile: z
    .string()
    .url()
    .nullable()
    .default(faker.image.urlPicsumPhotos()),
  url_folder: z
    .string()
    .url()
    .nullable()
    .default(faker.image.urlPicsumPhotos()),
  url_action_plan: z.string().url().default(faker.image.urlPicsumPhotos()),

  school_id: z.string().min(6),
  interlocutor_id: z.string().min(6),

  validity_date: z.coerce.date().nullable(),
  approval_date: z.coerce.date().nullable(),
});

export const GremioCreateSchema = GremioBaseSchema.omit({
  id: true,
});

export const UpdateGremioSchema = GremioCreateSchema.partial();

export const AllGremioSchema = z.array(GremioBaseSchema);

export const AllGremioWithMembersSchema = z.array(
  GremioBaseSchema.omit({
    school_id: true,
    interlocutor_id: true,
  }).extend({
    interlocutor: InterlocutorBaseSchema,
    school: SchoolBaseSchema,
    members: AllMemberWithStudents,
  })
);

// ==================== MESSAGENS ====================
export const MessageSchema = z.object({
  message: z.string(),
});

export const MessageWithIdSchema = z.object({
  message: z.string(),
  id: z.string().min(6),
});

export const ZodIssueSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    code: z.string(),
    path: z.array(z.union([z.string(), z.number()])),
    message: z.string(),
    expected: z.any().optional(),
    received: z.any().optional(),
    validation: z
      .union([
        z.literal("email"),
        z.literal("url"),
        z.literal("uuid"),
        z.literal("regex"),
      ])
      .optional(),
    minimum: z.number().optional(),
    maximum: z.number().optional(),
    inclusive: z.boolean().optional(),
    exact: z.boolean().optional(),
    type: z.string().optional(),
    keys: z.array(z.string()).optional(),
    unionErrors: z
      .array(
        z.object({
          issues: z.array(ZodIssueSchema),
        })
      )
      .optional(),
  })
);

export const ValidationErrorSchema = z.object({
  message: z.string(),
  errors: z.array(ZodIssueSchema),
});
