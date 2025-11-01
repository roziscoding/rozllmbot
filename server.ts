import { webhookCallback } from "grammy";
import { bot } from "./src/bot.ts";

const TELETGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
if (!TELETGRAM_BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN environment variable is not set.");
}

const handleUpdate = webhookCallback(bot, "std/http", {
  secretToken: TELETGRAM_BOT_TOKEN.replace(/[^a-z0-9]*/ig, ""),
});

Deno.serve({
  onListen: ({ port }) => {
    console.log(`Listening on port ${port}`);
  },
}, async (req) => {
  if (req.method === "POST") {
    return await handleUpdate(req);
  }

  return new Response();
});
