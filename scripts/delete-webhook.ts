import { Api } from "grammy";
import { config } from "../src/config.ts";
import { confirmAction } from "./utils/confirm-action.ts";

const api = new Api(config.telegram.token);
const me = await api.getMe();

confirmAction(`Deleting webhook for ${me.username}`);
await api.deleteWebhook({ drop_pending_updates: true });

console.log("Webhook deleted successfully");
