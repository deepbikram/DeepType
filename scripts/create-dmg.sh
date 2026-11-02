#!/bin/bash
set -euo pipefail

if [[ $# != 2 || ! -d "$1/Contents" || "$2" != *.dmg ]]; then
    echo "Usage: bash scripts/create-dmg.sh DeepType.app output.dmg" >&2
    exit 1
fi
if ! command -v dmgbuild >/dev/null 2>&1; then
    echo "DMG packaging requires dmgbuild (pip install dmgbuild)." >&2
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_PATH="$(cd "$1" && pwd)"
mkdir -p "$(dirname "$2")"
OUTPUT_DIR="$(cd "$(dirname "$2")" && pwd)"
OUTPUT_PATH="$OUTPUT_DIR/$(basename "$2")"
WORK_DIR="$(mktemp -d "$OUTPUT_DIR/.dmg-build.XXXXXX")"
trap 'rm -rf "$WORK_DIR"' EXIT

# ponytail: one headless-safe path (dmgbuild writes .DS_Store directly).
# Finder AppleScript layout is out: Tahoe refuses icon positioning and
# background changes (-10006), and headless CI has no Finder at all.
STAGING="$WORK_DIR/staging"
mkdir -p "$STAGING/.background"
ditto "$APP_PATH" "$STAGING/DeepType.app"
DMG_STAGING="$STAGING" xcrun swift "$SCRIPT_DIR/dmg-background.swift" "$STAGING/.background/background.tiff"
DMG_STAGING="$STAGING" dmgbuild -s "$SCRIPT_DIR/dmg-settings.py" DeepType "$WORK_DIR/DeepType.dmg"
mv -f "$WORK_DIR/DeepType.dmg" "$OUTPUT_PATH"
echo "Created $OUTPUT_PATH"
