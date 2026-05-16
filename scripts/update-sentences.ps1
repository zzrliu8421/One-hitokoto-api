# 句子数据更新脚本 (PowerShell)
# 用法: .\scripts\update-sentences.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 开始更新句子数据..." -ForegroundColor Cyan

# 获取脚本所在目录
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptDir "..")

# 1. 获取最新句子数据
Write-Host "📥 步骤1: 获取最新句子数据..." -ForegroundColor Yellow
node scripts/fetch-sentences.js

# 2. 构建数据模块
Write-Host "🔨 步骤2: 构建数据模块..." -ForegroundColor Yellow
node scripts/build-data-module.js

# 3. 提交更改
Write-Host "📦 步骤3: 提交更改到 Git..." -ForegroundColor Yellow
git add data/ edge-functions/api/sentences-data.js
$date = Get-Date -Format "yyyy-MM-dd"
git commit -m "chore: update sentences data $date" -ErrorAction SilentlyContinue
if ($LASTEXITCODE -ne 0) {
    Write-Host "无更改需要提交" -ForegroundColor Gray
}

# 4. 推送到远程仓库
Write-Host "🚀 步骤4: 推送到远程仓库..." -ForegroundColor Yellow
git push

Write-Host "✅ 句子数据更新完成!" -ForegroundColor Green
Write-Host ""
Write-Host "提示: EdgeOne Pages 会自动检测 Git 推送并重新部署。" -ForegroundColor Gray
