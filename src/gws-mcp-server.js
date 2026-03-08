"use strict";

const { spawn } = require("node:child_process");
const readline = require("node:readline");
const fs = require("node:fs");
const { resolveBinary } = require("./binary-resolver");
const { buildConfig } = require("./config");
const { createLogger } = require("./logger");

/**
 * Check if a string is valid JSON-RPC (starts with { and parses as JSON).
 */
function isJsonRpc(line) {
  if (!line.startsWith("{")) return false;
  try {
    JSON.parse(line);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate that required dependencies are available.
 */
function preflight(config, logger) {
  // Check credentials file
  if (!fs.existsSync(config.credentials)) {
    logger.warn(
      `Credentials file not found: ${config.credentials}`,
      "\n  Run: gws auth login"
    );
  }

  // Check Node.js version
  const [major] = process.versions.node.split(".").map(Number);
  if (major < 18) {
    logger.error(`Node.js 18+ required. Current: ${process.versions.node}`);
    process.exit(1);
  }
}

/**
 * Start the MCP server bridge.
 */
function start(argv = []) {
  const config = buildConfig(argv);
  const logger = createLogger(config.logLevel);

  logger.info("Starting gws-mcp-server...");
  logger.debug(`Config: services=${config.services}, credentials=${config.credentials}`);

  // Resolve binary
  let binaryPath;
  try {
    binaryPath = resolveBinary();
    logger.info(`Binary: ${binaryPath}`);
  } catch (err) {
    logger.error(err.message);
    process.exit(1);
  }

  // Preflight checks
  preflight(config, logger);

  // Spawn the gws binary with controlled stdio
  const env = {
    ...process.env,
    GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE: config.credentials,
  };

  const child = spawn(binaryPath, ["mcp", "-s", config.services], {
    stdio: ["pipe", "pipe", "pipe"],
    env,
    cwd: process.cwd(),
  });

  // Pipe stdin from MCP client to gws process
  process.stdin.pipe(child.stdin);

  // Filter stdout: only pass valid JSON-RPC lines
  const rl = readline.createInterface({ input: child.stdout, crlfDelay: Infinity });
  rl.on("line", (line) => {
    if (isJsonRpc(line)) {
      process.stdout.write(line + "\n");
    } else if (line.trim()) {
      logger.debug(`[gws stdout] ${line}`);
    }
  });

  // Forward child stderr to our stderr
  const rlErr = readline.createInterface({ input: child.stderr, crlfDelay: Infinity });
  rlErr.on("line", (line) => {
    if (line.trim()) {
      logger.debug(`[gws stderr] ${line}`);
    }
  });

  // Handle child process exit
  child.on("error", (err) => {
    logger.error(`Failed to start gws: ${err.message}`);
    process.exit(1);
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      logger.info(`gws process killed by signal ${signal}`);
    } else if (code !== 0) {
      logger.error(`gws process exited with code ${code}`);
    } else {
      logger.info("gws process exited normally");
    }
    process.exit(code ?? 1);
  });

  // Graceful shutdown: forward signals to child
  const shutdown = (signal) => {
    logger.info(`Received ${signal}, shutting down...`);
    child.kill(signal);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Handle parent stdin close (MCP client disconnected)
  process.stdin.on("end", () => {
    logger.info("stdin closed (client disconnected), shutting down...");
    child.kill("SIGTERM");
  });
}

module.exports = { start, isJsonRpc };
