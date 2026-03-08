"use strict";

const path = require("node:path");
const fs = require("node:fs");
const { execSync } = require("node:child_process");

const BINARY_NAME = process.platform === "win32" ? "gws.exe" : "gws";

/**
 * Resolve the gws binary path using a priority-based search strategy.
 *
 * Search order:
 *   1. GWS_BINARY_PATH environment variable
 *   2. Project-local node_modules/.bin_real/gws
 *   3. Global @googleworkspace/cli package's .bin_real/gws
 *   4. PATH lookup (which/where)
 *
 * @returns {string} Absolute path to the gws binary
 * @throws {Error} If gws binary cannot be found
 */
function resolveBinary() {
  // 1. Explicit environment variable
  const envPath = process.env.GWS_BINARY_PATH;
  if (envPath && isExecutable(envPath)) {
    return envPath;
  }

  // 2. Project-local installation
  const localPath = resolveLocalBinary();
  if (localPath) {
    return localPath;
  }

  // 3. Global npm installation
  const globalPath = resolveGlobalBinary();
  if (globalPath) {
    return globalPath;
  }

  // 4. PATH lookup
  const pathBinary = resolveFromPath();
  if (pathBinary) {
    return pathBinary;
  }

  throw new Error(
    [
      "gws binary not found. Tried:",
      "  1. GWS_BINARY_PATH environment variable",
      "  2. Local node_modules (@googleworkspace/cli)",
      "  3. Global npm installation",
      "  4. PATH lookup",
      "",
      "Install with: npm install -g @googleworkspace/cli",
    ].join("\n")
  );
}

/**
 * Check if a file exists and is executable.
 */
function isExecutable(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Search for gws binary in project-local node_modules.
 */
function resolveLocalBinary() {
  const candidates = [
    // Standard .bin_real location used by @googleworkspace/cli
    path.join(
      process.cwd(),
      "node_modules",
      "@googleworkspace",
      "cli",
      "node_modules",
      ".bin_real",
      BINARY_NAME
    ),
    // Standard node_modules/.bin
    path.join(process.cwd(), "node_modules", ".bin", BINARY_NAME),
  ];

  for (const candidate of candidates) {
    if (isExecutable(candidate)) {
      return candidate;
    }
  }
  return null;
}

/**
 * Search for gws binary in global npm installation.
 */
function resolveGlobalBinary() {
  let globalPrefix;
  try {
    globalPrefix = execSync("npm prefix -g", { encoding: "utf-8" }).trim();
  } catch {
    return null;
  }

  const candidates = [
    // npm global: {prefix}/lib/node_modules/@googleworkspace/cli/node_modules/.bin_real/gws
    path.join(
      globalPrefix,
      "lib",
      "node_modules",
      "@googleworkspace",
      "cli",
      "node_modules",
      ".bin_real",
      BINARY_NAME
    ),
    // Windows global: {prefix}/node_modules/@googleworkspace/cli/node_modules/.bin_real/gws
    path.join(
      globalPrefix,
      "node_modules",
      "@googleworkspace",
      "cli",
      "node_modules",
      ".bin_real",
      BINARY_NAME
    ),
  ];

  for (const candidate of candidates) {
    if (isExecutable(candidate)) {
      return candidate;
    }
  }
  return null;
}

/**
 * Search for gws binary in system PATH.
 */
function resolveFromPath() {
  const command = process.platform === "win32" ? "where gws" : "which gws";
  try {
    const result = execSync(command, { encoding: "utf-8" }).trim();
    // `where` on Windows may return multiple lines; take the first
    const firstLine = result.split("\n")[0].trim();
    if (firstLine && isExecutable(firstLine)) {
      return firstLine;
    }
  } catch {
    // Command not found in PATH
  }
  return null;
}

module.exports = { resolveBinary, isExecutable, BINARY_NAME };
