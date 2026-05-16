// 首页 - API文档和演示

export function onRequestGet(context) {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>一言API - Hitokoto API Service</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: #333;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    .header {
      text-align: center;
      color: white;
      margin-bottom: 40px;
    }
    
    .header h1 {
      font-size: 3em;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    
    .header p {
      font-size: 1.2em;
      opacity: 0.9;
    }
    
    .card {
      background: white;
      border-radius: 16px;
      padding: 30px;
      margin-bottom: 24px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    
    .card h2 {
      color: #667eea;
      margin-bottom: 16px;
      font-size: 1.5em;
    }
    
    .demo-box {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 24px;
      margin: 20px 0;
      text-align: center;
    }
    
    .demo-text {
      font-size: 1.3em;
      color: #333;
      margin-bottom: 12px;
      line-height: 1.6;
    }
    
    .demo-source {
      color: #666;
      font-size: 0.95em;
    }
    
    .refresh-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 25px;
      font-size: 1em;
      cursor: pointer;
      margin-top: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .refresh-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
    
    .api-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    
    .api-table th,
    .api-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    
    .api-table th {
      color: #667eea;
      font-weight: 600;
    }
    
    .api-table code {
      background: #f0f0f0;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'Consolas', monospace;
      font-size: 0.9em;
    }
    
    .endpoint {
      background: #2d3748;
      color: #68d391;
      padding: 16px;
      border-radius: 8px;
      font-family: 'Consolas', monospace;
      margin: 12px 0;
      overflow-x: auto;
    }
    
    .endpoint .method {
      color: #f687b3;
      font-weight: bold;
    }
    
    .footer {
      text-align: center;
      color: white;
      opacity: 0.8;
      margin-top: 40px;
    }
    
    .footer a {
      color: white;
      text-decoration: underline;
    }
    
    .tag {
      display: inline-block;
      background: #e9d8fd;
      color: #6b46c1;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      margin: 4px;
    }
    
    @media (max-width: 600px) {
      .header h1 { font-size: 2em; }
      .card { padding: 20px; }
      .demo-text { font-size: 1.1em; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>一言 API</h1>
      <p>基于 EdgeOne Pages 部署的优雅句子服务</p>
    </div>
    
    <div class="card">
      <h2>🎲 随机一言</h2>
      <div class="demo-box">
        <div class="demo-text" id="hitokoto-text">正在加载...</div>
        <div class="demo-source" id="hitokoto-source"></div>
        <br>
        <button class="refresh-btn" onclick="fetchHitokoto()">换一句</button>
      </div>
    </div>
    
    <div class="card">
      <h2>📚 API 文档</h2>
      <p style="margin-bottom: 16px; color: #666;">支持多种格式返回，跨域访问，简单易用。</p>
      
      <h3 style="color: #333; margin: 20px 0 12px;">基础接口</h3>
      <div class="endpoint"><span class="method">GET</span> /api/hitokoto</div>
      
      <h3 style="color: #333; margin: 20px 0 12px;">请求参数</h3>
      <table class="api-table">
        <tr>
          <th>参数</th>
          <th>类型</th>
          <th>说明</th>
        </tr>
        <tr>
          <td><code>c</code></td>
          <td>string</td>
          <td>句子类型，如 a(动画), b(漫画), c(游戏) 等</td>
        </tr>
        <tr>
          <td><code>encode</code></td>
          <td>string</td>
          <td>返回格式: json(默认), text, js</td>
        </tr>
        <tr>
          <td><code>callback</code></td>
          <td>string</td>
          <td>JSONP 回调函数名</td>
        </tr>
        <tr>
          <td><code>min_length</code></td>
          <td>number</td>
          <td>最小句子长度</td>
        </tr>
        <tr>
          <td><code>max_length</code></td>
          <td>number</td>
          <td>最大句子长度</td>
        </tr>
      </table>
      
      <h3 style="color: #333; margin: 20px 0 12px;">示例请求</h3>
      <div class="endpoint"><span class="method">GET</span> /api/hitokoto?c=a&encode=json</div>
      <div class="endpoint"><span class="method">GET</span> /api/hitokoto?encode=text</div>
      <div class="endpoint"><span class="method">GET</span> /api/hitokoto?callback=myCallback</div>
      
      <h3 style="color: #333; margin: 20px 0 12px;">分类列表</h3>
      <div class="endpoint"><span class="method">GET</span> /api/categories</div>
    </div>
    
    <div class="card">
      <h2>🏷️ 句子分类</h2>
      <div style="margin-top: 12px;">
        <span class="tag">a - 动画</span>
        <span class="tag">b - 漫画</span>
        <span class="tag">c - 游戏</span>
        <span class="tag">d - 文学</span>
        <span class="tag">e - 原创</span>
        <span class="tag">f - 网络</span>
        <span class="tag">g - 其他</span>
        <span class="tag">h - 影视</span>
        <span class="tag">i - 诗词</span>
        <span class="tag">j - 网易云</span>
        <span class="tag">k - 哲学</span>
        <span class="tag">l - 抖机灵</span>
      </div>
    </div>
    
    <div class="card">
      <h2>📦 响应示例</h2>
      <pre style="background: #f8f9fa; padding: 16px; border-radius: 8px; overflow-x: auto; margin-top: 12px;"><code>{
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
}</code></pre>
    </div>
    
    <div class="footer">
      <p>数据来源: <a href="https://github.com/hitokoto-osc/sentences-bundle" target="_blank">hitokoto-osc/sentences-bundle</a></p>
      <p style="margin-top: 8px;">部署于 EdgeOne Pages</p>
    </div>
  </div>
  
  <script>
    async function fetchHitokoto() {
      const textEl = document.getElementById('hitokoto-text');
      const sourceEl = document.getElementById('hitokoto-source');
      
      textEl.textContent = '加载中...';
      sourceEl.textContent = '';
      
      try {
        const res = await fetch('/api/hitokoto');
        const data = await res.json();
        
        textEl.textContent = data.hitokoto || '获取失败';
        sourceEl.textContent = data.from ? '—— 《' + data.from + '》' : '';
      } catch (err) {
        textEl.textContent = '获取失败，请稍后重试';
      }
    }
    
    fetchHitokoto();
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'max-age=60'
    }
  });
}
