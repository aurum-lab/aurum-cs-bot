#!/bin/bash

# Aurum CS Bot - Quick Install Script
# Usage: bash install.sh

set -e

echo "========================================="
echo "  Aurum CS Bot - Quick Install"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Install Node.js dependencies only
echo -e "${YELLOW}[1/3] Install dependencies...${NC}"
npm install

# Step 2: Create directories
echo -e "${YELLOW}[2/3] Create directories...${NC}"
mkdir -p data uploads

# Step 3: Setup database
echo -e "${YELLOW}[3/3] Setup database...${NC}"
npm run setup

echo ""
echo "========================================="
echo -e "${GREEN}  INSTALASI SELESAI!${NC}"
echo "========================================="
echo ""
echo "Selanjutnya:"
echo ""
echo "  Jalankan bot:"
echo "    npm start"
echo ""
echo "  Bot akan jalan tanpa AI (mode simple)."
echo "  Fitur AI (Ollama) bersifat OPTIONAL."
echo ""
echo "  Jika ingin pakai AI:"
echo "    1. Install Ollama:"
echo "       curl -fsSL https://ollama.com/install.sh | sh"
echo "    2. Download model:"
echo "       ollama pull qwen2.5:1.5b"
echo "    3. Edit config.js, uncomment bagian ollama"
echo ""
echo "========================================="
