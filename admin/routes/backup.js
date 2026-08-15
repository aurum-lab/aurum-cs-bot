import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync, createReadStream, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Ensure backup temp directory exists
const TEMP_DIR = join(__dirname, '../../data/tmp-backup');
mkdirSync(TEMP_DIR, { recursive: true });

// Setup multer for file upload
const upload = multer({ 
  dest: TEMP_DIR,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

const DATA_DIR = join(__dirname, '../../data');
const BACKUP_DIR = join(__dirname, '../../backups');

// GET /api/backup - Create and download backup
router.get('/', (req, res) => {
  try {
    const date = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    const backupName = `aurum-cs-bot-backup-${date}`;
    const tempDir = join(TEMP_DIR, backupName);
    
    // Create temp directory
    execSync(`mkdir -p "${tempDir}"`);
    
    // Copy database
    const dbPath = join(DATA_DIR, 'toko_roti.db');
    if (existsSync(dbPath)) {
      execSync(`cp "${dbPath}" "${tempDir}/"`);
    }
    
    // Copy templates
    const templatesPath = join(DATA_DIR, 'templates.json');
    if (existsSync(templatesPath)) {
      execSync(`cp "${templatesPath}" "${tempDir}/"`);
    }
    
    // Copy config
    const configPath = join(__dirname, '../../config.js');
    if (existsSync(configPath)) {
      execSync(`cp "${configPath}" "${tempDir}/"`);
    }
    
    // Copy WhatsApp session
    const sessionDir = join(DATA_DIR, 'whatsapp-session');
    if (existsSync(sessionDir)) {
      execSync(`cp -r "${sessionDir}" "${tempDir}/"`);
    }
    
    // Create tar.gz archive
    const archivePath = join(TEMP_DIR, `${backupName}.tar.gz`);
    execSync(`tar -czf "${archivePath}" -C "${TEMP_DIR}" "${backupName}"`);
    
    // Send file
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', `attachment; filename="${backupName}.tar.gz"`);
    
    const fileStream = createReadStream(archivePath);
    fileStream.pipe(res);
    
    // Cleanup after send
    fileStream.on('end', () => {
      execSync(`rm -rf "${tempDir}" "${archivePath}"`);
    });
    
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ error: 'Gagal membuat backup' });
  }
});

// POST /api/restore - Restore from backup
router.post('/', upload.single('backup'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File backup tidak ditemukan' });
    }
    
    console.log('[Restore] File received:', req.file.originalname, req.file.size, 'bytes');
    
    const tempDir = join(TEMP_DIR, `aurum-restore-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
    
    // Extract archive
    execSync(`tar -xzf "${req.file.path}" -C "${tempDir}"`);
    
    // Find backup folder
    const items = execSync(`ls "${tempDir}"`).toString().trim().split('\n');
    const backupFolder = items[0];
    
    if (!backupFolder) {
      throw new Error('Invalid backup file - no folder found');
    }
    
    console.log('[Restore] Found folder:', backupFolder);
    
    const backupPath = join(tempDir, backupFolder);
    
    // Restore database
    const dbFile = join(backupPath, 'toko_roti.db');
    if (existsSync(dbFile)) {
      execSync(`cp "${dbFile}" "${DATA_DIR}/"`);
      console.log('[Restore] Database restored');
    }
    
    // Restore templates
    const templatesFile = join(backupPath, 'templates.json');
    if (existsSync(templatesFile)) {
      execSync(`cp "${templatesFile}" "${DATA_DIR}/"`);
      console.log('[Restore] Templates restored');
    }
    
    // Restore config
    const configFile = join(backupPath, 'config.js');
    if (existsSync(configFile)) {
      execSync(`cp "${configFile}" "${join(__dirname, '../../')}"`);
      console.log('[Restore] Config restored');
    }
    
    // Restore WhatsApp session
    const sessionFolder = join(backupPath, 'whatsapp-session');
    if (existsSync(sessionFolder)) {
      execSync(`rm -rf "${join(DATA_DIR, 'whatsapp-session')}" && cp -r "${sessionFolder}" "${DATA_DIR}/"`);
      console.log('[Restore] WhatsApp session restored');
    }
    
    // Cleanup
    execSync(`rm -rf "${tempDir}" "${req.file.path}"`);
    
    res.json({ message: 'Restore berhasil! Restart bot untuk menerapkan.' });
    
  } catch (error) {
    console.error('[Restore] Error:', error.message);
    res.status(500).json({ error: 'Gagal restore: ' + error.message });
  }
});

export default router;
