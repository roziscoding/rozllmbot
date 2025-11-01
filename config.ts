import { z } from "zod/v4";

const AppConfig = z.object({
  TELEGRAM_BOT_TOKEN: z.string(),
  OPENAI_API_KEY: z.string(),
  TELEGRAM_MCP_URL: z.string(),
  TELEGRAM_MCP_AUTH_HEADER: z.string(),
  TELEGRAM_MCP_ALLOWED_TOOLS: z.string().transform((tools) => tools.split(",")),
  ALLOWED_USERS: z.string().transform((users) => users.split(",").map(Number)),
}).transform((envs) => ({
  telegram: {
    token: envs.TELEGRAM_BOT_TOKEN,
    allowedUsers: envs.ALLOWED_USERS,
    secret: envs.TELEGRAM_BOT_TOKEN.replace(/[^a-z0-9]*/ig, ""),
    mcp: {
      url: envs.TELEGRAM_MCP_URL,
      authHeader: envs.TELEGRAM_MCP_AUTH_HEADER,
      allowedTools: envs.TELEGRAM_MCP_ALLOWED_TOOLS,
    },
  },
  openai: {
    apiKey: envs.OPENAI_API_KEY,
  },
}));

export const config = AppConfig.parse(Deno.env.toObject());
