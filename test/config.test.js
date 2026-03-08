"use strict";

const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { buildConfig, parseArgs } = require("../src/config");

describe("parseArgs", () => {
  it("parses --services flag", () => {
    const result = parseArgs(["--services", "drive,gmail"]);
    assert.equal(result.services, "drive,gmail");
  });

  it("parses -s shorthand", () => {
    const result = parseArgs(["-s", "sheets"]);
    assert.equal(result.services, "sheets");
  });

  it("parses --credentials flag", () => {
    const result = parseArgs(["--credentials", "/path/to/creds.json"]);
    assert.equal(result.credentials, "/path/to/creds.json");
  });

  it("parses --log-level flag", () => {
    const result = parseArgs(["--log-level", "debug"]);
    assert.equal(result.logLevel, "debug");
  });

  it("returns empty object for no args", () => {
    const result = parseArgs([]);
    assert.deepEqual(result, {});
  });
});

describe("buildConfig", () => {
  const savedEnv = {};

  beforeEach(() => {
    // Save and clear relevant env vars
    for (const key of [
      "GWS_MCP_SERVICES",
      "GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE",
      "GWS_MCP_LOG_LEVEL",
    ]) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    // Restore env vars
    for (const [key, value] of Object.entries(savedEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it("uses defaults when no overrides", () => {
    const config = buildConfig([]);
    assert.equal(config.services, "all");
    assert.equal(config.logLevel, "info");
    assert.ok(config.credentials.includes("credentials.json"));
  });

  it("CLI args override environment variables", () => {
    process.env.GWS_MCP_SERVICES = "drive";
    const config = buildConfig(["--services", "gmail,sheets"]);
    assert.equal(config.services, "gmail,sheets");
  });

  it("environment variables override defaults", () => {
    process.env.GWS_MCP_SERVICES = "calendar";
    const config = buildConfig([]);
    assert.equal(config.services, "calendar");
  });

  it("environment variable for credentials", () => {
    process.env.GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE = "/custom/path.json";
    const config = buildConfig([]);
    assert.equal(config.credentials, "/custom/path.json");
  });
});
