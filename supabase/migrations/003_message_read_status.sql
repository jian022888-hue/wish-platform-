-- ============================================
-- 消息已读状态 - 数据库迁移
-- ============================================

-- 给消息表添加 is_read 字段
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false NOT NULL;

-- 给对话表添加 last_read_at 字段（用于计算未读数）
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS user_a_last_read_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS user_b_last_read_at TIMESTAMP WITH TIME ZONE;

-- 更新现有消息：默认都未读
UPDATE public.messages SET is_read = false WHERE is_read IS NULL;

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_messages_conversation_unread ON public.messages(conversation_id, is_read) WHERE is_read = false;

-- 函数：标记对话中的消息为已读
CREATE OR REPLACE FUNCTION public.mark_conversation_as_read(
  p_conversation_id TEXT,
  p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
  is_user_a BOOLEAN;
BEGIN
  SELECT (user_a_id = p_user_id) INTO is_user_a
  FROM public.conversations
  WHERE id = p_conversation_id;
  
  IF is_user_a THEN
    UPDATE public.conversations
    SET user_a_last_read_at = now()
    WHERE id = p_conversation_id;
  ELSE
    UPDATE public.conversations
    SET user_b_last_read_at = now()
    WHERE id = p_conversation_id;
  END IF;
  
  UPDATE public.messages
  SET is_read = true
  WHERE conversation_id = p_conversation_id
  AND sender_id != p_user_id
  AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
