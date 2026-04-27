import type { Response, ResponseType, Wish } from "@/types";

export const responseTypes: ResponseType[] = [
  "Advice",
  "Resource",
  "Introduction",
  "Opportunity",
  "Support",
  "Similar Experience",
];

export let wishes: Wish[] = [
  {
    id: "a1b2c3d4-0001-4000-8000-000000000001",
    title: "想做一个周末早餐俱乐部，让陌生人带着各自的故事来吃早饭",
    summary: "不是做社群活动，而是想试着把城市里那些轻轻悬着的人，放到一张安静的早餐桌上。",
    originLabel: "一个想把城市重新变得温柔一点的人",
    description:
      "我一直想在上海做一个非常小的周末早餐俱乐部。每次只邀请 8 到 10 个人，在一家普通但舒服的小店里吃早餐，聊最近在做的事、卡住的事、或者一个一直想开始却没开始的小愿望。我不想它变成 networking，也不想它变成一个热闹的活动品牌。我更想让它像一个被认真准备的清晨。",
    whyImportant:
      "因为我越来越觉得，很多成年人不是没有表达欲，而是很少有一个不需要立刻证明什么的场合。早餐可能是一天里最诚实的时间，我想试试看，能不能用一种很轻的方式，把人与人之间重新接起来。",
    currentBlocker:
      "我不知道第一场应该怎么开始，怕没有人来，也怕来了以后现场太尴尬。我现在缺的是一个足够小、足够真实的起步方式。",
    desiredResponseTypes: ["Advice", "Introduction", "Support"],
    category: "Community",
    status: "in_progress",
    responseCount: 5,
    featured: true,
    allowAnonymous: false,
    allowPlatformSupport: true,
    createdAt: "2026-04-05T10:30:00.000Z",
    updatedAt: "2026-04-20T09:10:00.000Z",
    progressUpdates: [
      {
        id: "progress-1",
        title: "平台协助整理了第一场试运行的范围",
        detail: "把活动规模从 20 人收缩到 8 人，并明确只做一次早餐，不做后续社群承诺。",
        date: "2026-04-12T08:00:00.000Z",
      },
      {
        id: "progress-2",
        title: "有两位回应者愿意帮忙做首场暖场",
        detail: "一位提供主持建议，一位愿意作为熟悉的第一批参与者到场支持。",
        date: "2026-04-19T08:00:00.000Z",
      },
    ],
  },
  {
    id: "a1b2c3d4-0002-4000-8000-000000000002",
    title: "想给奶奶做一本口述回忆小书，在她还能慢慢讲的时候",
    summary: "不是正式传记，只是想把她讲过很多次的那些故事，好好留住。",
    originLabel: "一个怕故事来不及被留下的孙女",
    description:
      "奶奶今年 84 岁，记忆开始有点散，但说起年轻时候的事还是会忽然很有神。我一直想把她讲过的家族迁徙、老房子、做饭、战争年代的细节录下来，再整理成一本很薄的小书，给家里人留着。它不需要出版，只要足够真实就好。",
    whyImportant:
      "这些故事如果现在不记，可能很快就会从家里消失。而我也意识到，很多我以为以后总能问的事，其实没有那么多以后。",
    currentBlocker:
      "我不知道怎样提问才不会让奶奶觉得自己在被采访，也不知道录音、整理、排版这条线从哪里开始更自然。",
    desiredResponseTypes: ["Advice", "Resource", "Similar Experience"],
    category: "Life",
    status: "open",
    responseCount: 3,
    featured: true,
    allowAnonymous: true,
    allowPlatformSupport: false,
    createdAt: "2026-04-09T14:20:00.000Z",
    updatedAt: "2026-04-18T18:40:00.000Z",
    progressUpdates: [
      {
        id: "progress-3",
        title: "整理出第一组可以从饭桌上自然问起的问题",
        detail: "先从她会做的几道菜和旧照片入手，不直接进入沉重主题。",
        date: "2026-04-18T12:00:00.000Z",
      },
    ],
  },
  {
    id: "a1b2c3d4-0003-4000-8000-000000000003",
    title: "想做一组关于“慢下来”的陶器作品，但总停在构思阶段",
    summary: "我不是想转行当艺术家，只是想认真做完一组真正属于自己的东西。",
    originLabel: "一个白天做设计、晚上想回到双手的人",
    description:
      "我平时在广告公司做品牌设计，工作里一直在处理速度、反馈和交付，但下班以后我最想做的其实是陶。过去一年断断续续上过课，也做了一些杯子和碗，但总觉得那只是练习。我想做一组完整作品，围绕“慢下来”这个主题，用三到五件器物讲一个温柔但克制的故事。",
    whyImportant:
      "它对我来说像一次很正式的自我确认。我想知道，当没有客户 brief、没有 KPI、也没有明确结果时，我还能不能把一个想法认真做完。",
    currentBlocker:
      "我缺少一个明确的系列方向，也缺少能帮我判断第一组作品是否成立的人。",
    desiredResponseTypes: ["Advice", "Support", "Opportunity"],
    category: "Creative",
    status: "clarifying",
    responseCount: 4,
    featured: false,
    allowAnonymous: false,
    allowPlatformSupport: true,
    createdAt: "2026-04-11T09:00:00.000Z",
    updatedAt: "2026-04-17T11:30:00.000Z",
    progressUpdates: [],
  },
  {
    id: "career-shift-counseling",
    title: "想从咨询转到教育公益，但不知道怎么判断这不是一时冲动",
    summary: "我不是想逃离现在的工作，而是想更诚实地判断另一种长期生活是否成立。",
    originLabel: "一个想把时间花在更具体的人身上的咨询顾问",
    description:
      "我在咨询行业工作了 6 年，外部看上去稳定、体面，收入也不错，但这两年越来越想去做和青少年教育相关的公益工作。我不是在寻求一个英雄叙事，也不是突然厌倦加班，而是反复感觉自己想把时间花在更具体的人身上。",
    whyImportant:
      "这可能不是一份新工作，而是一次生活结构的重排。我不想在没有准备的情况下冲出去，也不想因为害怕就一直拖着。",
    currentBlocker:
      "我目前最缺的是真实路径参考：有人是怎么做过渡的、经济上如何准备、前 6 个月通常会遇到什么落差。",
    desiredResponseTypes: ["Similar Experience", "Introduction", "Advice"],
    category: "Career",
    status: "supported",
    responseCount: 7,
    featured: false,
    allowAnonymous: true,
    allowPlatformSupport: true,
    createdAt: "2026-04-02T07:30:00.000Z",
    updatedAt: "2026-04-21T03:45:00.000Z",
    progressUpdates: [
      {
        id: "progress-4",
        title: "一位教育行业从业者答应做一次路径分享",
        detail: "已经约好线上聊 40 分钟，重点讨论跨行业转入前半年会遇到的落差。",
        date: "2026-04-21T01:00:00.000Z",
      },
    ],
  },
  {
    id: "night-school-math",
    title: "想给社区夜校做一门“大人也能重新学会数学”的课",
    summary: "想把很多人对数学的羞耻感，慢慢变成一种重新理解世界的能力。",
    originLabel: "一个想把数学重新变温柔的前老师",
    description:
      "我以前是理工科老师，后来转去做产品。最近一直在想，能不能为成年人设计一门非常温柔的数学课，不为了考试，只为了重新建立“我也可以理解抽象问题”的信心。也许是夜校，也许是社区空间里的 6 次小课。",
    whyImportant:
      "很多人不是不会学，而是太早被判定为不适合。重新学数学，对一些成年人来说可能是在修补一种被放弃过的自我感。",
    currentBlocker:
      "我缺一个愿意合作提供场地的小空间，也缺一个适合第一期测试的课程范围。",
    desiredResponseTypes: ["Opportunity", "Resource", "Support"],
    category: "Learning",
    status: "open",
    responseCount: 2,
    featured: true,
    allowAnonymous: false,
    allowPlatformSupport: true,
    createdAt: "2026-04-15T13:10:00.000Z",
    updatedAt: "2026-04-20T06:20:00.000Z",
    progressUpdates: [],
  },
];

export let responses: Response[] = [
  {
    id: "response-1",
    wishId: "city-breakfast-club",
    authorName: "Yiran",
    isAnonymous: false,
    type: "Advice",
    content: "你可以把第一场定义成一顿\"测试早餐\"，只邀请 6 到 8 人，并提前把聊天边界写清楚：不自我介绍履历，不交换名片，只聊最近真正想开始的一件事。",
    createdAt: "2026-04-15T09:10:00.000Z",
  },
  {
    id: "response-2",
    wishId: "city-breakfast-club",
    authorName: "匿名",
    isAnonymous: true,
    type: "Support",
    content: "如果你在上海市区做第一场，我愿意作为第一批参与者报名，也可以帮你现场照顾气氛，让你不用一个人扛住开场的紧张。",
    createdAt: "2026-04-16T04:20:00.000Z",
  },
  {
    id: "response-3",
    wishId: "city-breakfast-club",
    authorName: "Ming",
    isAnonymous: false,
    type: "Introduction",
    content: "我认识一家早上 9 点前比较安静的小馆，老板对小型活动友好。如果你愿意，我可以帮你做一次初步牵线，先问问场地条件。",
    createdAt: "2026-04-18T10:45:00.000Z",
  },
  {
    id: "response-4",
    wishId: "letters-to-grandma",
    authorName: "Fei",
    isAnonymous: false,
    type: "Similar Experience",
    content: "我去年给外婆做过类似的录音整理，最自然的方式不是\"采访\"，而是边翻相册边聊天。照片会让叙述自动有抓手，也比较不会有被审问的感觉。",
    createdAt: "2026-04-17T12:00:00.000Z",
  },
  {
    id: "response-5",
    wishId: "letters-to-grandma",
    authorName: "匿名",
    isAnonymous: true,
    type: "Resource",
    content: "如果你后面要做成一本家庭小书，可以先用最简单的文档模板，不必一开始就碰复杂排版。我可以整理一份适合长辈口述的提问框架给你。",
    createdAt: "2026-04-18T08:20:00.000Z",
  },
  {
    id: "response-6",
    wishId: "career-shift-counseling",
    authorName: "Lina",
    isAnonymous: false,
    type: "Similar Experience",
    content: "我曾经从投行转去做县域教育项目，最难的不是能力切换，而是生活节奏和成就感反馈机制完全变了。建议你先做三个月并行试探，而不是一次性辞职。",
    createdAt: "2026-04-20T07:00:00.000Z",
  },
  {
    id: "response-7",
    wishId: "night-school-math",
    authorName: "Jude",
    isAnonymous: false,
    type: "Opportunity",
    content: "我们社区空间最近在找愿意做成人学习实验课的老师，如果你已经有一个 90 分钟试讲版本，我可以帮你对接一次场地试排。",
    createdAt: "2026-04-19T15:15:00.000Z",
  },
];
