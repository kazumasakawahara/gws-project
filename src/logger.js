"use strict";

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

/**
 * Simple stderr-only logger.
 * MCP protocol requires stdout to be pure JSON-RPC, so all logs go to stderr.
 */
function createLogger(level = "info") {
  const threshold = LEVELS[level] ?? LEVELS.info;
  const prefix = "[gws-mcp]";

  function log(lvl, ...args) {
    if ((LEVELS[lvl] ?? 0) <= threshold) {
      const timestamp = new Date().toISOString();
      process.stderr.write(`${timestamp} ${prefix} ${lvl.toUpperCase()} ${args.join(" ")}\n`);
    }
  }

  return {
    error: (...args) => log("error", ...args),
    warn: (...args) => log("warn", ...args),
    info: (...args) => log("info", ...args),
    debug: (...args) => log("debug", ...args),
  };
}

module.exports = { createLogger };
