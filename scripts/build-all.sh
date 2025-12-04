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

echo -e "\n${YELLOW}Step 1: Initialize and update submodules${NC}"
git submodule init
git submodule update --recursive

echo -e "\n${YELLOW}Step 2: Build Spider Solitaire${NC}"
cd external/spider-solitaire
npm install
npm run build
cd "$PROJECT_ROOT"
echo -e "${GREEN}✅ Spider Solitaire built${NC}"

echo -e "\n${YELLOW}Step 3: Build JS Solitaire${NC}"
cd external/js-solitaire
# Check if pnpm is available, otherwise use npm
if command -v pnpm &> /dev/null; then
    pnpm install
    pnpm run build
else
    npm install
    npm run build
fi
cd "$PROJECT_ROOT"
echo -e "${GREEN}✅ JS Solitaire built${NC}"

echo -e "\n${YELLOW}Step 4: Copy built apps to public folder${NC}"

# Spider Solitaire
rm -rf public/games/spider-solitaire
mkdir -p public/games/spider-solitaire
cp -r external/spider-solitaire/build/* public/games/spider-solitaire/
echo -e "${GREEN}  ✅ Spider Solitaire copied${NC}"

# JS Solitaire
rm -rf public/games/solitaire
mkdir -p public/games/solitaire
cp -r external/js-solitaire/dist/* public/games/solitaire/
echo -e "${GREEN}  ✅ JS Solitaire copied${NC}"

# JSPaint (replace symlink with actual copy for production-like build)
rm -rf public/apps/jspaint
mkdir -p public/apps/jspaint
cp -r external/jspaint/index.html public/apps/jspaint/
cp -r external/jspaint/src public/apps/jspaint/
cp -r external/jspaint/lib public/apps/jspaint/
cp -r external/jspaint/images public/apps/jspaint/
cp -r external/jspaint/styles public/apps/jspaint/
cp -r external/jspaint/localization public/apps/jspaint/
cp -r external/jspaint/help public/apps/jspaint/ 2>/dev/null || true
cp -r external/jspaint/audio public/apps/jspaint/ 2>/dev/null || true
cp external/jspaint/favicon.ico public/apps/jspaint/ 2>/dev/null || true
cp external/jspaint/manifest.webmanifest public/apps/jspaint/ 2>/dev/null || true
echo -e "${GREEN}  ✅ JSPaint copied${NC}"

echo -e "\n${YELLOW}Step 5: Install main app dependencies${NC}"
npm install

echo -e "\n${YELLOW}Step 6: Build main app${NC}"
npm run build

echo -e "\n${GREEN}=============================================="
echo "  Build Complete!"
echo "  Output: ./dist"
echo "==============================================${NC}"
echo ""
echo "To preview locally, run:"
echo "  npm run preview"
