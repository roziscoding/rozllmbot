import { Api } from "grammy";
import { config } from "../src/config.ts";
import { logger } from "../src/logger.ts";

const api = new Api(config.telegram.token);
const me = await api.getMe();

logger.info("Current bot info:");
logger.info(`- Username: ${me.username}`);
logger.info(`- ID: ${me.id}`);
logger.info(`- First name: ${me.first_name}`);
logger.info(`- Last name: ${me.last_name}`);
logger.info(`- Language code: ${me.language_code}`);
logger.info(`- Is bot: ${me.is_bot}`);
logger.info(`- Is premium: ${me.is_premium}`);
