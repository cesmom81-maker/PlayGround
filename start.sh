#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PROJECT_ROOT="$(pwd)"
PORT="${PORT:-3000}"
DIST_DIR="$PROJECT_ROOT/dist"
SITE_DIR="$PROJECT_ROOT/site"
WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
/usr/bin/time -p mkdir -p "$DIST_DIR"
/usr/bin/time -p test -f "$SITE_DIR/index.html"
/usr/bin/time -p cp -f "$SITE_DIR/index.html" "$DIST_DIR/index.html"
/usr/bin/time -p cp -f "$SITE_DIR/brand.jpg" "$DIST_DIR/brand.jpg"
/usr/bin/time -p cp -f "$SITE_DIR/icon.png" "$DIST_DIR/icon.png"
/usr/bin/time -p test -f "$DIST_DIR/index.html"
/usr/bin/time -p mkdir -p "$WEB_DIR"
/usr/bin/time -p bash -c "printf '{\"project\":\"%s\",\"directory\":\"%s\"}' \"$PROJECT_ROOT\" \"$DIST_DIR\" > \"$WEB_DIR/deployment-output.json\""
/usr/bin/time -p cat "$WEB_DIR/deployment-output.json"
/usr/bin/time -p bash -c "echo serving MendsWay static on PORT=$PORT dir=$DIST_DIR"
exec /usr/bin/time -p python3 -m http.server "$PORT" --directory "$DIST_DIR" --bind 0.0.0.0
