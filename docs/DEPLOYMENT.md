# 部署文档

本文档指导如何将梦的平台部署到生产环境。

## 前置条件

- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase 项目（需要先在 [supabase.com](https://supabase.com) 创建）

---

## 第一步：创建 Supabase 项目

1. 访问 https://supabase.com 并登录
2. 点击「New Project」
3. 填写项目名称、数据库密码、区域（推荐选择离用户最近的区域）
4. 等待项目创建完成（约 2 分钟）

---

## 第二步：获取 Supabase 密钥

在项目创建完成后，进入项目设置：

1. **Project URL**: 在 Settings > General > Project URL 中获取
2. **anon public key**: 在 Settings > API > Project API keys > anon public 中获取
3. **service_role key**: 在 Settings > API > Project API keys > service_role 中获取（注意：此密钥仅在服务端使用，切勿泄露给前端）

---

## 第三步：执行数据库迁移

### 方式一：通过 Supabase Dashboard

1. 打开 Supabase Dashboard
2. 进入 SQL Editor
3. 将 `supabase/migrations/001_initial_schema.sql` 文件内容粘贴到编辑器
4. 点击「Run」执行

### 方式二：通过 Supabase CLI

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 关联项目
supabase link --project-ref <your-project-ref>

# 执行迁移
supabase db push
```

迁移完成后，数据库会创建以下表：
- `profiles` - 用户资料表
- `wishes` - 愿望表
- `responses` - 回应表

同时会创建以下功能：
- Row Level Security (RLS) 策略
- 自动创建用户 profile 的触发器
- 更新 `updated_at` 的触发器
- 增加 `response_count` 的触发器

---

## 第四步：配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# AI 配置（使用 OpenAI 兼容 API）
AI_API_KEY=your-openai-api-key-here
AI_MODEL=gpt-4o-mini

# 应用设置
NODE_ENV=production
PORT=3000
```

**注意**:
- `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 会暴露给浏览器，是安全的
- `SUPABASE_SERVICE_ROLE_KEY` **绝不能**暴露给前端，仅用于服务端
- `AI_API_KEY` 也需要保密

你可以参考 `.env.example` 和 `.env.local.example` 文件作为模板。

---

## 第五步：安装依赖并构建

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build
```

构建成功后，会生成 `.next-build` 目录。

---

## 第六步：启动生产服务器

```bash
# 启动
npm start
```

服务默认运行在 `http://localhost:3000`。

---

## 部署到 Vercel（推荐）

Vercel 是 Next.js 的官方部署平台，提供最简单的部署方式。

### 方式一：通过 GitHub 连接

1. 将代码推送到 GitHub 仓库
2. 访问 https://vercel.com 并登录
3. 点击「New Project」
4. 选择你的 GitHub 仓库
5. 在 Environment Variables 中添加所有环境变量
6. 点击「Deploy」

### 方式二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

部署时，在 Vercel 项目设置中添加环境变量：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AI_API_KEY`
- `AI_MODEL`

---

## 部署到其他平台

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next-build ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

构建并运行：
```bash
docker build -t dream-platform .
docker run -p 3000:3000 --env-file .env.local dream-platform
```

---

## 生产环境检查清单

在正式上线前，请确认以下事项：

- [ ] Supabase 项目已创建并配置
- [ ] 数据库迁移已执行
- [ ] 所有环境变量已正确配置
- [ ] `AI_API_KEY` 已配置且有效
- [ ] 生产构建成功
- [ ] 网站可通过 HTTPS 访问
- [ ] 自定义域名已配置（如需要）
- [ ] 错误监控已配置（如 Sentry）
- [ ] 数据库备份策略已设置
- [ ] 速率限制配置合理
- [ ] 日志收集已配置

---

## 常见问题

### Q: 构建时出现 "Missing Supabase environment variables" 错误
A: 确保 `.env.local` 文件存在，并且包含 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。

### Q: AI 功能无法使用
A: 检查 `AI_API_KEY` 是否正确，以及是否有足够的余额/额度。

### Q: 用户无法登录
A: 检查 Supabase Auth 设置，确认 Email 认证已启用。如果使用邮箱确认，用户需要先点击确认邮件中的链接。

### Q: 数据库查询很慢
A: 检查 Supabase Dashboard 中的数据库性能指标，考虑添加索引或优化查询。
