// 测试降级方案

import { getFallbackSentences, getAllFallbackSentences } from './edge-functions/api/fallback-sentences.js';

console.log('🧪 测试备用句子数据...\n');

// 测试1: 获取所有分类的句子
console.log('📌 测试1: 获取所有备用句子');
const allSentences = getAllFallbackSentences();
console.log(`✅ 总计 ${allSentences.length} 条备用句子\n`);

// 测试2: 按分类获取
console.log('📌 测试2: 按分类获取备用句子');
const categories = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
for (const cat of categories) {
  const sentences = getFallbackSentences(cat);
  const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
  console.log(`✅ 分类 ${cat}: ${sentences.length} 条`);
  console.log(`   示例: "${randomSentence.hitokoto}" (来自: ${randomSentence.from})`);
}

console.log('\n🎉 备用数据测试完成!');
