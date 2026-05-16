function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const CATEGORIES = [
  { key: 'a', name: '动画' },
  { key: 'b', name: '漫画' },
  { key: 'c', name: '游戏' },
  { key: 'd', name: '文学' },
  { key: 'e', name: '原创' },
  { key: 'f', name: '网络' },
  { key: 'g', name: '其他' },
  { key: 'h', name: '影视' },
  { key: 'i', name: '诗词' },
  { key: 'j', name: '网易云' },
  { key: 'k', name: '哲学' },
  { key: 'l', name: '抖机灵' }
];

let allSentences = null;

async function loadAllSentences() {
  if (allSentences !== null) {
    return allSentences;
  }

  const sentences = [];

  for (const category of CATEGORIES) {
    try {
      const response = await fetch(`https://cdn.jsdelivr.net/gh/hitokoto-osc/sentences-bundle@latest/sentences/${category.key}.json`);
      if (!response.ok) continue;

      const data = await response.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item && (item.hitokoto || item.content)) {
            sentences.push({
              id: item.uuid || uuidv4(),
              hitokoto: item.hitokoto || item.content,
              type: item.type || category.key,
              from: item.from || item.source || '',
              from_who: item.from_who || item.author || '',
              creator: item.creator || 'hitokoto',
              creator_uid: item.creator_uid || 0,
              reviewer: item.reviewer || 0,
              uuid: item.uuid || uuidv4(),
              created_at: item.created_at || new Date().toISOString()
            });
          }
        }
      }
    } catch (error) {
      console.error(`Failed to load ${category.key}:`, error.message);
    }
  }

  allSentences = sentences;
  return sentences;
}

function getRandomSentence(sentences, categories, minLength, maxLength) {
  const filtered = sentences.filter(s => {
    if (categories.length > 0 && !categories.includes(s.type)) {
      return false;
    }
    const len = s.hitokoto.length;
    return len >= minLength && len <= maxLength;
  });

  if (filtered.length === 0) return null;

  return filtered[Math.floor(Math.random() * filtered.length)];
}

function parseQueryParams(url) {
  const params = new URLSearchParams(url.search);

  let categories = params.get('c') ? params.get('c').split('') : [];
  let encode = params.get('encode') || 'json';
  let minLength = parseInt(params.get('min_length') || '0', 10);
  let maxLength = parseInt(params.get('max_length') || '10000', 10);
  let charset = params.get('charset') || 'utf-8';
  let callback = params.get('callback') || '';

  if (isNaN(minLength)) minLength = 0;
  if (isNaN(maxLength)) maxLength = 10000;

  if (maxLength < minLength) {
    const tmp = minLength;
    minLength = maxLength;
    maxLength = tmp;
  }

  return { categories, encode, minLength, maxLength, charset, callback };
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
      body = `${callback || 'hitokoto'}(${JSON.stringify(data)});`;
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
      'X-Request-Id': uuidv4(),
      'Cache-Control': 'no-cache'
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
  try {
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
      return new Response(JSON.stringify({
        name: 'hitokoto-api',
        version: '2.0.0-edge',
        message: 'Love us? donate at https://hitokoto.cn/donate',
        website: 'https://hitokoto.cn',
        server_id: 'edge-one',
        server_status: {
          categories: CATEGORIES.length
        },
        copyright: 'MoeCraft © ' + new Date().getFullYear() + ' All Rights Reserved.',
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
    const sentences = await loadAllSentences();

    if (sentences.length === 0) {
      return createErrorResponse(503, 'Service temporarily unavailable');
    }

    const sentence = getRandomSentence(
      sentences,
      params.categories,
      params.minLength,
      params.maxLength
    );

    if (!sentence) {
      return createErrorResponse(404, 'No matching sentences found');
    }

    return createResponse(sentence, params.encode, params.callback, params.charset);

  } catch (error) {
    console.error('Edge Function Error:', error);
    return createErrorResponse(500, 'Internal Server Error: ' + error.message);
  }
}
