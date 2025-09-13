#!/bin/bash

# Create test build without modifying source files
echo "🔄 Creating test build..."

# Create dist directory
rm -rf dist
mkdir -p dist

# Copy all files except .git, node_modules, and dist itself
rsync -av --exclude='.git' --exclude='node_modules' --exclude='dist' --exclude='*.bak' . dist/

# Run template replacement on the dist version
cd dist
../scripts/replace-templates.sh

echo "✅ Test build complete in dist/ folder"
echo "🌐 Starting BrowserSync server..."

# Start BrowserSync server
cd dist
npx browser-sync start --server --files "**/*" --port 3000 --no-open