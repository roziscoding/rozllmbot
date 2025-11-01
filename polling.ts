import { bot } from "./src/bot.ts";
import { logger } from "./src/logger.ts";

bot.start({
  onStart: (({ username }) =>
    logger.info(`Bot started with username: ${username}`)),
});
