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

# Extract to temp directory
TEMP_DIR=$(mktemp -d)
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Find backup folder
BACKUP_FOLDER=$(ls "$TEMP_DIR" | head -1)

if [ -z "$BACKUP_FOLDER" ]; then
  echo -e "${RED}❌ Invalid backup file${NC}"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# Restore database
if [ -f "$TEMP_DIR/$BACKUP_FOLDER/toko_roti.db" ]; then
  mkdir -p ./data
  cp "$TEMP_DIR/$BACKUP_FOLDER/toko_roti.db" ./data/
  echo -e "${GREEN}✓ Database restored${NC}"
fi

# Restore templates
if [ -f "$TEMP_DIR/$BACKUP_FOLDER/templates.json" ]; then
  mkdir -p ./data
  cp "$TEMP_DIR/$BACKUP_FOLDER/templates.json" ./data/
  echo -e "${GREEN}✓ Templates restored${NC}"
fi

# Restore config
if [ -f "$TEMP_DIR/$BACKUP_FOLDER/config.js" ]; then
  cp "$TEMP_DIR/$BACKUP_FOLDER/config.js" ./
  echo -e "${GREEN}✓ Config restored${NC}"
fi

# Restore WhatsApp session
if [ -d "$TEMP_DIR/$BACKUP_FOLDER/whatsapp-session" ]; then
  mkdir -p ./data
  rm -rf ./data/whatsapp-session
  cp -r "$TEMP_DIR/$BACKUP_FOLDER/whatsapp-session" ./data/
  echo -e "${GREEN}✓ WhatsApp session restored${NC}"
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo -e "${GREEN}✅ Restore selesai!${NC}"
echo -e "💡 Restart bot dengan: npm start"
