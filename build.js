const fs = require('fs');
const path = require('path');

// Move compiled files from subdirectories to dist root
function moveCompiledFiles() {
  const distPath = './dist';

  // Move files from dist/core to dist
  const corePath = path.join(distPath, 'core');
  if (fs.existsSync(corePath)) {
    const coreFiles = fs.readdirSync(corePath);
    coreFiles.forEach(file => {
      if (file.endsWith('.js')) {
        const source = path.join(corePath, file);
        const target = path.join(distPath, file);
        fs.renameSync(source, target);
        console.log(`✅ Moved ${file} from core to dist`);
      }
    });
    fs.rmSync(corePath, { recursive: true, force: true });
  }

  // Move files from dist/utils to dist
  const utilsPath = path.join(distPath, 'utils');
  if (fs.existsSync(utilsPath)) {
    const utilsFiles = fs.readdirSync(utilsPath);
    utilsFiles.forEach(file => {
      if (file.endsWith('.js')) {
        const source = path.join(utilsPath, file);
        const target = path.join(distPath, file);
        fs.renameSync(source, target);
        console.log(`✅ Moved ${file} from utils to dist`);
      }
    });
    fs.rmSync(utilsPath, { recursive: true, force: true });
  }

  console.log('✅ All compiled files moved to dist directory');
}

// Fix import paths in compiled JavaScript files
function fixImportPaths() {
  const distPath = './dist';

  // Fix MarkdownEditorProvider.js
  const providerPath = path.join(distPath, 'MarkdownEditorProvider.js');
  if (fs.existsSync(providerPath)) {
    let content = fs.readFileSync(providerPath, 'utf8');
    content = content.replace(/require\("\.\.\/utils\/utils"\)/g, 'require("./utils")');
    fs.writeFileSync(providerPath, content);
    console.log('✅ Fixed import paths in MarkdownEditorProvider.js');
  }

  console.log('✅ Import paths fixed');
}

// Update package.json for VSCode extension
function updatePackageJson() {
  const packagePath = './package.json';
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  // Ensure main field points to correct path
  if (packageJson.main !== './dist/extension.js') {
    packageJson.main = './dist/extension.js';
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json updated for VSCode extension');
  } else {
    console.log('✅ package.json already correctly configured');
  }
}

// Main build preparation
console.log('🔧 Preparing build for VSCode extension...');

// Move compiled files
moveCompiledFiles();

// Fix import paths
fixImportPaths();

// Update package.json
updatePackageJson();

// 复制 CSS 文件到 dist 目录
const cssFiles = ['reset.css', 'vscode.css', 'main.css'];
const stylesDir = path.join(__dirname, 'src', 'styles');
const distDir = path.join(__dirname, 'dist');

// 确保 dist 目录存在
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

cssFiles.forEach(file => {
  const srcPath = path.join(stylesDir, file);
  const distPath = path.join(distDir, file);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, distPath);
    console.log(`✅ Copied ${file} to dist/`);
  }
});

console.log('✅ Build preparation completed');