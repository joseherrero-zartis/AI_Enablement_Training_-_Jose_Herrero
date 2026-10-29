// Safe to call from Server Actions, client effects, or Server Components after `await connection()`.
// The timestamp reads the current time, which cacheComponents forbids during a prerender.
type Level = "DEBUG" | "INFO" | "WARN" | "ERROR";

function format(level: Level, message: string): string {
  return `[${new Date().toISOString()}] [${level}] ${message}`;
}

export const logger = {
  // Server only: logs when LOG_DEBUG=1. Browser code never sees LOG_DEBUG, so it never logs there.
  // Read on each call so it can be toggled without reloading the module.
  debug(message: string, ...args: unknown[]): void {
    if (process.env.LOG_DEBUG !== "1") return;
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
