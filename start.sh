#!/bin/bash

# Aurum CS Bot - Start Script
# Menjalankan Ollama + Bot dalam satu command

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Starting Aurum CS Bot...${NC}"
echo ""

# Check if Ollama is running
if ! pgrep -x "ollama" > /dev/null; then
    echo -e "${YELLOW}Starting Ollama...${NC}"
    ollama serve &
    sleep 3
    
    # Verify Ollama started
    if ! pgrep -x "ollama" > /dev/null; then
        echo -e "${RED}Gagal menjalankan Ollama!${NC}"
        echo "Jalankan manual: ollama serve"
        exit 1
    fi
    echo -e "${GREEN}Ollama running!${NC}"
else
    echo -e "${GREEN}Ollama sudah running${NC}"
fi

# Check if model exists
echo "Checking AI model..."
if ! ollama list | grep -q "qwen2.5:1.5b"; then
    echo -e "${YELLOW}Model belum ada, downloading...${NC}"
    ollama pull qwen2.5:1.5b
fi

echo ""
echo -e "${GREEN}Starting WhatsApp Bot...${NC}"
echo "Scan QR Code dengan WhatsApp:"
echo "  WhatsApp > Settings > Linked Devices > Link a Device"
echo ""

# Run the bot
node index.js
