import { Api } from "grammy";
import { config } from "../config.ts";
import { confirmAction } from "./utils/confirm-action.ts";

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
console.log(`Webhook info for ${me.username}:`);
console.log(`- URL: ${webhookInfo.url}`);
console.log(`- Allowed updates: ${webhookInfo.allowed_updates || "Not set"}`);
console.log(`- Max connections: ${webhookInfo.max_connections || "Not set"}`);
console.log(`- Pending updates: ${webhookInfo.pending_update_count || "Not set"}`);
console.log(`- Last error date: ${webhookInfo.last_error_date || "Not set"}`);
console.log(`- Last error message: ${webhookInfo.last_error_message || "Not set"}`);
