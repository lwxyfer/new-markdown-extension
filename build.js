const fs = require('fs');
const path = require('path');

// 复制 package.vscode.json 到 package.json
const packageVSCodePath = path.join(__dirname, 'package.vscode.json');
const packageJsonPath = path.join(__dirname, 'package.json');

if (fs.existsSync(packageVSCodePath)) {
  const packageVSCode = JSON.parse(fs.readFileSync(packageVSCodePath, 'utf8'));
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // 合并必要的字段
  const mergedPackage = {
    ...packageVSCode,
    dependencies: packageJson.dependencies,
    devDependencies: packageJson.devDependencies,
    scripts: packageJson.scripts
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(mergedPackage, null, 2));
  console.log('✅ package.json updated for VSCode extension');
}

// 复制 CSS 文件到 dist 目录
const cssFiles = ['reset.css', 'vscode.css', 'main.css'];
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// 确保 dist 目录存在
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

cssFiles.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const distPath = path.join(distDir, file);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, distPath);
    console.log(`✅ Copied ${file} to dist/`);
  }
});

console.log('✅ Build preparation completed');