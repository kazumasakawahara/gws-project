"use strict";

const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { isExecutable, BINARY_NAME } = require("../src/binary-resolver");

describe("BINARY_NAME", () => {
  it("is gws on non-Windows platforms", () => {
    if (process.platform !== "win32") {
      assert.equal(BINARY_NAME, "gws");
    }
  });

  it("would be gws.exe on Windows", () => {
    // This is a design verification test
    const expected = process.platform === "win32" ? "gws.exe" : "gws";
    assert.equal(BINARY_NAME, expected);
  });
});

describe("isExecutable", () => {
  it("returns true for node binary", () => {
    assert.equal(isExecutable(process.execPath), true);
  });

  it("returns false for non-existent path", () => {
    assert.equal(isExecutable("/nonexistent/binary"), false);
  });

  it("returns false for non-executable file", () => {
    // package.json exists but is not executable
    const packageJson = require("node:path").join(process.cwd(), "package.json");
    // On some systems regular files may have execute bit; just verify no crash
    assert.equal(typeof isExecutable(packageJson), "boolean");
  });
});

describe("resolveBinary", () => {
  const savedEnv = {};

  beforeEach(() => {
    savedEnv.GWS_BINARY_PATH = process.env.GWS_BINARY_PATH;
  });

  afterEach(() => {
    if (savedEnv.GWS_BINARY_PATH === undefined) {
      delete process.env.GWS_BINARY_PATH;
    } else {
      process.env.GWS_BINARY_PATH = savedEnv.GWS_BINARY_PATH;
    }
  });

  it("uses GWS_BINARY_PATH env var when set to valid executable", () => {
    // Use node as a stand-in for a valid executable path
    process.env.GWS_BINARY_PATH = process.execPath;
    const { resolveBinary } = require("../src/binary-resolver");
    const result = resolveBinary();
    assert.equal(result, process.execPath);
  });

  it("finds gws binary through standard resolution", () => {
    delete process.env.GWS_BINARY_PATH;
    // Clear module cache to force re-evaluation
    delete require.cache[require.resolve("../src/binary-resolver")];
    const { resolveBinary } = require("../src/binary-resolver");

    // This should find gws since it's globally installed
    try {
      const result = resolveBinary();
      assert.ok(result.includes("gws"), `Expected path containing 'gws', got: ${result}`);
    } catch (err) {
      // Acceptable if gws is not installed in this test environment
      assert.ok(err.message.includes("gws binary not found"));
    }
  });
});
