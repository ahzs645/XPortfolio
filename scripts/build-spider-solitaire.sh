#!/bin/bash

# Build script for Spider Solitaire app
# This script builds the spider-solitaire submodule and copies the build to the apps directory

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SUBMODULE_DIR="$PROJECT_ROOT/external/spider-solitaire"
TARGET_DIR="$PROJECT_ROOT/src/apps/spider-solitaire/build"

echo "Building Spider Solitaire..."

# Check if submodule exists
if [ ! -d "$SUBMODULE_DIR" ]; then
    echo "Error: Spider Solitaire submodule not found at $SUBMODULE_DIR"
    echo "Run: git submodule update --init --recursive"
    exit 1
fi

# Navigate to submodule
cd "$SUBMODULE_DIR"

# Check if we need to install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    if command -v pnpm &> /dev/null; then
        pnpm install
    else
        npm install
    fi
fi

# Build the app
echo "Building app..."
if command -v pnpm &> /dev/null; then
    DISABLE_ESLINT_PLUGIN=true pnpm build
else
    DISABLE_ESLINT_PLUGIN=true npm run build
fi

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Remove old build files
echo "Cleaning old build files..."
rm -rf "$TARGET_DIR"/*

# Copy new build files
echo "Copying build files to $TARGET_DIR..."
cp -r build/* "$TARGET_DIR/"

# Clean up build changes in submodule to avoid git tracking them
cd "$SUBMODULE_DIR"
git restore . 2>/dev/null || true
git clean -fd 2>/dev/null || true

echo "Spider Solitaire build complete!"
