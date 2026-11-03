#!/bin/bash
set -uo pipefail
cd "$(dirname "$0")/.."

sig() {
  find Sources Resources Package.swift -type f -exec stat -f '%m %N' {} + 2>/dev/null | sort | md5
}

rebuild() {
  if scripts/build-app.sh debug; then
    pkill -f '.build/.*/DeepType.app/Contents/MacOS/DeepType' 2>/dev/null
    sleep 0.3
    open .build/debug/DeepType.app
  else
    echo "build failed — keeping last running app"
  fi
}

last=$(sig)
rebuild
echo "watching Sources/ Resources/ Package.swift — Ctrl-C to stop"
while sleep 2; do
  cur=$(sig)
  if [ "$cur" != "$last" ]; then
    last="$cur"
    sleep 0.5
    rebuild
  fi
done
