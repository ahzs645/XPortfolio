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

# Remove .parcelrc if it exists (causes issues with missing @parcel/config-default)
rm -f .parcelrc

# Check if we need to install dependencies
if [ ! -d "node_modules" ]; then
    # Create lmdb-store stub BEFORE yarn install to prevent native compilation
    echo "Creating lmdb-store stub..."
    mkdir -p node_modules/lmdb-store
    cat > node_modules/lmdb-store/index.js << 'LMDB_EOF'
// Stub module that implements LMDB interface with in-memory cache
// This allows Parcel to run without native LMDB bindings
class StubLMDB {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    return this.cache.get(key);
  }

  put(key, value) {
    this.cache.set(key, value);
    return Promise.resolve();
  }

  remove(key) {
    this.cache.delete(key);
    return Promise.resolve();
  }

  getMany(keys) {
    return keys.map(key => this.cache.get(key));
  }

  putSync(key, value) {
    this.cache.set(key, value);
  }

  removeSync(key) {
    this.cache.delete(key);
  }

  close() {
    this.cache.clear();
  }
}

module.exports = {
  open: () => new StubLMDB()
};
LMDB_EOF
    cat > node_modules/lmdb-store/package.json << 'PKG_EOF'
{
  "name": "lmdb-store",
  "version": "0.0.0-stub",
  "main": "index.js"
}
PKG_EOF

    echo "Installing dependencies..."
    if command -v pnpm &> /dev/null; then
        pnpm install || true
    elif command -v yarn &> /dev/null; then
        yarn install --ignore-scripts || true
    else
        npm install --ignore-scripts || true
    fi

    # Ensure lmdb-store stub is still in place after yarn install
    echo "Verifying lmdb-store stub..."
    mkdir -p node_modules/lmdb-store
    cat > node_modules/lmdb-store/index.js << 'LMDB_EOF2'
// Stub module that implements LMDB interface with in-memory cache
// This allows Parcel to run without native LMDB bindings
class StubLMDB {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    return this.cache.get(key);
  }

  put(key, value) {
    this.cache.set(key, value);
    return Promise.resolve();
  }

  remove(key) {
    this.cache.delete(key);
    return Promise.resolve();
  }

  getMany(keys) {
    return keys.map(key => this.cache.get(key));
  }

  putSync(key, value) {
    this.cache.set(key, value);
  }

  removeSync(key) {
    this.cache.delete(key);
  }

  close() {
    this.cache.clear();
  }
}

module.exports = {
  open: () => new StubLMDB()
};
LMDB_EOF2
    cat > node_modules/lmdb-store/package.json << 'PKG_EOF2'
{
  "name": "lmdb-store",
  "version": "0.0.0-stub",
  "main": "index.js"
}
PKG_EOF2
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
    # Use sed -i with compatibility for both macOS and Linux
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' 's|href=/|href=./|g' "$TARGET_DIR/index.html"
        sed -i '' 's|src=/|src=./|g' "$TARGET_DIR/index.html"
        sed -i '' 's|</head>|	<link rel=stylesheet href=../solitaire-override.css>\n</head>|g' "$TARGET_DIR/index.html"
    else
        # Linux
        sed -i 's|href=/|href=./|g' "$TARGET_DIR/index.html"
        sed -i 's|src=/|src=./|g' "$TARGET_DIR/index.html"
        sed -i 's|</head>|	<link rel=stylesheet href=../solitaire-override.css>\n</head>|g' "$TARGET_DIR/index.html"
    fi
fi

# Clean up build changes in submodule to avoid git tracking them
cd "$SUBMODULE_DIR"
git restore . 2>/dev/null || true
git clean -fd 2>/dev/null || true

echo "Solitaire build complete!"
