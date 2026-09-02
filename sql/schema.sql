-- =========================================================
-- Школьный портфолио-сайт: схема БД + RLS-политики
-- Выполнить этот файл целиком в Supabase → SQL Editor
-- =========================================================

-- ---------- 1. Расширения ----------
create extension if not exists "pgcrypto";

-- ---------- 2. Таблица профилей ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text not null default '',
  last_name text not null default '',
  class text not null default '',
  role text not null default 'student' check (role in ('student','teacher','admin')),
  created_at timestamptz not null default now()
);

-- ---------- 3. Таблица элементов портфолио ----------
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text default '',
  category text not null default 'project' check (category in ('project','achievement','certificate','creative')),
  item_date date,
  file_url text,
  external_link text,
  created_at timestamptz not null default now()
);

-- ---------- 4. Таблица событий ----------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  event_date timestamptz not null,
  location text default '',
  max_participants integer,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------- 5. Таблица записей на события ----------
create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  registered_at timestamptz not null default now(),
  unique (event_id, user_id)
);

-- ---------- 5b. Ограничение по max_participants (защита на уровне БД) ----------
create or replace function public.check_event_capacity()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  cap integer;
  taken integer;
begin
  select max_participants into cap from public.events where id = new.event_id;
  if cap is not null then
    select count(*) into taken from public.event_registrations where event_id = new.event_id;
    if taken >= cap then
      raise exception 'На это событие больше нет свободных мест';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_event_capacity on public.event_registrations;
create trigger trg_check_event_capacity
  before insert on public.event_registrations
  for each row execute procedure public.check_event_capacity();

-- ---------- 6. Индексы ----------
create index if not exists idx_portfolio_items_user on public.portfolio_items(user_id);
create index if not exists idx_events_created_by on public.events(created_by);
create index if not exists idx_event_registrations_event on public.event_registrations(event_id);
create index if not exists idx_event_registrations_user on public.event_registrations(user_id);

-- ---------- 7. Автосоздание профиля при регистрации ----------
-- Данные (имя, фамилия, класс) передаются через raw_user_meta_data при signUp()
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, class, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'class', ''),
    'student'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- 8. Вспомогательная функция: роль текущего пользователя ----------
-- security definer + фиксированный search_path нужны, чтобы функцию можно было
-- безопасно использовать внутри RLS-политик без рекурсии по RLS таблицы profiles
create or replace function public.current_role_is(target_role text)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = target_role
  );
$$;

create or replace function public.current_role_is_teacher_or_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('teacher','admin')
  );
$$;

-- ---------- 9. Включаем RLS ----------
alter table public.profiles enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;

-- ---------- 10. Политики: profiles ----------
-- Читать профили может любой аутентифицированный пользователь (нужно для
-- публичных страниц портфолио и списков в календаре/панели учителя).
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- Публичный (анонимный) доступ на чтение тоже нужен, чтобы страница
-- портфолио открывалась без входа в аккаунт.
create policy "profiles_select_anon"
  on public.profiles for select
  to anon
  using (true);

-- Пользователь может редактировать только своё имя/фамилию/класс,
-- но НЕ поле role (это форсируется отдельно триггером ниже).
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Запрещаем менять role всем, кроме admin, через триггер (defense in depth,
-- т.к. RLS policy сама по себе не может сравнить old.role vs new.role).
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if not public.current_role_is('admin') then
      raise exception 'Только администратор может менять роль пользователя';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_self_escalation on public.profiles;
create trigger trg_prevent_role_self_escalation
  before update on public.profiles
  for each row execute procedure public.prevent_role_self_escalation();

-- ---------- 11. Политики: portfolio_items ----------
-- Читать может кто угодно (в т.ч. анонимно) — портфолио публичное.
create policy "portfolio_select_anon"
  on public.portfolio_items for select
  to anon
  using (true);

create policy "portfolio_select_authenticated"
  on public.portfolio_items for select
  to authenticated
  using (true);

-- Создавать/редактировать/удалять может только владелец.
create policy "portfolio_insert_own"
  on public.portfolio_items for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "portfolio_update_own"
  on public.portfolio_items for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "portfolio_delete_own"
  on public.portfolio_items for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------- 12. Политики: events ----------
create policy "events_select_authenticated"
  on public.events for select
  to authenticated
  using (true);

-- Создавать события может только teacher/admin, и только от своего имени.
create policy "events_insert_teacher_admin"
  on public.events for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and public.current_role_is_teacher_or_admin()
  );

-- Редактировать/удалять — только автор события (или admin).
create policy "events_update_own_or_admin"
  on public.events for update
  to authenticated
  using (created_by = auth.uid() or public.current_role_is('admin'))
  with check (created_by = auth.uid() or public.current_role_is('admin'));

create policy "events_delete_own_or_admin"
  on public.events for delete
  to authenticated
  using (created_by = auth.uid() or public.current_role_is('admin'));

-- ---------- 13. Политики: event_registrations ----------
-- Ученик видит свои записи; учитель/админ видят все (нужно для списка "кто записался").
create policy "registrations_select_own_or_staff"
  on public.event_registrations for select
  to authenticated
  using (user_id = auth.uid() or public.current_role_is_teacher_or_admin());

-- Записаться на событие может только сам пользователь.
create policy "registrations_insert_own"
  on public.event_registrations for insert
  to authenticated
  with check (user_id = auth.uid());

-- Отменить запись может только сам пользователь (или admin).
create policy "registrations_delete_own_or_admin"
  on public.event_registrations for delete
  to authenticated
  using (user_id = auth.uid() or public.current_role_is('admin'));

-- ---------- 14. Storage: бакет для файлов портфолио ----------
insert into storage.buckets (id, name, public)
values ('portfolio-files', 'portfolio-files', true)
on conflict (id) do nothing;

-- Читать файлы может кто угодно (бакет публичный, нужно для публичных страниц).
create policy "portfolio_files_read_all"
  on storage.objects for select
  to public
  using (bucket_id = 'portfolio-files');

-- Загружать файлы может только сам пользователь, в свою собственную папку
-- (ожидаем путь вида: <user_id>/имя_файла.ext)
create policy "portfolio_files_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'portfolio-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "portfolio_files_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'portfolio-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =========================================================
-- Готово. После выполнения:
-- 1) В Authentication → Providers включён Email (по умолчанию включён).
-- 2) Чтобы назначить себя первым admin, выполните вручную (замените email):
--    update public.profiles set role = 'admin' where email = 'ваш-email@example.com';
-- =========================================================
