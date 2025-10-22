#!/bin/bash

# Build script for JS Paint app
# This script prepares jspaint submodule and copies necessary files to the apps directory

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SUBMODULE_DIR="$PROJECT_ROOT/external/jspaint"
TARGET_DIR="$PROJECT_ROOT/src/apps/paint/build"

echo "Building JS Paint..."

# Check if submodule exists
if [ ! -d "$SUBMODULE_DIR" ]; then
    echo "Error: JS Paint submodule not found at $SUBMODULE_DIR"
    echo "Run: git submodule update --init --recursive"
    exit 1
fi

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Remove old build files
echo "Cleaning old build files..."
rm -rf "$TARGET_DIR"/*

# Copy jspaint files (it's a static app, no build needed)
echo "Copying jspaint files to $TARGET_DIR..."

# Copy main HTML file
cp "$SUBMODULE_DIR/index.html" "$TARGET_DIR/"

# Copy all necessary directories
cp -r "$SUBMODULE_DIR/src" "$TARGET_DIR/"
cp -r "$SUBMODULE_DIR/lib" "$TARGET_DIR/"
cp -r "$SUBMODULE_DIR/styles" "$TARGET_DIR/"
cp -r "$SUBMODULE_DIR/images" "$TARGET_DIR/"
cp -r "$SUBMODULE_DIR/help" "$TARGET_DIR/"
cp -r "$SUBMODULE_DIR/localization" "$TARGET_DIR/"
cp -r "$SUBMODULE_DIR/audio" "$TARGET_DIR/"

# Copy other essential files
[ -f "$SUBMODULE_DIR/favicon.ico" ] && cp "$SUBMODULE_DIR/favicon.ico" "$TARGET_DIR/"
[ -f "$SUBMODULE_DIR/manifest.webmanifest" ] && cp "$SUBMODULE_DIR/manifest.webmanifest" "$TARGET_DIR/"

# Modify index.html to set Windows XP as default theme
echo "Setting Windows XP as default theme..."
# This will be loaded dynamically by jspaint's theme system

# Create a custom config to load XP theme by default
cat > "$TARGET_DIR/xp-config.js" << 'EOF'
// Set Windows XP theme as default
(function() {
    // Wait for the theme system to load
    if (window.set_theme) {
        window.set_theme("windows-xp.css");
    } else {
        // If not loaded yet, try after DOM content loaded
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                if (window.set_theme) {
                    window.set_theme("windows-xp.css");
                }
            }, 100);
        });
    }
})();
EOF

echo "JS Paint build complete!"
echo "The Windows XP theme has been included."
echo "To use it, go to Extras > Themes > windows-xp.css in the app."
