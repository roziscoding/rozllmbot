import pino from "pino";

const logLevel = Deno.env.get("LOG_LEVEL") || "info";
const isDevelopment = Deno.env.get("ENVIRONMENT") === "development";

// Define a common logger interface that both implementations will follow
type LogMethod = (obj: object, msg?: string, ...args: unknown[]) => void;
type LogMethodSimple = (msg: string, ...args: unknown[]) => void;

interface Logger {
  trace: LogMethod & LogMethodSimple;
  debug: LogMethod & LogMethodSimple;
  info: LogMethod & LogMethodSimple;
  warn: LogMethod & LogMethodSimple;
  error: LogMethod & LogMethodSimple;
  fatal: LogMethod & LogMethodSimple;
  silent: LogMethod & LogMethodSimple;
  child: (bindings: Record<string, unknown>) => Logger;
}

// Log level priority mapping
const LOG_LEVELS: Record<string, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
  silent: Infinity,
};

const consoleLogger = (
  bindings: Record<string, unknown> = {},
  levelName: string = logLevel,
): Logger => {
  const currentLevel = LOG_LEVELS[levelName] ?? LOG_LEVELS.info;

  function shouldLog(level: string): boolean {
    return LOG_LEVELS[level] >= currentLevel;
  }

  function formatMessage(
    level: string,
    objOrMsg: object | string,
    msg?: string,
    ..._args: unknown[]
  ): string {
    const timestamp = Date.now();
    const levelValue = LOG_LEVELS[level];

    let message: string;
    let mergedBindings = { ...bindings };

    // Handle pino-style object-first logging
    if (typeof objOrMsg === "object" && objOrMsg !== null) {
      mergedBindings = { ...bindings, ...objOrMsg };
      message = msg ?? "";
    } else {
      message = String(objOrMsg);
    }

    // Build pino-compatible JSON log entry
    const logEntry: Record<string, unknown> = {
      level: levelValue,
      time: timestamp,
      ...mergedBindings,
    };

    if (message) {
      logEntry.msg = message;
    }

    return JSON.stringify(logEntry);
  }

  function createLogMethod(
    level: string,
    consoleFn: (...args: unknown[]) => void,
  ): LogMethod & LogMethodSimple {
    return ((objOrMsg: object | string, msg?: string, ...args: unknown[]) => {
      if (!shouldLog(level)) return;

      const formattedMsg = formatMessage(level, objOrMsg, msg, ...args);
      consoleFn(formattedMsg);
    }) as LogMethod & LogMethodSimple;
  }

  return {
    trace: createLogMethod("trace", console.debug),
    debug: createLogMethod("debug", console.debug),
    info: createLogMethod("info", console.info),
    warn: createLogMethod("warn", console.warn),
    error: createLogMethod("error", console.error),
    fatal: createLogMethod("fatal", console.error),
    silent: () => {}, // Silent level never logs
    child: (childBindings: Record<string, unknown>) =>
      consoleLogger({ ...bindings, ...childBindings }, levelName),
  };
};

// Create logger based on environment
async function createLogger(): Promise<Logger> {
  if (isDevelopment) {
    try {
      // Dynamically import pino-pretty only in development
      const pretty = await import("pino-pretty");
      const stream = pretty.default({
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      });

      return pino({ level: logLevel }, stream) as Logger;
    } catch (error) {
      // Fallback to regular pino if pino-pretty fails
      console.warn(
        "Failed to load pino-pretty, falling back to standard pino:",
        error,
      );
      return pino({ level: logLevel }) as Logger;
    }
  }

  return consoleLogger();
}

export const logger = await createLogger();
