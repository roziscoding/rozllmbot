import { Api } from "grammy";
import { config } from "../config.ts";

const api = new Api(config.telegram.token);
const me = await api.getMe();
const webhookInfo = await api.getWebhookInfo();

console.log(`Webhook info for ${me.username}:`);
console.log(`- URL: ${webhookInfo.url}`);
console.log(`- Allowed updates: ${webhookInfo.allowed_updates || "Not set"}`);
console.log(`- Max connections: ${webhookInfo.max_connections || "Not set"}`);
console.log(`- Pending updates: ${webhookInfo.pending_update_count || "Not set"}`);
console.log(`- Last error date: ${webhookInfo.last_error_date || "Not set"}`);
console.log(`- Last error message: ${webhookInfo.last_error_message || "Not set"}`);
