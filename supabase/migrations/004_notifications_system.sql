-- ==========================================
-- 通知系统 - 数据库迁移
-- ==========================================

-- 创建 notifications 表
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null, -- 'new_response', 'new_message', 'new_follower', 'wish_update'
  title text not null,
  content text,
  reference_id uuid, -- wish_id, conversation_id, etc.
  is_read boolean default false not null,
  created_at timestamp with time zone default now()
);

alter table public.notifications enable row level security;

create policy "查看自己的通知" on public.notifications
  for select using (auth.uid() = user_id);

create policy "更新自己的通知" on public.notifications
  for update using (auth.uid() = user_id);

-- 创建索引
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_created_at on public.notifications(created_at desc);
create index idx_notifications_is_read on public.notifications(is_read);

-- 创建触发器：当有新回应时自动创建通知
create or replace function public.create_notification_on_response()
returns trigger as $$
declare
  wish_owner_id uuid;
begin
  -- 获取愿望的拥有者
  select user_id into wish_owner_id from public.wishes where id = new.wish_id;
  
  -- 如果不是愿望拥有者自己发布的回应，则创建通知
  if wish_owner_id is not null and wish_owner_id != new.user_id then
    insert into public.notifications (user_id, type, title, content, reference_id)
    values (
      wish_owner_id,
      'new_response',
      '收到新回应',
      '有人在你的愿望 "' || (select title from public.wishes where id = new.wish_id) || '" 上留下了回应',
      new.wish_id
    );
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_response_created
  after insert on public.responses
  for each row
  execute function public.create_notification_on_response();

-- 创建触发器：当有新消息时自动创建通知
create or replace function public.create_notification_on_message()
returns trigger as $$
declare
  receiver_id uuid;
  sender_id uuid;
begin
  -- 获取对话中的接收者
  select 
    case 
      when user_a_id = new.sender_id then user_b_id
      else user_a_id
    end into receiver_id
  from public.conversations
  where id = new.conversation_id;
  
  -- 获取发送者ID
  sender_id := new.sender_id;
  
  -- 如果不是自己发给自己，则创建通知
  if receiver_id is not null and receiver_id != sender_id then
    insert into public.notifications (user_id, type, title, content, reference_id)
    values (
      receiver_id,
      'new_message',
      '收到新消息',
      '你有一条新的私信消息',
      new.conversation_id
    );
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_message_created
  after insert on public.messages
  for each row
  execute function public.create_notification_on_message();

-- 创建触发器：当有新关注时自动创建通知
create or replace function public.create_notification_on_follow()
returns trigger as $$
begin
  insert into public.notifications (user_id, type, title, content, reference_id)
  values (
    new.following_id,
    'new_follower',
    '新粉丝',
    '有人开始关注你了',
    new.follower_id
  );
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_follow_created
  after insert on public.follows
  for each row
  execute function public.create_notification_on_follow();
