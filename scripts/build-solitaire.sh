#!/bin/bash

# Build script for Solitaire app
# This script builds the js-solitaire submodule and copies the build to the apps directory

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SUBMODULE_DIR="$PROJECT_ROOT/external/js-solitaire"
TARGET_DIR="$PROJECT_ROOT/src/apps/solitaire/build"

echo "Building Solitaire..."

# Check if submodule exists
if [ ! -d "$SUBMODULE_DIR" ]; then
    echo "Error: Solitaire submodule not found at $SUBMODULE_DIR"
    echo "Run: git submodule update --init --recursive"
    exit 1
fi

# Navigate to submodule
cd "$SUBMODULE_DIR"

# Create .parcelrc to use default config (avoids LMDB cache issues)
cat > .parcelrc << 'EOF'
{
  "extends": "@parcel/config-default"
}
EOF

# Check if we need to install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    if command -v pnpm &> /dev/null; then
        pnpm install --ignore-optional || true
    elif command -v yarn &> /dev/null; then
        yarn install --ignore-optional || true
    else
        npm install --ignore-optional || true
    fi

    # Remove problematic native dependencies to prevent Parcel from trying to load them
    echo "Removing native cache dependencies..."
    rm -rf node_modules/lmdb-store || true
    rm -rf node_modules/msgpackr-extract || true
fi

# Build the app
echo "Building app..."
# Disable Parcel cache completely to avoid LMDB native dependency issues
if command -v pnpm &> /dev/null; then
    pnpm build --no-cache
elif command -v yarn &> /dev/null; then
    yarn build --no-cache
else
    npm run build -- --no-cache
fi

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Remove old build files
echo "Cleaning old build files..."
rm -rf "$TARGET_DIR"/*

# Copy new build files (Parcel outputs to 'dist' by default)
echo "Copying build files to $TARGET_DIR..."
cp -r dist/* "$TARGET_DIR/"

# Fix absolute paths in index.html to relative paths
echo "Fixing asset paths..."
if [ -f "$TARGET_DIR/index.html" ]; then
    sed -i '' 's|href=/|href=./|g' "$TARGET_DIR/index.html"
    sed -i '' 's|src=/|src=./|g' "$TARGET_DIR/index.html"

    # Add custom override CSS to remove window chrome
    echo "Adding custom CSS override..."
    sed -i '' 's|</head>|	<link rel=stylesheet href=../solitaire-override.css>\n</head>|g' "$TARGET_DIR/index.html"
fi

# Clean up build changes in submodule to avoid git tracking them
cd "$SUBMODULE_DIR"
git restore . 2>/dev/null || true
git clean -fd 2>/dev/null || true

echo "Solitaire build complete!"
