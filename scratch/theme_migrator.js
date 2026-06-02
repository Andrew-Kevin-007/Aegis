const fs = require('fs');
const path = require('path');

const directoryPaths = ['./app', './components'];

const replacements = [
  { regex: /bg-\[#050505\]/g, replacement: 'bg-background' },
  { regex: /bg-\[#0A0A0A\]/g, replacement: 'bg-surface' },
  { regex: /bg-\[#020202\]/g, replacement: 'bg-surface' },
  { regex: /bg-\[#111111\]/g, replacement: 'bg-surface-hover' },
  { regex: /bg-\[#1A1A1A\]/g, replacement: 'bg-surface-active' },
  { regex: /bg-white\/5/g, replacement: 'bg-surface-hover' },
  { regex: /bg-white\/10/g, replacement: 'bg-surface-active' },
  { regex: /border-white\/5/g, replacement: 'border-border' },
  { regex: /border-white\/10/g, replacement: 'border-border' },
  { regex: /border-white\/20/g, replacement: 'border-border-hover' },
  { regex: /text-white\/80/g, replacement: 'text-text-secondary' },
  { regex: /text-white\/60/g, replacement: 'text-text-muted' },
  { regex: /text-white/g, replacement: 'text-text-primary' },
  { regex: /text-black/g, replacement: 'text-primary-inverse' },
  { regex: /bg-white/g, replacement: 'bg-primary' },
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;

      replacements.forEach(({ regex, replacement }) => {
        content = content.replace(regex, replacement);
      });

      if (original !== content) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  });
}

directoryPaths.forEach(processDirectory);
console.log('Theme migration complete.');
