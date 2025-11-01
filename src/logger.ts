import pino from "pino";
import pretty from "pino-pretty";

const logLevel = Deno.env.get("LOG_LEVEL") || "info";
const isDevelopment = Deno.env.get("ENVIRONMENT") === "development";
const stream = pretty({
  colorize: true,
  translateTime: "SYS:standard",
  ignore: "pid,hostname",
});

export const logger = isDevelopment
  ? pino({ level: logLevel }, stream)
  : pino({ level: logLevel });
