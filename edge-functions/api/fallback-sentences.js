// 本地备用句子数据
// 当所有网络源都不可用时，使用这些内置句子作为降级方案

const FALLBACK_SENTENCES = {
  a: [
    { id: 1, uuid: "f81e5b5c-45c7-4c5b-8f3e-1a2b3c4d5e6f", hitokoto: "即使忘记了我，我也不会遗忘你。", type: "a", from: "Re：从零开始的异世界生活", from_who: null, creator: "system", creator_uid: 0, length: 16 },
    { id: 2, uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", hitokoto: "真相只有一个！", type: "a", from: "名侦探柯南", from_who: null, creator: "system", creator_uid: 0, length: 7 },
    { id: 3, uuid: "b2c3d4e5-f6a7-8901-bcde-f12345678901", hitokoto: "我手中的魔法，是守护挚爱的力量。", type: "a", from: "魔法少女奈叶", from_who: null, creator: "system", creator_uid: 0, length: 16 },
    { id: 4, uuid: "c3d4e5f6-a7b8-9012-cdef-123456789012", hitokoto: "努力是不会背叛自己的，虽然梦想有时会背叛自己。", type: "a", from: "我的青春恋爱物语果然有问题", from_who: null, creator: "system", creator_uid: 0, length: 23 },
    { id: 5, uuid: "d4e5f6a7-b8c9-0123-defa-234567890123", hitokoto: "人经历风浪是会变得更强，可是船不同，日积月累的只有伤痛。", type: "a", from: "海贼王", from_who: null, creator: "system", creator_uid: 0, length: 28 },
    { id: 6, uuid: "e5f6a7b8-c9d0-1234-efab-345678901234", hitokoto: "我是一个经常笑的人，可我不是经常开心的人。", type: "a", from: "未闻花名", from_who: null, creator: "system", creator_uid: 0, length: 21 },
    { id: 7, uuid: "f6a7b8c9-d0e1-2345-fabc-456789012345", hitokoto: "无法飞翔的翅膀也是有意义的，因为它是曾经翱翔于天空所留下的珍贵回忆。", type: "a", from: "AIR", from_who: null, creator: "system", creator_uid: 0, length: 34 },
    { id: 8, uuid: "a7b8c9d0-e1f2-3456-abcd-567890123456", hitokoto: "只要有想见面的人，自己就不再是孤单一人。", type: "a", from: "夏目友人帐", from_who: null, creator: "system", creator_uid: 0, length: 20 },
    { id: 9, uuid: "b8c9d0e1-f2a3-4567-bcde-678901234567", hitokoto: "世界上没有一个人能代替另一个人。", type: "a", from: "人型电脑天使心", from_who: null, creator: "system", creator_uid: 0, length: 16 },
    { id: 10, uuid: "c9d0e1f2-a3b4-5678-cdef-789012345678", hitokoto: "就是因为你不好，才要留在你身边，给你幸福。", type: "a", from: "哈尔的移动城堡", from_who: null, creator: "system", creator_uid: 0, length: 21 }
  ],
  b: [
    { id: 101, uuid: "d0e1f2a3-b4c5-6789-defa-890123456789", hitokoto: "即使是绝望，也绝不能放弃希望。", type: "b", from: "进击的巨人", from_who: null, creator: "system", creator_uid: 0, length: 15 },
    { id: 102, uuid: "e1f2a3b4-c5d6-7890-efab-901234567890", hitokoto: "人的梦想，是不会终结的！", type: "b", from: "海贼王", from_who: null, creator: "system", creator_uid: 0, length: 12 }
  ],
  c: [
    { id: 201, uuid: "f2a3b4c5-d6e7-8901-fabc-012345678901", hitokoto: "游戏就是为了开心而存在的。", type: "c", from: "原创", from_who: null, creator: "system", creator_uid: 0, length: 13 },
    { id: 202, uuid: "a3b4c5d6-e7f8-9012-abcd-123456789012", hitokoto: "在虚拟世界中寻找真实感的人，一定有问题。", type: "c", from: "凉宫春日的忧郁", from_who: null, creator: "system", creator_uid: 0, length: 21 }
  ],
  d: [
    { id: 301, uuid: "b4c5d6e7-f8a9-0123-bcde-234567890123", hitokoto: "生活不止眼前的苟且，还有诗和远方。", type: "d", from: "高晓松", from_who: null, creator: "system", creator_uid: 0, length: 17 },
    { id: 302, uuid: "c5d6e7f8-a9b0-1234-cdef-345678901234", hitokoto: "黑夜给了我黑色的眼睛，我却用它寻找光明。", type: "d", from: "顾城", from_who: null, creator: "system", creator_uid: 0, length: 21 },
    { id: 303, uuid: "d6e7f8a9-b0c1-2345-defa-456789012345", hitokoto: "人生如逆旅，我亦是行人。", type: "d", from: "苏轼", from_who: null, creator: "system", creator_uid: 0, length: 12 },
    { id: 304, uuid: "e7f8a9b0-c1d2-3456-efab-567890123456", hitokoto: "山有木兮木有枝，心悦君兮君不知。", type: "d", from: "越人歌", from_who: null, creator: "system", creator_uid: 0, length: 16 }
  ],
  e: [
    { id: 401, uuid: "f8a9b0c1-d2e3-4567-fabc-678901234567", hitokoto: "每一个不曾起舞的日子，都是对生命的辜负。", type: "e", from: "尼采", from_who: null, creator: "system", creator_uid: 0, length: 20 },
    { id: 402, uuid: "a9b0c1d2-e3f4-5678-abcd-789012345678", hitokoto: "愿你出走半生，归来仍是少年。", type: "e", from: "网络", from_who: null, creator: "system", creator_uid: 0, length: 15 }
  ],
  f: [
    { id: 501, uuid: "b0c1d2e3-f4a5-6789-bcde-890123456789", hitokoto: "世界那么大，我想去看看。", type: "f", from: "网络", from_who: null, creator: "system", creator_uid: 0, length: 12 },
    { id: 502, uuid: "c1d2e3f4-a5b6-7890-cdef-901234567890", hitokoto: "不忘初心，方得始终。", type: "f", from: "网络", from_who: null, creator: "system", creator_uid: 0, length: 10 }
  ],
  g: [
    { id: 601, uuid: "d2e3f4a5-b6c7-8901-defa-012345678901", hitokoto: "知行合一。", type: "g", from: "王阳明", from_who: null, creator: "system", creator_uid: 0, length: 4 },
    { id: 602, uuid: "e3f4a5b6-c7d8-9012-efab-123456789012", hitokoto: "千里之行，始于足下。", type: "g", from: "老子", from_who: null, creator: "system", creator_uid: 0, length: 10 }
  ],
  h: [
    { id: 701, uuid: "f4a5b6c7-d8e9-0123-fabc-234567890123", hitokoto: "人生就像一盒巧克力，你永远不知道下一颗是什么味道。", type: "h", from: "阿甘正传", from_who: null, creator: "system", creator_uid: 0, length: 26 },
    { id: 702, uuid: "a5b6c7d8-e9f0-1234-abcd-345678901234", hitokoto: "希望是件好东西，也许是人间至善。", type: "h", from: "肖申克的救赎", from_who: null, creator: "system", creator_uid: 0, length: 16 }
  ],
  i: [
    { id: 801, uuid: "b6c7d8e9-f0a1-2345-bcde-456789012345", hitokoto: "采菊东篱下，悠然见南山。", type: "i", from: "陶渊明", from_who: null, creator: "system", creator_uid: 0, length: 12 },
    { id: 802, uuid: "c7d8e9f0-a1b2-3456-cdef-567890123456", hitokoto: "落霞与孤鹜齐飞，秋水共长天一色。", type: "i", from: "王勃", from_who: null, creator: "system", creator_uid: 0, length: 16 },
    { id: 803, uuid: "d8e9f0a1-b2c3-4567-defa-678901234567", hitokoto: "大漠孤烟直，长河落日圆。", type: "i", from: "王维", from_who: null, creator: "system", creator_uid: 0, length: 12 }
  ],
  j: [
    { id: 901, uuid: "e9f0a1b2-c3d4-5678-efab-789012345678", hitokoto: "你是我患得患失的梦，我是你可有可无的人。", type: "j", from: "网易云音乐", from_who: null, creator: "system", creator_uid: 0, length: 20 },
    { id: 902, uuid: "f0a1b2c3-d4e5-6789-fabc-890123456789", hitokoto: "后来的我们，什么都有了，却没有了我们。", type: "j", from: "网易云音乐", from_who: null, creator: "system", creator_uid: 0, length: 19 }
  ],
  k: [
    { id: 1001, uuid: "a1b2c3d4-e5f6-7890-abcd-901234567890", hitokoto: "我思故我在。", type: "k", from: "笛卡尔", from_who: null, creator: "system", creator_uid: 0, length: 5 },
    { id: 1002, uuid: "b2c3d4e5-f6a7-8901-bcde-012345678901", hitokoto: "认识你自己。", type: "k", from: "苏格拉底", from_who: null, creator: "system", creator_uid: 0, length: 6 }
  ],
  l: [
    { id: 1101, uuid: "c3d4e5f6-a7b8-9012-cdef-123456789012", hitokoto: "我不是针对谁，我是说在座的各位都是垃圾。", type: "l", from: "破坏之王", from_who: null, creator: "system", creator_uid: 0, length: 21 },
    { id: 1102, uuid: "d4e5f6a7-b8c9-0123-defa-234567890123", hitokoto: "贫穷限制了我的想象力。", type: "l", from: "网络", from_who: null, creator: "system", creator_uid: 0, length: 11 }
  ]
};

/**
 * 获取备用句子
 * @param {string} category - 句子类型
 * @returns {Array} 句子数组
 */
export function getFallbackSentences(category) {
  if (category && FALLBACK_SENTENCES[category]) {
    return FALLBACK_SENTENCES[category];
  }
  // 如果未指定分类或分类不存在，返回所有分类的句子
  return Object.values(FALLBACK_SENTENCES).flat();
}

/**
 * 获取所有备用句子
 * @returns {Array} 所有句子数组
 */
export function getAllFallbackSentences() {
  return Object.values(FALLBACK_SENTENCES).flat();
}
