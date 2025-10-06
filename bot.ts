import { Agent, run, webSearchTool } from "@openai/agents";
import { Bot, Composer } from "grammy";
import { config } from "./config.ts";

const TELEGRAM_HTML_INSTRUCTIONS = `
<b>bold</b>
<i>italic</i>
<u>underline</u>
<s>strikethrough</s>
<tg-spoiler>spoiler</tg-spoiler>
<a href="http://www.example.com/">inline URL</a>
<code>inline fixed-width code</code>
<pre>pre-formatted fixed-width code block</pre>
<pre><code class="language-python">pre-formatted fixed-width code block written in the Python programming language</code></pre>
<blockquote>Block quotation started\nBlock quotation continued\nThe last line of the block quotation</blockquote>
<blockquote expandable>Expandable block quotation started\nExpandable block quotation continued\nExpandable block quotation continued\nHidden by default part of the block quotation started\nExpandable block quotation continued\nThe last line of the block quotation</blockquote>

Rules:
- Only the tags mentioned above are currently supported.
- All <, > and & symbols that are not a part of a tag or an HTML entity must be replaced with the corresponding HTML entities (< with &lt;, > with &gt; and & with &amp;).
- All numerical HTML entities are supported.
- The API currently supports only the following named HTML entities: &lt;, &gt;, &amp; and &quot;.
- Use nested pre and code tags, to define programming language for pre entity.
- Programming language can't be specified for standalone code tags.
- Use \\n to create new lines.
`;

const agentInstructionsLines = [
  "You are a helpful assistant being called by a user through an inline query in Telegram.",
  "When formatting your responses, use HTML formatting as described below:",
  TELEGRAM_HTML_INSTRUCTIONS,
  "Do not use any HTML that that's not on the list.",
  "Do not use Markdown, as it will not be rendered correctly.",
  "Respond to the user's query in a concise and informative manner. If the user asks for help, provide relevant information or instructions.",
  "You are allowed to be a bit sassy and even use curse words, but do not overdo it.",
];

const agent = new Agent({
  name: "LLM Bot",
  instructions: agentInstructionsLines.join("\n\n"),
  tools: [webSearchTool()],
});

export const bot = new Bot(config.telegram.token);
const composer = bot.filter((ctx) => ctx.from?.id === 16715013);

composer.on("inline_query", async (ctx, next) => {
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

composer.on("chosen_inline_result", async (ctx, next) => {
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

  await ctx.editMessageText(
    response ? `${userMessage}\n\n${response}` : "No response from the agent.",
    {
      parse_mode: "HTML",
      link_preview_options: {
        is_disabled: true,
      },
    },
  )
    .catch(() => {
      return ctx.editMessageText(
        response
          ? `${userMessage}\n\n${response}`
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

composer
  .chatType("private")
  .on("msg:text", async (ctx) => {
    await ctx.replyWithChatAction("typing");

    const response = await run(agent, ctx.msg.text)
      .then((response) => response.finalOutput)
      .catch((error) => `Error calling ChatGPT: ${error.message}`);

    return ctx.reply(response ? response : "No response from the agent.", {
      parse_mode: "HTML",
      link_preview_options: {
        is_disabled: true,
      },
    }).catch((err) => {
      console.error("Error replying to message:", err);
      return ctx.reply(
        `An error occurred while processing your request: ${err.message}`,
      );
    });
  });

bot.use(composer);
