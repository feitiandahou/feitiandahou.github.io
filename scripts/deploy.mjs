// scripts/deploy.mjs
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..');

// 👇【重要】替换成你的 GitHub 用户名！
const GITHUB_USERNAME = 'feitiandahou'; // ← 改这里！

console.log(`🚀 开始部署到 https://${GITHUB_USERNAME}.github.io`);

// 1. 构建项目
console.log('📦 正在构建...');
execSync('npm run build', { stdio: 'inherit' });

const distPath = path.join(projectRoot, 'dist');
if (!fs.existsSync(distPath)) {
  throw new Error('❌ 构建失败：dist 目录不存在');
}

// 2. 备份 dist 到系统临时目录（关键！防止被后续操作删除）
const tempDeployDir = path.join(tmpdir(), `deploy-${Date.now()}`);
console.log(`📂 备份 dist 到临时目录: ${tempDeployDir}`);
fs.cpSync(distPath, tempDeployDir, { recursive: true });

// 3. 切换到 main 分支（用于 GitHub Pages）
console.log('🔄 切换到 main 分支...');
try {
  execSync('git checkout main', { stdio: 'pipe' });
} catch {
  console.log('🆕 创建新的 orphan main 分支...');
  execSync('git checkout --orphan main', { stdio: 'inherit' });
}

// 4. 尝试拉取远程（避免冲突，可选）
try {
  execSync('git pull origin main --rebase', { stdio: 'inherit' });
} catch {
  console.log('⚠️ 忽略拉取错误（可能是空分支）');
}

// 5. 清空当前工作区（保留 .git）
console.log('🧹 清理工作区（保留 .git）...');
const files = fs.readdirSync(projectRoot);
for (const file of files) {
  if (file === '.git') continue;
  const fullPath = path.join(projectRoot, file);
  try {
    if (fs.lstatSync(fullPath).isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.warn(`⚠️ 无法删除 ${fullPath}: ${err.message}`);
  }
}

// 6. 从临时目录复制部署文件到项目根
console.log('📂 恢复静态文件到项目根...');
const deployFiles = fs.readdirSync(tempDeployDir);
for (const file of deployFiles) {
  const src = path.join(tempDeployDir, file);
  const dest = path.join(projectRoot, file);
  if (fs.lstatSync(src).isDirectory()) {
    fs.cpSync(src, dest, { recursive: true });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 7. 添加 GitHub Pages 必需文件
fs.writeFileSync(path.join(projectRoot, '.nojekyll'), '');

// 8. 提交并推送
console.log('💾 提交并推送到 main 分支...');
execSync('git add .', { stdio: 'inherit' });

let hasChanges = false;
try {
  execSync('git diff --cached --quiet HEAD', { stdio: 'pipe' });
} catch {
  hasChanges = true;
}

if (hasChanges) {
  execSync('git commit -m "Deploy site"', { stdio: 'inherit' });
  execSync('git push -f origin main', { stdio: 'inherit' });
  console.log(`✅ 部署成功！访问: https://${GITHUB_USERNAME}.github.io`);
} else {
  console.log('ℹ️ 无变化，跳过部署');
}

// 9. 清理临时目录
fs.rmSync(tempDeployDir, { recursive: true, force: true });

// 10. 自动切回 source 分支
console.log('🔙 切回 source 分支...');
execSync('git checkout source', { stdio: 'inherit' });

console.log('✨ 部署流程完成！');