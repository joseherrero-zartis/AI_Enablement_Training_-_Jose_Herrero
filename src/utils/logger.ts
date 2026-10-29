type Level = "DEBUG" | "INFO" | "WARN" | "ERROR";

function format(level: Level, message: string): string {
  return `[${new Date().toISOString()}] [${level}] ${message}`;
}

export const logger = {
  // Read DEBUG on each call so it can be toggled without reloading the module.
  debug(message: string, ...args: unknown[]): void {
    if (!process.env.DEBUG) return;
    console.debug(format("DEBUG", message), ...args);
  },
  info(message: string, ...args: unknown[]): void {
    console.info(format("INFO", message), ...args);
  },
  warn(message: string, ...args: unknown[]): void {
    console.warn(format("WARN", message), ...args);
  },
  error(message: string, ...args: unknown[]): void {
    console.error(format("ERROR", message), ...args);
  },
};
