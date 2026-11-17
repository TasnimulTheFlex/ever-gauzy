#!/usr/bin/env bash
# Publishes the built Base360 Timer for Windows or Linux to time.base360.ai/downloads:
#   - the installers + update metadata in downloads/updates, which running apps poll to update themselves
#   - the same installers (hard links, no second copy) next to the download page, which is pointed at them
# Usage: base360-publish-desktop.sh windows|linux, after `yarn build:desktop-timer:windows` / `:linux`.
# The update metadata (latest.yml / latest-linux.yml) goes up last, so no app sees a version whose installer is still uploading.
set -euo pipefail

PLATFORM="${1:-}"
case "$PLATFORM" in
	windows) FEED=latest.yml; FILES=(x64-@.exe x64-@.exe.blockmap); LABEL=Windows ;;
	linux) FEED=latest-linux.yml; FILES=(x86_64-@.AppImage amd64-@.deb); LABEL=Linux ;;
	*) echo "usage: $0 windows|linux" >&2; exit 2 ;;
esac

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${BASE360_DOWNLOADS_HOST:-ec2-user@18.135.162.36}"
KEY="${BASE360_DOWNLOADS_KEY:-$HOME/.ssh/aws_new_key}"
DIR="gauzy/downloads"
PKG="${BASE360_PACKAGES:-$ROOT/dist/apps/desktop-timer-packages}"
VERSION="$(sed -n 's/^version: //p' "$PKG/$FEED")"
# A failed Angular build still lets electron-builder package the previous output, so make sure this is the version just bumped
EXPECTED="$(sed -n 's/^ *"version": "\(.*\)",/\1/p' "$ROOT/apps/desktop-timer/src/package.json" | head -1)"
[ "$VERSION" = "$EXPECTED" ] || { echo "built $VERSION but package.json says $EXPECTED: the build failed or is stale" >&2; exit 1; }
SSH=(ssh -i "$KEY" -o ServerAliveInterval=15)
RSYNC=(rsync -e "ssh -i $KEY -o ServerAliveInterval=15" --partial --checksum)

NAMES=()
for f in "${FILES[@]}"; do
	name="base360-timer-${f/@/$VERSION}"
	test -f "$PKG/$name" || { echo "missing $name" >&2; exit 1; }
	NAMES+=("$name")
done
INSTALLERS=()
for name in "${NAMES[@]}"; do [[ "$name" == *.blockmap ]] || INSTALLERS+=("$name"); done
echo "Publishing Base360 Timer $VERSION for $LABEL"

"${SSH[@]}" "$HOST" "mkdir -p $DIR/updates"
"${RSYNC[@]}" "${NAMES[@]/#/$PKG/}" "$HOST:$DIR/updates/"

# Check every uploaded file against the local build before any app or visitor is pointed at it
SUMS="$(mktemp)"; trap 'rm -f "$SUMS"' EXIT
(cd "$PKG" && shasum -a 256 "${NAMES[@]}") > "$SUMS"
"${SSH[@]}" "$HOST" "cd $DIR/updates && sha256sum -c --quiet && chmod 644 ${NAMES[*]}" < "$SUMS"
"${SSH[@]}" "$HOST" "cd $DIR && for f in ${INSTALLERS[*]}; do ln -f updates/\$f \$f; done"

"${RSYNC[@]}" "$PKG/$FEED" "$HOST:$DIR/updates/$FEED"
# The page once said "Windows and Linux <version>"; each platform now carries its own version.
"${SSH[@]}" "$HOST" "cd $DIR && cp index.html index.html.bak-before-$PLATFORM-$VERSION && sed -i -E \
	-e 's/Windows and Linux ([0-9.]+) ·/Windows \1 · Linux \1 ·/' \
	$( [ "$PLATFORM" = windows ] \
		&& echo "-e 's/base360-timer-x64-[0-9.]+\.exe/base360-timer-x64-$VERSION.exe/g'" \
		|| echo "-e 's/base360-timer-x86_64-[0-9.]+\.AppImage/base360-timer-x86_64-$VERSION.AppImage/g' -e 's/base360-timer-amd64-[0-9.]+\.deb/base360-timer-amd64-$VERSION.deb/g'" ) \
	-e 's/$LABEL [0-9.]+ ·/$LABEL $VERSION ·/' index.html"

for path in "" "updates/$FEED" "${INSTALLERS[@]}"; do
	echo "$(curl -s -o /dev/null -I -w '%{http_code}' "https://time.base360.ai/downloads/$path") /downloads/$path"
done
curl -s "https://time.base360.ai/downloads/updates/$FEED" | head -1
