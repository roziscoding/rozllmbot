import { Api } from "grammy";
import { config } from "../src/config.ts";
import { confirmAction } from "./utils/confirm-action.ts";
import { formatWebhookInfo } from "./utils/webhook-info.ts";
import { logger } from "../src/logger.ts";

const WEBHOOK_URL = Deno.args[0];

if (!WEBHOOK_URL) {
  console.error("Please provide the webhook URL as the first argument.");
  Deno.exit(1);
}

const api = new Api(config.telegram.token);
const me = await api.getMe();

confirmAction(`Setting webhook to: ${WEBHOOK_URL} for ${me.username}`);

await api.setWebhook(Deno.args[0], {
  secret_token: config.telegram.secret,
  drop_pending_updates: true,
});

const webhookInfo = await api.getWebhookInfo();
logger.info(`Webhook info for ${me.username}:`);
logger.info(formatWebhookInfo(webhookInfo));
