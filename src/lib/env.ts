import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  API_URL: z.url(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

/** Validated server-only environment. Parsed lazily so `next build` does not require it. */
export function serverEnv(): ServerEnv {
  cached ??= serverEnvSchema.parse({ API_URL: process.env.API_URL });
  return cached;
}
