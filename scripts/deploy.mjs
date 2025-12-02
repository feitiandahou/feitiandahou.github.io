// scripts/deploy.mjs
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👇 替换成你的 GitHub 用户名！
const username = 'your-username';
console.log(`🚀 部署到 https://${username}.github.io`);

// 1. 构建项目
console.log('📦 构建中...');
execSync('npm run build', { stdio: 'inherit' });

// 2. 获取绝对路径
const projectRoot = path.resolve(__dirname, '..');
const distPath = path.resolve(projectRoot, 'dist');

if (!fs.existsSync(distPath)) {
  throw new Error('❌ 构建失败：dist 目录不存在');
}

// 3. 切换到 main 分支（部署分支）
console.log('🔄 切换到 main 分支...');
try {
  execSync('git checkout main', { stdio: 'pipe' });
} catch {
  // 创建 orphan main 分支
  execSync('git checkout --orphan main', { stdio: 'inherit' });
}

// 4. 拉取远程（可选，避免冲突）
try {
  execSync('git pull origin main --rebase', { stdio: 'inherit' });
} catch (e) {
  console.log('⚠️ 忽略拉取错误（可能是空分支）');
}

// 5. 👉 关键：先清空工作区（除了 .git）
console.log('🧹 清理工作区（保留 .git）...');
const files = fs.readdirSync(projectRoot);
for (const file of files) {
  if (file === '.git' || file === 'node_modules') continue;
  const fullPath = path.join(projectRoot, file);
  if (fs.lstatSync(fullPath).isDirectory()) {
    fs.rmSync(fullPath, { recursive: true, force: true });
  } else {
    fs.unlinkSync(fullPath);
  }
}

// 6. 👉 再复制 dist 内容到当前目录（此时 .deploy 不会干扰）
console.log('📂 复制构建文件...');
const distFiles = fs.readdirSync(distPath);
for (const file of distFiles) {
  const src = path.join(distPath, file);
  const dest = path.join(projectRoot, file);
  if (fs.lstatSync(src).isDirectory()) {
    fs.cpSync(src, dest, { recursive: true });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 7. 添加必要文件
fs.writeFileSync(path.join(projectRoot, '.nojekyll'), '');

// 8. 提交并推送
console.log('💾 提交并推送...');
execSync('git add .', { stdio: 'inherit' });

let hasChanges;
try {
  execSync('git diff --cached --quiet HEAD', { stdio: 'pipe' });
  hasChanges = false;
} catch {
  hasChanges = true;
}

if (hasChanges) {
  execSync('git commit -m "Deploy site"', { stdio: 'inherit' });
  execSync('git push -f origin main', { stdio: 'inherit' });
  console.log(`🎉 部署成功！访问：https://${username}.github.io`);
} else {
  console.log('✅ 无变化，无需部署');
}

// 9. 回到 source 分支
console.log('🔙 切回 source 分支...');
execSync('git checkout source', { stdio: 'inherit' });