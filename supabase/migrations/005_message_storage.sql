-- ============================================
-- 消息图片存储 - Supabase Storage 配置
-- ============================================

-- 创建存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-images',
  'message-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 允许认证用户上传文件
CREATE POLICY "Authenticated users can upload message images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'message-images'
    AND auth.uid() IS NOT NULL
  );

-- 允许认证用户读取文件
CREATE POLICY "Anyone can view message images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'message-images');

-- 允许用户删除自己的文件
CREATE POLICY "Users can delete their own message images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'message-images'
    AND auth.uid() = owner
  );
