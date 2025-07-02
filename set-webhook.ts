import { Api } from "grammy";
import { config } from "./config.ts";

const WEBHOOK_URL = Deno.args[0];

if (!WEBHOOK_URL) {
  console.error("Please provide the webhook URL as the first argument.");
  Deno.exit(1);
}

console.log(`Setting webhook to: ${WEBHOOK_URL}`);

const api = new Api(config.telegram.token);
await api.setWebhook(Deno.args[0], { secret_token: config.telegram.secret });
console.log(await api.getMe());
console.log(await api.getWebhookInfo());
