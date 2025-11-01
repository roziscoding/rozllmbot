import { Api } from "grammy";
import { config } from "../src/config.ts";
import { formatWebhookInfo } from "./utils/webhook-info.ts";

const api = new Api(config.telegram.token);
const me = await api.getMe();
const webhookInfo = await api.getWebhookInfo();

console.log(`Webhook info for ${me.username}:`);
console.log(formatWebhookInfo(webhookInfo));
