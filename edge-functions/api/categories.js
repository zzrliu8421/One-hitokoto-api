// 获取所有句子分类信息

const CATEGORY_MAP = {
  a: { name: '动画', desc: 'Anime', key: 'a' },
  b: { name: '漫画', desc: 'Comic', key: 'b' },
  c: { name: '游戏', desc: 'Game', key: 'c' },
  d: { name: '文学', desc: 'Literature', key: 'd' },
  e: { name: '原创', desc: 'Original', key: 'e' },
  f: { name: '网络', desc: 'Internet', key: 'f' },
  g: { name: '其他', desc: 'Other', key: 'g' },
  h: { name: '影视', desc: 'Movie', key: 'h' },
  i: { name: '诗词', desc: 'Poetry', key: 'i' },
  j: { name: '网易云', desc: 'Netease', key: 'j' },
  k: { name: '哲学', desc: 'Philosophy', key: 'k' },
  l: { name: '抖机灵', desc: 'Wit', key: 'l' }
};

export function onRequestGet(context) {
  try {
    var categories = [];
    for (var key in CATEGORY_MAP) {
      categories.push(CATEGORY_MAP[key]);
    }

    return new Response(JSON.stringify({
      code: 200,
      data: categories,
      count: categories.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'max-age=86400'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      code: 500,
      message: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

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
