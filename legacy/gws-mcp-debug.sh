#!/bin/bash
LOG_FILE="/Users/k-kawahara/gws-project/gws-mcp-debug.log"
echo "--- MCP Start: $(date) ---" >> "$LOG_FILE"
export GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE="/Users/k-kawahara/.config/gws/credentials.json"
# nodeのパスを通す（nvm環境の場合）
export PATH="/Users/k-kawahara/.nvm/versions/node/v24.13.0/bin:$PATH"

# tee を使って全ての入出力をログに記録しつつ、実際の動作を行う
/Users/k-kawahara/.nvm/versions/node/v24.13.0/bin/gws mcp -s all "$@" 2>> "$LOG_FILE" | tee -a "$LOG_FILE"
