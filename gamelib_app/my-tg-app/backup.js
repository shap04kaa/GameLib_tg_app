import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// === НАСТРОЙКИ СКРИПТА ===

// Папки, которые ИГНОРИРУЕМ
const SKIP_DIRS = [
  'node_modules', 
  '.git', 
  '.vscode', 
  'dist', 
  'build', 
  'backups', 
  '.idea',
  'public' // Обычно там картинки, но если нужен index.html, можно убрать
];

// Файлы, которые ИГНОРИРУЕМ
const SKIP_FILES = [
  'package-lock.json', 
  'yarn.lock', 
  'pnpm-lock.yaml', 
  '.DS_Store', 
  'backup.js' // Сам себя не бэкапим
];

// Расширения файлов, которые СОХРАНЯЕМ
const INCLUDE_EXTENSIONS = [
  '.js', '.jsx', 
  '.ts', '.tsx',
  '.css', '.scss', '.sass', '.less',
  '.json', 
  '.html', 
  '.md',
  '.env' // Переменные окружения
];

// Файлы, которые включаем ВСЕГДА, даже если расширение не совпадает
const FORCE_INCLUDE_FILES = [
  'vite.config.js',
  'vite.config.ts',
  '.gitignore'
];

// =========================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    const baseName = path.basename(fullPath);

    // Проверка папок на игнор
    if (stat.isDirectory()) {
      if (SKIP_DIRS.includes(baseName)) continue;
      walk(fullPath, fileList);
    } else {
      // Проверка файлов
      if (SKIP_FILES.includes(baseName)) continue;

      const ext = path.extname(file);
      
      // Логика добавления: либо расширение подходит, либо файл в списке обязательных
      if (INCLUDE_EXTENSIONS.includes(ext) || FORCE_INCLUDE_FILES.includes(baseName)) {
        fileList.push(fullPath);
      }
    }
  }

  return fileList;
}

function getFormattedDate() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  
  return `${dd}.${mm}.${yy}_${hh}-${min}`;
}

function generate(name) {
  console.log('🔄 Сканирование файлов...');
  const files = walk('.');
  
  if (files.length === 0) {
    console.log('⚠️  Файлы не найдены');
    return;
  }

  let content = '';
  const dateStr = getFormattedDate();

  content += `PROJECT BACKUP: ${name}\n`;
  content += `DATE: ${dateStr}\n`;
  content += `FILES COUNT: ${files.length}\n`;
  content += `========================================\n\n`;

  for (const file of files) {
    const rel = path.relative('.', file);
    
    try {
      const code = fs.readFileSync(file, 'utf-8');
      content += `\n/* FILE START: ${rel} */\n`;
      content += `${'-'.repeat(50)}\n`;
      content += code;
      content += `\n${'-'.repeat(50)}\n`;
      content += `/* FILE END: ${rel} */\n\n`;
    } catch (err) {
      console.warn(`⚠️  Ошибка чтения: ${rel}`);
    }
  }

  const backupsDir = './backups';
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir);
  }

  // Формируем имя файла: Название_Дата_Время.txt
  const safeName = name.replace(/[^a-z0-9а-яё]/gi, '_'); // Убираем спецсимволы
  const fileName = `${safeName}_${dateStr}.txt`;
  const fullPath = path.join(backupsDir, fileName);

  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`✅ Успешно! Файл сохранён: ${fullPath}`);
  console.log(`📄 Всего файлов упаковано: ${files.length}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Введите название для бэкапа (например: step1_initial): ', (answer) => {
  const title = answer && answer.trim() ? answer.trim() : 'backup';
  generate(title);
  rl.close();
});