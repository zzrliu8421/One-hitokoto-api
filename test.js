// 本地测试脚本 - 模拟 EdgeOne Pages Edge Functions 环境

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

const SENTENCES_BASE_URL = 'https://raw.githubusercontent.com/hitokoto-osc/sentences-bundle/master/sentences';

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

function getRandomSentence(sentences) {
  if (!sentences || sentences.length === 0) return null;
  const index = Math.floor(Math.random() * sentences.length);
  return sentences[index];
}

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

async function testAPI() {
  console.log('🧪 开始测试一言API...\n');
  
  // 测试1: 获取随机一言 (JSON格式)
  console.log('📌 测试1: 获取随机一言 (JSON格式)');
  const sentences = await fetchSentences('a');
  console.log(`✅ 获取到 ${sentences.length} 条动画类句子`);
  
  const sentence = getRandomSentence(sentences);
  const response = buildResponse(sentence, 'json');
  console.log('📦 响应数据:');
  console.log(JSON.stringify(response, null, 2));
  console.log('');
  
  // 测试2: 纯文本格式
  console.log('📌 测试2: 纯文本格式');
  const textResponse = buildResponse(sentence, 'text');
  console.log(`📦 响应: ${textResponse.text}`);
  console.log('');
  
  // 测试3: JS格式
  console.log('📌 测试3: JS变量格式');
  const jsResponse = buildResponse(sentence, 'js');
  console.log(`📦 响应: ${jsResponse.js}`);
  console.log('');
  
  // 测试4: 长度过滤
  console.log('📌 测试4: 长度过滤 (min_length=10, max_length=30)');
  const filtered = sentences.filter(s => s.length >= 10 && s.length <= 30);
  console.log(`✅ 过滤后剩余 ${filtered.length} 条句子`);
  if (filtered.length > 0) {
    const filteredSentence = getRandomSentence(filtered);
    console.log(`📦 随机选择: "${filteredSentence.hitokoto}" (长度: ${filteredSentence.length})`);
  }
  console.log('');
  
  // 测试5: 测试多个分类
  console.log('📌 测试5: 测试多个分类数据获取');
  const categories = ['a', 'b', 'c', 'd'];
  for (const cat of categories) {
    const catSentences = await fetchSentences(cat);
    console.log(`✅ 分类 ${cat} (${CATEGORY_MAP[cat]?.name}): ${catSentences.length} 条句子`);
  }
  console.log('');
  
  console.log('🎉 所有测试完成!');
}

testAPI().catch(console.error);
