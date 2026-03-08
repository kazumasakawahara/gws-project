#!/bin/bash
# gws mcp final wrapper - strictly separate logs from JSON-RPC
export GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE="/Users/k-kawahara/.config/gws/credentials.json"
export PATH="/Users/k-kawahara/.nvm/versions/node/v24.13.0/bin:$PATH"

# sed を使って `[` で始まるデバッグ行を stderr にリダイレクトし、それ以外（JSON-RPC）を stdout に流す
/Users/k-kawahara/.nvm/versions/node/v24.13.0/bin/gws mcp -s all "$@" 2>&1 | while read -r line; do
    if [[ "$line" == \{* ]]; then
        echo "$line"
    else
        echo "$line" >&2
    fi
done
