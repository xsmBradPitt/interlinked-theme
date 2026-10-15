#!/usr/bin/env bash
# Interlinked sample — Bash
set -euo pipefail

THEME_DIR="${HOME}/themes"
COUNT=0
NAME='interlinked'

build() {
  local out="$1"
  echo "building ${NAME} into ${out}"
  node scripts/build.mjs | tee "${out}/build.log"
}

if [ -d "$THEME_DIR" ]; then
  for file in "$THEME_DIR"/*.json; do
    COUNT=$((COUNT + 1))
    echo "found: $(basename "$file")"
  done
else
  echo "missing: $THEME_DIR" >&2
  exit 1
fi

build "$THEME_DIR" && grep -c "teal" "$THEME_DIR/build.log"
