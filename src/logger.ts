import pino from "pino";
import pretty from "pino-pretty";

const logLevel = Deno.env.get("LOG_LEVEL") || "info";
const isDevelopment = Deno.env.get("ENVIRONMENT") === "development";
const stream = isDevelopment
  ? pretty({
    colorize: true,
    translateTime: "SYS:standard",
    ignore: "pid,hostname",
    singleLine: true,
  })
  : undefined;

export const logger = pino({ level: logLevel }, stream);
