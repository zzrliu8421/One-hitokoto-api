import sentences from '../_data/sentences.js';

const ALLOWED_ENCODE = new Set(['json', 'js', 'text']);
const MIME = {
  json: 'application/json',
  js: 'application/javascript',
  text: 'text/plain',
};

function getParamEncode(encode) {
  const tmp = encode || 'json';
  return ALLOWED_ENCODE.has(tmp) ? tmp : 'json';
}

function getParamCategory(c) {
  if (!c) return [];
  if (!Array.isArray(c)) c = [c];
  return c;
}

function excludeNotMatchCategories(minLength, maxLength, cats, allSentences) {
  const targetCategories = [];
  if (cats.length === 0) {
    cats = Object.keys(allSentences);
  }
  for (const cat of cats) {
    if (!allSentences[cat]) continue;
    const catSentences = allSentences[cat];
    let catMin = Infinity;
    let catMax = -Infinity;
    for (const s of catSentences) {
      if (s.length < catMin) catMin = s.length;
      if (s.length > catMax) catMax = s.length;
    }
    if (minLength <= catMax && maxLength >= catMin) {
      targetCategories.push(cat);
    }
  }
  return targetCategories;
}

function getRandomSentence(minLength, maxLength, category, allSentences) {
  const pool = allSentences[category];
  const filtered = pool.filter((s) => s.length >= minLength && s.length <= maxLength);
  if (filtered.length === 0) return null;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function formatJS(data, select) {
  const hitokoto = data.hitokoto;
  const selector = select || '.hitokoto';
  return `(function hitokoto(){var hitokoto=${JSON.stringify(hitokoto)};var dom=document.querySelector('${selector}');Array.isArray(dom)?dom[0].innerText=hitokoto:dom.innerText=hitokoto;})()`;
}

export function onRequestGet(context) {
  const url = new URL(context.request.url);
  const tmpMax = parseInt(url.searchParams.get('max_length'));
  const tmpMin = parseInt(url.searchParams.get('min_length'));

  const params = {
    c: getParamCategory(url.searchParams.get('c')),
    encode: getParamEncode(url.searchParams.get('encode')),
    select: url.searchParams.get('select') || '.hitokoto',
  };
  params.min_length = tmpMin && tmpMin >= 0 ? tmpMin : 0;
  params.max_length = tmpMax && tmpMax <= 1000 && tmpMax > params.min_length ? tmpMax : 30;

  if (params.max_length < params.min_length) {
    return new Response(JSON.stringify({
      status: 400,
      message: '`max_length` 不能小于 `min_length`！',
      data: [],
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const validCategories = excludeNotMatchCategories(
    params.min_length,
    params.max_length,
    params.c,
    sentences,
  );

  if (validCategories.length === 0) {
    return new Response(JSON.stringify({
      status: 400,
      message: '很抱歉，没有分类有句子符合长度区间。',
      data: [],
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const category = validCategories[Math.floor(Math.random() * validCategories.length)];
  const sentence = getRandomSentence(params.min_length, params.max_length, category, sentences);

  if (!sentence) {
    return new Response(JSON.stringify({
      status: 400,
      message: '很抱歉，没有句子符合长度区间。',
      data: [],
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const encode = params.encode;
  let body;
  let contentType = MIME[encode];

  if (encode === 'json') {
    body = JSON.stringify(sentence);
  } else if (encode === 'js') {
    body = formatJS(sentence, params.select);
  } else {
    body = sentence.hitokoto;
  }

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}