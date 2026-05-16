// 一言API核心实现
// 数据来源: 本地 data/ 目录下的 JSON 文件

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

// 内存缓存
const memoryCache = new Map();

/**
 * 从本地静态资源获取句子数据
 * @param {string} category - 句子类型
 * @returns {Promise<Array>} 句子数组
 */
async function fetchLocalSentences(category) {
  try {
    // 通过 fetch 读取同域名下的静态 JSON 文件
    var url = '/data/' + category + '.json';
    var response = await fetch(url);

    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }

    var data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Error fetching local sentences for ' + category + ':', e);
    return [];
  }
}

/**
 * 获取句子（本地静态资源优先）
 * @param {string} category - 句子类型
 * @returns {Promise<Array>} 句子数组
 */
async function getSentences(category) {
  var cacheKey = 'sentences_' + category;

  // 1. 尝试从内存缓存获取
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  // 2. 从本地静态资源获取
  var sentences = await fetchLocalSentences(category);

  // 3. 存入内存缓存
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
    'Cache-Control': 'no-cache'
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
      var categories = Object.keys(CATEGORY_MAP);
      var selectedCategory = categories[Math.floor(Math.random() * categories.length)];
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
          'Cache-Control': 'no-cache'
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
          'Cache-Control': 'no-cache'
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
          'Cache-Control': 'no-cache'
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
