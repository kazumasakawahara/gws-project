#!/bin/bash
export GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE="/Users/k-kawahara/.config/gws/credentials.json"
export PATH="/Users/k-kawahara/.nvm/versions/node/v24.13.0/bin:$PATH"

# stdoutからJSON({で始まる)のみを抽出し、それ以外(デバッグログ)はstderrにリダイレクトする
# --line-buffered でGemini CLIとの通信遅延を防ぐ
/Users/k-kawahara/.nvm/versions/node/v24.13.0/bin/gws mcp -s all "$@" 2>&1 | grep --line-buffered "^\{"
