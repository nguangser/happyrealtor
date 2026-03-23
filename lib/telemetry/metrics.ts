type LogLevel = "info" | "warn" | "error";

type LogPayload = Record<string, unknown>;

function writeLog(level: LogLevel, message: string, payload?: LogPayload) {
  const entry = {
    level,
    message,
    payload: payload ?? {},
    timestamp: new Date().toISOString(),
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export const logger = {
  info(message: string, payload?: LogPayload) {
    writeLog("info", message, payload);
  },
  warn(message: string, payload?: LogPayload) {
    writeLog("warn", message, payload);
  },
  error(message: string, payload?: LogPayload) {
    writeLog("error", message, payload);
  },
};