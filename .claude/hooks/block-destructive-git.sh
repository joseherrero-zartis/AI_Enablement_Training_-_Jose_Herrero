#!/bin/bash
COMMAND=$(jq -r '.tool_input.command')
if echo "$COMMAND" | grep -qiE 'git\s+(push\s+--force|reset\s+--hard|clean\s+-fd)'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Destructive git command requires manual execution"
    }
  }'
else
  exit 0
fi