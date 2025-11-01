import { config } from "../config.ts";
import { Context } from "grammy";

export const isAllowedUser = (ctx: Context) => {
  return config.telegram.allowedUsers.includes(ctx.from?.id ?? 0);
};
