-- ==============================================================================
-- CORREÇÃO DE SEGURANÇA (RLS) - ETERNOQR
-- Rode este script no SQL Editor do Supabase para corrigir as vulnerabilidades.
-- ==============================================================================

-- 1. MEMORIALS TABLE
-- Remove políticas antigas (inseguras)
drop policy if exists "Public memorials are viewable by everyone" on public.memorials;
drop policy if exists "Users can insert their own memorials" on public.memorials;
drop policy if exists "View Memorials" on public.memorials;
drop policy if exists "Insert Memorials" on public.memorials;
drop policy if exists "Update Memorials" on public.memorials;
drop policy if exists "Delete Memorials" on public.memorials;

-- Cria políticas seguras
-- Visualização: Público vê apenas se is_public = true. Dono vê tudo.
create policy "View Memorials"
  on public.memorials for select
  using ( (is_public = true) OR (auth.uid() = user_id) );

-- Inserção: Apenas usuários autenticados criando para si mesmos.
create policy "Insert Memorials"
  on public.memorials for insert
  with check ( auth.uid() = user_id );

-- Edição: Apenas o dono.
create policy "Update Memorials"
  on public.memorials for update
  using ( auth.uid() = user_id );

-- Exclusão: Apenas o dono.
create policy "Delete Memorials"
  on public.memorials for delete
  using ( auth.uid() = user_id );


-- 2. TIMELINE_EVENTS TABLE
-- Remove políticas antigas
drop policy if exists "Timeline viewable" on public.timeline_events;
drop policy if exists "Users can insert timeline" on public.timeline_events;
drop policy if exists "View Timeline" on public.timeline_events;
drop policy if exists "Insert Timeline" on public.timeline_events;
drop policy if exists "Modify Timeline" on public.timeline_events;

-- Visualização: Se o memorial pai for público OU se o usuário for o dono do memorial.
create policy "View Timeline"
  on public.timeline_events for select
  using (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_id
      and (m.is_public = true or m.user_id = auth.uid())
    )
  );

-- Inserção: Permite apenas se o usuário for DONO do memorial vinculado.
create policy "Insert Timeline"
  on public.timeline_events for insert
  with check (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_id
      and m.user_id = auth.uid()
    )
  );

-- Edição/Exclusão: Apenas o dono do memorial.
create policy "Modify Timeline"
  on public.timeline_events for all
  using (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_id
      and m.user_id = auth.uid()
    )
  );


-- 3. MEDIA_ITEMS TABLE
-- Remove políticas antigas
drop policy if exists "Media viewable" on public.media_items;
drop policy if exists "Users can insert media" on public.media_items;
drop policy if exists "View Media" on public.media_items;
drop policy if exists "Insert Media" on public.media_items;
drop policy if exists "Modify Media" on public.media_items;

-- Visualização: Mesmo critério da timeline.
create policy "View Media"
  on public.media_items for select
  using (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_id
      and (m.is_public = true or m.user_id = auth.uid())
    )
  );

-- Inserção: Apenas dono do memorial.
create policy "Insert Media"
  on public.media_items for insert
  with check (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_id
      and m.user_id = auth.uid()
    )
  );

-- Edição/Exclusão: Apenas dono.
create policy "Modify Media"
  on public.media_items for all
  using (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_id
      and m.user_id = auth.uid()
    )
  );


-- 4. STORAGE (ARQUIVOS)
-- Remove políticas antigas se necessário (ajuste o nome se for diferente no seu bucket)
drop policy if exists "Auth Upload" on storage.objects;
drop policy if exists "Secure Upload" on storage.objects;
drop policy if exists "Secure Modify Files" on storage.objects;
drop policy if exists "Secure Delete Files" on storage.objects;

-- Política de Upload Seguro:
create policy "Secure Upload"
on storage.objects for insert
with check (
  bucket_id = 'memorials' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política de Update/Delete Arquivos:
create policy "Secure Modify Files"
on storage.objects for update
using (
  bucket_id = 'memorials' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Secure Delete Files"
on storage.objects for delete
using (
  bucket_id = 'memorials' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ==============================================================================
-- 5. GESTÃO DE USUÁRIOS (PROFILES) - NOVO!
-- Cria uma tabela pública de perfis e sincroniza automaticamente com o Google Auth
-- ==============================================================================

-- Criar tabela de perfis (se não existir)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS em profiles
alter table public.profiles enable row level security;

-- Políticas de Profiles
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- FUNÇÃO TRIGGER:
-- Esta função será executada automaticamente pelo Supabase sempre que um novo usuário
-- for criado na tabela oculta auth.users (login do Google).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- DEFINIR O TRIGGER
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

