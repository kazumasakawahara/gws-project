"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { isJsonRpc } = require("../src/gws-mcp-server");

describe("isJsonRpc", () => {
  it("accepts valid JSON-RPC response", () => {
    const line = '{"jsonrpc":"2.0","id":1,"result":{"capabilities":{}}}';
    assert.equal(isJsonRpc(line), true);
  });

  it("accepts valid JSON-RPC notification", () => {
    const line = '{"jsonrpc":"2.0","method":"notifications/tools/list_changed"}';
    assert.equal(isJsonRpc(line), true);
  });

  it("rejects log lines starting with [", () => {
    assert.equal(isJsonRpc("[2024-03-07] Starting server..."), false);
  });

  it("rejects plain text messages", () => {
    assert.equal(isJsonRpc("Loading services: drive, gmail"), false);
  });

  it("rejects empty strings", () => {
    assert.equal(isJsonRpc(""), false);
  });

  it("rejects whitespace-only strings", () => {
    assert.equal(isJsonRpc("   "), false);
  });

  it("rejects malformed JSON starting with {", () => {
    assert.equal(isJsonRpc("{malformed json without closing"), false);
  });

  it("accepts minimal valid JSON object", () => {
    assert.equal(isJsonRpc("{}"), true);
  });

  it("rejects lines starting with non-brace characters", () => {
    assert.equal(isJsonRpc("Warning: something happened"), false);
  });
});

describe("JSON-RPC filter integration", () => {
  it("correctly classifies mixed gws output", () => {
    const lines = [
      "[2024-03-07T12:00:00Z] Starting MCP server...",
      "Loading services: drive, gmail, calendar...",
      '{"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05"}}',
      "Warning: deprecated API detected",
      '{"jsonrpc":"2.0","method":"notifications/tools/list_changed"}',
      " ",
      "{malformed json without closing",
      '{"jsonrpc":"2.0","id":2,"result":{"tools":[]}}',
      "[info] Connection established",
    ];

    const jsonLines = lines.filter(isJsonRpc);
    assert.equal(jsonLines.length, 3);
    assert.ok(jsonLines.every((l) => l.startsWith("{")));
    assert.ok(jsonLines.every((l) => JSON.parse(l).jsonrpc === "2.0"));
  });
});
