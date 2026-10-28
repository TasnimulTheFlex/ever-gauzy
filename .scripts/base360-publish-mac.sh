#!/usr/bin/env bash
# Publishes the built Base360 Timer for macOS to time.base360.ai/downloads:
#   - the DMGs for new installs (and points the download page at them)
#   - the zips + latest-mac.yml in downloads/updates, which running apps poll to update themselves
# Run after `yarn build:desktop-timer:mac`. latest-mac.yml goes up last, so no app sees a version whose zip is still uploading.
set -euo pipefail

HOST="${BASE360_DOWNLOADS_HOST:-ec2-user@18.135.162.36}"
KEY="${BASE360_DOWNLOADS_KEY:-$HOME/.ssh/aws_new_key}"
DIR="gauzy/downloads"
PKG="$(cd "$(dirname "$0")/.." && pwd)/dist/apps/desktop-timer-packages"
VERSION="$(sed -n 's/^version: //p' "$PKG/latest-mac.yml")"
# A failed Angular build still lets electron-builder package the previous output, so make sure this is the version just bumped
EXPECTED="$(sed -n 's/^ *"version": "\(.*\)",/\1/p' "$PKG/../../../apps/desktop-timer/src/package.json" | head -1)"
[ "$VERSION" = "$EXPECTED" ] || { echo "built $VERSION but package.json says $EXPECTED: the build failed or is stale" >&2; exit 1; }
SSH=(ssh -i "$KEY" -o ServerAliveInterval=15)
RSYNC=(rsync -e "ssh -i $KEY -o ServerAliveInterval=15" --partial --checksum)

for arch in arm64 x64; do
	for ext in dmg zip zip.blockmap; do
		test -f "$PKG/base360-timer-$arch-$VERSION.$ext" || { echo "missing base360-timer-$arch-$VERSION.$ext" >&2; exit 1; }
	done
done
echo "Publishing Base360 Timer $VERSION for macOS"

"${SSH[@]}" "$HOST" "mkdir -p $DIR/updates"
"${RSYNC[@]}" "$PKG"/base360-timer-{arm64,x64}-"$VERSION".dmg "$HOST:$DIR/"
"${RSYNC[@]}" "$PKG"/base360-timer-{arm64,x64}-"$VERSION".{zip,zip.blockmap} "$HOST:$DIR/updates/"

# Check every uploaded file against the local build before any app or visitor is pointed at it
SUMS="$(mktemp)"; trap 'rm -f "$SUMS"' EXIT
(cd "$PKG" && shasum -a 256 base360-timer-{arm64,x64}-"$VERSION".dmg) > "$SUMS"
(cd "$PKG" && shasum -a 256 base360-timer-{arm64,x64}-"$VERSION".{zip,zip.blockmap} | sed 's#  #  updates/#') >> "$SUMS"
"${SSH[@]}" "$HOST" "cd $DIR && sha256sum -c --quiet" < "$SUMS"

"${RSYNC[@]}" "$PKG/latest-mac.yml" "$HOST:$DIR/updates/latest-mac.yml"
"${SSH[@]}" "$HOST" "cd $DIR && cp index.html index.html.bak-before-$VERSION && sed -i -E \
	-e 's/base360-timer-(arm64|x64)-[0-9.]+\.dmg/base360-timer-\1-$VERSION.dmg/g' \
	-e 's/macOS [0-9.]+ ·/macOS $VERSION ·/' index.html"

for path in "" "updates/latest-mac.yml" "base360-timer-arm64-$VERSION.dmg" "updates/base360-timer-arm64-$VERSION.zip"; do
	echo "$(curl -s -o /dev/null -w '%{http_code}' "https://time.base360.ai/downloads/$path") /downloads/$path"
done
curl -s https://time.base360.ai/downloads/updates/latest-mac.yml | head -1
