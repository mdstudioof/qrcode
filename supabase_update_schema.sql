-- ==============================================================================
-- ATUALIZAÇÃO DE ESQUEMA - PERSISTÊNCIA E EXCLUSÃO
-- Execute este script no SQL Editor do Supabase
-- ==============================================================================

-- 1. Adicionar coluna de capa na tabela de perfis (se não existir)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_url text;

-- 2. Configurar EXCLUSÃO EM CASCATA (Cascading Deletes)
-- Isso garante que ao apagar um Memorial, todos os eventos e mídias sumam juntos.

-- Timeline: Remove a chave estrangeira antiga e recria com ON DELETE CASCADE
ALTER TABLE public.timeline_events DROP CONSTRAINT IF EXISTS timeline_events_memorial_id_fkey;
ALTER TABLE public.timeline_events 
  ADD CONSTRAINT timeline_events_memorial_id_fkey 
  FOREIGN KEY (memorial_id) REFERENCES public.memorials(id) ON DELETE CASCADE;

-- Media Items: Remove a chave estrangeira antiga e recria com ON DELETE CASCADE
ALTER TABLE public.media_items DROP CONSTRAINT IF EXISTS media_items_memorial_id_fkey;
ALTER TABLE public.media_items 
  ADD CONSTRAINT media_items_memorial_id_fkey 
  FOREIGN KEY (memorial_id) REFERENCES public.memorials(id) ON DELETE CASCADE;

-- Memorials: Garante que se o USUÁRIO for deletado, os memoriais sumam
ALTER TABLE public.memorials DROP CONSTRAINT IF EXISTS memorials_user_id_fkey;
ALTER TABLE public.memorials 
  ADD CONSTRAINT memorials_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Profiles: Garante que se o USUÁRIO for deletado, o perfil suma
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- 3. Função para AUTO-EXCLUSÃO de conta
-- Permite que o usuário delete sua própria conta da tabela de autenticação
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void AS $$
BEGIN
  -- Apenas apaga o usuário atual. Devido ao CASCADE configurado acima,
  -- isso apagará automaticamente: Perfil, Memoriais, Timeline e Mídias.
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Permissões de Atualização de Perfil (Garantia)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

SELECT 'Banco de dados atualizado com sucesso!' as resultado;