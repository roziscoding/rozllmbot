import { Composer } from "grammy";
import { BotContext } from "../contex.ts";
import { QueueMessage } from "./queue.ts";

export const messageHandler = new Composer<BotContext>();

messageHandler
  .chatType("private")
  .on("msg:text", async (ctx) => {
    ctx.logger.info(
      `Received text message: ${ctx.msg.text} from ${ctx.from?.id}`,
    );
    const message = await ctx.reply("Thinking...", {
      parse_mode: "HTML",
      link_preview_options: {
        is_disabled: true,
      },
    });

    ctx.logger.info("Enqueuing message for LLM invocation");
    await ctx.kv.enqueue(
      {
        type: "llmInvocation",
        updateId: ctx.update.update_id,
        chatId: ctx.chat.id,
        messageId: message.message_id,
        input: ctx.msg.text,
      } satisfies QueueMessage,
    );
  });
