// 句子数据预加载脚本
// 在构建前从远程源获取所有句子数据，保存为本地 JSON 文件
// 用法: node scripts/fetch-sentences.js

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const CATEGORIES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];

// 多个镜像源，按优先级排列
const MIRROR_SOURCES = [
  'https://raw.githubusercontent.com/hitokoto-osc/sentences-bundle/master/sentences',
  'https://raw.kkgithub.com/hitokoto-osc/sentences-bundle/master/sentences',
  'https://ghproxy.net/https://raw.githubusercontent.com/hitokoto-osc/sentences-bundle/master/sentences',
  'https://mirror.ghproxy.com/https://raw.githubusercontent.com/hitokoto-osc/sentences-bundle/master/sentences'
];

const DATA_DIR = path.join(__dirname, '..', 'data');
const TIMEOUT = 15000; // 15秒超时

/**
 * 确保目录存在
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 从URL获取数据
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const req = client.get(url, { timeout: TIMEOUT }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(new Error('Invalid JSON'));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

/**
 * 从单个源获取句子
 */
async function fetchFromSource(category, baseUrl) {
  const url = `${baseUrl}/${category}.json`;
  const data = await fetchUrl(url);
  return Array.isArray(data) ? data : [];
}

/**
 * 获取句子（多源重试）
 */
async function fetchSentences(category) {
  const errors = [];

  for (const baseUrl of MIRROR_SOURCES) {
    try {
      const sentences = await fetchFromSource(category, baseUrl);
      if (sentences.length > 0) {
        console.log(`  ✅ 从 ${baseUrl} 获取成功`);
        return sentences;
      }
    } catch (error) {
      errors.push(`${baseUrl}: ${error.message}`);
    }
  }

  console.error(`  ❌ 所有源都失败:`, errors.join('; '));
  return [];
}

/**
 * 保存句子数据到本地文件
 */
function saveSentences(category, sentences) {
  const filePath = path.join(DATA_DIR, `${category}.json`);
  fs.writeFileSync(filePath, JSON.stringify(sentences, null, 2), 'utf-8');
  return filePath;
}

/**
 * 生成数据索引文件
 */
function generateIndex(sentenceCounts) {
  const index = {
    updatedAt: new Date().toISOString(),
    categories: {}
  };

  for (const cat of CATEGORIES) {
    index.categories[cat] = {
      file: `${cat}.json`,
      count: sentenceCounts[cat] || 0
    };
  }

  const indexPath = path.join(DATA_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
  return indexPath;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始获取句子数据...\n');

  ensureDir(DATA_DIR);

  const sentenceCounts = {};
  let totalCount = 0;
  let successCount = 0;

  for (const category of CATEGORIES) {
    process.stdout.write(`📥 获取分类 [${category}]... `);

    const sentences = await fetchSentences(category);

    if (sentences.length > 0) {
      const filePath = saveSentences(category, sentences);
      sentenceCounts[category] = sentences.length;
      totalCount += sentences.length;
      successCount++;
      console.log(`${sentences.length} 条句子 → ${path.basename(filePath)}`);
    } else {
      sentenceCounts[category] = 0;
      console.log('获取失败，保留旧数据（如有）');
    }

    // 短暂延迟，避免请求过快
    await new Promise(r => setTimeout(r, 500));
  }

  // 生成索引文件
  const indexPath = generateIndex(sentenceCounts);

  console.log('\n📊 统计结果:');
  console.log(`  成功获取: ${successCount}/${CATEGORIES.length} 个分类`);
  console.log(`  句子总数: ${totalCount} 条`);
  console.log(`  索引文件: ${indexPath}`);
  console.log(`  数据目录: ${DATA_DIR}`);

  // 如果获取到的数据太少，给出警告
  if (totalCount < 100) {
    console.log('\n⚠️ 警告: 获取到的句子数量较少，请检查网络连接');
    process.exit(1);
  }

  console.log('\n✅ 句子数据更新完成!');
}

main().catch(err => {
  console.error('❌ 错误:', err);
  process.exit(1);
});
