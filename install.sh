#!/bin/bash

# Aurum CS Bot - One-click Install Script for Termux
# Usage: bash install.sh

set -e

echo "========================================="
echo "  Aurum CS Bot - WhatsApp CS Bot"
echo "  Auto Installer untuk Termux"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running in Termux
if [ ! -d "/data/data/com.termux" ]; then
    echo -e "${RED}Script ini hanya untuk Termux/Android${NC}"
    exit 1
fi

# Step 1: Update packages
echo -e "${YELLOW}[1/6] Update packages...${NC}"
pkg update -y && pkg upgrade -y

# Step 2: Install dependencies
echo -e "${YELLOW}[2/6] Install dependencies...${NC}"
pkg install -y git nodejs-lts npm curl

# Step 3: Install Ollama
echo -e "${YELLOW}[3/6] Install Ollama...${NC}"
if command -v ollama &> /dev/null; then
    echo -e "${GREEN}Ollama sudah terinstall${NC}"
else
    curl -fsSL https://ollama.com/install.sh | sh
fi

# Step 4: Start Ollama and pull model
echo -e "${YELLOW}[4/6] Download AI Model (Qwen2.5 1.5B)...${NC}"
# Start ollama in background
ollama serve &
OLLAMA_PID=$!
sleep 3

# Check if ollama is running
if ! kill -0 $OLLAMA_PID 2>/dev/null; then
    echo -e "${YELLOW}Restarting Ollama...${NC}"
    ollama serve &
    OLLAMA_PID=$!
    sleep 3
fi

# Pull model
ollama pull qwen2.5:1.5b

echo -e "${GREEN}Model downloaded!${NC}"

# Step 5: Install Bot Dependencies
echo -e "${YELLOW}[5/6] Install Bot dependencies...${NC}"
npm install

# Step 6: Setup Database & Create dirs
echo -e "${YELLOW}[6/6] Setup database...${NC}"
mkdir -p data uploads
npm run setup

echo ""
echo "========================================="
echo -e "${GREEN}  INSTALASI SELESAI!${NC}"
echo "========================================="
echo ""
echo "Cara menjalankan:"
echo ""
echo "  1. Jalankan Ollama (tab terpisah):"
echo "     ollama serve"
echo ""
echo "  2. Jalankan Bot:"
echo "     cd $(pwd)"
echo "     npm start"
echo ""
echo "  3. Scan QR Code dengan WhatsApp"
echo ""
echo "  4. (Optional) Jalankan Admin Panel:"
echo "     npm run admin"
echo "     Buka http://localhost:2020"
echo ""
echo "========================================="
