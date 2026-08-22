#!/bin/bash

# Aurum CS Bot - Restore Script
# Usage: bash restore.sh <backup_file.tar.gz>

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ -z "$1" ]; then
  echo -e "${RED}❌ Usage: bash restore.sh <backup_file.tar.gz>${NC}"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}❌ File not found: $BACKUP_FILE${NC}"
  exit 1
fi

echo -e "${YELLOW}🔄 Starting restore from: $BACKUP_FILE${NC}"

# STEP 1: Check if bot is running
BOT_PID=$(pgrep -f "node.*index.js" || true)
if [ -n "$BOT_PID" ]; then
  echo -e "${YELLOW}⚠️  Bot sedang berjalan (PID: $BOT_PID)${NC}"
  echo -e "${YELLOW}🛑 Menghentikan bot untuk restore aman...${NC}"

  # Graceful shutdown
  kill -TERM "$BOT_PID" 2>/dev/null || true
  sleep 3

  # Force kill if still running
  if ps -p "$BOT_PID" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Force kill bot...${NC}"
    kill -KILL "$BOT_PID" 2>/dev/null || true
    sleep 1
  fi

  echo -e "${GREEN}✓ Bot dihentikan${NC}"
else
  echo -e "${GREEN}✓ Bot tidak berjalan${NC}"
fi

# STEP 2: Ensure data directory exists
mkdir -p ./data

# STEP 3: Extract to temp directory
TEMP_DIR=$(mktemp -d)
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Find backup folder
BACKUP_FOLDER=$(ls "$TEMP_DIR" | head -1)

if [ -z "$BACKUP_FOLDER" ]; then
  echo -e "${RED}❌ Invalid backup file${NC}"
  rm -rf "$TEMP_DIR"
  exit 1
fi

echo -e "${YELLOW}📁 Backup folder: $BACKUP_FOLDER${NC}"

# STEP 4: Restore database
if [ -f "$TEMP_DIR/$BACKUP_FOLDER/toko_roti.db" ]; then
  cp "$TEMP_DIR/$BACKUP_FOLDER/toko_roti.db" ./data/
  echo -e "${GREEN}✓ Database restored${NC}"
else
  echo -e "${RED}⚠️  Database tidak ditemukan di backup${NC}"
fi

# STEP 5: Restore templates
if [ -f "$TEMP_DIR/$BACKUP_FOLDER/templates.json" ]; then
  cp "$TEMP_DIR/$BACKUP_FOLDER/templates.json" ./data/
  echo -e "${GREEN}✓ Templates restored${NC}"
fi

# STEP 6: Restore config
if [ -f "$TEMP_DIR/$BACKUP_FOLDER/config.js" ]; then
  cp "$TEMP_DIR/$BACKUP_FOLDER/config.js" ./
  echo -e "${GREEN}✓ Config restored${NC}"
fi

# STEP 7: Restore WhatsApp session
if [ -d "$TEMP_DIR/$BACKUP_FOLDER/whatsapp-session" ]; then
  rm -rf ./data/whatsapp-session
  cp -r "$TEMP_DIR/$BACKUP_FOLDER/whatsapp-session" ./data/
  echo -e "${GREEN}✓ WhatsApp session restored${NC}"
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo -e "${GREEN}✅ Restore selesai!${NC}"
echo ""
echo -e "${YELLOW}🚀 Silakan restart bot:${NC}"
echo -e "   npm start"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "   • Bot HARUS di-restart agar database di-load ulang dari file"
echo -e "   • Jangan jalankan restore saat bot sedang berjalan"
