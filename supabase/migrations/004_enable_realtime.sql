-- ============================================
-- 启用 Supabase Realtime 广播
-- ============================================

-- 启用 messages 表的 Realtime 广播
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 启用 message_requests 表的 Realtime 广播
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_requests;
