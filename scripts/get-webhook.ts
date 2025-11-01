import { Api } from "grammy";
import { config } from "../src/config.ts";
import { formatWebhookInfo } from "./utils/webhook-info.ts";
import { logger } from "../src/logger.ts";

const api = new Api(config.telegram.token);
const me = await api.getMe();
const webhookInfo = await api.getWebhookInfo();

logger.info(`Webhook info for ${me.username}:`);
logger.info(formatWebhookInfo(webhookInfo));
