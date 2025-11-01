import { Bot } from "grammy";
import { config } from "./config.ts";
import { isAllowedUser } from "./middleware/auth.ts";
import { inlineQueryHandler } from "./handlers/inline-query.ts";
import { messageHandler } from "./handlers/messages.ts";
import { BotContext } from "./contex.ts";
import { registerQueueHandlers } from "./handlers/queue.ts";
import { logger } from "./logger.ts";

const kv = await Deno.openKv();
export const bot = new Bot<BotContext>(config.telegram.token);

bot.use((ctx, next) => {
  Object.defineProperties(ctx, {
    kv: {
      value: kv,
      enumerable: true,
      writable: false,
    },
    logger: {
      value: logger.child({ updateId: ctx.update.update_id, from: ctx.from }),
      enumerable: true,
      writable: false,
    },
  });

  return next();
});

bot.use((ctx, next) => {
  ctx.logger.info(
    `Processing update from ${ctx.from?.first_name}`,
  );
  return next();
});

const composer = bot.filter(isAllowedUser);

composer.use(inlineQueryHandler);
composer.use(messageHandler);

registerQueueHandlers(kv, bot.api);
