#!/bin/bash
# 句子数据更新脚本
# 用法: ./scripts/update-sentences.sh

set -e

echo "🚀 开始更新句子数据..."

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# 1. 获取最新句子数据
echo "📥 步骤1: 获取最新句子数据..."
node scripts/fetch-sentences.js

# 2. 构建数据模块
echo "🔨 步骤2: 构建数据模块..."
node scripts/build-data-module.js

# 3. 提交更改
echo "📦 步骤3: 提交更改到 Git..."
git add data/ edge-functions/api/sentences-data.js
git commit -m "chore: update sentences data $(date +%Y-%m-%d)" || echo "无更改需要提交"

# 4. 推送到远程仓库
echo "🚀 步骤4: 推送到远程仓库..."
git push

echo "✅ 句子数据更新完成!"
echo ""
echo "提示: EdgeOne Pages 会自动检测 Git 推送并重新部署。"
