# 🚀 部署指南 - 消息系统数据库迁移

## 前置要求
- 已登录 Supabase Dashboard: https://supabase.com/dashboard
- 选择你的项目

## 迁移步骤

### 第 1 步：运行数据库迁移

前往 Supabase Dashboard → **SQL Editor**，依次运行以下 SQL 文件：

#### 1.1 已读状态迁移
```
supabase/migrations/003_message_read_status.sql
```
**作用**：
- 给 `messages` 表添加 `is_read` 字段
- 给 `conversations` 表添加 `user_a_last_read_at` 和 `user_b_last_read_at` 字段
- 创建 `mark_conversation_as_read` 函数

#### 1.2 实时通知迁移
```
supabase/migrations/004_enable_realtime.sql
```
**作用**：
- 启用 `messages` 表的 Realtime 广播
- 启用 `message_requests` 表的 Realtime 广播

#### 1.3 图片存储迁移
```
supabase/migrations/005_message_storage.sql
```
**作用**：
- 创建 `message-images` 存储桶
- 配置上传/读取/删除权限

### 第 2 步：启用 Supabase Realtime

1. 前往 **Database** → **Replication**
2. 在 **Source** 标签下，确保以下表已开启 Realtime：
   - ✅ `messages`
   - ✅ `message_requests`
3. 如果未开启，点击表名右侧的开关启用

### 第 3 步：验证迁移

运行以下 SQL 验证：

```sql
-- 检查消息表是否有 is_read 字段
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'messages' AND column_name = 'is_read';

-- 检查存储桶是否创建
SELECT * FROM storage.buckets WHERE id = 'message-images';

-- 检查 realtime 是否启用
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';
```

## 完成

迁移完成后，所有消息系统功能将可用。
