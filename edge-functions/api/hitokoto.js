// 一言API核心实现
// 数据来源: https://github.com/hitokoto-osc/sentences-bundle

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

// 句子源文件基础URL
const SENTENCES_BASE_URL = 'https://raw.githubusercontent.com/hitokoto-osc/sentences-bundle/master/sentences';

// 缓存配置
const CACHE_TTL = 3600; // 1小时

/**
 * 获取句子数据
 * @param {string} category - 句子类型
 * @returns {Promise<Array>} 句子数组
 */
async function fetchSentences(category) {
  const url = `${SENTENCES_BASE_URL}/${category}.json`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Hitokoto-API/EdgeOne-Pages'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${category}: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error fetching sentences for category ${category}:`, error);
    return [];
  }
}

/**
 * 从缓存获取或加载句子
 * @param {string} category - 句子类型
 * @param {Cache} cache - Edge Cache对象
 * @returns {Promise<Array>} 句子数组
 */
async function getSentencesWithCache(category, cache) {
  const cacheKey = `https://hitokoto-api.internal/sentences/${category}`;
  
  // 尝试从缓存读取
  const cached = await cache.match(cacheKey);
  if (cached) {
    try {
      return await cached.json();
    } catch {
      // 缓存解析失败，继续获取新数据
    }
  }
  
  // 获取新数据
  const sentences = await fetchSentences(category);
  
  // 存入缓存
  if (sentences.length > 0) {
    const response = new Response(JSON.stringify(sentences), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `max-age=${CACHE_TTL}`
      }
    });
    await cache.put(cacheKey, response);
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
  
  // 获取Edge Cache
  const cache = caches.default;
  
  let sentences = [];
  let selectedCategory = category;
  
  // 如果指定了类型，获取对应类型句子
  if (category && CATEGORY_MAP[category]) {
    sentences = await getSentencesWithCache(category, cache);
  } else {
    // 随机选择一个类型
    const categories = Object.keys(CATEGORY_MAP);
    selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    sentences = await getSentencesWithCache(selectedCategory, cache);
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
  let responseData = buildResponse(sentence, format);
  
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
