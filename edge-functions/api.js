// 一言API核心实现 - 高性能优化版
// 接口路径: /api (通过 api.js 直接映射)
// 数据来源: 本地 data/ 目录下的 JSON 文件 + 内联备用数据

// 句子类型映射
const CATEGORY_MAP = {
  a: { name: '动画', desc: 'Anime' },
  b: { name: '漫画', desc: 'Comic' },
  c: { name: '游戏', desc: 'Game' },
  d: { name: '文学', desc: 'Literature' },
  e: { name: '原创', desc: 'Original' },
  f: { name: '网络', desc: 'Internet' },
  g: { name: '其他', desc: 'Other' },
  h: { name: '影视', desc: 'Movie' },
  i: { name: '诗词', desc: 'Poetry' },
  j: { name: '网易云', desc: 'Netease' },
  k: { name: '哲学', desc: 'Philosophy' },
  l: { name: '抖机灵', desc: 'Wit' }
};

const ALL_CATEGORIES = Object.keys(CATEGORY_MAP);

// 内联备用句子数据（当 fetch 读取失败时使用）
const FALLBACK_DATA = {
  a: [
    { id: 1, uuid: '9818ecda-9cbf-4f2a-9af8-8136ef39cfcd', hitokoto: '与众不同的生活方式很累人呢，因为找不到借口。', type: 'a', from: '幸运星', from_who: null, creator: '跳舞的果果', creator_uid: 0, length: 22 },
    { id: 2, uuid: '4e71bc61-9f2e-49e1-a62f-d4b8ad9716c6', hitokoto: '面对就好，去经历就好。', type: 'a', from: '花伞菌', from_who: null, creator: 'umbrella', creator_uid: 0, length: 11 },
    { id: 3, uuid: '8ea19537-2bae-4f64-8296-b8f1eed8006a', hitokoto: '将愿望倾入不愿忘却的回忆中……', type: 'a', from: 'ef-a tale of memories', from_who: null, creator: 'lqsasa', creator_uid: 0, length: 15 },
    { id: 4, uuid: 'a2a6645b-a631-4a7c-a5c3-d835e4775c17', hitokoto: '美好的人眼里映出的世界也是美好的。', type: 'a', from: 'ARIA', from_who: null, creator: 'misaki', creator_uid: 0, length: 17 },
    { id: 5, uuid: '1905d15f-9ade-454f-8478-3b169c8dee61', hitokoto: '看似美好的东西，往往藏着陷阱。', type: 'a', from: '只有神知道的世界', from_who: null, creator: '紫月岚', creator_uid: 0, length: 15 },
    { id: 6, uuid: '124cdf23-bbbb-4724-adc0-02e8aedf8f17', hitokoto: '天空是连着的，如果我们也能各自发光的话，无论距离有多远，都能看到彼此努力的身影。', type: 'a', from: '龙虎斗', from_who: null, creator: 'Sai', creator_uid: 0, length: 40 },
    { id: 7, uuid: 'f0ae41d9-25ab-4960-9506-22171dcd1504', hitokoto: '恋ではなく、爱でもなく、もっとずっと 深く重い。', type: 'a', from: 'sweet   pool', from_who: null, creator: '占星术杀人魔法', creator_uid: 0, length: 24 },
    { id: 8, uuid: '3b2e6049-5dca-4cfe-9b4a-f16b6db17c38', hitokoto: '花开花落，再灿烂的星光也会消失。', type: 'a', from: '圣斗士星矢', from_who: null, creator: '水幻之音', creator_uid: 0, length: 16 },
    { id: 9, uuid: 'afbaeea5-b6ab-4d9f-b08a-abc65a9d87cc', hitokoto: '挡着在我们面前的是巨大庞然的人生，阻隔在我们中间的是广阔无际的时间，对于他们，我们无能为力……', type: 'a', from: '秒速五厘米', from_who: null, creator: 'zjl4835751', creator_uid: 0, length: 47 },
    { id: 10, uuid: 'aa833615-6333-439c-8ca3-1a067e884d58', hitokoto: '我是一个经常笑的人，可我不是经常开心的人。', type: 'a', from: '未闻花名', from_who: null, creator: 'Sai', creator_uid: 0, length: 21 },
    { id: 11, uuid: '27f3fd8b-53c6-4976-b6ad-1d56653d9a03', hitokoto: '努力是不会背叛自己的，虽然梦想有时会背叛自己。', type: 'a', from: '我的青春恋爱物语果然有问题', from_who: null, creator: '百花残', creator_uid: 0, length: 23 },
    { id: 12, uuid: '21876029-7f74-4d10-86d8-70c724248f5d', hitokoto: '人经历风浪是会变得更强，可是船不同，日积月累的只有伤痛。', type: 'a', from: '海贼王', from_who: null, creator: 'Jonse', creator_uid: 0, length: 28 },
    { id: 13, uuid: '1c496696-7d7c-4dde-b8be-3a71cea020ab', hitokoto: '真相只有一个！', type: 'a', from: '柯南', from_who: null, creator: 'freejishu', creator_uid: 1, length: 7 },
    { id: 14, uuid: 'd862941f-5404-45c8-84fa-aa97eb9db92d', hitokoto: '用你的笑容去改变这个世界，别让这个世界改变了你的笑容。', type: 'a', from: '网络', from_who: null, creator: '酱七', creator_uid: 0, length: 27 },
    { id: 15, uuid: 'a4c37812-1fff-4d66-98c1-1b5ecf687e1e', hitokoto: '我有在反省，但我不后悔。', type: 'a', from: '物语系列', from_who: null, creator: 'billykingzero', creator_uid: 0, length: 12 },
    { id: 16, uuid: '489cf466-ef41-4ea3-b26f-bf454a02efbb', hitokoto: '我没有梦想，但是我能保护！', type: 'a', from: '假面骑士555', from_who: null, creator: '魅影陌客', creator_uid: 0, length: 13 },
    { id: 17, uuid: 'c893e847-d381-4d3e-93ae-60292fab099a', hitokoto: '或许只需一滴露水，便能守护这绽放的花朵。', type: 'a', from: '反叛的鲁鲁修', from_who: null, creator: '夜夜天天', creator_uid: 0, length: 20 },
    { id: 18, uuid: '5632f221-4e22-43c0-a90a-ef8581b8e27b', hitokoto: '我不会让任何人看到我软弱的一面。', type: 'a', from: '桔梗', from_who: null, creator: '星之彼岸', creator_uid: 0, length: 16 },
    { id: 19, uuid: '48fd5061-dc77-419c-8beb-b96d71f930ff', hitokoto: '当你想做一件事，却无能为力的时候，是最痛苦的。', type: 'a', from: '高达SEED', from_who: null, creator: '矢野加奈', creator_uid: 0, length: 23 },
    { id: 20, uuid: 'd05ae153-c17d-4546-8ccb-347bead06b0a', hitokoto: '我的腿让我停下，可是心却不允许我那么做。', type: 'a', from: '钢之炼金术师', from_who: null, creator: 'Sakamoto', creator_uid: 0, length: 20 }
  ],
  b: [
    { id: 101, uuid: 'd0e1f2a3-b4c5-6789-defa-890123456789', hitokoto: '即使是绝望，也绝不能放弃希望。', type: 'b', from: '进击的巨人', from_who: null, creator: 'system', creator_uid: 0, length: 15 },
    { id: 102, uuid: 'e1f2a3b4-c5d6-7890-efab-901234567890', hitokoto: '人的梦想，是不会终结的！', type: 'b', from: '海贼王', from_who: null, creator: 'system', creator_uid: 0, length: 12 }
  ],
  c: [
    { id: 201, uuid: 'f2a3b4c5-d6e7-8901-fabc-012345678901', hitokoto: '游戏就是为了开心而存在的。', type: 'c', from: '原创', from_who: null, creator: 'system', creator_uid: 0, length: 13 },
    { id: 202, uuid: 'a3b4c5d6-e7f8-9012-abcd-123456789012', hitokoto: '在虚拟世界中寻找真实感的人，一定有问题。', type: 'c', from: '凉宫春日的忧郁', from_who: null, creator: 'system', creator_uid: 0, length: 21 }
  ],
  d: [
    { id: 301, uuid: 'b4c5d6e7-f8a9-0123-bcde-234567890123', hitokoto: '生活不止眼前的苟且，还有诗和远方。', type: 'd', from: '高晓松', from_who: null, creator: 'system', creator_uid: 0, length: 17 },
    { id: 302, uuid: 'c5d6e7f8-a9b0-1234-cdef-345678901234', hitokoto: '黑夜给了我黑色的眼睛，我却用它寻找光明。', type: 'd', from: '顾城', from_who: null, creator: 'system', creator_uid: 0, length: 21 },
    { id: 303, uuid: 'd6e7f8a9-b0c1-2345-defa-456789012345', hitokoto: '人生如逆旅，我亦是行人。', type: 'd', from: '苏轼', from_who: null, creator: 'system', creator_uid: 0, length: 12 },
    { id: 304, uuid: 'e7f8a9b0-c1d2-3456-efab-567890123456', hitokoto: '山有木兮木有枝，心悦君兮君不知。', type: 'd', from: '越人歌', from_who: null, creator: 'system', creator_uid: 0, length: 16 }
  ],
  e: [
    { id: 401, uuid: 'f8a9b0c1-d2e3-4567-fabc-678901234567', hitokoto: '每一个不曾起舞的日子，都是对生命的辜负。', type: 'e', from: '尼采', from_who: null, creator: 'system', creator_uid: 0, length: 20 },
    { id: 402, uuid: 'a9b0c1d2-e3f4-5678-abcd-789012345678', hitokoto: '愿你出走半生，归来仍是少年。', type: 'e', from: '网络', from_who: null, creator: 'system', creator_uid: 0, length: 15 }
  ],
  f: [
    { id: 501, uuid: 'b0c1d2e3-f4a5-6789-bcde-890123456789', hitokoto: '世界那么大，我想去看看。', type: 'f', from: '网络', from_who: null, creator: 'system', creator_uid: 0, length: 12 },
    { id: 502, uuid: 'c1d2e3f4-a5b6-7890-cdef-901234567890', hitokoto: '不忘初心，方得始终。', type: 'f', from: '网络', from_who: null, creator: 'system', creator_uid: 0, length: 10 }
  ],
  g: [
    { id: 601, uuid: 'd2e3f4a5-b6c7-8901-defa-012345678901', hitokoto: '知行合一。', type: 'g', from: '王阳明', from_who: null, creator: 'system', creator_uid: 0, length: 4 },
    { id: 602, uuid: 'e3f4a5b6-c7d8-9012-efab-123456789012', hitokoto: '千里之行，始于足下。', type: 'g', from: '老子', from_who: null, creator: 'system', creator_uid: 0, length: 10 }
  ],
  h: [
    { id: 701, uuid: 'f4a5b6c7-d8e9-0123-fabc-234567890123', hitokoto: '人生就像一盒巧克力，你永远不知道下一颗是什么味道。', type: 'h', from: '阿甘正传', from_who: null, creator: 'system', creator_uid: 0, length: 26 },
    { id: 702, uuid: 'a5b6c7d8-e9f0-1234-abcd-345678901234', hitokoto: '希望是件好东西，也许是人间至善。', type: 'h', from: '肖申克的救赎', from_who: null, creator: 'system', creator_uid: 0, length: 16 }
  ],
  i: [
    { id: 801, uuid: 'b6c7d8e9-f0a1-2345-bcde-456789012345', hitokoto: '采菊东篱下，悠然见南山。', type: 'i', from: '陶渊明', from_who: null, creator: 'system', creator_uid: 0, length: 12 },
    { id: 802, uuid: 'c7d8e9f0-a1b2-3456-cdef-567890123456', hitokoto: '落霞与孤鹜齐飞，秋水共长天一色。', type: 'i', from: '王勃', from_who: null, creator: 'system', creator_uid: 0, length: 16 },
    { id: 803, uuid: 'd8e9f0a1-b2c3-4567-defa-678901234567', hitokoto: '大漠孤烟直，长河落日圆。', type: 'i', from: '王维', from_who: null, creator: 'system', creator_uid: 0, length: 12 }
  ],
  j: [
    { id: 901, uuid: 'e9f0a1b2-c3d4-5678-efab-789012345678', hitokoto: '你是我患得患失的梦，我是你可有可无的人。', type: 'j', from: '网易云音乐', from_who: null, creator: 'system', creator_uid: 0, length: 20 },
    { id: 902, uuid: 'f0a1b2c3-d4e5-6789-fabc-890123456789', hitokoto: '后来的我们，什么都有了，却没有了我们。', type: 'j', from: '网易云音乐', from_who: null, creator: 'system', creator_uid: 0, length: 19 }
  ],
  k: [
    { id: 1001, uuid: 'a1b2c3d4-e5f6-7890-abcd-901234567890', hitokoto: '我思故我在。', type: 'k', from: '笛卡尔', from_who: null, creator: 'system', creator_uid: 0, length: 5 },
    { id: 1002, uuid: 'b2c3d4e5-f6a7-8901-bcde-012345678901', hitokoto: '认识你自己。', type: 'k', from: '苏格拉底', from_who: null, creator: 'system', creator_uid: 0, length: 6 }
  ],
  l: [
    { id: 1101, uuid: 'c3d4e5f6-a7b8-9012-cdef-123456789012', hitokoto: '我不是针对谁，我是说在座的各位都是垃圾。', type: 'l', from: '破坏之王', from_who: null, creator: 'system', creator_uid: 0, length: 21 },
    { id: 1102, uuid: 'd4e5f6a7-b8c9-0123-defa-234567890123', hitokoto: '贫穷限制了我的想象力。', type: 'l', from: '网络', from_who: null, creator: 'system', creator_uid: 0, length: 11 }
  ]
};

// 内存缓存 - 存储所有分类的句子数据
const memoryCache = new Map();

// 预加载状态标记
let preloadPromise = null;
let preloadDone = false;

// fetch 超时时间 (毫秒)
const FETCH_TIMEOUT = 3000;

// 缓存命名空间
const CACHE_NAMESPACE = 'hitokoto-data';

/**
 * 获取 EdgeOne Pages Cache 实例
 */
async function getCache() {
  return caches.open(CACHE_NAMESPACE);
}

/**
 * 从缓存读取句子数据
 * @param {string} category - 句子类型
 * @returns {Promise<Array|null>}
 */
async function getCachedSentences(category) {
  try {
    var cache = await getCache();
    var request = new Request('https://hitokoto.api.sylv.top/data/' + category + '.json');
    var response = await cache.match(request);
    if (response) {
      var data = await response.json();
      return Array.isArray(data) ? data : null;
    }
  } catch (e) {
    console.error('Cache read error:', e.message || e);
  }
  return null;
}

/**
 * 将句子数据写入缓存
 * @param {string} category - 句子类型
 * @param {Array} data - 句子数据
 */
async function setCachedSentences(category, data) {
  try {
    var cache = await getCache();
    var request = new Request('https://hitokoto.api.sylv.top/data/' + category + '.json');
    var response = new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=86400'
      }
    });
    await cache.put(request, response);
  } catch (e) {
    console.error('Cache write error:', e.message || e);
  }
}

/**
 * 带超时的 fetch 请求
 * @param {string} url - 请求URL
 * @param {number} timeout - 超时时间(毫秒)
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, timeout) {
  var controller = new AbortController();
  var timeoutId = setTimeout(function() {
    controller.abort();
  }, timeout);

  try {
    var response = await fetch(url, {
      signal: controller.signal,
      cf: {
        cacheTtl: 86400,
        cacheEverything: true
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

/**
 * 从本地静态资源获取句子数据（带缓存）
 * @param {string} category - 句子类型
 * @returns {Promise<Array>} 句子数组
 */
async function fetchLocalSentences(category) {
  // 1. 先尝试从 Edge Cache 读取
  var cached = await getCachedSentences(category);
  if (cached && cached.length > 0) {
    return cached;
  }

  // 2. 从网络获取
  try {
    var url = 'https://hitokoto.api.sylv.top/data/' + category + '.json';
    var response = await fetchWithTimeout(url, FETCH_TIMEOUT);

    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }

    var data = await response.json();
    var sentences = Array.isArray(data) ? data : [];

    // 3. 写入 Edge Cache
    if (sentences.length > 0) {
      await setCachedSentences(category, sentences);
    }

    return sentences;
  } catch (e) {
    console.error('Error fetching local sentences for ' + category + ':', e.message || e);
    return [];
  }
}

/**
 * 预加载所有分类数据（并发加载）
 * 在函数冷启动时尽早调用，减少首次请求延迟
 */
async function preloadAllCategories() {
  if (preloadDone || preloadPromise) {
    return preloadPromise;
  }

  preloadPromise = Promise.all(
    ALL_CATEGORIES.map(function(category) {
      return fetchLocalSentences(category).then(function(sentences) {
        if (sentences.length > 0) {
          memoryCache.set('sentences_' + category, sentences);
        } else if (FALLBACK_DATA[category]) {
          memoryCache.set('sentences_' + category, FALLBACK_DATA[category]);
        }
        return { category: category, count: sentences.length };
      });
    })
  ).then(function(results) {
    preloadDone = true;
    var totalLoaded = results.reduce(function(sum, r) { return sum + r.count; }, 0);
    console.log('Preload complete: ' + totalLoaded + ' sentences loaded across ' + ALL_CATEGORIES.length + ' categories');
    return results;
  }).catch(function(err) {
    console.error('Preload error:', err);
    preloadDone = true;
    return [];
  });

  return preloadPromise;
}

/**
 * 获取句子（内存缓存 → Edge Cache → fetch → 备用数据）
 * @param {string} category - 句子类型
 * @returns {Promise<Array>} 句子数组
 */
async function getSentences(category) {
  var cacheKey = 'sentences_' + category;

  // 1. 尝试从内存缓存获取（最快）
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  // 2. 等待预加载完成（如果正在进行）
  if (preloadPromise && !preloadDone) {
    await preloadPromise;
    if (memoryCache.has(cacheKey)) {
      return memoryCache.get(cacheKey);
    }
  }

  // 3. 从 Edge Cache 或网络获取
  var sentences = await fetchLocalSentences(category);

  // 4. 如果获取失败，使用备用数据
  if (sentences.length === 0 && FALLBACK_DATA[category]) {
    sentences = FALLBACK_DATA[category];
  }

  // 5. 存入内存缓存
  if (sentences.length > 0) {
    memoryCache.set(cacheKey, sentences);
  }

  return sentences;
}

/**
 * 随机选择一条句子
 * @param {Array} sentences - 句子数组
 * @returns {Object|null} 随机句子
 */
function getRandomSentence(sentences) {
  if (!sentences || sentences.length === 0) return null;
  var index = Math.floor(Math.random() * sentences.length);
  return sentences[index];
}

/**
 * 构建API响应
 * @param {Object} sentence - 句子对象
 * @param {string} format - 响应格式
 * @returns {Object} 格式化响应
 */
function buildResponse(sentence, format) {
  if (!sentence) {
    return {
      code: 404,
      message: 'No sentences found'
    };
  }

  var categoryInfo = CATEGORY_MAP[sentence.type] || { name: '未知', desc: 'Unknown' };

  var baseResponse = {
    id: sentence.id,
    uuid: sentence.uuid,
    hitokoto: sentence.hitokoto,
    type: sentence.type,
    from: sentence.from,
    from_who: sentence.from_who,
    creator: sentence.creator,
    creator_uid: sentence.creator_uid,
    length: sentence.length,
    category_name: categoryInfo.name,
    category_desc: categoryInfo.desc
  };

  if (format === 'text') {
    return { text: sentence.hitokoto };
  }

  if (format === 'js') {
    return {
      js: 'hitokoto="' + sentence.hitokoto.replace(/"/g, '\\"') + '"'
    };
  }

  return baseResponse;
}

/**
 * 创建CORS响应
 * @param {Object} data - 响应数据
 * @param {number} status - HTTP状态码
 * @param {Object} extraHeaders - 额外响应头
 * @returns {Response}
 */
function createResponse(data, status, extraHeaders) {
  status = status || 200;
  extraHeaders = extraHeaders || {};

  var headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=0, s-maxage=60',
    'Vary': 'Accept-Encoding'
  };

  for (var key in extraHeaders) {
    headers[key] = extraHeaders[key];
  }

  return new Response(JSON.stringify(data), {
    status: status,
    headers: headers
  });
}

/**
 * 主处理函数
 */
export async function onRequestGet(context) {
  try {
    // 启动预加载（如果尚未开始）- 不等待，让其在后台执行
    if (!preloadDone && !preloadPromise) {
      context.waitUntil(preloadAllCategories());
    }

    var request = context.request;
    var url = new URL(request.url);

    // 获取查询参数
    var category = url.searchParams.get('c') || url.searchParams.get('category') || '';
    var format = url.searchParams.get('encode') || url.searchParams.get('format') || 'json';
    var callback = url.searchParams.get('callback') || '';
    var minLength = parseInt(url.searchParams.get('min_length') || '0', 10);
    var maxLength = parseInt(url.searchParams.get('max_length') || '0', 10);

    var sentences = [];

    // 如果指定了类型，获取对应类型句子
    if (category && CATEGORY_MAP[category]) {
      sentences = await getSentences(category);
    } else {
      // 随机选择一个类型
      var selectedCategory = ALL_CATEGORIES[Math.floor(Math.random() * ALL_CATEGORIES.length)];
      sentences = await getSentences(selectedCategory);
    }

    // 根据长度过滤
    if (minLength > 0) {
      sentences = sentences.filter(function(s) { return s.length >= minLength; });
    }
    if (maxLength > 0) {
      sentences = sentences.filter(function(s) { return s.length <= maxLength; });
    }

    // 获取随机句子
    var sentence = getRandomSentence(sentences);

    // 构建响应
    var responseData = buildResponse(sentence, format);

    // 处理JSONP回调
    if (callback && format === 'json') {
      var jsResponse = callback + '(' + JSON.stringify(responseData) + ');';
      return new Response(jsResponse, {
        status: 200,
        headers: {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=0, s-maxage=60',
          'Vary': 'Accept-Encoding'
        }
      });
    }

    // 纯文本格式直接返回
    if (format === 'text') {
      return new Response(responseData.text, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=0, s-maxage=60',
          'Vary': 'Accept-Encoding'
        }
      });
    }

    // JS格式直接返回
    if (format === 'js') {
      return new Response(responseData.js, {
        status: 200,
        headers: {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=0, s-maxage=60',
          'Vary': 'Accept-Encoding'
        }
      });
    }

    return createResponse(responseData);
  } catch (error) {
    console.error('Error in onRequestGet:', error);
    return createResponse({
      code: 500,
      message: 'Internal server error: ' + error.message
    }, 500);
  }
}

/**
 * OPTIONS请求处理 (CORS预检)
 */
export function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
