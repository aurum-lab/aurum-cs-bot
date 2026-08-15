#!/bin/bash

# Aurum CS Bot - Start Script
# Menjalankan Bot (Ollama optional)

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🍞 Starting Aurum CS Bot...${NC}"
echo ""

# Check if Ollama is installed
if command -v ollama &> /dev/null; then
    echo -e "${GREEN}✓ Ollama terinstall${NC}"
    
    # Check if Ollama is running
    if ! pgrep -x "ollama" > /dev/null; then
        echo -e "${YELLOW}Starting Ollama...${NC}"
        ollama serve &
        sleep 3
        
        if pgrep -x "ollama" > /dev/null; then
            echo -e "${GREEN}Ollama running!${NC}"
        else
            echo -e "${YELLOW}Ollama gagal start, bot jalan tanpa AI${NC}"
        fi
    else
        echo -e "${GREEN}Ollama sudah running${NC}"
    fi
    
    # Check if model exists
    if pgrep -x "ollama" > /dev/null; then
        if ! ollama list | grep -q "qwen2.5:1.5b"; then
            echo -e "${YELLOW}Model belum ada, downloading...${NC}"
            echo -e "${YELLOW}Ini butuh waktu beberapa menit...${NC}"
            ollama pull qwen2.5:1.5b || echo -e "${YELLOW}Gagal download model, bot jalan tanpa AI${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Ollama tidak terinstall${NC}"
    echo -e "${YELLOW}Bot jalan tanpa AI (mode simple)${NC}"
    echo -e "${YELLOW}Install Ollama (opsional): curl -fsSL https://ollama.com/install.sh | sh${NC}"
fi

echo ""
echo -e "${GREEN}Starting WhatsApp Bot...${NC}"
echo "Scan QR Code dengan WhatsApp:"
echo "  WhatsApp > Settings > Linked Devices > Link a Device"
echo ""

# Run the bot
node index.js
