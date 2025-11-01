import { Composer } from "grammy";
import { BotContext } from "../contex.ts";
import { QueueMessage } from "./queue.ts";

export const inlineQueryHandler = new Composer<BotContext>();

inlineQueryHandler
  .on("inline_query", async (ctx, next) => {
    if (!ctx.inlineQuery.query) return next();

    await ctx.answerInlineQuery([{
      type: "article",
      id: "thinking",
      title: "Ask ChatGPT",
      input_message_content: {
        message_text: ctx.inlineQuery.query,
        entities: [
          {
            type: "bold",
            offset: 0,
            length: ctx.inlineQuery.query.length,
          },
          {
            type: "italic",
            offset: 0,
            length: ctx.inlineQuery.query.length,
          },
        ],
      },
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "...",
              switch_inline_query_current_chat: ctx.inlineQuery.query,
            },
          ],
        ],
      },
    }]);

    return next();
  });

inlineQueryHandler.on("chosen_inline_result", async (ctx, next) => {
  if (!ctx.chosenInlineResult.inline_message_id) return next();

  const userMessage = `<b><i>${ctx.chosenInlineResult.query}</i></b>`;

  await ctx.editMessageText(
    `${userMessage}\nThinking...`,
    {
      parse_mode: "HTML",
    },
  );

  await ctx.kv.enqueue(
    {
      type: "inlineQuery",
      updateId: ctx.update.update_id,
      inlineMessageId: ctx.chosenInlineResult.inline_message_id,
      input: ctx.chosenInlineResult.query,
      from: ctx.from,
    } satisfies QueueMessage,
  );

  return next();
});
