// 将 data/ 目录下的 JSON 数据转换为 JS 模块
// 这样 EdgeOne Pages 的 Edge Functions 可以直接 import 使用
// 用法: node scripts/build-data-module.js

const fs = require('fs');
const path = require('path');

const CATEGORIES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(__dirname, '..', 'edge-functions', 'api', 'sentences-data.js');

/**
 * 读取 JSON 文件
 */
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    console.error(`  ❌ 读取失败: ${filePath}`);
    return [];
  }
}

/**
 * 转义字符串中的特殊字符
 */
function escapeString(str) {
  if (!str) return null;
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

/**
 * 生成 JS 模块内容
 */
function generateModule() {
  let moduleContent = '// 自动生成的句子数据模块\n';
  moduleContent += '// 生成时间: ' + new Date().toISOString() + '\n';
  moduleContent += '// 来源: https://github.com/hitokoto-osc/sentences-bundle\n\n';

  const allSentences = {};
  let totalCount = 0;

  for (const category of CATEGORIES) {
    const filePath = path.join(DATA_DIR, `${category}.json`);
    const sentences = readJsonFile(filePath);

    if (sentences.length === 0) {
      console.log(`⚠️ 分类 [${category}] 无数据，跳过`);
      continue;
    }

    allSentences[category] = sentences;
    totalCount += sentences.length;

    console.log(`✅ 分类 [${category}]: ${sentences.length} 条句子`);
  }

  // 生成导出语句
  moduleContent += 'export const SENTENCES_DATA = {\n';

  for (const category of CATEGORIES) {
    const sentences = allSentences[category] || [];
    moduleContent += `  ${category}: [`;

    if (sentences.length > 0) {
      moduleContent += '\n';
      for (const s of sentences) {
        const hitokoto = escapeString(s.hitokoto);
        const from = escapeString(s.from);
        const fromWho = escapeString(s.from_who);
        const creator = escapeString(s.creator);

        moduleContent += `    { id: ${s.id}, uuid: '${s.uuid}', hitokoto: '${hitokoto}', type: '${s.type}', from: '${from}', from_who: ${fromWho ? `'${fromWho}'` : 'null'}, creator: '${creator}', creator_uid: ${s.creator_uid || 0}, length: ${s.length} },\n`;
      }
      moduleContent += '  ';
    }

    moduleContent += `],\n`;
  }

  moduleContent += '};\n\n';

  // 添加辅助函数
  moduleContent += `
/**
 * 获取指定分类的句子
 * @param {string} category - 分类代码
 * @returns {Array} 句子数组
 */
export function getSentencesByCategory(category) {
  return SENTENCES_DATA[category] || [];
}

/**
 * 获取所有句子
 * @returns {Array} 所有句子数组
 */
export function getAllSentences() {
  return Object.values(SENTENCES_DATA).flat();
}

/**
 * 获取数据更新时间
 * @returns {string} ISO 格式时间字符串
 */
export function getDataUpdatedAt() {
  return '${new Date().toISOString()}';
}
`;

  return { moduleContent, totalCount };
}

/**
 * 主函数
 */
function main() {
  console.log('🔨 开始构建句子数据模块...\n');

  if (!fs.existsSync(DATA_DIR)) {
    console.error('❌ 数据目录不存在:', DATA_DIR);
    console.log('请先运行: node scripts/fetch-sentences.js');
    process.exit(1);
  }

  const { moduleContent, totalCount } = generateModule();

  fs.writeFileSync(OUTPUT_FILE, moduleContent, 'utf-8');

  console.log(`\n📦 模块已生成: ${OUTPUT_FILE}`);
  console.log(`📊 句子总数: ${totalCount} 条`);
  console.log(`📏 文件大小: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB`);

  // 检查文件大小是否超过限制
  const fileSizeKB = fs.statSync(OUTPUT_FILE).size / 1024;
  if (fileSizeKB > 4000) {
    console.log('\n⚠️ 警告: 数据模块较大，可能影响加载性能');
  }

  console.log('\n✅ 构建完成!');
}

main();
