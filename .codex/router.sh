#!/bin/bash

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null)"

if [ -z "$ROOT_DIR" ]; then
  echo "Not inside a git repository."
  exit 1
fi

cd "$ROOT_DIR"

echo "Codex Interactive Router"
echo "Type 'exit' to quit."
echo ""

while true; do
  echo -n "> "
  read INPUT

  case "$INPUT" in

    "커밋메세지 딸깍")
      bash ./.codex/skills/commit-message/generate.sh
      echo ""
      ;;

    "exit")
      echo "Bye."
      break
      ;;

    *)
      codex exec "$INPUT"
      echo ""
      ;;
  esac
done