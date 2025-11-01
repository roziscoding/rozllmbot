import z from "zod";
import { Agent, run } from "@openai/agents";
import { Api } from "grammy";
import { sanitizeTelegramHTML } from "../utils/telegram-html.ts";
import { agent } from "../agent/index.ts";
import { logger } from "../logger.ts";

export const LLMInvocationMessage = z.object({
  type: z.literal("llmInvocation"),
  updateId: z.number(),
  chatId: z.number(),
  messageId: z.number(),
  input: z.string(),
});

export const QueueMessage = z.discriminatedUnion("type", [
  LLMInvocationMessage,
]);
export type QueueMessage = z.infer<typeof QueueMessage>;

async function handleLLMInvocation(
  agent: Agent,
  api: Api,
  message: QueueMessage,
) {
  logger.info("Calling ChatGPT");
  const response = await run(agent, message.input)
    .then((response) => response.finalOutput)
    .catch((error) => `Error calling ChatGPT: ${error.message}`);

  logger.info("Got response from ChatGPT. Sanitizing...");
  const sanitizedResponse = response
    ? sanitizeTelegramHTML(response)
    : "No response from the agent.";

  logger.info("Editing message in Telegram");
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
}

export function registerQueueHandlers(kv: Deno.Kv, api: Api) {
  kv.listenQueue(async (event) => {
    logger.info({ eventType: event.type }, "Processing queue message");
    const message = QueueMessage.parse(event);
    switch (message.type) {
      case "llmInvocation":
        await handleLLMInvocation(agent, api, message);
        break;
    }
  });
}
