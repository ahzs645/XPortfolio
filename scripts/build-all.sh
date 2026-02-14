#!/bin/bash
# Build script for XPortfolio with all external apps
# Run this to build everything locally for testing

set -e  # Exit on error

echo "=============================================="
echo "  XPortfolio Full Build Script"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo -e "\n${YELLOW}Step 1: Build and deploy external apps${NC}"
node scripts/build-externals.js

echo -e "\n${YELLOW}Step 2: Install main app dependencies${NC}"
npm install

echo -e "\n${YELLOW}Step 3: Build main app${NC}"
npm run build

echo -e "\n${GREEN}=============================================="
echo "  Build Complete!"
echo "  Output: ./dist"
echo "==============================================${NC}"
echo ""
echo "To preview locally, run:"
echo "  npm run preview"
