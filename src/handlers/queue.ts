import z from "zod";
import { run } from "@openai/agents";
import { Api } from "grammy";
import { sanitizeTelegramHTML } from "../utils/telegram-html.ts";
import { agent } from "../agent/index.ts";
import { logger } from "../logger.ts";

export const BaseQueueMessage = z.object({
  updateId: z.number(),
  input: z.string(),
  from: z.object({
    id: z.number(),
    is_bot: z.boolean(),
    first_name: z.string(),
    last_name: z.string().optional(),
    username: z.string().optional(),
  }),
});

export const ChatMessage = BaseQueueMessage.extend({
  type: z.literal("chat"),
  chatId: z.number(),
  messageId: z.number(),
});

export const InlineQueryMessage = BaseQueueMessage.extend({
  type: z.literal("inlineQuery"),
  inlineMessageId: z.string(),
});

export const QueueMessage = z.discriminatedUnion("type", [
  ChatMessage,
  InlineQueryMessage,
]);

export type QueueMessage = z.infer<typeof QueueMessage>;

export function registerQueueHandlers(kv: Deno.Kv, api: Api) {
  kv.listenQueue(async (event) => {
    const childLogger = logger.child({
      updateId: event.updateId,
      from: event.from,
    });
    childLogger.info({ eventType: event.type }, "Processing queue message");
    const message = QueueMessage.parse(event);

    childLogger.info("Calling ChatGPT");
    const response = await run(agent, message.input)
      .then((response) => response.finalOutput)
      .catch((error) => `Error calling ChatGPT: ${error.message}`);

    childLogger.info("Got response from ChatGPT. Sanitizing...");
    const sanitizedResponse = response
      ? sanitizeTelegramHTML(response)
      : "No response from the agent.";

    childLogger.info("Editing message in Telegram");

    if (message.type === "chat") {
      await api.editMessageText(
        message.chatId,
        message.messageId,
        sanitizedResponse,
        {
          parse_mode: "HTML",
          link_preview_options: {
            is_disabled: true,
          },
        },
      );

      return;
    }

    const inlineResponse = [
      `<blockquote>${message.input}</blockquote>`,
      sanitizedResponse,
    ].join("\n");

    await api.editMessageTextInline(
      message.inlineMessageId,
      inlineResponse,
      {
        parse_mode: "HTML",
        link_preview_options: {
          is_disabled: true,
        },
      },
    );
  });
}
