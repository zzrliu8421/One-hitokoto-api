// 一言API核心实现
// 数据来源: 本地 sentences-data.js 模块（构建时预加载）

import { SENTENCES_DATA, getSentencesByCategory } from './sentences-data.js';

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

// 远程镜像源（作为本地数据的补充/更新来源）
const MIRROR_SOURCES = [
  'https://raw.githubusercontent.com/hitokoto-osc/sentences-bundle/master/sentences',
  'https://raw.kkgithub.com/hitokoto-osc/sentences-bundle/master/sentences',
  'https://ghproxy.net/https://raw.githubusercontent.com/hitokoto-osc/sentences-bundle/master/sentences',
  'https://mirror.ghproxy.com/https://raw.githubusercontent.com/hitokoto-osc/sentences-bundle/master/sentences'
];

// 缓存配置
const CACHE_TTL = 3600;
const FETCH_TIMEOUT = 5000;
const MAX_RETRIES = 2;

// 内存缓存
const memoryCache = new Map();

/**
 * 从本地模块获取句子
 * @param {string} category - 句子类型
 * @returns {Array} 句子数组
 */
function getLocalSentences(category) {
  const sentences = getSentencesByCategory(category);
  return sentences.length > 0 ? sentences : [];
}

/**
 * 带超时的fetch
 * @param {string} url - 请求URL
 * @param {Object} options - fetch选项
 * @param {number} timeout - 超时时间(ms)
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options = {}, timeout = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * 从远程源获取句子数据
 * @param {string} category - 句子类型
 * @param {string} baseUrl - 源基础URL
 * @returns {Promise<Array>} 句子数组
 */
async function fetchFromSource(category, baseUrl) {
  const url = `${baseUrl}/${category}.json`;

  const response = await fetchWithTimeout(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Hitokoto-API/EdgeOne-Pages'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * 从远程获取句子数据（多源重试）
 * @param {string} category - 句子类型
 * @returns {Promise<Array>} 句子数组
 */
async function fetchRemoteSentences(category) {
  const errors = [];

  for (const baseUrl of MIRROR_SOURCES) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const sentences = await fetchFromSource(category, baseUrl);
        if (sentences.length > 0) {
          return sentences;
        }
      } catch (error) {
        const errorMsg = `Source ${baseUrl}, attempt ${attempt + 1}: ${error.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);

        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
        }
      }
    }
  }

  console.error(`All remote sources failed for category ${category}:`, errors);
  return [];
}

/**
 * 获取句子（本地优先，远程兜底）
 * @param {string} category - 句子类型
 * @returns {Promise<Array>} 句子数组
 */
async function getSentences(category) {
  const cacheKey = `sentences_${category}`;

  // 1. 尝试从内存缓存获取
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  // 2. 尝试从 Edge Cache 获取
  try {
    const cache = caches.default;
    const cached = await cache.match(`https://hitokoto-api.internal/${cacheKey}`);
    if (cached) {
      const data = await cached.json();
      if (Array.isArray(data) && data.length > 0) {
        memoryCache.set(cacheKey, data);
        return data;
      }
    }
  } catch {
    // 缓存读取失败，继续
  }

  // 3. 从本地模块获取（主要数据来源）
  let sentences = getLocalSentences(category);

  // 4. 如果本地数据为空，尝试从远程获取
  if (sentences.length === 0) {
    console.log(`Local data empty for ${category}, trying remote...`);
    sentences = await fetchRemoteSentences(category);
  }

  // 5. 存入缓存
  if (sentences.length > 0) {
    memoryCache.set(cacheKey, sentences);
    try {
      const cache = caches.default;
      const response = new Response(JSON.stringify(sentences), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `max-age=${CACHE_TTL}`
        }
      });
      await cache.put(`https://hitokoto-api.internal/${cacheKey}`, response);
    } catch {
      // 缓存写入失败，不影响主流程
    }
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
  const index = Math.floor(Math.random() * sentences.length);
  return sentences[index];
}

/**
 * 构建API响应
 * @param {Object} sentence - 句子对象
 * @param {string} format - 响应格式
 * @returns {Object} 格式化响应
 */
function buildResponse(sentence, format = 'json') {
  if (!sentence) {
    return {
      code: 404,
      message: 'No sentences found'
    };
  }

  const categoryInfo = CATEGORY_MAP[sentence.type] || { name: '未知', desc: 'Unknown' };

  const baseResponse = {
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
      js: `hitokoto="${sentence.hitokoto.replace(/"/g, '\\"')}"`
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
function createResponse(data, status = 200, extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache',
    ...extraHeaders
  };

  return new Response(JSON.stringify(data), {
    status,
    headers
  });
}

/**
 * 主处理函数
 */
export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);

  // 获取查询参数
  const category = url.searchParams.get('c') || url.searchParams.get('category') || '';
  const format = url.searchParams.get('encode') || url.searchParams.get('format') || 'json';
  const callback = url.searchParams.get('callback') || '';
  const minLength = parseInt(url.searchParams.get('min_length') || '0', 10);
  const maxLength = parseInt(url.searchParams.get('max_length') || '0', 10);

  let sentences = [];

  // 如果指定了类型，获取对应类型句子
  if (category && CATEGORY_MAP[category]) {
    sentences = await getSentences(category);
  } else {
    // 随机选择一个类型
    const categories = Object.keys(CATEGORY_MAP);
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    sentences = await getSentences(selectedCategory);
  }

  // 根据长度过滤
  if (minLength > 0) {
    sentences = sentences.filter(s => s.length >= minLength);
  }
  if (maxLength > 0) {
    sentences = sentences.filter(s => s.length <= maxLength);
  }

  // 获取随机句子
  const sentence = getRandomSentence(sentences);

  // 构建响应
  const responseData = buildResponse(sentence, format);

  // 处理JSONP回调
  if (callback && format === 'json') {
    const jsResponse = `${callback}(${JSON.stringify(responseData)});`;
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
