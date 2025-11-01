import pino from "pino";
import pretty from "pino-pretty";
import process from "node:process";

const logLevel = Deno.env.get("LOG_LEVEL") || "info";
const isDevelopment = Deno.env.get("ENVIRONMENT") === "development";
const stream = isDevelopment
  ? pretty({
    colorize: true,
    translateTime: "SYS:standard",
    ignore: "pid,hostname",
  })
  : process.stdout;

export const logger = pino({ level: logLevel }, stream);
