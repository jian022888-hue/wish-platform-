# API 文档

本文档描述了梦的平台的所有 REST API 接口。

## 基础信息

- **Base URL**: `https://your-domain.com/api`
- **认证方式**: 通过 Supabase Auth 的 Cookie/Session
- **Content-Type**: `application/json`

## 数据格式

### 成功响应
```json
{
  "success": true,
  "data": { ... }
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误信息"
}
```

---

## 愿望 (Wishes)

### 获取愿望列表

**GET** `/api/wishes`

获取所有愿望，支持分页、搜索和筛选。

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| limit | number | 否 | 10 | 每页数量 |
| category | string | 否 | - | 按分类筛选（Life/Creative/Learning/Career/Community） |
| status | string | 否 | - | 按状态筛选（open/clarifying/in_progress/supported/completed） |
| search | string | 否 | - | 关键词搜索（标题、描述、摘要） |

**响应示例**:
```json
{
  "success": true,
  "wishes": [
    {
      "id": "wish-1234567890-abc12",
      "title": "想做一个散步式读书会",
      "summary": "",
      "description": "...",
      "whyImportant": "...",
      "currentBlocker": "...",
      "desiredResponseTypes": ["Advice", "Support"],
      "category": "Life",
      "status": "open",
      "responseCount": 3,
      "featured": false,
      "allowAnonymous": true,
      "allowPlatformSupport": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 创建愿望

**POST** `/api/wishes`

创建一个新的愿望。需要用户登录。

**速率限制**: 每小时最多 10 次

**请求体**:
```json
{
  "title": "想做一个散步式读书会",
  "description": "每月一次的小型散步读书会...",
  "whyImportant": "因为我想给阅读找回一点松弛...",
  "currentBlocker": "我不知道第一场应该把人数控制在多少...",
  "desiredResponseTypes": ["Advice", "Support", "Opportunity"],
  "allowAnonymous": true,
  "allowPlatformSupport": true
}
```

**字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 愿望标题（1-100字符） |
| description | string | 是 | 愿望描述（20-1000字符） |
| whyImportant | string | 是 | 为什么重要（10-500字符） |
| currentBlocker | string | 是 | 当前卡点（10-500字符） |
| desiredResponseTypes | string[] | 是 | 期望回应类型，至少一个 |
| allowAnonymous | boolean | 否 | 是否允许匿名，默认 false |
| allowPlatformSupport | boolean | 否 | 是否允许平台参与，默认 false |

**允许的回应类型**:
- `Advice` - 经验建议
- `Resource` - 资源提供
- `Introduction` - 人脉引荐
- `Opportunity` - 机会线索
- `Support` - 陪伴支持
- `Similar Experience` - 相似经历

**响应示例** (201):
```json
{
  "success": true,
  "wish": { ... }
}
```

---

### 更新愿望

**PATCH** `/api/wishes/[id]/edit`

更新指定愿望的信息。仅愿望拥有者可操作。

**速率限制**: 每小时最多 10 次

**权限**: 仅愿望创建者可编辑

**请求体** (所有字段可选):
```json
{
  "title": "新的标题",
  "description": "新的描述",
  "whyImportant": "...",
  "currentBlocker": "...",
  "desiredResponseTypes": ["Advice", "Support"],
  "status": "in_progress",
  "category": "Creative",
  "featured": true
}
```

**允许的状态**:
- `open` - 开放中
- `clarifying` - 整理中
- `in_progress` - 进行中
- `supported` - 已获得支持
- `completed` - 已完成

**响应示例** (200):
```json
{
  "success": true,
  "wish": { ... }
}
```

---

### 删除愿望

**DELETE** `/api/wishes/[id]`

删除指定愿望。仅愿望拥有者可操作。

**速率限制**: 每小时最多 10 次

**权限**: 仅愿望创建者可删除

**响应示例** (200):
```json
{
  "success": true
}
```

---

## 回应 (Responses)

### 创建回应

**POST** `/api/wishes/[id]/responses`

为指定愿望创建一个回应。需要用户登录。

**速率限制**: 每小时最多 20 次

**请求体**:
```json
{
  "authorName": "张三",
  "isAnonymous": false,
  "type": "Advice",
  "content": "我可以分享我之前组织读书会的经验..."
}
```

**字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| authorName | string | 是 | 作者名称（最多 50 字符） |
| isAnonymous | boolean | 否 | 是否匿名，默认 false |
| type | string | 是 | 回应类型（见上方允许的类型列表） |
| content | string | 是 | 回应内容（10-5000字符） |

**响应示例** (201):
```json
{
  "success": true,
  "response": {
    "id": "resp-1234567890-abc12",
    "wishId": "wish-1234567890-abc12",
    "authorName": "张三",
    "isAnonymous": false,
    "type": "Advice",
    "content": "我可以分享...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## AI 功能

### AI 整理愿望

**POST** `/api/ai/refine`

使用 AI 将用户的原始愿望想法整理为结构化的格式。

**速率限制**: 每小时最多 10 次

**Content-Type**: `text/event-stream` (SSE 流式响应)

**请求体**:
```json
{
  "rawWish": "我想做一个读书会，但是不知道怎么做"
}
```

**流式响应** (Server-Sent Events):
```
data: {"content": "{"}

data: {"content": "\"title\":\""}

data: {"content": "想做一个读书"}

data: {"content": "会\""}

...

data: [DONE]
```

**最终解析后的 JSON**:
```json
{
  "title": "想做一个散步式读书会",
  "description": "...",
  "whyImportant": "...",
  "currentBlocker": "..."
}
```

---

### AI 聊天

**POST** `/api/ai/chat`

与 AI 进行多轮对话。

**速率限制**: 每分钟最多 10 次

**Content-Type**: `text/event-stream` (SSE 流式响应)

**请求体**:
```json
{
  "messages": [
    { "role": "user", "content": "你好" },
    { "role": "assistant", "content": "你好！有什么可以帮助你的？" },
    { "role": "user", "content": "我想发布一个愿望" }
  ]
}
```

**响应**: SSE 流式响应，格式同 AI 整理接口。

---

## 认证

### 登录

**POST** `/auth/v1/token` (Supabase Auth)

用户登录接口。

**速率限制**: 每 15 分钟最多 5 次

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### 注册

**POST** `/auth/v1/signup` (Supabase Auth)

用户注册接口。

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "data": {
    "display_name": "张三"
  }
}
```

---

### 退出登录

**POST** `/auth/signout` (Server Action)

用户退出登录。

---

## 错误码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

---

## 安全说明

1. **所有用户输入** 会经过 XSS 清洗
2. **所有 API** 都有速率限制保护
3. **编辑/删除操作** 需要验证用户身份和所有权
4. **匿名回应** 的用户信息不会被泄露
