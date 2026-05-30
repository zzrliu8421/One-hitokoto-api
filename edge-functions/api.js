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

const memoryCache = new Map();

const CACHE_TTL = 86400000;

const FETCH_TIMEOUT = 5000;

async function fetchCategoryData(request, category) {
  var cacheKey = 'data_' + category;
  var cached = memoryCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  try {
    var url = new URL(request.url);
    var dataUrl = url.origin + '/data/' + category + '.json';

    var controller = new AbortController();
    var timeoutId = setTimeout(function() {
      controller.abort();
    }, FETCH_TIMEOUT);

    var response = await fetch(dataUrl, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }

    var data = await response.json();
    var sentences = Array.isArray(data) ? data : [];

    if (sentences.length > 0) {
      memoryCache.set(cacheKey, {
        data: sentences,
        timestamp: Date.now()
      });
    }

    return sentences;
  } catch (e) {
    console.error('Error fetching category ' + category + ':', e.message || e);
    if (cached) {
      return cached.data;
    }
    return [];
  }
}

function getRandomSentence(sentences) {
  if (!sentences || sentences.length === 0) return null;
  var index = Math.floor(Math.random() * sentences.length);
  return sentences[index];
}

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

async function handleRequest(request) {
  try {
    var url = new URL(request.url);

    var pathname = url.pathname;

    if (pathname === '/api/categories') {
      return createResponse({
        code: 200,
        data: ALL_CATEGORIES.map(function(key) {
          return { key: key, name: CATEGORY_MAP[key].name, desc: CATEGORY_MAP[key].desc };
        }),
        count: ALL_CATEGORIES.length
      });
    }

    var category = url.searchParams.get('c') || url.searchParams.get('category') || '';
    var format = url.searchParams.get('encode') || url.searchParams.get('format') || 'json';
    var callback = url.searchParams.get('callback') || '';
    var minLength = parseInt(url.searchParams.get('min_length') || '0', 10);
    var maxLength = parseInt(url.searchParams.get('max_length') || '0', 10);

    var sentences = [];

    if (category && CATEGORY_MAP[category]) {
      sentences = await fetchCategoryData(request, category);
    } else {
      var selectedCategory = ALL_CATEGORIES[Math.floor(Math.random() * ALL_CATEGORIES.length)];
      sentences = await fetchCategoryData(request, selectedCategory);
    }

    if (minLength > 0) {
      sentences = sentences.filter(function(s) { return s.length >= minLength; });
    }
    if (maxLength > 0) {
      sentences = sentences.filter(function(s) { return s.length <= maxLength; });
    }

    var sentence = getRandomSentence(sentences);

    var responseData = buildResponse(sentence, format);

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
    console.error('Error in handleRequest:', error);
    return createResponse({
      code: 500,
      message: 'Internal server error: ' + error.message
    }, 500);
  }
}

export default {
  async fetch(request) {
    return handleRequest(request);
  }
};
