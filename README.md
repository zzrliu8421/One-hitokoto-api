# 一言 API (Hitokoto API)

基于 EdgeOne Pages 部署的一言API服务，使用 [hitokoto-osc/sentences-bundle](https://github.com/hitokoto-osc/sentences-bundle) 作为句子源。

## 功能特性

- 🚀 基于 EdgeOne Pages Edge Functions，全球边缘节点部署，超低延迟
- 🎲 随机获取一言，支持按分类筛选
- 📦 支持多种返回格式：JSON、纯文本、JS变量、JSONP
- 🔍 支持按句子长度过滤
- 🏷️ 提供分类列表接口
- 🌐 全CORS支持，跨域友好
- ⚡ 边缘缓存加速

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

## API 文档

### 获取随机一言

```
GET /api/hitokoto
```

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| c | string | 否 | 句子分类，如 `a`(动画), `b`(漫画), `c`(游戏) 等 |
| encode | string | 否 | 返回格式：`json`(默认), `text`, `js` |
| callback | string | 否 | JSONP 回调函数名 |
| min_length | number | 否 | 最小句子长度 |
| max_length | number | 否 | 最大句子长度 |

#### 响应示例 (JSON)

```json
{
  "id": 1,
  "uuid": "9818ecda-9cbf-4f2a-9af8-8136ef39cfcd",
  "hitokoto": "与众不同的生活方式很累人呢，因为找不到借口。",
  "type": "a",
  "from": "幸运星",
  "from_who": null,
  "creator": "跳舞的果果",
  "creator_uid": 0,
  "length": 22,
  "category_name": "动画",
  "category_desc": "Anime"
}
```

#### 示例请求

```bash
# 获取随机一言（JSON格式）
curl https://your-domain.com/api/hitokoto

# 获取动画类一言
curl https://your-domain.com/api/hitokoto?c=a

# 获取纯文本格式
curl https://your-domain.com/api/hitokoto?encode=text

# JSONP 回调
curl https://your-domain.com/api/hitokoto?callback=myCallback

# 长度过滤
curl https://your-domain.com/api/hitokoto?min_length=10&max_length=50
```

### 获取分类列表

```
GET /api/categories
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

## 句子分类

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

## 技术栈

- [EdgeOne Pages](https://edgeone.ai/pages) - 边缘计算平台
- [Edge Functions](https://edgeone.ai/document/edge-functions) - 边缘函数
- [hitokoto-osc/sentences-bundle](https://github.com/hitokoto-osc/sentences-bundle) - 句子数据源

## 项目结构

```
.
├── edge-functions/
│   ├── index.js          # 首页（API文档 + 演示）
│   └── api/
│       ├── hitokoto.js   # 一言API核心接口
│       └── categories.js # 分类列表接口
├── package.json
└── README.md
```

## 开源协议

MIT License
