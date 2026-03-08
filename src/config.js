"use strict";

const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

/**
 * Default credentials file path per platform.
 */
function defaultCredentialsPath() {
  if (process.platform === "win32") {
    const appData = process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
    return path.join(appData, "gws", "credentials.json");
  }
  return path.join(os.homedir(), ".config", "gws", "credentials.json");
}

/**
 * Load configuration from config file if it exists.
 */
function loadConfigFile() {
  const candidates = [
    // Project-local config
    path.join(process.cwd(), "gws-mcp.config.json"),
    // User-level config
    process.platform === "win32"
      ? path.join(
          process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"),
          "gws-mcp",
          "config.json"
        )
      : path.join(os.homedir(), ".config", "gws-mcp", "config.json"),
  ];

  for (const configPath of candidates) {
    try {
      const content = fs.readFileSync(configPath, "utf-8");
      return JSON.parse(content);
    } catch {
      // File doesn't exist or is invalid; try next
    }
  }
  return {};
}

/**
 * Parse command-line arguments.
 */
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--services":
      case "-s":
        args.services = argv[++i];
        break;
      case "--credentials":
        args.credentials = argv[++i];
        break;
      case "--log-level":
        args.logLevel = argv[++i];
        break;
    }
  }
  return args;
}

/**
 * Build the final configuration.
 *
 * Priority (highest first):
 *   1. Command-line arguments
 *   2. Environment variables
 *   3. Config file
 *   4. Defaults
 */
function buildConfig(argv = []) {
  const cliArgs = parseArgs(argv);
  const fileConfig = loadConfigFile();

  return {
    services:
      cliArgs.services ||
      process.env.GWS_MCP_SERVICES ||
      fileConfig.services ||
      "all",

    credentials:
      cliArgs.credentials ||
      process.env.GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE ||
      fileConfig.credentials ||
      defaultCredentialsPath(),

    logLevel:
      cliArgs.logLevel ||
      process.env.GWS_MCP_LOG_LEVEL ||
      fileConfig.logLevel ||
      "info",
  };
}

module.exports = { buildConfig, defaultCredentialsPath, parseArgs };
