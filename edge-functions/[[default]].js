function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const CATEGORIES = [
  { key: 'a', name: '动画', desc: 'Anime' },
  { key: 'b', name: '漫画', desc: 'Comic' },
  { key: 'c', name: '游戏', desc: 'Game' },
  { key: 'd', name: '文学', desc: 'Literature' },
  { key: 'e', name: '原创', desc: 'Original' },
  { key: 'f', name: '网络', desc: 'Internet' },
  { key: 'g', name: '其他', desc: 'Other' },
  { key: 'h', name: '影视', desc: 'Video' },
  { key: 'i', name: '诗词', desc: 'Poem' },
  { key: 'j', name: '网易云', desc: 'NCM' },
  { key: 'k', name: '哲学', desc: 'Philosophy' },
  { key: 'l', name: '抖机灵', desc: 'Funny' }
];

const CDN_BASE_URL = 'https://cdn.jsdelivr.net/gh/hitokoto-osc/sentences-bundle@latest';

const cachedSentences = new Map();
const cachedCategories = new Map();

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  return await response.json();
}

async function loadCategorySentences(categoryKey) {
  if (cachedSentences.has(categoryKey)) {
    return cachedSentences.get(categoryKey);
  }

  try {
    const url = `${CDN_BASE_URL}/sentences/${categoryKey}.json`;
    const data = await fetchJSON(url);
    cachedSentences.set(categoryKey, data);
    return data;
  } catch (error) {
    console.error(`Failed to load category ${categoryKey}:`, error);
    return [];
  }
}

async function getAllCategories() {
  if (cachedCategories.size > 0) {
    return Array.from(cachedCategories.values());
  }

  try {
    const url = `${CDN_BASE_URL}/categories.json`;
    const categories = await fetchJSON(url);
    categories.forEach((cat) => cachedCategories.set(cat.key, cat));
    return categories;
  } catch (error) {
    console.error('Failed to load categories:', error);
    return CATEGORIES;
  }
}

function getRandomElement(array) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

function formatSentence(sentence, categoryKey) {
  return {
    id: sentence.uuid || uuidv4(),
    hitokoto: sentence.hitokoto || sentence.content,
    type: sentence.type || categoryKey,
    from: sentence.from || sentence.source,
    from_who: sentence.from_who || sentence.author,
    creator: sentence.creator || 'hitokoto-api',
    creator_uid: sentence.creator_uid,
    reviewer: sentence.reviewer,
    uuid: sentence.uuid || uuidv4(),
    created_at: sentence.created_at || new Date().toISOString()
  };
}

function parseQueryParams(url) {
  const params = new URLSearchParams(url.search);
  
  let categories = params.get('c') ? params.get('c').split('') : [];
  let encode = params.get('encode') || 'json';
  let minLength = parseInt(params.get('min_length') || '0', 10);
  let maxLength = parseInt(params.get('max_length') || '10000', 10);
  let charset = params.get('charset') || 'utf-8';
  let callback = params.get('callback') || '';
  
  if (maxLength < minLength) {
    [minLength, maxLength] = [maxLength, minLength];
  }
  
  if (categories.length === 0) {
    categories = CATEGORIES.map(c => c.key);
  }
  
  return {
    categories,
    encode,
    minLength,
    maxLength,
    charset,
    callback
  };
}

function filterSentences(sentences, minLength, maxLength) {
  return sentences.filter(s => {
    const text = s.hitokoto || s.content;
    if (!text) return false;
    const length = text.length;
    return length >= minLength && length <= maxLength;
  });
}

async function getRandomSentence(categories, minLength, maxLength) {
  const shuffledCategories = [...categories].sort(() => Math.random() - 0.5);
  
  for (const categoryKey of shuffledCategories) {
    const sentences = await loadCategorySentences(categoryKey);
    const filtered = filterSentences(sentences, minLength, maxLength);
    if (filtered.length > 0) {
      const sentence = getRandomElement(filtered);
      return formatSentence(sentence, categoryKey);
    }
  }
  
  return null;
}

function createResponse(data, encode, callback, charset) {
  let body;
  let contentType;
  
  switch (encode) {
    case 'text':
      body = data.hitokoto;
      contentType = `text/plain; charset=${charset}`;
      break;
      
    case 'js':
      body = `${callback || 'hitokoto'}(JSON.parse('${JSON.stringify(data).replace(/'/g, "\\'")}'));`;
      contentType = `application/javascript; charset=${charset}`;
      break;
      
    case 'json':
    default:
      body = JSON.stringify(data);
      contentType = `application/json; charset=${charset}`;
      break;
  }
  
  return new Response(body, {
    headers: {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Expose-Headers': 'X-Request-Id',
      'X-Request-Id': uuidv4()
    }
  });
}

function createErrorResponse(status, message) {
  return new Response(JSON.stringify({
    status,
    message,
    data: null,
    ts: Date.now()
  }), {
    status: status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export default async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return createErrorResponse(405, 'Method Not Allowed');
  }
  
  if (url.pathname === '/ping') {
    return new Response(JSON.stringify({
      status: 200,
      message: 'ok',
      data: {},
      ts: Date.now()
    }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  if (url.pathname === '/status') {
    const categories = await getAllCategories();
    return new Response(JSON.stringify({
      name: 'hitokoto-api',
      version: '2.0.0-edge',
      message: 'Love us? donate at https://hitokoto.cn/donate',
      website: 'https://hitokoto.cn',
      server_id: 'edge-one',
      server_status: {
        categories: categories.length
      },
      copyright: 'MoeCraft © ' + new Date().getFullYear() + ' All Rights Reserved. Open Source at https://github.com/hitokoto-osc/hitokoto-api .',
      now: new Date().toString(),
      ts: Date.now()
    }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  const params = parseQueryParams(url);
  const sentence = await getRandomSentence(params.categories, params.minLength, params.maxLength);
  
  if (!sentence) {
    return createErrorResponse(404, 'No matching sentences found');
  }
  
  return createResponse(sentence, params.encode, params.callback, params.charset);
}
