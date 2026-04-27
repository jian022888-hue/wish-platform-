-- ============================================
-- 私信系统 - 数据库迁移
-- ============================================

-- 用户关注表
CREATE TABLE IF NOT EXISTS public.follows (
  id TEXT PRIMARY KEY DEFAULT 'follow-' || extract(epoch FROM now())::TEXT || '-' || substr(md5(random()::TEXT), 1, 5),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- 对话表
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY DEFAULT 'conv-' || extract(epoch FROM now())::TEXT || '-' || substr(md5(random()::TEXT), 1, 5),
  user_a_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_b_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wish_context_id TEXT REFERENCES public.wishes(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' NOT NULL, -- active, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_a_id, user_b_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_a_id);

CREATE POLICY "Users can update their own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- 消息表
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY DEFAULT 'msg-' || extract(epoch FROM now())::TEXT || '-' || substr(md5(random()::TEXT), 1, 5),
  conversation_id TEXT REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' NOT NULL, -- text, image
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (c.user_a_id = auth.uid() OR c.user_b_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (c.user_a_id = auth.uid() OR c.user_b_id = auth.uid())
    )
  );

-- 陌生人消息请求表
CREATE TABLE IF NOT EXISTS public.message_requests (
  id TEXT PRIMARY KEY DEFAULT 'req-' || extract(epoch FROM now())::TEXT || '-' || substr(md5(random()::TEXT), 1, 5),
  conversation_id TEXT REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, accepted, ignored
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(conversation_id, receiver_id)
);

ALTER TABLE public.message_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own message requests"
  ON public.message_requests FOR SELECT
  USING (auth.uid() = receiver_id);

CREATE POLICY "Users can create message requests"
  ON public.message_requests FOR INSERT
  WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "Users can update their own message requests"
  ON public.message_requests FOR UPDATE
  USING (auth.uid() = receiver_id);

-- 触发器：更新对话的 updated_at
CREATE OR REPLACE FUNCTION public.update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_updated_at();

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_conversations_user_a ON public.conversations(user_a_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_b ON public.conversations(user_b_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_requests_receiver ON public.message_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_message_requests_status ON public.message_requests(status);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
