var SENTENCES_DATA = {};

var CATEGORY_MAP = {
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

var ALL_CATEGORIES = Object.keys(CATEGORY_MAP);

function getSentences(category) {
  var data = SENTENCES_DATA[category];
  return Array.isArray(data) ? data : [];
}

function getRandomSentence(sentences) {
  if (!sentences || sentences.length === 0) return null;
  return sentences[Math.floor(Math.random() * sentences.length)];
}

function buildResponse(sentence, format) {
  if (!sentence) {
    return { code: 404, message: 'No sentences found' };
  }

  var categoryInfo = CATEGORY_MAP[sentence.type] || { name: '未知', desc: 'Unknown' };

  var result = {
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

  return result;
}

function jsonResponse(data, status) {
  status = status || 200;
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=0, s-maxage=60',
      'Vary': 'Accept-Encoding'
    }
  });
}

function textResponse(text, contentType) {
  return new Response(text, {
    status: 200,
    headers: {
      'Content-Type': contentType + '; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=0, s-maxage=60',
      'Vary': 'Accept-Encoding'
    }
  });
}

async function handleRequest(request) {
  try {
    var url = new URL(request.url);
    var pathname = url.pathname;

    if (pathname !== '/api' && pathname !== '/api/' && pathname !== '/api/categories') {
      return jsonResponse({ code: 404, message: 'Not Found' }, 404);
    }

    if (pathname === '/api/categories') {
      return jsonResponse({
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
      sentences = getSentences(category);
    } else {
      var selectedCategory = ALL_CATEGORIES[Math.floor(Math.random() * ALL_CATEGORIES.length)];
      sentences = getSentences(selectedCategory);
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
      return textResponse(callback + '(' + JSON.stringify(responseData) + ');', 'application/javascript');
    }

    if (format === 'text') {
      return textResponse(responseData.text, 'text/plain');
    }

    if (format === 'js') {
      return textResponse(responseData.js, 'application/javascript');
    }

    return jsonResponse(responseData);
  } catch (error) {
    console.error('Error:', error);
    return jsonResponse({
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
