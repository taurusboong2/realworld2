#!/bin/bash

DIFF=$(git diff --cached)

if [ -z "$DIFF" ]; then
  DIFF=$(git diff)
fi

PROMPT=$(cat .codex/skills/commit-message/skill.md)

FULL_PROMPT="$PROMPT

Git Diff:
$DIFF
"

codex exec "$FULL_PROMPT"