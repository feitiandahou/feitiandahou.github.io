#### 本项目主要页面

- `HomeView` 提交每日学习状态
- `AnalysisView` 图表和数据分析
- `HistoryView` 学习状态历史记录，支持json导入和md/json导出
** 本项目为纯前端项目，默认mock初始数据，之后所有数据均在客户端localStorage 中存储！！仅自己可见 **
#### 本项目使用的技术栈

- Vue 3
- TypeScript
- Vite
- tailwindcss
- Chart.js

#### 本项目自用

长期主义
一个简单的 Vue 3 项目，用于学习 Vue 3 基础语法和组件化开发。
记录自己每日学习时间，方便后续查看和分析。

#### deploy.mjs脚本功能 用于部署到 GitHub Pages

位于src/script/deploy.mjs 在vite.config.ts 中添加配置
npm run deploy 执行部署脚本

- npm run build 生成 dist/ 文件夹（包含 HTML/CSS/JS）
- git checkout main 切换到 部署专用分支 main
- 清空当前目录（保留 .git） 删除源码、node_modules 等，只留 Git 元数据
- 把 dist/ 里的所有文件复制到项目根目录 让 main 分支只包含网站静态文件
- git add . + git commit 提交这些静态文件（相当于手动 git commit -m "Deploy"）
- git push -f origin main 强制推送到 GitHub 的 main 分支
- git checkout source 自动切回你的源码分支，方便继续开发
