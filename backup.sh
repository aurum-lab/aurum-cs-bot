#!/bin/bash

# Aurum CS Bot - Backup Script
# Usage: bash backup.sh [backup_dir]

set -e

# Default backup directory
BACKUP_DIR="${1:-./backups}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="aurum-cs-bot-backup-$DATE"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔄 Starting backup...${NC}"

# Check if bot is running and save database first
BOT_PID=$(pgrep -f "node.*index.js" || true)
if [ -n "$BOT_PID" ]; then
  echo -e "${YELLOW}⚠️  Bot sedang berjalan (PID: $BOT_PID)${NC}"
  echo -e "${YELLOW}💾 Menyimpan database ke disk...${NC}"

  # Send SIGUSR1 to trigger database save (if implemented) or just warn
  # Alternative: create a flag file that bot can check
  touch ./data/.backup-requested
  sleep 2

  echo -e "${YELLOW}⏳ Menunggu database tersimpan...${NC}"
  sleep 3
fi

# Create backup directory
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

# Backup database
if [ -f "./data/toko_roti.db" ]; then
  echo -e "${GREEN}✓ Database backed up${NC}"
  cp ./data/toko_roti.db "$BACKUP_DIR/$BACKUP_NAME/"
else
  echo -e "${RED}⚠️  Database tidak ditemukan: ./data/toko_roti.db${NC}"
fi

# Backup templates
if [ -f "./data/templates.json" ]; then
  echo -e "${GREEN}✓ Templates backed up${NC}"
  cp ./data/templates.json "$BACKUP_DIR/$BACKUP_NAME/"
fi

# Backup config
if [ -f "./config.js" ]; then
  echo -e "${GREEN}✓ Config backed up${NC}"
  cp ./config.js "$BACKUP_DIR/$BACKUP_NAME/"
fi

# Backup WhatsApp session
if [ -d "./data/whatsapp-session" ]; then
  echo -e "${GREEN}✓ WhatsApp session backed up${NC}"
  cp -r ./data/whatsapp-session "$BACKUP_DIR/$BACKUP_NAME/"
fi

# Create archive
cd "$BACKUP_DIR"
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"

# Cleanup flag file
rm -f ./data/.backup-requested

echo ""
echo -e "${GREEN}✅ Backup selesai!${NC}"
echo -e "📁 File: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
echo -e "📊 Size: $(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)"
