-- =========================================================
-- Миграция №3: раздел «Новости и объявления»
-- Выполнить ЦЕЛИКОМ в Supabase → SQL Editor.
-- =========================================================

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_announcements_created_at on public.announcements(created_at desc);

alter table public.announcements enable row level security;

-- Читать могут только вошедшие пользователи (не публично) — это внутренние
-- школьные новости, а не то, что должно быть доступно кому угодно по ссылке.
drop policy if exists "announcements_select_authenticated" on public.announcements;
create policy "announcements_select_authenticated"
  on public.announcements for select
  to authenticated using (true);

-- Публиковать может только учитель/админ, и только от своего имени.
drop policy if exists "announcements_insert_teacher_admin" on public.announcements;
create policy "announcements_insert_teacher_admin"
  on public.announcements for insert
  to authenticated
  with check (created_by = auth.uid() and public.current_role_is_teacher_or_admin());

drop policy if exists "announcements_update_own_or_admin" on public.announcements;
create policy "announcements_update_own_or_admin"
  on public.announcements for update
  to authenticated
  using (created_by = auth.uid() or public.current_role_is('admin'))
  with check (created_by = auth.uid() or public.current_role_is('admin'));

drop policy if exists "announcements_delete_own_or_admin" on public.announcements;
create policy "announcements_delete_own_or_admin"
  on public.announcements for delete
  to authenticated
  using (created_by = auth.uid() or public.current_role_is('admin'));

-- =========================================================
-- Готово.
-- =========================================================
