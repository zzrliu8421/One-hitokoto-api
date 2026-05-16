// 首页 - API文档和演示

export function onRequestGet(context) {
  try {
    var html = '<!DOCTYPE html>' +
      '<html lang="zh-CN">' +
      '<head>' +
      '  <meta charset="UTF-8">' +
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '  <title>一言API - Hitokoto API Service</title>' +
      '  <style>' +
      '    * { margin: 0; padding: 0; box-sizing: border-box; }' +
      '    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: #333; }' +
      '    .container { max-width: 960px; margin: 0 auto; padding: 40px 20px; }' +
      '    .header { text-align: center; color: white; margin-bottom: 40px; }' +
      '    .header h1 { font-size: 3em; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }' +
      '    .header p { font-size: 1.2em; opacity: 0.9; }' +
      '    .card { background: white; border-radius: 16px; padding: 30px; margin-bottom: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }' +
      '    .card h2 { color: #667eea; margin-bottom: 16px; font-size: 1.5em; }' +
      '    .card h3 { color: #333; margin: 20px 0 12px; font-size: 1.15em; }' +
      '    .card p { color: #666; line-height: 1.8; margin-bottom: 12px; }' +
      '    .demo-box { background: #f8f9fa; border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center; }' +
      '    .demo-text { font-size: 1.3em; color: #333; margin-bottom: 12px; line-height: 1.6; min-height: 2em; }' +
      '    .demo-source { color: #666; font-size: 0.95em; min-height: 1.5em; }' +
      '    .refresh-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 32px; border-radius: 25px; font-size: 1em; cursor: pointer; margin-top: 16px; transition: all 0.3s ease; }' +
      '    .refresh-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4); }' +
      '    .refresh-btn:active { transform: translateY(0); }' +
      '    .api-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 0.95em; }' +
      '    .api-table th, .api-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; }' +
      '    .api-table th { color: #667eea; font-weight: 600; background: #f8f9fa; }' +
      '    .api-table code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-family: "Consolas", monospace; font-size: 0.9em; }' +
      '    .endpoint { background: #2d3748; color: #68d391; padding: 14px 16px; border-radius: 8px; font-family: "Consolas", monospace; margin: 10px 0; overflow-x: auto; font-size: 0.95em; }' +
      '    .endpoint .method { color: #f687b3; font-weight: bold; }' +
      '    .json-example { background: #f8f9fa; padding: 16px; border-radius: 8px; font-family: "Consolas", monospace; font-size: 0.9em; overflow-x: auto; line-height: 1.6; color: #333; }' +
      '    .json-example .key { color: #d73a49; }' +
      '    .json-example .string { color: #032f62; }' +
      '    .json-example .number { color: #005cc5; }' +
      '    .footer { text-align: center; color: white; opacity: 0.8; margin-top: 40px; }' +
      '    .footer a { color: white; text-decoration: underline; }' +
      '    .tag { display: inline-block; background: #e9d8fd; color: #6b46c1; padding: 4px 12px; border-radius: 12px; font-size: 0.85em; margin: 4px; }' +
      '    .tag:hover { background: #d6bcfa; }' +
      '    .status-ok { color: #48bb78; font-weight: bold; }' +
      '    .status-error { color: #f56565; font-weight: bold; }' +
      '    .notice { background: #fffaf0; border-left: 4px solid #ed8936; padding: 12px 16px; margin: 12px 0; border-radius: 0 8px 8px 0; color: #744210; font-size: 0.95em; }' +
      '    .notice a { color: #c05621; }' +
      '    @media (max-width: 600px) { .header h1 { font-size: 2em; } .card { padding: 20px; } .demo-text { font-size: 1.1em; } .api-table { font-size: 0.85em; } .api-table th, .api-table td { padding: 8px; } }' +
      '  </style>' +
      '</head>' +
      '<body>' +
      '  <div class="container">' +
      '    <div class="header">' +
      '      <h1>一言 API</h1>' +
      '      <p>基于 EdgeOne Pages 部署的高性能句子服务</p>' +
      '    </div>' +
      '    <div class="card">' +
      '      <h2>随机一言</h2>' +
      '      <div class="demo-box">' +
      '        <div class="demo-text" id="hitokoto-text">正在加载...</div>' +
      '        <div class="demo-source" id="hitokoto-source"></div>' +
      '        <div style="margin-top: 8px; font-size: 0.85em; color: #999;" id="hitokoto-status"></div>' +
      '        <br>' +
      '        <button class="refresh-btn" id="refresh-btn" onclick="fetchHitokoto()">换一句</button>' +
      '      </div>' +
      '    </div>' +
      '    <div class="card">' +
      '      <h2>接口说明</h2>' +
      '      <p>动漫也好、小说也好、网络也好，不论在哪里，我们总会看到有那么一两个句子能穿透你的心。一言指的就是一句话，可以是动漫中的台词，也可以是网络上的各种小段子。</p>' +
      '      <div class="notice">' +
      '        <strong>提示：</strong>本服务基于 EdgeOne Pages Edge Functions 部署，数据来源于 <a href="https://github.com/hitokoto-osc/sentences-bundle" target="_blank">hitokoto-osc/sentences-bundle</a>。' +
      '      </div>' +
      '      <h3>请求地址</h3>' +
      '      <div class="endpoint"><span class="method">GET</span> https://hitokoto.api.sylv.top/api</div>' +
      '      <h3>请求参数</h3>' +
      '      <table class="api-table">' +
      '        <tr><th>参数</th><th>值</th><th>可选</th><th>说明</th></tr>' +
      '        <tr><td><code>c</code></td><td>见下表</td><td>是</td><td>句子类型</td></tr>' +
      '        <tr><td><code>encode</code></td><td>json / text / js</td><td>是</td><td>返回编码，默认 json</td></tr>' +
      '        <tr><td><code>charset</code></td><td>utf-8</td><td>是</td><td>字符集，默认 utf-8</td></tr>' +
      '        <tr><td><code>callback</code></td><td>如：moe</td><td>是</td><td>JSONP 异步回调函数</td></tr>' +
      '        <tr><td><code>select</code></td><td>默认：.hitokoto</td><td>是</td><td>选择器，配合 encode=js 使用</td></tr>' +
      '        <tr><td><code>min_length</code></td><td>默认：0</td><td>是</td><td>返回句子的最小长度（包含）</td></tr>' +
      '        <tr><td><code>max_length</code></td><td>默认：30</td><td>是</td><td>返回句子的最大长度（包含）</td></tr>' +
      '      </table>' +
      '      <h3>句子类型</h3>' +
      '      <table class="api-table">' +
      '        <tr><th>参数</th><th>说明</th></tr>' +
      '        <tr><td><code>a</code></td><td>动画</td></tr>' +
      '        <tr><td><code>b</code></td><td>漫画</td></tr>' +
      '        <tr><td><code>c</code></td><td>游戏</td></tr>' +
      '        <tr><td><code>d</code></td><td>文学</td></tr>' +
      '        <tr><td><code>e</code></td><td>原创</td></tr>' +
      '        <tr><td><code>f</code></td><td>来自网络</td></tr>' +
      '        <tr><td><code>g</code></td><td>其他</td></tr>' +
      '        <tr><td><code>h</code></td><td>影视</td></tr>' +
      '        <tr><td><code>i</code></td><td>诗词</td></tr>' +
      '        <tr><td><code>j</code></td><td>网易云</td></tr>' +
      '        <tr><td><code>k</code></td><td>哲学</td></tr>' +
      '        <tr><td><code>l</code></td><td>抖机灵</td></tr>' +
      '      </table>' +
      '      <p style="margin-top: 12px; font-size: 0.9em; color: #888;">可选择多个分类，例如：<code>?c=a&amp;c=c</code>。其他类型参数将作为动画类型处理。</p>' +
      '      <h3>返回编码</h3>' +
      '      <table class="api-table">' +
      '        <tr><th>参数</th><th>说明</th></tr>' +
      '        <tr><td><code>text</code></td><td>返回纯文本</td></tr>' +
      '        <tr><td><code>json</code></td><td>返回格式化后的 JSON 文本（默认）</td></tr>' +
      '        <tr><td><code>js</code></td><td>返回指定选择器的同步调用函数，默认选择器为 .hitokoto</td></tr>' +
      '      </table>' +
      '      <h3>示例请求</h3>' +
      '      <div class="endpoint"><span class="method">GET</span> /api?c=f</div>' +
      '      <div class="endpoint"><span class="method">GET</span> /api?encode=text</div>' +
      '      <div class="endpoint"><span class="method">GET</span> /api?callback=myCallback</div>' +
      '      <div class="endpoint"><span class="method">GET</span> /api?min_length=10&amp;max_length=50</div>' +
      '      <h3>返回值</h3>' +
      '      <table class="api-table">' +
      '        <tr><th>返回参数</th><th>描述</th></tr>' +
      '        <tr><td><code>id</code></td><td>一言标识</td></tr>' +
      '        <tr><td><code>uuid</code></td><td>一言唯一标识</td></tr>' +
      '        <tr><td><code>hitokoto</code></td><td>一言正文</td></tr>' +
      '        <tr><td><code>type</code></td><td>类型</td></tr>' +
      '        <tr><td><code>from</code></td><td>一言的出处</td></tr>' +
      '        <tr><td><code>from_who</code></td><td>一言的作者</td></tr>' +
      '        <tr><td><code>creator</code></td><td>添加者</td></tr>' +
      '        <tr><td><code>creator_uid</code></td><td>添加者用户标识</td></tr>' +
      '        <tr><td><code>length</code></td><td>句子长度</td></tr>' +
      '      </table>' +
      '      <h3>响应示例</h3>' +
      '      <div class="json-example">' +
      '        {<br>' +
      '        &nbsp;&nbsp;<span class="key">"id"</span>: <span class="number">7338</span>,<br>' +
      '        &nbsp;&nbsp;<span class="key">"uuid"</span>: <span class="string">"75a45fd4-4f2f-45eb-80cb-6f0a7bcdfaf2"</span>,<br>' +
      '        &nbsp;&nbsp;<span class="key">"hitokoto"</span>: <span class="string">"用代码表达言语的魅力，用代码书写山河的壮丽。"</span>,<br>' +
      '        &nbsp;&nbsp;<span class="key">"type"</span>: <span class="string">"f"</span>,<br>' +
      '        &nbsp;&nbsp;<span class="key">"from"</span>: <span class="string">"一言开发者中心"</span>,<br>' +
      '        &nbsp;&nbsp;<span class="key">"from_who"</span>: <span class="string">"一言"</span>,<br>' +
      '        &nbsp;&nbsp;<span class="key">"creator"</span>: <span class="string">"DreamOne"</span>,<br>' +
      '        &nbsp;&nbsp;<span class="key">"creator_uid"</span>: <span class="number">9209</span>,<br>' +
      '        &nbsp;&nbsp;<span class="key">"length"</span>: <span class="number">22</span><br>' +
      '        }' +
      '      </div>' +
      '      <h3>其他接口</h3>' +
      '      <div class="endpoint"><span class="method">GET</span> /api/categories - 获取分类列表</div>' +
      '    </div>' +
      '    <div class="card">' +
      '      <h2>句子分类</h2>' +
      '      <div style="margin-top: 12px;">' +
      '        <span class="tag">a - 动画</span>' +
      '        <span class="tag">b - 漫画</span>' +
      '        <span class="tag">c - 游戏</span>' +
      '        <span class="tag">d - 文学</span>' +
      '        <span class="tag">e - 原创</span>' +
      '        <span class="tag">f - 网络</span>' +
      '        <span class="tag">g - 其他</span>' +
      '        <span class="tag">h - 影视</span>' +
      '        <span class="tag">i - 诗词</span>' +
      '        <span class="tag">j - 网易云</span>' +
      '        <span class="tag">k - 哲学</span>' +
      '        <span class="tag">l - 抖机灵</span>' +
      '      </div>' +
      '    </div>' +
      '    <div class="footer">' +
      '      <p>数据来源: <a href="https://github.com/hitokoto-osc/sentences-bundle" target="_blank">hitokoto-osc/sentences-bundle</a></p>' +
      '      <p style="margin-top: 8px;">部署于 EdgeOne Pages | 参考文档: <a href="https://developer.hitokoto.cn/sentence/" target="_blank">developer.hitokoto.cn</a></p>' +
      '    </div>' +
      '  </div>' +
      '  <script>' +
      '    var typewriter = {' +
      '      textEl: null,' +
      '      sourceEl: null,' +
      '      statusEl: null,' +
      '      btn: null,' +
      '      queue: [],' +
      '      currentIndex: 0,' +
      '      isDeleting: false,' +
      '      displayText: "",' +
      '      sourceText: "",' +
      '      typingSpeed: 80,' +
      '      deleteSpeed: 50,' +
      '      pauseTime: 8000,' +
      '      timer: null,' +
      '      isRunning: false,' +
      '      init: function() {' +
      '        this.textEl = document.getElementById("hitokoto-text");' +
      '        this.sourceEl = document.getElementById("hitokoto-source");' +
      '        this.statusEl = document.getElementById("hitokoto-status");' +
      '        this.btn = document.getElementById("refresh-btn");' +
      '        this.loadQueue();' +
      '      },' +
      '      loadQueue: async function() {' +
      '        this.btn.disabled = true;' +
      '        try {' +
      '          var res = await fetch("/api?t=" + Date.now());' +
      '          if (!res.ok) throw new Error("HTTP " + res.status);' +
      '          var data = await res.json();' +
      '          if (data.code && data.code !== 200) throw new Error(data.message || "API Error");' +
      '          this.queue.push(data);' +
      '          if (!this.isRunning) {' +
      '            this.isRunning = true;' +
      '            this.run();' +
      '          }' +
      '          this.preloadNext();' +
      '        } catch (err) {' +
      '          console.error("Fetch error:", err);' +
      '          this.textEl.textContent = "获取失败，请稍后重试";' +
      '          this.sourceEl.textContent = "";' +
      '          this.statusEl.innerHTML = "<span class=\'status-error\'>✗</span> 错误: " + err.message;' +
      '          this.btn.disabled = false;' +
      '        }' +
      '      },' +
      '      preloadNext: async function() {' +
      '        try {' +
      '          var res = await fetch("/api?t=" + Date.now());' +
      '          if (!res.ok) return;' +
      '          var data = await res.json();' +
      '          if (data.code && data.code !== 200) return;' +
      '          this.queue.push(data);' +
      '        } catch (e) {}' +
      '      },' +
      '      run: function() {' +
      '        if (this.queue.length === 0) {' +
      '          this.loadQueue();' +
      '          return;' +
      '        }' +
      '        var data = this.queue[this.currentIndex];' +
      '        var fullText = data.hitokoto || "";' +
      '        var fromText = data.from || "";' +
      '        var fromWhoText = data.from_who || "";' +
      '        var sourceParts = [];' +
      '        if (fromText) sourceParts.push(fromText);' +
      '        if (fromWhoText) sourceParts.push(fromWhoText);' +
      '        var fullSource = sourceParts.length > 0 ? "—— " + sourceParts.join(" · ") : "";' +
      '        this.statusEl.innerHTML = "<span class=\'status-ok\'>✓</span> 分类: " + (data.category_name || data.type || "") + " | 长度: " + (data.length || 0) + "字";' +
      '        if (!this.isDeleting) {' +
      '          if (this.displayText.length < fullText.length) {' +
      '            this.displayText = fullText.substring(0, this.displayText.length + 1);' +
      '            this.textEl.textContent = this.displayText;' +
      '            this.sourceEl.textContent = "";' +
      '            this.timer = setTimeout(function() { typewriter.run(); }, this.typingSpeed);' +
      '          } else if (this.sourceText.length < fullSource.length) {' +
      '            this.sourceText = fullSource.substring(0, this.sourceText.length + 1);' +
      '            this.sourceEl.textContent = this.sourceText;' +
      '            this.timer = setTimeout(function() { typewriter.run(); }, this.typingSpeed);' +
      '          } else {' +
      '            this.timer = setTimeout(function() { typewriter.isDeleting = true; typewriter.run(); }, this.pauseTime);' +
      '          }' +
      '        } else {' +
      '          if (this.sourceText.length > 0) {' +
      '            this.sourceText = fullSource.substring(0, this.sourceText.length - 1);' +
      '            this.sourceEl.textContent = this.sourceText;' +
      '            this.timer = setTimeout(function() { typewriter.run(); }, this.deleteSpeed);' +
      '          } else if (this.displayText.length > 0) {' +
      '            this.displayText = fullText.substring(0, this.displayText.length - 1);' +
      '            this.textEl.textContent = this.displayText;' +
      '            this.timer = setTimeout(function() { typewriter.run(); }, this.deleteSpeed);' +
      '          } else {' +
      '            this.isDeleting = false;' +
      '            this.currentIndex++;' +
      '            if (this.currentIndex >= this.queue.length) {' +
      '              this.currentIndex = 0;' +
      '              this.queue = [];' +
      '              this.loadQueue();' +
      '              return;' +
      '            }' +
      '            this.run();' +
      '          }' +
      '        }' +
      '      },' +
      '      refresh: function() {' +
      '        if (this.timer) clearTimeout(this.timer);' +
      '        this.isDeleting = false;' +
      '        this.displayText = "";' +
      '        this.sourceText = "";' +
      '        this.currentIndex = 0;' +
      '        this.queue = [];' +
      '        this.isRunning = false;' +
      '        this.loadQueue();' +
      '      }' +
      '    };' +
      '    async function fetchHitokoto() {' +
      '      typewriter.refresh();' +
      '    }' +
      '    typewriter.init();' +
      '  </script>' +
      '</body>' +
      '</html>';

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'max-age=60'
      }
    });
  } catch (error) {
    return new Response('Internal Server Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }
}
