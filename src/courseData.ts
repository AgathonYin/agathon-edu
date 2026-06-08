export type CourseWeek = {
  id: number
  module: string
  mode: string
  title: string
  summary: string
  route?: string
  status: 'ready' | 'planned'
}

export type KnowledgePoint = {
  id: string
  title: string
  module: string
  week: number
  tags: string[]
  mastery: number
  description: string
}

export type Lesson = {
  slug: string
  week: number
  title: string
  subtitle: string
  tabs: Array<{
    id: string
    label: string
    heading: string
    body: string[]
    callout?: string
  }>
}

export type FeaturePage = {
  slug: string
  title: string
  subtitle: string
  badge: string
  sections: Array<{
    title: string
    body: string[]
    items?: string[]
  }>
}

export const weeks: CourseWeek[] = [
  { id: 1, module: '一·导论', mode: '讲授与实操', title: '翻译本质界定', summary: '翻译的本质界定；语料库建设设计', status: 'planned' },
  { id: 2, module: '二·社交与致辞', mode: '讲授与实操', title: '致辞与敬语层级', summary: '受众身份决定语体与敬语层级', route: 'speech', status: 'ready' },
  { id: 3, module: '三·网络与游戏', mode: '讲授与实操', title: '游戏本地化流程', summary: '游戏本地化完整流程：翻译、润色、测试', route: 'game', status: 'ready' },
  { id: 4, module: '三·网络与游戏', mode: '点评与补充', title: 'UI 空间与字符控制', summary: 'UI空间限制与极限缩减技巧', status: 'planned' },
  { id: 5, module: '四·广告与营销', mode: '讲授与实操', title: '广告语言特征', summary: 'SEO搜索词的跨文化重构', route: 'ad', status: 'ready' },
  { id: 6, module: '四·广告与营销', mode: '点评与补充', title: '电商标题重构', summary: '商品标题的信息密度重构', route: 'week6', status: 'ready' },
  { id: 7, module: '五·旅游外宣', mode: '讲授与实操', title: '旅游文体交际属性', summary: '推介语与说明语的转换', status: 'planned' },
  { id: 8, module: '五·旅游外宣', mode: '点评与补充', title: '景物描写差异', summary: '中文主观视角与日文客观视角', status: 'planned' },
  { id: 9, module: '六·新闻报道', mode: '讲授与实操', title: '新闻5W1H结构差异', summary: '新闻信息结构与逆金字塔原则', status: 'planned' },
  { id: 10, module: '六·新闻报道', mode: '点评与考核', title: '新闻作业点评', summary: '共性错误总结与期中考核说明', status: 'planned' },
  { id: 11, module: '七·科技产品', mode: '讲授与实操', title: '技术文档规范', summary: '技术文档与说明书的规制规范', route: 'tech', status: 'ready' },
  { id: 12, module: '七·科技产品', mode: '点评与补充', title: 'MTPE流程与质量', summary: '机器翻译后编辑与质量评估标准', route: 'week12', status: 'ready' },
  { id: 13, module: '八·商务信函', mode: '讲授与实操', title: '商务文书的翻译', summary: '中文业务信息如何转换为日语商务文书体裁', route: 'week13', status: 'ready' },
  { id: 14, module: '八·商务信函', mode: '点评与补充', title: '拒绝与致歉信函', summary: '社交距离控制与缓冲表达', status: 'planned' },
  { id: 15, module: '九·法规合同', mode: '讲授与实操', title: '涉外商业契约翻译（二）', summary: '防御性表述与逻辑层级', route: 'week15', status: 'ready' },
  { id: 16, module: '九·法规合同', mode: '点评与总结', title: '全学期能力回顾', summary: '合同翻译作业点评与综合总结', status: 'planned' },
]

export const knowledgePoints: KnowledgePoint[] = [
  {
    id: 'equivalence',
    title: '翻译本质与等值理论',
    module: '一·导论',
    week: 1,
    tags: ['功能对等', '翻译理论'],
    mastery: 68,
    description: '形式对等与功能对等的适用边界，以及中日翻译实践中的信达雅、忠实性、明确性和自然性。',
  },
  {
    id: 'register',
    title: '中日语体系统对比',
    module: '二·社交与致辞',
    week: 2,
    tags: ['语体', '敬语'],
    mastery: 74,
    description: '书面语、口语、敬体、常体和正式度层级在社交致辞翻译中的对应选择。',
  },
  {
    id: 'game-ui',
    title: '游戏本地化中的字符空间限制',
    module: '三·网络与游戏',
    week: 3,
    tags: ['本地化', 'UI翻译'],
    mastery: 82,
    description: '在按钮、菜单、弹窗等 UI 容器限制下，压缩译文并保持角色语气和可读性。',
  },
  {
    id: 'seo-copy',
    title: '广告文案中的 SEO 重构',
    module: '四·广告与营销',
    week: 5,
    tags: ['SEO', '广告翻译'],
    mastery: 56,
    description: '围绕目标市场搜索行为重构关键词、标题长度和诉求轴。',
  },
  {
    id: 'mtpe',
    title: 'MTPE 质量评估与人工干预',
    module: '七·科技产品',
    week: 12,
    tags: ['MTPE', 'MQM'],
    mastery: 61,
    description: '区分轻量级编辑和全量编辑，识别术语不一致、数字错误、否定遗漏等 MT 常见问题。',
  },
  {
    id: 'business-format',
    title: '商务信函格式与社交距离',
    module: '八·商务信函',
    week: 13,
    tags: ['商务文书', '礼貌策略'],
    mastery: 43,
    description: '将中文直接业务信息转换为日语商务文书的固定格式、缓冲表达和礼貌请求。',
  },
  {
    id: 'legal-conditions',
    title: '契约条件嵌套的集合论逻辑',
    module: '九·法规合同',
    week: 15,
    tags: ['場合', 'とき', '法律逻辑'],
    mastery: 37,
    description: '以「場合」构建大前提，以「とき」指定触发事件，避免平级并列导致权利边界错误。',
  },
  {
    id: 'deemed-presumed',
    title: '法律拟制与法律推定',
    module: '九·法规合同',
    week: 15,
    tags: ['みなす', '推定する'],
    mastery: 48,
    description: '区分不可反驳的法律拟制与可反驳的法律推定，控制举证责任和抗辩空间。',
  },
  {
    id: 'corpus',
    title: '语料库辅助翻译',
    module: '一·导论',
    week: 1,
    tags: ['语料库', '平行语料库'],
    mastery: 64,
    description: '利用平行语料库、可比语料库和索引行分析辅助术语选择、搭配判断和语体判断。',
  },
  {
    id: 'keigo',
    title: '敬語層級の体系と中日敬語のズレ',
    module: '二·社交与致辞',
    week: 2,
    tags: ['敬語', '尊敬語'],
    mastery: 58,
    description: '梳理尊敬语、谦让语、丁寧语的映射规则，并判断自他关系对敬语方向的制约。',
  },
  {
    id: 'speech-structure',
    title: '致辞文本的篇章结构',
    module: '二·社交与致辞',
    week: 2,
    tags: ['篇章结构', '致辞翻译'],
    mastery: 52,
    description: '比较日语固定开场套语、起承转结结构与中文总分总结构之间的转换策略。',
  },
  {
    id: 'transcreation',
    title: 'トランスレクリエーション',
    module: '三·网络与游戏',
    week: 3,
    tags: ['创译', '网络语言'],
    mastery: 47,
    description: '面对网络梗、表情包文字和游戏彩蛋台词，优先保留情感冲击力与幽默节奏。',
  },
  {
    id: 'cat-workflow',
    title: '本地化流程与 CAT 工具',
    module: '三·网络与游戏',
    week: 4,
    tags: ['CAT工具', '翻译记忆库'],
    mastery: 63,
    description: '围绕翻译记忆库、术语库、XLIFF/PO 文件和多人协作风格指南建立项目流程。',
  },
  {
    id: 'brand-voice',
    title: '語域選択とブランドボイス',
    module: '四·广告与营销',
    week: 5,
    tags: ['品牌声音', '语域'],
    mastery: 55,
    description: '根据品牌形象选择敬体、常体、年轻语或正式语，并保持跨渠道语域一致性。',
  },
  {
    id: 'ecommerce-copy',
    title: '电商标题与产品描述重构',
    module: '四·广告与营销',
    week: 6,
    tags: ['电商翻译', '产品描述'],
    mastery: 46,
    description: '兼顾平台算法规则和消费者心理，重写标题信息密度、Bullet Point 和促销语气。',
  },
  {
    id: 'tourism-perspective',
    title: '旅游外宣文本的视点转换',
    module: '五·旅游外宣',
    week: 7,
    tags: ['视点转换', '旅游翻译'],
    mastery: 50,
    description: '将中文全知叙述者式景点描述，转换为日语旅游文案偏好的体验视角。',
  },
  {
    id: 'news-5w1h',
    title: '新闻翻译中 5W1H 结构重编',
    module: '六·新闻报道',
    week: 9,
    tags: ['新闻翻译', '逆金字塔'],
    mastery: 57,
    description: '识别逆金字塔结构，处理标题显化、消息来源、数字日期格式和中日语序重排。',
  },
  {
    id: 'terminology',
    title: '技术用语统一与用语集构建',
    module: '七·科技产品',
    week: 11,
    tags: ['术语管理', '用语集'],
    mastery: 69,
    description: '管理产品名、功能名、界面标签和客户指定术语，降低跨文档术语不一致风险。',
  },
  {
    id: 'interval-boundary',
    title: '数量与期间的开闭区间控制',
    module: '九·法规合同',
    week: 15,
    tags: ['以上以下', '期间边界'],
    mastery: 41,
    description: '区分以上、以下、以前、以後与超える、未満、前、後，明确基准日和基准数量是否包含。',
  },
]

export const lessons: Lesson[] = [
  {
    slug: 'speech',
    week: 2,
    title: '第2周｜致辞翻译实务',
    subtitle: '中日笔译实战与语用分析：组织语境、交际功能与微观表达',
    tabs: [
      {
        id: 'intro',
        label: '课程导入',
        heading: '受众身份决定语体与敬语层级',
        body: [
          '致辞翻译不是把祝辞逐句换成日语，而是先识别发言人的组织身份、受众关系、场合等级和文本功能。',
          '同一句中文，在校长致辞、企业代表致辞、学生代表致辞中，对应的日语敬语层级、句末形式和篇章结构都不同。',
        ],
        callout: '核心能力：从“说了什么”转向“谁在什么场合对谁说”。',
      },
      {
        id: 'method',
        label: '教学方法',
        heading: '组织语境映射',
        body: [
          '先判断组织关系：主办方、来宾、上级、同级、学生、客户等身份会改变称谓和敬语方向。',
          '再判断交际功能：感谢、祝贺、鼓励、承诺、邀请、致歉等功能段落在日语致辞中往往有固定顺序。',
        ],
      },
      {
        id: 'expression',
        label: '表达库',
        heading: '致辞固定表达的替代机制',
        body: [
          '中文中的“在此表示热烈欢迎”“衷心感谢各位的到来”等表达，不宜机械直译，应使用日语致辞中自然的功能等效表达。',
          '翻译时保留社交功能，调整语言形式，避免过度书面化或过度口语化。',
        ],
      },
    ],
  },
  {
    slug: 'ad',
    week: 5,
    title: 'キャッチフレーズの翻訳',
    subtitle: '广告文案的语言特点与跨文化翻译策略',
    tabs: [
      {
        id: 'intro',
        label: '引入',
        heading: 'iPhone 14 运动模式广告',
        body: [
          '中文广告文案：“镜头很晃 / 影片很稳 / 放心，有 iPhone14”。',
          '日文广告文案：“カメラが揺れても / 手ぶれしない映像を / 大丈夫、iPhone14なら”。',
          '这个案例体现了广告翻译的核心：并非逐句对应，而是重新组织节奏、视角和消费者感受。',
        ],
      },
      {
        id: 'analysis',
        label: '翻译分析',
        heading: '诉求轴与语气重构',
        body: [
          '广告语要先判断核心诉求：功能型、情感型、社会认同型，还是品牌形象型。',
          '中译日时常需要降低中文的直接感，转为日语广告偏好的留白、轻提示和自然语气。',
        ],
      },
      {
        id: 'practice',
        label: '练习',
        heading: '多版本广告语生成',
        body: [
          '给同一中文广告语生成直译版、正式版、年轻受众版和高级感版本。',
          'AI 陪练后续会根据受众年龄、行业和品牌调性自动生成候选译文，并解释每个版本的选择理由。',
        ],
      },
    ],
  },
  {
    slug: 'week6',
    week: 6,
    title: '第6周｜广告与营销文案（下）',
    subtitle: '跨境电商实操：标题、Bullet Point、促销语气与合规意识',
    tabs: [
      {
        id: 'review',
        label: '作业点评',
        heading: '把“感觉”变成框架',
        body: [
          '上周任务是把“用心感受美好生活”翻译成面向不同行业、不同年龄段日本消费者的广告语。整体完成度较好，但共性问题是：很多译文依赖直觉，缺少可解释的选择框架。',
          '本课把直觉拆成三个维度：年龄段、心理诉求、语言工具；再结合行业卖点和合规红线，形成可复用的广告翻译判断地图。',
        ],
      },
      {
        id: 'audience',
        label: '年龄与行业',
        heading: '年龄段 × 心理诉求 × 语言工具',
        body: [
          '若年层强调当下享乐、自我表达和新鲜刺激，可使用邀请式、平辈感表达，如「楽しもう」「〜ない？」。',
          '中年层强调家庭价值、小确幸和品质感，适合「ささやかな」「安心」等温暖、略正式的词汇。',
          'シニア层强调安心感、被尊重和仪式感，应避免催促式语气，常用「ていねいな」「穏やかな」「丁寧な」。',
        ],
      },
      {
        id: 'ecommerce',
        label: '电商实操',
        heading: '标题信息密度与 Bullet Point 架构',
        body: [
          '中文电商标题常采用高密度关键词堆叠，日语标题需要重构信息优先级，保留搜索词但降低杂乱感。',
          'Bullet Point 应从情绪型表达改写为事实型架构，突出功能、材质、适用场景、尺寸和售后等可验证信息。',
        ],
      },
      {
        id: 'compliance',
        label: '合规提醒',
        heading: '行业卖点与表达红线',
        body: [
          '食品文案应避免过度功能性声称；化妆品文案要谨慎处理美白、修复、保证效果等表达。',
          '汽车文案不能夸大安全性能；科技产品应避免过度拟人化和夸大智能程度。',
        ],
      },
    ],
  },
  {
    slug: 'ecommerce',
    week: 6,
    title: '第6周｜跨境电商实操',
    subtitle: '标题信息密度重构、Bullet Point 架构改写、促销语气重建',
    tabs: [
      {
        id: 'overview',
        label: '课程概览',
        heading: '从创意到落地',
        body: [
          '上节课讲的是创意：如何读懂受众、选择语言策略、让同一句话在不同语境里各就各位。',
          '这节课讲的是落地：拿到真实电商产品页后，如何一步一步处理标题、卖点、促销语和合规风险。',
        ],
        callout: '核心能力：拆解日系电商 listing 结构，并重构为适合日本平台的产品表达。',
      },
      {
        id: 'title',
        label: '场景一·标题',
        heading: '商品标题的信息密度重构',
        body: [
          '中文标题常把材质、功能、使用场景、卖点和搜索词集中堆叠。日语标题需要保留核心搜索词，同时让句读和信息层级更清晰。',
          '标题重构时先列出不可删信息，再判断哪些应移入 Bullet Point 或详情页。',
        ],
      },
      {
        id: 'promotion',
        label: '场景三·促销',
        heading: '促销语气落差与紧迫感重建',
        body: [
          '中文促销文案常用强推动语气，日语中需要根据平台风格和商品品类降低压迫感。',
          '紧迫感可以通过期限、数量、活动名表达，而不是简单堆叠感叹号和夸张形容词。',
        ],
      },
    ],
  },
  {
    slug: 'tech',
    week: 11,
    title: '第11周｜科技与智能产品（上）',
    subtitle: '技術文書の翻訳実務：科技日语、术语调查、说明书规范与综合实操',
    tabs: [
      {
        id: 'overview',
        label: '课程概览',
        heading: '技术文档的全景图',
        body: [
          '上一个模块关注新闻报道的可读性。第11周进入科技产品模块，但科技翻译绝不只是“把警示语翻对”。',
          '本课先建立全景视野：技术文档有哪些类型、科技日语有什么语言特征、专业术语如何调查、说明书规范如何在中日之间对接。',
        ],
        callout: '核心能力：辨别技术文档类型 → 掌握科技日语语言特征 → 习得专业术语调查方法 → 完成 MT+人工编辑项目。',
      },
      {
        id: 'language',
        label: '科技日语特征',
        heading: '漢字語・外来語・概念の多義性',
        body: [
          '科技日语中大量汉字词与中文同形，但同形不等于同义；译者需要根据领域上下文判断含义。',
          '外来语可能存在多种片假名写法，应追溯西文词源，再决定中文译法。',
        ],
      },
      {
        id: 'terms',
        label: '术语调查',
        heading: '日中辞書の限界と検証経路',
        body: [
          '单靠日中词典或 AI 输出容易误判专业术语。更稳的路径是日语原词 → 英文术语 → 中文行业官网/标准文件交叉验证。',
          '术语表应记录来源、领域、禁用译法和例句，避免跨文档不一致。',
        ],
      },
      {
        id: 'manual',
        label: '说明书规范',
        heading: '取扱説明書の規範転換',
        body: [
          '说明书翻译需要处理警示语等级、被动态、名词化、无主语结构和固定句式。',
          '「危険」「警告」「注意」对应不同风险等级，不能只按中文语感随意替换。',
        ],
      },
    ],
  },
  {
    slug: 'week12',
    week: 12,
    title: 'AI 时代的技术翻译实务',
    subtitle: '机器翻译后编辑 · CAT · 特许 · 医療機器',
    tabs: [
      {
        id: 'intro',
        label: '课程导览',
        heading: '课程定位',
        body: [
          '以学生 MT 初译和人工编辑作业为讨论起点，分析 AI 翻得好的地方、翻得差的地方，以及人在技术翻译项目中的新职责。',
          '课程目标是理解 MTPE 实务流程、掌握术语一致性管理方法，并接触 CAT 工具、特许说明书和医療機器説明書的翻译策略。',
        ],
        callout: '90 分钟结构：作业点评、模型对比、CAT 工具、特许翻译、医療機器和模块总结。',
      },
      {
        id: 'mt',
        label: 'MT 对比',
        heading: 'AI 译文的“假准确”陷阱',
        body: [
          '模型译文常在句法上流畅，但在术语一致性、否定结构、数字单位和责任主体上出现隐蔽错误。',
          '评价 MT 译文时，先看风险项，再看流畅度。技术翻译里“读起来顺”不等于“可交付”。',
        ],
      },
      {
        id: 'cat',
        label: 'CAT 工具',
        heading: '术语库与翻译记忆库',
        body: [
          'CAT 工具的核心价值是让术语、重复句和项目风格保持一致，而不是替代译者判断。',
          '术语库字段建议包含：源语、目标语、领域、禁用译法、客户备注、例句和更新人。',
        ],
      },
    ],
  },
  {
    slug: 'week13',
    week: 13,
    title: '商务文书的翻译',
    subtitle: '中文业务信息如何转换为日语商务文书体裁',
    tabs: [
      {
        id: 'intro',
        label: '课程导入',
        heading: '体裁判断先于逐句翻译',
        body: [
          '中文商务文书译成日语时，最难的不是词汇，而是判断目标文本应当变成什么体裁。',
          '中文原文可能很直接，但日语正式文书往往需要加入寒暄、感谢、缓冲表达和固定格式。',
        ],
        callout: '训练重点：在礼貌化表达中保留金额、期限、合同号、责任等业务事实。',
      },
      {
        id: 'format',
        label: '核心讲解',
        heading: '格式、社交距离与业务事实',
        body: [
          '日语商务文书常包含宛名、頭語、時候の挨拶、平素の感謝、本文、結語等结构。',
          '翻译时不能为了“像日语”而模糊关键事实。礼貌化是语用处理，不是业务信息减损。',
        ],
      },
      {
        id: 'practice',
        label: '互动练习',
        heading: '从直接要求到礼貌请求',
        body: [
          '练习任务：将“请贵司于本月 30 日前支付尾款”改写为自然的日语商务邮件表达。',
          'AI 陪练可以给出三个层级版本：直译版、正式商务版、缓冲加强版。',
        ],
      },
    ],
  },
  {
    slug: 'week15',
    week: 15,
    title: '涉外商业契约翻译（二）',
    subtitle: '防御性表述 · 逻辑层级 · 法律定性 · 词汇技法',
    tabs: [
      {
        id: 'intro',
        label: '课前导入',
        heading: '法律日语不是日常语感',
        body: [
          '「善意の第三者」中的善意是“不知情”，不是道德意义上的善良。',
          '法律文本中的每个词都有专属功能。一个“推定する”可能改变举证责任，一个“みなす”可能封闭抗辩空间。',
        ],
        callout: '核心问题：中文“视为验收合格”在日语合同里应如何处理？',
      },
      {
        id: 'conditions',
        label: '条件嵌套',
        heading: '「場合」与「とき」的层级铁律',
        body: [
          '「場合」构建最高层级条件，「とき」指定从属触发事件，「時」通常只表示物理时刻。',
          '把两个条件错误地扁平并列，可能导致权利归属和履行义务发生争议。',
        ],
      },
      {
        id: 'defense',
        label: '防御性表述',
        heading: 'みなす vs 推定する',
        body: [
          '「みなす」是不可反驳的法律拟制；「推定する」是可反驳的法律推定。',
          '验收、默示同意、期限失权等条款中，这组词的选择具有直接法律后果。',
        ],
      },
    ],
  },
]

export const gameCases = [
  {
    category: 'JRPG / 剧情向 RPG',
    source: '封印远古灾厄的「黄昏之塔」再次苏醒，世界各地观测到了魔力的暴走。王都向被选中的调律师发出了召集令。',
    versions: [
      '古の災厄を封印した「黄昏の塔」が再び目を覚まし、世界各地で魔力の暴走が観測されている。',
      '古の災厄を封じた「黄昏の塔」が再び目を覚まし、王都は選ばれし調律師たちに緊急の召集令を発した。',
      '遥か昔、災厄をその身に封じた「黄昏の塔」が、ふたたび目を覚ました。事態を重く見た王都は最後の召集を告げた。',
    ],
  },
  {
    category: '动作 / 动作冒险',
    source: '敌人的护甲已经破裂，现在是发动终结技的最佳时机。',
    versions: ['敵の防具が壊れた。今こそフィニッシュ技を使う時だ。', '敵の装甲が崩れた。いまが必殺の一撃を叩き込む好機だ。', 'ガードは崩した。決めるなら、今だ。'],
  },
  {
    category: '手游 RPG / 抽卡 / 策略',
    source: '活动期间，每日登录即可获得限定招募券。',
    versions: ['イベント期間中、毎日ログインすると限定募集券を獲得できます。', '期間中のログインで、毎日「限定召喚券」をプレゼント。', '毎日ログインして、限定スカウトチケットを手に入れよう。'],
  },
  {
    category: '益智 / 休闲 / 模拟',
    source: '拖动相同颜色的方块完成合成，解锁新的装饰道具。',
    versions: ['同じ色のブロックをドラッグして合成し、新しい装飾アイテムを解放します。', '同じ色のブロックを合わせて、新しいデコアイテムをアンロックしましょう。', '同じ色をつなげて合体。新しいデコで空間をもっと楽しく。'],
  },
  {
    category: '射击 / 对战 / 大逃杀',
    source: '安全区正在缩小，请尽快转移到新的掩体。',
    versions: ['安全エリアが縮小しています。早めに新しい遮蔽物へ移動してください。', '安全地帯が狭まっています。次のカバーへ急いで移動しましょう。', 'エリア収縮中。次の遮蔽まで走れ。'],
  },
  {
    category: '格斗 / 音乐 / 体育',
    source: '连续命中三次后，可触发额外得分倍率。',
    versions: ['3回連続で命中すると、追加スコア倍率が発動します。', '3連続ヒットで、ボーナス倍率が発生します。', 'コンボを3つつなげて、スコア倍率アップ。'],
  },
  {
    category: 'UI / 按钮文本',
    source: '领取每日登录奖励',
    versions: ['毎日ログイン報酬を受け取る', 'ログイン報酬を受取', '本日の報酬'],
  },
  {
    category: '配音台词',
    source: '别靠近我。下一次，我不会再手下留情。',
    versions: ['近づくな。次は手加減しない。', '私に近寄らないで。次は容赦しません。', 'それ以上来るな。次は、本気で斬る。'],
  },
]

export const featurePages: FeaturePage[] = [
  {
    slug: 'blind',
    title: '裸翻实验：语境缺失下的本地化',
    subtitle: '没有角色设定、术语表、世界观文档时，译文为什么会失真',
    badge: 'Game Localization Lab',
    sections: [
      {
        title: '实验设定',
        body: [
          '译者收到一张 Excel 表格，没有角色设定、没有术语表、没有世界观文档，只能根据零散文本直接翻译。',
          '这正是很多本地化项目的真实风险：文本看似简单，实际依赖语境、角色、系统限制和 UI 空间。',
        ],
        items: ['开始 / 继续 / 设置', '你来了。', '我等你很久了。', '回春丹', '金蝉脱壳', '他从火里来，向火里去。'],
      },
      {
        title: '迁移后的交互设计',
        body: [
          '新站将把这个实验做成可提交的练习：学生先裸翻，系统记录译文；随后展示语境反转和参考版本。',
          'AI 陪练会指出哪些译法因为缺少角色信息而偏离，并要求学生给出修订理由。',
        ],
        items: ['裸翻提交', '语境揭示', '译文修订', 'AI 反馈', '教师点评'],
      },
    ],
  },
  {
    slug: 'rating',
    title: '游戏分级制度与本地化合规',
    subtitle: 'CERO、ESRB、NPPA、GRAC 的分级逻辑与本地化交付要求',
    badge: 'Compliance',
    sections: [
      {
        title: '制度概览',
        body: [
          '游戏本地化不能只做语言转换。年龄分级、内容说明、商店页、活动文案、社交与付费功能说明都是合规交付物。',
          '日本 CERO 与美国 ESRB 以年龄段和内容描述符为核心；中国 NPPA 与韩国 GRAC 更强调主管机关审批和未成年人保护。',
        ],
        items: ['日本 CERO：A / B / C / D / Z', '美国 ESRB：E / E10+ / T / M / AO', '中国适龄提示：8+ / 12+ / 16+', '韩国 GRAC：전체 / 12+ / 15+ / 청불'],
      },
      {
        title: '本地化影响',
        body: [
          '送审不能只交主线文本，隐藏内容、彩蛋、分支演出和极端镜头也需要纳入。',
          '北美商店页需要准确标注商城、抽卡、联网、聊天、定位等互动要素。韩版测试版本也不能把文字当作临时文本处理。',
        ],
        items: ['商店页文案', '内容描述符', '抽卡与付费说明', '未成年人提示', '测试版文本管理'],
      },
    ],
  },
  {
    slug: 'projects',
    title: '学生项目作业评析',
    subtitle: '游戏本地化翻译：角色重塑、阶级语态与翻译比对',
    badge: 'Student Work',
    sections: [
      {
        title: '项目说明',
        body: [
          '原始台词来自游戏场景中的经典对话，多位学生各自选定一个角色人格进行日语改写。',
          '评析重点不是“哪一句最像原文”，而是角色身份、阶级语态、第一人称、语尾和词汇选择是否形成稳定人格。',
        ],
        items: ['学生译文', '综合评析', '词汇辨析', '第一人称表', '语尾效果表', '角色对比'],
      },
      {
        title: '迁移后的用途',
        body: [
          '新站将支持上传学生译文、生成多维点评、保存教师评语，并展示同一原文的多种人格化译文。',
          'AI 可以先做初评，但最终评价由教师确认，以避免模型把创译差异误判为错误。',
        ],
        items: ['多译文对照', '角色设定标签', 'AI 初评', '教师复评', '优秀译例归档'],
      },
    ],
  },
  {
    slug: 'exercise-library',
    title: '练习库',
    subtitle: '按知识点、难度、题型组织翻译练习，并支持 AI 自动生成',
    badge: 'Exercise System',
    sections: [
      {
        title: '练习类型',
        body: [
          '练习库用于沉淀每周课程后的可复用任务。每道练习绑定知识点、难度、评分量表和参考答案。',
          '后续教师可从网页内容库、课程讲义或手动输入素材生成新练习。',
        ],
        items: ['短句翻译', '段落翻译', '术语判断', '错误诊断', '多版本改写', '合规判断'],
      },
      {
        title: 'AI 生成逻辑',
        body: [
          'AI 生成练习时先读取知识点目标，再生成源文、要求、评分维度和参考反馈。',
          '教师端可以一键保存、修改或弃用模型生成结果。',
        ],
        items: ['选择知识点', '选择难度', '生成题目', '生成评分标准', '教师确认发布'],
      },
    ],
  },
  {
    slug: 'teacher-system',
    title: '教师后台迁移蓝图',
    subtitle: '从 Base44 数据视图重建为自有数据库与 AI 学情分析系统',
    badge: 'Admin Console',
    sections: [
      {
        title: '现有能力',
        body: [
          '原站教师端包含 DeepSeek API 配置、班级筛选、学生总数、提交练习、平均得分、完成评价、分数分布和知识点平均分。',
          '还包含提交记录、网页内容库、知识点管理、练习任务和待复核/已批阅流程。',
        ],
        items: ['DeepSeek API Key', '班级筛选', '提交记录', '知识点图谱', '网页内容库', '教师批改模式'],
      },
      {
        title: '新系统实现方式',
        body: [
          '这些能力会迁移为 PostgreSQL 数据表和后端 API，不再依赖 Base44 的实体系统。',
          'AI 密钥只存储在服务端环境变量或加密配置表中，前端不直接暴露密钥。',
        ],
        items: ['users', 'knowledge_points', 'exercises', 'submissions', 'ai_reviews', 'teacher_reviews', 'web_contents'],
      },
    ],
  },
]
