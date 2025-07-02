import { z } from "zod/v4";

const AppConfig = z.object({
  TELEGRAM_BOT_TOKEN: z.string(),
  OPENAI_API_KEY: z.string(),
}).transform((envs) => ({
  telegram: {
    token: envs.TELEGRAM_BOT_TOKEN,
    secret: envs.TELEGRAM_BOT_TOKEN.replace(/[^a-z0-9]*/ig, ""),
  },
  openai: {
    apiKey: envs.OPENAI_API_KEY,
  },
}));

export const config = AppConfig.parse(Deno.env.toObject());
