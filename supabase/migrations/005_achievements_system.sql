-- ==========================================
-- 成就系统 - 数据库迁移
-- ==========================================

-- 创建 achievements 表 - 成就定义
create table public.achievements (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null,
  icon text not null, -- emoji or icon name
  category text not null, -- 'wish', 'social', 'milestone'
  requirement integer not null, -- 需要的数量
  requirement_type text not null, -- 'wishes_created', 'responses_received', 'followers', etc.
  points integer default 0, -- 积分奖励
  created_at timestamp with time zone default now()
);

-- 创建 user_achievements 表 - 用户成就
create table public.user_achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  achievement_id uuid references public.achievements(id) on delete cascade not null,
  earned_at timestamp with time zone default now(),
  unique(user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

create policy "查看成就" on public.user_achievements
  for select using (true);

create policy "创建成就" on public.user_achievements
  for insert with check (auth.uid() = user_id);

-- 创建 user_levels 表 - 用户等级
create table public.user_levels (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  level integer default 1,
  xp integer default 0, -- 经验值
  total_xp integer default 0, -- 总经验值
  updated_at timestamp with time zone default now()
);

alter table public.user_levels enable row level security;

create policy "查看等级" on public.user_levels
  for select using (true);

create policy "更新等级" on public.user_levels
  for update using (auth.uid() = user_id);

-- 插入默认成就
insert into public.achievements (name, description, icon, category, requirement, requirement_type, points) values
  ('初次许愿', '发布你的第一个愿望', '🌟', 'wish', 1, 'wishes_created', 50),
  ('许愿达人', '发布 10 个愿望', '', 'wish', 10, 'wishes_created', 200),
  ('愿望大师', '发布 50 个愿望', '✨', 'wish', 50, 'wishes_created', 500),
  ('受欢迎', '收到第一个回应', '💝', 'social', 1, 'responses_received', 100),
  ('人气之星', '收到 100 个回应', '', 'social', 100, 'responses_received', 500),
  ('社交达人', '拥有 10 个粉丝', '👥', 'social', 10, 'followers', 300),
  ('意见领袖', '拥有 100 个粉丝', '🎯', 'social', 100, 'followers', 1000),
  ('助人达人', '给 10 个愿望回应', '🤝', 'social', 10, 'responses_given', 200),
  ('坚持达人', '连续登录 7 天', '📅', 'milestone', 7, 'login_streak', 150),
  ('铁杆用户', '连续登录 30 天', '🏆', 'milestone', 30, 'login_streak', 500);

-- 创建触发器：当用户发布愿望时检查成就
create or replace function public.check_achievements_on_wish()
returns trigger as $$
declare
  wish_count integer;
begin
  -- 计算用户的愿望数量
  select count(*) into wish_count from public.wishes where user_id = new.user_id;
  
  -- 检查成就
  perform check_and_award_achievement(new.user_id, 'wishes_created', wish_count);
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_wish_created
  after insert on public.wishes
  for each row
  execute function public.check_achievements_on_wish();

-- 创建触发器：当用户收到回应时检查成就
create or replace function public.check_achievements_on_response()
returns trigger as $$
declare
  wish_owner_id uuid;
  response_count integer;
begin
  -- 获取愿望拥有者
  select user_id into wish_owner_id from public.wishes where id = new.wish_id;
  
  if wish_owner_id is not null then
    -- 计算愿望拥有者收到的回应总数
    select sum(response_count) into response_count 
    from public.wishes 
    where user_id = wish_owner_id;
    
    perform check_and_award_achievement(wish_owner_id, 'responses_received', response_count);
    
    -- 给回应者加分
    perform check_and_award_achievement(new.user_id, 'responses_given', 1);
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_response_created
  after insert on public.responses
  for each row
  execute function public.check_achievements_on_response();

-- 创建触发器：当有新关注时检查成就
create or replace function public.check_achievements_on_follow()
returns trigger as $$
declare
  follower_count integer;
begin
  -- 计算被关注者的粉丝数
  select count(*) into follower_count 
  from public.follows 
  where following_id = new.following_id;
  
  perform check_and_award_achievement(new.following_id, 'followers', follower_count);
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_follow_created
  after insert on public.follows
  for each row
  execute function public.check_achievements_on_follow();

-- 创建检查和授予成就的函数
create or replace function public.check_and_award_achievement(
  p_user_id uuid,
  p_requirement_type text,
  p_current_value integer
)
returns void as $$
declare
  v_achievement record;
  v_already_earned boolean;
begin
  -- 遍历所有符合要求的成就
  for v_achievement in
    select * from public.achievements
    where requirement_type = p_requirement_type
    and requirement <= p_current_value
  loop
    -- 检查用户是否已获得该成就
    select exists(
      select 1 from public.user_achievements
      where user_id = p_user_id
      and achievement_id = v_achievement.id
    ) into v_already_earned;
    
    -- 如果未获得，则授予
    if not v_already_earned then
      insert into public.user_achievements (user_id, achievement_id)
      values (p_user_id, v_achievement.id);
      
      -- 更新用户经验值
      perform update_user_xp(p_user_id, v_achievement.points);
    end if;
  end loop;
end;
$$ language plpgsql security definer;

-- 创建更新用户经验值的函数
create or replace function public.update_user_xp(
  p_user_id uuid,
  p_xp integer
)
returns void as $$
declare
  v_new_total_xp integer;
  v_new_level integer;
begin
  -- 获取或创建用户等级记录
  insert into public.user_levels (user_id, level, xp, total_xp)
  values (p_user_id, 1, 0, 0)
  on conflict (user_id) do nothing;
  
  -- 更新经验值
  update public.user_levels
  set 
    total_xp = total_xp + p_xp,
    xp = xp + p_xp,
    updated_at = now()
  where user_id = p_user_id;
  
  -- 获取新的总经验值
  select total_xp into v_new_total_xp
  from public.user_levels
  where user_id = p_user_id;
  
  -- 计算新等级 (每 500 XP 升一级)
  v_new_level := floor(v_new_total_xp / 500) + 1;
  
  -- 更新等级
  update public.user_levels
  set level = v_new_level
  where user_id = p_user_id;
end;
$$ language plpgsql security definer;

-- 创建索引
create index idx_user_achievements_user_id on public.user_achievements(user_id);
create index idx_user_achievements_achievement_id on public.user_achievements(achievement_id);
create index idx_user_levels_user_id on public.user_levels(user_id);
