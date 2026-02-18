-- ==============================================================================
-- CORREÇÃO DE EXCLUSÃO (DELETE CASCADE)
-- Execute este script para consertar o botão de lixeira
-- ==============================================================================

-- 1. TIMELINE EVENTS: Recriar vínculo com CASCADE
-- Primeiro removemos a chave estrangeira antiga (seja qual for o nome)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'timeline_events' AND constraint_type = 'FOREIGN KEY') LOOP
        EXECUTE 'ALTER TABLE public.timeline_events DROP CONSTRAINT ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- Agora adicionamos a correta
ALTER TABLE public.timeline_events 
ADD CONSTRAINT timeline_events_memorial_id_fkey 
FOREIGN KEY (memorial_id) REFERENCES public.memorials(id) ON DELETE CASCADE;


-- 2. MEDIA ITEMS (FOTOS/VIDEOS): Recriar vínculo com CASCADE
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'media_items' AND constraint_type = 'FOREIGN KEY') LOOP
        EXECUTE 'ALTER TABLE public.media_items DROP CONSTRAINT ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

ALTER TABLE public.media_items 
ADD CONSTRAINT media_items_memorial_id_fkey 
FOREIGN KEY (memorial_id) REFERENCES public.memorials(id) ON DELETE CASCADE;


-- 3. GARANTIR PERMISSÃO DE DELETE (RLS)
-- Removemos a política antiga para garantir
DROP POLICY IF EXISTS "Delete Memorials" ON public.memorials;

-- Criamos a política que permite o dono (ou admin) apagar
CREATE POLICY "Delete Memorials"
ON public.memorials FOR DELETE
USING (
  (auth.uid() = user_id)
  OR (auth.jwt() ->> 'email' = 'admin@eternize.com.br')
);


SELECT 'Sucesso! Agora ao apagar um memorial, todos os itens vinculados serão apagados juntos.' as resultado;