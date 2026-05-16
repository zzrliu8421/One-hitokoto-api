# OneHitokoto-API

基于 EdgeOne Pages 部署的一言API服务，使用 [hitokoto-osc/sentences-bundle](https://github.com/hitokoto-osc/sentences-bundle) 作为句子源。

## 功能特性

- 基于 EdgeOne Pages Edge Functions，全球边缘节点部署，超低延迟
- 随机获取一言，支持按分类筛选
- 支持多种返回格式：JSON、纯文本、JS变量、JSONP
- 支持按句子长度过滤
- 提供分类列表接口
- 全CORS支持，跨域友好
- 边缘缓存加速 + 内存预加载
- 多源镜像自动切换，数据获取更稳定

## 在线演示

**首页**: https://hitokoto.api.sylv.top/

**API 接口**: https://hitokoto.api.sylv.top/api

## API 文档

### 获取随机一言

```
GET /api
```

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| c | string | 否 | 句子分类，如 `a`(动画), `b`(漫画), `c`(游戏) 等 |
| encode | string | 否 | 返回格式：`json`(默认), `text`, `js` |
| callback | string | 否 | JSONP 回调函数名 |
| min_length | number | 否 | 最小句子长度（包含） |
| max_length | number | 否 | 最大句子长度（包含） |

#### 句子分类

| 分类码 | 名称 | 说明 |
|--------|------|------|
| a | 动画 | Anime |
| b | 漫画 | Comic |
| c | 游戏 | Game |
| d | 文学 | Literature |
| e | 原创 | Original |
| f | 网络 | Internet |
| g | 其他 | Other |
| h | 影视 | Movie |
| i | 诗词 | Poetry |
| j | 网易云 | Netease |
| k | 哲学 | Philosophy |
| l | 抖机灵 | Wit |

#### 响应示例 (JSON)

```json
{
  "id": 7338,
  "uuid": "75a45fd4-4f2f-45eb-80cb-6f0a7bcdfaf2",
  "hitokoto": "用代码表达言语的魅力，用代码书写山河的壮丽。",
  "type": "f",
  "from": "一言开发者中心",
  "from_who": "一言",
  "creator": "DreamOne",
  "creator_uid": 9209,
  "length": 22,
  "category_name": "网络",
  "category_desc": "Internet"
}
```

#### 示例请求

```bash
# 获取随机一言（JSON格式）
curl https://hitokoto.api.sylv.top/api

# 获取动画类一言
curl https://hitokoto.api.sylv.top/api?c=a

# 获取纯文本格式
curl https://hitokoto.api.sylv.top/api?encode=text

# JSONP 回调
curl https://hitokoto.api.sylv.top/api?callback=myCallback

# 长度过滤
curl "https://hitokoto.api.sylv.top/api?min_length=10&max_length=50"
```

### 获取分类列表

```
GET /api/categories.json
```

#### 响应示例

```json
{
  "code": 200,
  "data": [
    { "key": "a", "name": "动画", "desc": "Anime" },
    { "key": "b", "name": "漫画", "desc": "Comic" },
    ...
  ],
  "count": 12
}
```

## 部署方式

### 1. 通过 EdgeOne CLI 部署

```bash
# 安装 CLI
npm install -g @edgeone/cli

# 登录
edgeone login

# 部署
edgeone deploy
```

### 2. 通过 Git 导入部署

1. Fork 本仓库
2. 登录 [EdgeOne Pages 控制台](https://console.tencentcloud.com/edgeone/pages)
3. 选择「导入 Git 仓库」，授权并选择本仓库
4. 点击部署，等待构建完成

### 3. 通过 Pages MCP 部署

使用支持 MCP 的编辑器（如 Cursor、Trae），配置 Pages MCP Server 后直接部署。

## 数据更新

句子数据存储在 `data/` 目录下，可通过以下方式更新：

```bash
# 手动更新
node scripts/fetch-sentences.js

# 或使用 PowerShell 脚本（Windows）
.\scripts\update-sentences.ps1

# 或使用 Bash 脚本（Linux/macOS）
./scripts/update-sentences.sh
```

项目已配置 GitHub Actions 自动更新工作流（`.github/workflows/update-sentences.yml`），每天凌晨 3 点 (UTC) 自动从远程源获取最新数据。

## 技术栈

- [EdgeOne Pages](https://edgeone.ai/pages) - 边缘计算平台
- [Edge Functions](https://edgeone.ai/document/edge-functions) - 边缘函数
- [hitokoto-osc/sentences-bundle](https://github.com/hitokoto-osc/sentences-bundle) - 句子数据源

## 项目结构

```
.
├── api/
│   └── categories.json              # 分类列表静态数据
├── data/                            # 句子 JSON 数据
│   ├── a.json ~ l.json              # 各分类句子数据
│   └── index.json                   # 数据索引（统计信息）
├── edge-functions/
│   └── api.js                       # 一言API核心接口 (/api)
├── scripts/
│   ├── fetch-sentences.js           # 获取句子数据（多源镜像）
│   ├── update-sentences.ps1         # PowerShell 更新脚本
│   └── update-sentences.sh          # Bash 更新脚本
├── .github/workflows/
│   └── update-sentences.yml         # 自动更新工作流
├── edgeone.json                     # EdgeOne Pages 配置（缓存、CORS）
├── index.html                       # 首页（API文档 + 演示）
├── package.json
└── README.md
```

## 参考文档

- [一言开发者文档](https://developer.hitokoto.cn/sentence/)
- [EdgeOne Pages 文档](https://edgeone.ai/document/pages)

## 开源协议

MIT License
