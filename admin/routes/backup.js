import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync, createReadStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Setup multer for file upload
const upload = multer({ 
  dest: '/tmp/aurum-backup/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

const DATA_DIR = join(__dirname, '../../data');
const BACKUP_DIR = join(__dirname, '../../backups');

// GET /api/backup - Create and download backup
router.get('/', (req, res) => {
  try {
    const date = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    const backupName = `aurum-cs-bot-backup-${date}`;
    const tempDir = join('/tmp', backupName);
    
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
    const archivePath = join('/tmp', `${backupName}.tar.gz`);
    execSync(`tar -czf "${archivePath}" -C /tmp "${backupName}"`);
    
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
router.post('/', upload.single('backup'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File backup tidak ditemukan' });
    }
    
    const tempDir = join('/tmp', `aurum-restore-${Date.now()}`);
    
    // Extract archive
    execSync(`mkdir -p "${tempDir}" && tar -xzf "${req.file.path}" -C "${tempDir}"`);
    
    // Find backup folder
    const folders = execSync(`ls "${tempDir}"`).toString().trim().split('\n');
    const backupFolder = folders[0];
    
    if (!backupFolder) {
      throw new Error('Invalid backup file');
    }
    
    const backupPath = join(tempDir, backupFolder);
    
    // Restore database
    const dbFile = join(backupPath, 'toko_roti.db');
    if (existsSync(dbFile)) {
      execSync(`mkdir -p "${DATA_DIR}" && cp "${dbFile}" "${DATA_DIR}/"`);
    }
    
    // Restore templates
    const templatesFile = join(backupPath, 'templates.json');
    if (existsSync(templatesFile)) {
      execSync(`mkdir -p "${DATA_DIR}" && cp "${templatesFile}" "${DATA_DIR}/"`);
    }
    
    // Restore config
    const configFile = join(backupPath, 'config.js');
    if (existsSync(configFile)) {
      execSync(`cp "${configFile}" "${join(__dirname, '../../')}"`);
    }
    
    // Restore WhatsApp session
    const sessionFolder = join(backupPath, 'whatsapp-session');
    if (existsSync(sessionFolder)) {
      execSync(`mkdir -p "${DATA_DIR}" && rm -rf "${join(DATA_DIR, 'whatsapp-session')}" && cp -r "${sessionFolder}" "${DATA_DIR}/"`);
    }
    
    // Cleanup
    execSync(`rm -rf "${tempDir}" "${req.file.path}"`);
    
    res.json({ message: 'Restore berhasil! Restart bot untuk menerapkan.' });
    
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ error: 'Gagal restore backup' });
  }
});

export default router;
