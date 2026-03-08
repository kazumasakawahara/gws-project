#!/bin/bash
# gws-mcp-standalone.sh: Ensure nvm/node paths are fully loaded
# and output is strictly JSON-RPC for stdout.

# Log all startup events and errors to /tmp for visibility
LOG_FILE="/tmp/gws-mcp-system.log"
echo "--- MCP Startup: $(date) ---" >> "$LOG_FILE"

# 1. PATH and Env Setup (Fully hardcoded for reliability)
export PATH="/Users/k-kawahara/.nvm/versions/node/v24.13.0/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE="/Users/k-kawahara/.config/gws/credentials.json"
export HOME="/Users/k-kawahara"

# 2. Command execution
# Use node directly to call the gws binary to avoid ambiguity
GWS_BIN="/Users/k-kawahara/.nvm/versions/node/v24.13.0/bin/gws"

# gws mcp will log its startup messages to stdout/stderr.
# We redirect stderr to our log file and keep stdout for the protocol.
# Use --line-buffered grep to only pass JSON lines to the client.
"$GWS_BIN" mcp -s all 2>> "$LOG_FILE" | grep --line-buffered "^\{"
