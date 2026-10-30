import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "@/lib/logger";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("logger", () => {
  it("prefixes messages with a UTC timestamp and the level", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    logger.info("hello", { id: 1 });
    expect(info).toHaveBeenCalledWith(
      expect.stringMatching(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO\] hello$/),
      { id: 1 },
    );
  });

  it("only logs debug messages when LOG_DEBUG=1", () => {
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});

    vi.stubEnv("LOG_DEBUG", "0");
    logger.debug("hidden");
    expect(debug).not.toHaveBeenCalled();

    vi.stubEnv("LOG_DEBUG", "1");
    logger.debug("shown");
    expect(debug).toHaveBeenCalledWith(expect.stringContaining("[DEBUG] shown"));
  });
});
