"use strict";

const path = require("node:path");
const os = require("node:os");

/**
 * Generate MCP server configuration templates for different clients.
 */

const binPath = path.resolve(__dirname, "..", "bin", "gws-mcp");

const templates = {
  gemini() {
    return `# Gemini CLI MCP configuration
# Add to your project's config.yaml or ~/.gemini/config.yaml
mcpServers:
  gws:
    command: "node"
    args: ["${binPath}"]
    # Optional: override services (default: all)
    # env:
    #   GWS_MCP_SERVICES: "drive,gmail,calendar,sheets,docs,tasks"
`;
  },

  claude() {
    const config = {
      mcpServers: {
        gws: {
          command: "node",
          args: [binPath],
        },
      },
    };
    return `// Claude Desktop MCP configuration
// Add to: ${getClaudeConfigPath()}
${JSON.stringify(config, null, 2)}
`;
  },
};

function getClaudeConfigPath() {
  if (process.platform === "win32") {
    const appData = process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
    return path.join(appData, "Claude", "claude_desktop_config.json");
  }
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", "Claude", "claude_desktop_config.json");
  }
  return path.join(os.homedir(), ".config", "claude", "claude_desktop_config.json");
}

// CLI entry point
const target = process.argv[2];
if (!target || !templates[target]) {
  console.log("Usage: node config-template.js <gemini|claude>");
  console.log("  gemini  - Generate Gemini CLI config snippet");
  console.log("  claude  - Generate Claude Desktop config snippet");
  process.exit(1);
}

console.log(templates[target]());
