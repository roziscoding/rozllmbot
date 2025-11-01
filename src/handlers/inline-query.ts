import { run } from "@openai/agents";
import { Composer } from "grammy";
import { agent } from "../agent/index.ts";
import { sanitizeTelegramHTML } from "../utils/telegram-html.ts";

export const inlineQueryHandler = new Composer();

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

  const response = await run(agent, ctx.chosenInlineResult.query)
    .then((response) => response.finalOutput)
    .catch((error) => `Error calling ChatGPT: ${error.message}`);

  const sanitizedResponse = response ? sanitizeTelegramHTML(response) : null;

  await ctx.editMessageText(
    sanitizedResponse
      ? `${userMessage}\n\n${sanitizedResponse}`
      : "No response from the agent.",
    {
      parse_mode: "HTML",
      link_preview_options: {
        is_disabled: true,
      },
    },
  )
    .catch(() => {
      return ctx.editMessageText(
        sanitizedResponse
          ? `${userMessage}\n\n${sanitizedResponse}`
          : "No response from the agent.",
      );
    })
    .catch((err) => {
      console.error("Error editing message:", err);
      return ctx.editMessageText(
        `An error occurred while processing your request: ${err.message}`,
      );
    })
    .catch((err) => {
      console.error("Error editing message:", err);
    });

  return next();
});
