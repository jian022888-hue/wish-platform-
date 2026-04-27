-- ==========================================
-- 梦的平台 - 数据库 Schema (与代码同步版本)
-- ==========================================

-- 启用 UUID 扩展
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. profiles 表 - 用户资料
-- ==========================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "公开查看用户资料" on public.profiles
  for select using (true);

create policy "更新自己的资料" on public.profiles
  for update using (auth.uid() = id);

create policy "插入自己的资料" on public.profiles
  for insert with check (auth.uid() = id);

-- ==========================================
-- 2. wishes 表 - 愿望
-- ==========================================
create table public.wishes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  summary text,
  why_important text,
  current_blocker text,
  desired_response_types text[] not null default '{}',
  category text not null default 'Life',
  status text not null default 'open',
  response_count integer not null default 0,
  featured boolean not null default false,
  allow_anonymous boolean default false,
  allow_platform_support boolean default false,
  origin_label text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.wishes enable row level security;

create policy "公开查看愿望" on public.wishes
  for select using (true);

create policy "创建自己的愿望" on public.wishes
  for insert with check (auth.uid() = user_id);

create policy "更新自己的愿望" on public.wishes
  for update using (auth.uid() = user_id);

create policy "删除自己的愿望" on public.wishes
  for delete using (auth.uid() = user_id);

-- ==========================================
-- 3. progress_updates 表 - 愿望推进记录
-- ==========================================
create table public.progress_updates (
  id uuid primary key default uuid_generate_v4(),
  wish_id uuid references public.wishes(id) on delete cascade not null,
  title text not null,
  detail text not null,
  created_at timestamp with time zone default now()
);

alter table public.progress_updates enable row level security;

create policy "公开查看推进记录" on public.progress_updates
  for select using (true);

create policy "管理自己的推进记录" on public.progress_updates
  for all using (
    exists (
      select 1 from public.wishes 
      where wishes.id = progress_updates.wish_id 
      and wishes.user_id = auth.uid()
    )
  );

-- ==========================================
-- 4. responses 表 - 回应/回声
-- ==========================================
create table public.responses (
  id uuid primary key default uuid_generate_v4(),
  wish_id uuid references public.wishes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  type text not null,
  author_name text,
  is_anonymous boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.responses enable row level security;

create policy "公开查看回应" on public.responses
  for select using (true);

create policy "创建自己的回应" on public.responses
  for insert with check (auth.uid() = user_id or user_id is null);

create policy "更新自己的回应" on public.responses
  for update using (auth.uid() = user_id);

create policy "删除自己的回应" on public.responses
  for delete using (auth.uid() = user_id);

-- ==========================================
-- 5. conversations 表 - 私信对话
-- ==========================================
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  user_a_id uuid references public.profiles(id) on delete cascade not null,
  user_b_id uuid references public.profiles(id) on delete cascade not null,
  wish_context_id uuid references public.wishes(id) on delete set null,
  status text not null default 'active',
  user_a_last_read_at timestamp with time zone,
  user_b_last_read_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint unique_conversation unique (user_a_id, user_b_id)
);

alter table public.conversations enable row level security;

create policy "查看自己的对话" on public.conversations
  for select using (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "创建对话" on public.conversations
  for insert with check (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "更新自己的对话" on public.conversations
  for update using (auth.uid() = user_a_id or auth.uid() = user_b_id);

-- ==========================================
-- 6. messages 表 - 私信消息
-- ==========================================
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  message_type text default 'text',
  image_url text,
  is_read boolean default false not null,
  created_at timestamp with time zone default now()
);

alter table public.messages enable row level security;

create policy "查看自己的消息" on public.messages
  for select using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and (conversations.user_a_id = auth.uid() or conversations.user_b_id = auth.uid())
    )
  );

create policy "发送消息" on public.messages
  for insert with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and (conversations.user_a_id = auth.uid() or conversations.user_b_id = auth.uid())
    )
  );

-- ==========================================
-- 7. message_requests 表 - 陌生人消息请求
-- ==========================================
create table public.message_requests (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

alter table public.message_requests enable row level security;

create policy "查看自己的消息请求" on public.message_requests
  for select using (auth.uid() = receiver_id);

-- ==========================================
-- 8. follows 表 - 关注关系
-- ==========================================
create table public.follows (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  constraint no_self_follow check (follower_id != following_id),
  constraint unique_follow unique (follower_id, following_id)
);

alter table public.follows enable row level security;

create policy "公开查看关注关系" on public.follows
  for select using (true);

create policy "创建自己的关注" on public.follows
  for insert with check (auth.uid() = follower_id);

create policy "删除自己的关注" on public.follows
  for delete using (auth.uid() = follower_id);

-- ==========================================
-- 9. 自动更新 updated_at 触发器
-- ==========================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function update_updated_at_column();

create trigger update_wishes_updated_at
  before update on public.wishes
  for each row
  execute function update_updated_at_column();

create trigger update_conversations_updated_at
  before update on public.conversations
  for each row
  execute function update_updated_at_column();

-- ==========================================
-- 10. 自动创建用户资料触发器
-- ==========================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ==========================================
-- 11. 创建索引优化查询
-- ==========================================
create index idx_wishes_user_id on public.wishes(user_id);
create index idx_wishes_status on public.wishes(status);
create index idx_wishes_created_at on public.wishes(created_at desc);
create index idx_responses_wish_id on public.responses(wish_id);
create index idx_responses_user_id on public.responses(user_id);
create index idx_messages_conversation_id on public.messages(conversation_id);
create index idx_messages_created_at on public.messages(created_at desc);
create index idx_follows_follower on public.follows(follower_id);
create index idx_follows_following on public.follows(following_id);
create index idx_conversations_users on public.conversations(user_a_id, user_b_id);
