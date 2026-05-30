const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const BUILD_DIR = path.join(__dirname, '..', 'build');
const DATA_DIR = path.join(__dirname, '..', 'data');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyDir(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function buildStaticAssets() {
  console.log('Building static assets...');
  ensureDir(DIST_DIR);

  const rootDir = path.join(__dirname, '..');

  fs.copyFileSync(
    path.join(rootDir, 'index.html'),
    path.join(DIST_DIR, 'index.html')
  );
  console.log('Copied index.html');

  copyDir(
    path.join(rootDir, 'data'),
    path.join(DIST_DIR, 'data')
  );
  console.log('Copied data/');

  copyDir(
    path.join(rootDir, 'api'),
    path.join(DIST_DIR, 'api')
  );
  console.log('Copied api/');
}

function buildFunctionBundle() {
  console.log('Building function bundle with inline data...');
  ensureDir(BUILD_DIR);

  var categories = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
  var dataObject = {};

  for (var i = 0; i < categories.length; i++) {
    var cat = categories[i];
    var filePath = path.join(DATA_DIR, cat + '.json');
    if (fs.existsSync(filePath)) {
      var data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      dataObject[cat] = data;
      console.log('Loaded ' + cat + '.json: ' + (Array.isArray(data) ? data.length : 0) + ' sentences');
    }
  }

  var dataJson = JSON.stringify(dataObject);

  var functionCode = `
var SENTENCES_DATA = ${dataJson};

var CATEGORY_MAP = {
  a: { name: '\u52A8\u753B', desc: 'Anime' },
  b: { name: '\u6F2B\u753B', desc: 'Comic' },
  c: { name: '\u6E38\u620F', desc: 'Game' },
  d: { name: '\u6587\u5B66', desc: 'Literature' },
  e: { name: '\u539F\u521B', desc: 'Original' },
  f: { name: '\u7F51\u7EDC', desc: 'Internet' },
  g: { name: '\u5176\u4ED6', desc: 'Other' },
  h: { name: '\u5F71\u89C6', desc: 'Movie' },
  i: { name: '\u8BD7\u8BCD', desc: 'Poetry' },
  j: { name: '\u7F51\u6613\u4E91', desc: 'Netease' },
  k: { name: '\u54F2\u5B66', desc: 'Philosophy' },
  l: { name: '\u6296\u673A\u7075', desc: 'Wit' }
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

  var categoryInfo = CATEGORY_MAP[sentence.type] || { name: '\u672A\u77E5', desc: 'Unknown' };

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
      js: 'hitokoto="' + sentence.hitokoto.replace(/\\\\/g, '\\\\\\\\').replace(/"/g, '\\\\"') + '"'
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
`;

  var outputPath = path.join(BUILD_DIR, 'api.js');
  fs.writeFileSync(outputPath, functionCode, 'utf-8');

  var sizeKB = Math.round(fs.statSync(outputPath).size / 1024);
  console.log('Function bundle size: ' + sizeKB + ' KB');

  if (fs.statSync(outputPath).size > 4 * 1024 * 1024) {
    console.error('ERROR: Function bundle exceeds 4 MB limit!');
    process.exit(1);
  }

  console.log('Function bundle generated: build/api.js');
}

buildStaticAssets();
buildFunctionBundle();
console.log('Build complete!');
