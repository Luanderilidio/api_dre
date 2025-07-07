import z from "zod";

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

export const StagesEnumZod = z.enum(stages);

export const TimestampsMetadata = z.object({
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
  disabled_at: z.date().nullable(),
});

export const SchoolBaseSchema = z
  .object({
    id: z.string().min(6),
    name: z.string().min(1),
    city: z.string().min(1),
    status: z.boolean().default(true),
  })
  .merge(TimestampsMetadata);

export const SchoolCreateSchema = SchoolBaseSchema.omit({
  id: true,
});

export const SchoolUpdateSchema = SchoolCreateSchema.partial();

export const AllSchoolSchema = z.array(SchoolBaseSchema);

// SCHEMA STUDENTS ===========================================

export const StudentBaseSchema = z.object({
  id: z.string().min(6),
  name: z.string().min(1),
  registration: z.string(),
  contact: z.string(),
  email: z.string().email(),
  series: z.string(),
  shift: z.enum(["matutino", "vespertino", "noturno", "integral"]),
  url_profile: z.string().nullable(),
});

export const StudentCreateSchema = StudentBaseSchema.omit({
  id: true,
});

export const StudentUpdateSchema = StudentCreateSchema.partial();

export const AllStudentSchema = z.array(StudentBaseSchema);



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
