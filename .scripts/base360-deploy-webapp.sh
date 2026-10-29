#!/usr/bin/env bash
# Builds the Base360 web app and deploys it to time.base360.ai.
#
# The server (2 CPUs, 3 GB) cannot compile the app, so the bundle is built here (this Mac or a CI runner) and shipped as a
# tarball. On the server a small image is derived from the base webapp image: same nginx, entrypoint and runtime
# placeholder substitution, only the compiled site replaced. The previous image stays tagged for a one-line rollback.
#   SKIP_BUILD=1   deploy the existing dist/apps/gauzy without rebuilding
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${BASE360_DOWNLOADS_HOST:-ec2-user@18.135.162.36}"
KEY="${BASE360_DOWNLOADS_KEY:-$HOME/.ssh/aws_new_key}"
BASE_IMAGE="${BASE360_WEBAPP_BASE_IMAGE:-base360-time-webapp:bf26d77187}"
COMMIT="$(git -C "$ROOT" rev-parse --short=10 HEAD)"
SSH=(ssh -i "$KEY" -o ServerAliveInterval=15)

if [ "${SKIP_BUILD:-}" != "1" ]; then
	# The Docker build's ENV lines are the source of truth for the build-time settings
	eval "$(python3 - "$ROOT/.deploy/webapp/Dockerfile" <<'EOF'
import re, shlex, sys
lines = open(sys.argv[1]).read().splitlines()
start = next(i for i, l in enumerate(lines) if re.match(r'FROM .* AS build', l))
defaults = {'NODE_ENV': 'production', 'DEMO': 'false', 'NX_BRANCH': 'base360'}
for l in lines[start:]:
    if l.startswith('FROM ') and ' AS build' not in l:
        break
    m = re.match(r'\s*ENV\s+(\w+)=(.*)$', l)
    if not m or m.group(1) == 'NODE_OPTIONS':
        continue
    v = re.sub(r'\$\{(\w+):-"?([^}"]*)"?\}', lambda x: defaults.get(x.group(1), x.group(2)), m.group(2).strip())
    v = re.sub(r'\$\{(\w+)\}', lambda x: defaults.get(x.group(1), ''), v).strip('"')
    print(f'export {m.group(1)}={shlex.quote(v)}')
EOF
)"
	export NODE_OPTIONS="--max-old-space-size=${WEBAPP_BUILD_MEMORY_MB:-12288}" GAUZY_APP_COMMIT="$COMMIT"
	(cd "$ROOT" && yarn build:gauzy:prod:docker)
fi

DIST="$ROOT/dist/apps/gauzy"
test -f "$DIST/index.html" || { echo "no build in $DIST" >&2; exit 1; }
TARBALL="$(mktemp -d)/webapp-$COMMIT.tgz"
trap 'rm -rf "$(dirname "$TARBALL")"' EXIT
COPYFILE_DISABLE=1 tar -C "$ROOT/dist/apps" -czf "$TARBALL" gauzy
SUM="$(shasum -a 256 "$TARBALL" | cut -c1-64)"
scp -q -i "$KEY" -o ServerAliveInterval=15 "$TARBALL" "$HOST:/tmp/webapp-$COMMIT.tgz"

"${SSH[@]}" "$HOST" bash -s -- "$COMMIT" "$SUM" "$BASE_IMAGE" <<'REMOTE'
set -euo pipefail
COMMIT="$1"; SUM="$2"; BASE_IMAGE="$3"; TARBALL="/tmp/webapp-$COMMIT.tgz"
[ "$(sha256sum "$TARBALL" | cut -c1-64)" = "$SUM" ] || { echo "upload checksum mismatch" >&2; exit 1; }
BUILD="$(mktemp -d)"; trap 'rm -rf "$BUILD" "$TARBALL"' EXIT
tar -C "$BUILD" -xzf "$TARBALL" 2>/dev/null
cat > "$BUILD/Dockerfile" <<EOF
FROM $BASE_IMAGE
RUN find /srv/gauzy -mindepth 1 -maxdepth 1 ! -name "entrypoint*.sh" ! -name wait ! -name replacements.sed -exec rm -rf {} +
COPY --chown=nginx:nginx gauzy/ /srv/gauzy/
EOF
docker build -q -t "base360-time-webapp:$COMMIT" "$BUILD" >/dev/null
cd ~/gauzy
PREVIOUS="$(grep -oE 'base360-time-webapp:[0-9a-f]+' docker-compose.yml | head -1)"
sed -i -E "s#image: base360-time-webapp:[0-9a-f]+#image: base360-time-webapp:$COMMIT#" docker-compose.yml
docker compose up -d --no-deps webapp
echo "deployed base360-time-webapp:$COMMIT (previous: $PREVIOUS)"
REMOTE

for i in $(seq 1 24); do
	[ "$(curl -s -o /dev/null -w '%{http_code}' https://time.base360.ai/)" = 200 ] && break
	sleep 5
done
LIVE="$(curl -s https://time.base360.ai/ | grep -o 'main\.[0-9a-f]*\.js' | head -1)"
BUILT="$(ls "$DIST" | grep -E '^main\.[0-9a-f]+\.js$')"
[ "$LIVE" = "$BUILT" ] || { echo "live site serves $LIVE, expected $BUILT" >&2; exit 1; }
echo "time.base360.ai serves $LIVE"
