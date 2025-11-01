import { Context } from "grammy";
import { Logger } from "pino";

export type BotContext = Context & {
  kv: Deno.Kv;
  logger: Logger;
};
