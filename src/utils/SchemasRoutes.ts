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
  id: z.string().min(6)
});


