#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
configuration="${1:-debug}"
architecture="${2:-$(uname -m)}"
if [[ $# -gt 2 || ( "$configuration" != debug && "$configuration" != release ) || ( "$architecture" != arm64 && "$architecture" != x86_64 ) ]]; then
    echo 'Usage: scripts/build-app.sh [debug|release] [arm64|x86_64]' >&2
    exit 2
fi
swift build -c "$configuration" --arch "$architecture" --product DeepType
binary_dir="$(swift build -c "$configuration" --arch "$architecture" --show-bin-path)"
app="$binary_dir/DeepType.app"
mkdir -p "$app/Contents/MacOS" "$app/Contents/Resources" "$app/Contents/Frameworks"
# SwiftPM checkout licenses/resources can be read-only after the first copy.
chmod -R u+w "$app"
cp "$binary_dir/DeepType" "$app/Contents/MacOS/DeepType"
cp Resources/Info.plist "$app/Contents/Info.plist"
version="$(tr -d '[:space:]' < VERSION)"
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $version" -c "Set :CFBundleVersion $version" "$app/Contents/Info.plist"
icon_sources=(Sources/DeepType/Design/BrandMark.swift scripts/render-app-icon.swift)
icon=.build/AppIcon.icns
if [[ -f Resources/Branding/AppIcon-1024.png ]] && [[ ! -f "$icon" || Resources/Branding/AppIcon-1024.png -nt "$icon" ]]; then
    iconset="$(mktemp -d)/AppIcon.iconset"
    mkdir -p "$iconset"
    # ponytail: sips from the gathered D-mark PNG instead of the SwiftUI BrandMark render.
    for points in 16 32 128 256 512; do
        for scale in 1 2; do
            pixels=$((points * scale))
            name="icon_${points}x${points}"
            [[ "$scale" == 2 ]] && name="${name}@2x"
            sips -s format png -Z "$pixels" Resources/Branding/AppIcon-1024.png --out "$iconset/$name.png" >/dev/null
        done
    done
    iconutil -c icns "$iconset" -o "$icon"
elif [[ ! -f "$icon" || "${icon_sources[0]}" -nt "$icon" || "${icon_sources[1]}" -nt "$icon" ]]; then
    iconset="$(mktemp -d)/AppIcon.iconset"
    swiftc -parse-as-library "${icon_sources[@]}" -o .build/render-app-icon
    .build/render-app-icon "$iconset"
    iconutil -c icns "$iconset" -o "$icon"
fi
cp "$icon" "$app/Contents/Resources/AppIcon.icns"
# ponytail: ship the gathered D-mark + mascot PNGs so About/Onboarding can show them.
if [[ -d Resources/Branding ]]; then
    mkdir -p "$app/Contents/Resources/Branding"
    cp Resources/Branding/*.png Resources/Branding/*.svg "$app/Contents/Resources/Branding/"
fi
rm -rf "$app/Contents/Resources/Licenses" "$app/Contents/Resources/DeepType_DeepType.bundle" "$app/Contents/MacOS/FluidAudio_FluidAudio.bundle" "$app/Contents/MacOS/DeepType_DeepType.bundle" "$app/Contents/Frameworks/Sparkle.framework" "$app/Contents/Frameworks/llama.framework"
ditto "$binary_dir/Sparkle.framework" "$app/Contents/Frameworks/Sparkle.framework"
ditto "$binary_dir/llama.framework" "$app/Contents/Frameworks/llama.framework"
rm -rf "$app/Contents/Frameworks/Sparkle.framework/Versions/B/XPCServices" "$app/Contents/Frameworks/Sparkle.framework/XPCServices"
mkdir -p "$app/Contents/Resources/Licenses"
cp LICENSE "$app/Contents/Resources/Licenses/DeepType-Apache-2.0.txt"
cp Resources/Licenses/codex-asr-MIT.txt "$app/Contents/Resources/Licenses/codex-asr-MIT.txt"
cp .build/checkouts/argmax-oss-swift/LICENSE "$app/Contents/Resources/Licenses/Argmax-MIT.txt"
cp .build/checkouts/argmax-oss-swift/NOTICES "$app/Contents/Resources/Licenses/Argmax-NOTICES.txt"
cp .build/checkouts/FluidAudio/LICENSE "$app/Contents/Resources/Licenses/FluidAudio-Apache-2.0.txt"
cp .build/checkouts/swift-argument-parser/LICENSE.txt "$app/Contents/Resources/Licenses/Swift-Argument-Parser-Apache-2.0.txt"
cp .build/checkouts/Sparkle/LICENSE "$app/Contents/Resources/Licenses/Sparkle-MIT.txt"
cp .build/checkouts/llama.swift/LICENSE.md "$app/Contents/Resources/Licenses/llama.swift-MIT.txt"
cp Resources/Licenses/llama.cpp-MIT.txt "$app/Contents/Resources/Licenses/llama.cpp-MIT.txt"
# SwiftPM resources from speech/tokenizer dependencies must travel with the app.
for resource in "$binary_dir"/*.bundle; do
    [[ -d "$resource" ]] || continue
    [[ "$(basename "$resource")" == DeepType_DeepType.bundle ]] && continue
    cp -R "$resource" "$app/Contents/Resources/"
    [[ "$(basename "$resource")" == FluidAudio_* ]] && continue
    cp -R "$resource" "$app/Contents/MacOS/"
done
# ponytail: stable Team ID + bundle ID keeps TCC (Mic/Accessibility) across updates.
# Ad-hoc signatures change on every build, so macOS revokes them each time.
identity="${CODESIGN_IDENTITY:-$(security find-identity -v -p codesigning 2>/dev/null | grep 'Developer ID Application.*8JL39GK2DC' | awk '{print $2; exit}' || true)}"
if [[ -z "$identity" ]]; then
    identity="${CODESIGN_IDENTITY:-$(security find-identity -v -p codesigning 2>/dev/null | awk '/\)/ {print $2; exit}' || true)}"
fi
if [[ -z "$identity" ]]; then
    identity=-
    echo 'warning: ad-hoc signing changes on every build, so macOS revokes Accessibility (paste) each time. Set CODESIGN_IDENTITY to a persistent identity to keep permissions across rebuilds.' >&2
    # Sign nested code first so the outer seal covers stable inner signatures (no --deep).
    while IFS= read -r nested; do
        codesign --force --sign "$identity" "$nested"
    done < <(find "$app/Contents/Frameworks" "$app/Contents/MacOS" -name '*.framework' -o -name '*.bundle' -o -name '*.dylib' 2>/dev/null || true)
    codesign --force --sign "$identity" --entitlements Resources/DeepType.entitlements "$app"
else
    while IFS= read -r nested; do
        codesign --force --options runtime --timestamp --sign "$identity" "$nested"
    done < <(find "$app/Contents/Frameworks" "$app/Contents/MacOS" -name '*.framework' -o -name '*.bundle' -o -name '*.dylib' 2>/dev/null || true)
    codesign --force --options runtime --timestamp --sign "$identity" --entitlements Resources/DeepType.entitlements "$app"
fi
echo "$app"
