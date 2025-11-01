import { WebhookInfo } from "@grammy/types";

export function formatWebhookInfo(webhookInfo: WebhookInfo): string {
  return `
  - URL: ${webhookInfo.url}
  - Allowed updates: ${webhookInfo.allowed_updates?.join(", ") ?? "Not set"}
  - Max connections: ${webhookInfo.max_connections ?? "Not set"}
  - Pending updates: ${webhookInfo.pending_update_count}
  - Last error date: ${webhookInfo.last_error_date ?? "Never"}
  - Last error message: ${webhookInfo.last_error_message ?? "Never"}
  `;
}
