import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./index"; // importa tudo que foi exportado em schema/index.ts

import { env } from "../env";

export const pg = postgres(env.POSTGRES_URL);
export const db = drizzle(pg, {
  schema
});
