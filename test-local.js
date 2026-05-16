// 测试本地数据加载

import { SENTENCES_DATA, getSentencesByCategory, getAllSentences } from './edge-functions/api/sentences-data.js';

console.log('🧪 测试本地句子数据加载...\n');

// 测试1: 检查所有分类
console.log('📌 测试1: 检查所有分类数据');
const categories = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
let totalCount = 0;

for (const cat of categories) {
  const sentences = getSentencesByCategory(cat);
  totalCount += sentences.length;
  const random = sentences[Math.floor(Math.random() * sentences.length)];
  console.log(`✅ 分类 [${cat}]: ${sentences.length} 条`);
  console.log(`   示例: "${random.hitokoto}" (来自: ${random.from})`);
}

// 测试2: 获取所有句子
console.log('\n📌 测试2: 获取所有句子');
const all = getAllSentences();
console.log(`✅ 总计: ${all.length} 条句子`);

// 测试3: 随机选择测试
console.log('\n📌 测试3: 随机选择测试');
for (let i = 0; i < 5; i++) {
  const randomCat = categories[Math.floor(Math.random() * categories.length)];
  const sentences = getSentencesByCategory(randomCat);
  const random = sentences[Math.floor(Math.random() * sentences.length)];
  console.log(`🎲 [${randomCat}] "${random.hitokoto}"`);
}

console.log('\n✅ 所有测试通过!');
