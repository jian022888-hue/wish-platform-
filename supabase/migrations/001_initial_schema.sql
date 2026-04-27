create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.wishes (
  id text primary key default 'wish-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 5),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  summary text default '',
  origin_label text,
  description text not null,
  why_important text not null,
  current_blocker text not null,
  desired_response_types text[] not null,
  category text not null default 'Life',
  status text not null default 'open',
  response_count integer default 0 not null,
  featured boolean default false not null,
  allow_anonymous boolean default false not null,
  allow_platform_support boolean default false not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.wishes enable row level security;

create policy "Wishes are viewable by everyone"
  on public.wishes for select
  using (true);

create policy "Users can insert their own wishes"
  on public.wishes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own wishes"
  on public.wishes for update
  using (auth.uid() = user_id);

create policy "Users can delete own wishes"
  on public.wishes for delete
  using (auth.uid() = user_id);

create table if not exists public.responses (
  id text primary key default 'resp-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 5),
  wish_id text references public.wishes(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  author_name text not null,
  is_anonymous boolean default false not null,
  type text not null,
  content text not null,
  created_at timestamp with time zone default now() not null
);

alter table public.responses enable row level security;

create policy "Responses are viewable by everyone"
  on public.responses for select
  using (true);

create policy "Users can insert their own responses"
  on public.responses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own responses"
  on public.responses for update
  using (auth.uid() = user_id);

create policy "Users can delete own responses"
  on public.responses for delete
  using (auth.uid() = user_id);

create function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_wishes_updated_at
  before update on public.wishes
  for each row execute procedure public.update_updated_at_column();

create function public.increment_response_count()
returns trigger as $$
begin
  update public.wishes
  set response_count = response_count + 1
  where id = new.wish_id;
  return new;
end;
$$ language plpgsql;

create trigger on_response_created
  after insert on public.responses
  for each row execute procedure public.increment_response_count();
