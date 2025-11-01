import { Agent, hostedMcpTool, webSearchTool } from "@openai/agents";
import { config } from "../config.ts";
import { agentInstructionsLines } from "./instructions.ts";

export const agent = new Agent({
  name: "LLM Bot",
  instructions: agentInstructionsLines.join("\n\n"),
  tools: [
    webSearchTool(),
    hostedMcpTool({
      serverLabel: "telegram",
      serverUrl: config.telegram.mcp.url,
      headers: {
        Authorization: config.telegram.mcp.authHeader,
      },
      allowedTools: config.telegram.mcp.allowedTools,
    }),
  ],
});
