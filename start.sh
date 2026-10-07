#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PROJECT_DIR="$(pwd)"
PORT="${PORT:-3000}"
DIST_DIR="$PROJECT_DIR/dist"
WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
DEPLOY_OUT="$WEB_DIR/deployment-output.json"
/usr/bin/time -p mkdir -p "$WEB_DIR"
/usr/bin/time -p test -f package.json
if /usr/bin/time -p test -f package-lock.json; then
  if ! /usr/bin/time -p test -d node_modules/.bin; then
    /usr/bin/time -p npm ci --no-audit --no-fund
  fi
else
  if ! /usr/bin/time -p test -d node_modules/vite; then
    /usr/bin/time -p npm install --no-audit --no-fund
  fi
fi
NEED_BUILD=0
if ! /usr/bin/time -p test -f "$DIST_DIR/index.html"; then
  NEED_BUILD=1
elif /usr/bin/time -p test package.json -nt "$DIST_DIR/index.html"; then
  NEED_BUILD=1
elif /usr/bin/time -p find src index.html vite.config.ts public -newer "$DIST_DIR/index.html" -print -quit 2>/dev/null | /usr/bin/time -p grep -q .; then
  NEED_BUILD=1
fi
if [ "$NEED_BUILD" = "1" ]; then
  /usr/bin/time -p npm run build
fi
/usr/bin/time -p test -f "$DIST_DIR/index.html"
/usr/bin/time -p mkdir -p "$(dirname "$DEPLOY_OUT")"
/usr/bin/time -p node -e 'const fs=require("fs");const out=process.argv[1];const payload={project:process.argv[2],directory:process.argv[3]};fs.writeFileSync(out,JSON.stringify(payload));' "$DEPLOY_OUT" "$PROJECT_DIR" "$DIST_DIR"
/usr/bin/time -p cat "$DEPLOY_OUT"
echo "Serving $DIST_DIR on PORT=$PORT"
/usr/bin/time -p node scripts/serve.mjs "$DIST_DIR"
