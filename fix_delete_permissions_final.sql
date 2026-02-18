-- ==============================================================================
-- CORREÇÃO DEFINITIVA DE EXCLUSÃO (MEGA FIX)
-- Execute este script para desbloquear a exclusão de Conta e Memoriais
-- ==============================================================================

BEGIN;

-- 1. CORRIGIR RELAÇÃO: TIMELINE -> MEMORIAL
-- Remove qualquer FK existente e recria com CASCADE
DO $$ 
DECLARE r RECORD; 
BEGIN
  FOR r IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'timeline_events' AND constraint_type = 'FOREIGN KEY') LOOP
    EXECUTE 'ALTER TABLE public.timeline_events DROP CONSTRAINT ' || quote_ident(r.constraint_name);
  END LOOP;
END $$;
ALTER TABLE public.timeline_events ADD CONSTRAINT timeline_events_memorial_id_fkey FOREIGN KEY (memorial_id) REFERENCES public.memorials(id) ON DELETE CASCADE;


-- 2. CORRIGIR RELAÇÃO: MEDIA ITEMS -> MEMORIAL
-- Remove qualquer FK existente e recria com CASCADE
DO $$ 
DECLARE r RECORD; 
BEGIN
  FOR r IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'media_items' AND constraint_type = 'FOREIGN KEY') LOOP
    EXECUTE 'ALTER TABLE public.media_items DROP CONSTRAINT ' || quote_ident(r.constraint_name);
  END LOOP;
END $$;
ALTER TABLE public.media_items ADD CONSTRAINT media_items_memorial_id_fkey FOREIGN KEY (memorial_id) REFERENCES public.memorials(id) ON DELETE CASCADE;


-- 3. CORRIGIR RELAÇÃO: MEMORIAL -> USUÁRIO (CRÍTICO PARA APAGAR CONTA)
-- Se isso não for CASCADE, apagar a conta falha porque existem memoriais vinculados.
DO $$ 
DECLARE r RECORD; 
BEGIN
  FOR r IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'memorials' AND constraint_type = 'FOREIGN KEY' AND table_schema = 'public') LOOP
    -- Precisamos garantir que estamos apagando a FK que aponta para auth.users
    -- Como é difícil filtrar por target no information_schema simples, vamos dropar todas as FKs de memoriais e recriar.
    EXECUTE 'ALTER TABLE public.memorials DROP CONSTRAINT ' || quote_ident(r.constraint_name);
  END LOOP;
END $$;
ALTER TABLE public.memorials ADD CONSTRAINT memorials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- 4. CORRIGIR RELAÇÃO: PERFIL -> USUÁRIO
DO $$ 
DECLARE r RECORD; 
BEGIN
  FOR r IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'profiles' AND constraint_type = 'FOREIGN KEY') LOOP
    EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT ' || quote_ident(r.constraint_name);
  END LOOP;
END $$;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- 5. REFORÇAR A FUNÇÃO DE EXCLUSÃO DE CONTA
DROP FUNCTION IF EXISTS public.delete_own_account();

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void AS $$
BEGIN
  -- Apaga o usuário da tabela de autenticação.
  -- Graças aos CASCADEs acima, o banco apagará automaticamente: Perfil, Memoriais, Mídias e Timeline.
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir permissão de execução
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO service_role;


-- 6. GARANTIR POLÍTICAS RLS DE EXCLUSÃO
DROP POLICY IF EXISTS "Delete Memorials" ON public.memorials;
CREATE POLICY "Delete Memorials" ON public.memorials FOR DELETE
USING ( auth.uid() = user_id OR (auth.jwt() ->> 'email' = 'admin@eternize.com.br') );

COMMIT;

SELECT 'Tudo corrigido! Agora o banco permitirá as exclusões.' as status;