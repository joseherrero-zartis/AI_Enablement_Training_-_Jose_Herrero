#!/bin/bash
FILE=$(jq -r '.tool_input.file_path // empty')
case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs) ;;
  *) exit 0 ;;
esac

export NVM_DIR="$HOME/.nvm"
[ -s /opt/homebrew/opt/nvm/nvm.sh ] && . /opt/homebrew/opt/nvm/nvm.sh >/dev/null

cd "$CLAUDE_PROJECT_DIR" || exit 0
if ! OUTPUT=$(npx --no-install eslint --fix "$FILE" 2>&1); then
  echo "ESLint found problems it couldn't fix in $FILE:" >&2
  echo "$OUTPUT" >&2
  exit 2
fi
