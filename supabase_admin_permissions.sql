-- ==============================================================================
-- CORREÇÃO DE TIPOS E PERMISSÕES DE ADMINISTRAÇÃO - VERSÃO FINAL (ROBUSTA)
-- Execute este script COMPLETO no SQL Editor do Supabase.
-- ==============================================================================

-- 1. REMOVER TODAS AS POLÍTICAS POSSÍVEIS (LIMPEZA TOTAL)
-- Removemos pelo nome todas as variações comuns para garantir que não sobre nada
-- travando a alteração das colunas.

-- Memorials
DROP POLICY IF EXISTS "View Memorials" ON public.memorials;
DROP POLICY IF EXISTS "Insert Memorials" ON public.memorials;
DROP POLICY IF EXISTS "Update Memorials" ON public.memorials;
DROP POLICY IF EXISTS "Delete Memorials" ON public.memorials;
DROP POLICY IF EXISTS "Public memorials are viewable by everyone" ON public.memorials;
DROP POLICY IF EXISTS "Users can insert their own memorials" ON public.memorials;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.memorials;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.memorials;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.memorials;

-- Timeline (Aqui estava o erro: "Timeline viewable if memorial accessible")
DROP POLICY IF EXISTS "View Timeline" ON public.timeline_events;
DROP POLICY IF EXISTS "Insert Timeline" ON public.timeline_events;
DROP POLICY IF EXISTS "Modify Timeline" ON public.timeline_events;
DROP POLICY IF EXISTS "Timeline viewable" ON public.timeline_events;
DROP POLICY IF EXISTS "Timeline viewable if memorial accessible" ON public.timeline_events; -- O CULPADO DO ERRO
DROP POLICY IF EXISTS "Enable read access for all users" ON public.timeline_events;

-- Media Items
DROP POLICY IF EXISTS "View Media" ON public.media_items;
DROP POLICY IF EXISTS "Insert Media" ON public.media_items;
DROP POLICY IF EXISTS "Modify Media" ON public.media_items;
DROP POLICY IF EXISTS "Media viewable" ON public.media_items;
DROP POLICY IF EXISTS "Media viewable if memorial accessible" ON public.media_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.media_items;


-- 2. CORREÇÃO DE ESQUEMA (Converter colunas para BOOLEAN)

-- Remover constraints antigas de status se existirem
ALTER TABLE public.memorials DROP CONSTRAINT IF EXISTS memorials_status_check;

-- Garante que is_public é boolean
ALTER TABLE public.memorials 
ALTER COLUMN is_public TYPE boolean 
USING CASE 
    WHEN is_public::text = 'true' THEN true 
    WHEN is_public::text = 'false' THEN false 
    ELSE COALESCE(is_public::boolean, false)
END;

-- Garante que status é boolean
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memorials' AND column_name = 'status') THEN
        ALTER TABLE public.memorials ADD COLUMN status BOOLEAN DEFAULT false;
    ELSE
        ALTER TABLE public.memorials 
        ALTER COLUMN status TYPE boolean 
        USING CASE 
            WHEN status::text = 'true' THEN true 
            WHEN status::text = 'false' THEN false 
            ELSE false 
        END;
    END IF;
END $$;

-- Define valor padrão e remove nulos
ALTER TABLE public.memorials ALTER COLUMN status SET DEFAULT false;
UPDATE public.memorials SET status = false WHERE status IS NULL;


-- 3. REAPLICAR PERMISSÕES COM ACESSO DE ADMIN (admin@eternize.com.br)

-- MEMORIALS
CREATE POLICY "View Memorials"
  ON public.memorials FOR SELECT
  USING (
    (is_public = true AND status = true)                         -- Público e Aprovado
    OR (auth.uid() = user_id)                                    -- Dono (vê tudo dele)
    OR (auth.jwt() ->> 'email' = 'admin@eternize.com.br')        -- Admin (vê tudo)
  );

CREATE POLICY "Insert Memorials"
  ON public.memorials FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Update Memorials"
  ON public.memorials FOR UPDATE
  USING (
    (auth.uid() = user_id)
    OR (auth.jwt() ->> 'email' = 'admin@eternize.com.br')        -- Admin pode editar (aprovar/reprovar)
  );

CREATE POLICY "Delete Memorials"
  ON public.memorials FOR DELETE
  USING (
    (auth.uid() = user_id)
    OR (auth.jwt() ->> 'email' = 'admin@eternize.com.br')        -- Admin pode deletar
  );

-- TIMELINE
CREATE POLICY "View Timeline"
  ON public.timeline_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memorials m
      WHERE m.id = memorial_id
      AND (
        (m.is_public = true AND m.status = true)
        OR m.user_id = auth.uid()
        OR (auth.jwt() ->> 'email' = 'admin@eternize.com.br')
      )
    )
  );

CREATE POLICY "Insert Timeline"
  ON public.timeline_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memorials m
      WHERE m.id = memorial_id
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Modify Timeline"
  ON public.timeline_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.memorials m
      WHERE m.id = memorial_id
      AND (
          m.user_id = auth.uid()
          OR (auth.jwt() ->> 'email' = 'admin@eternize.com.br')
      )
    )
  );

-- MEDIA ITEMS
CREATE POLICY "View Media"
  ON public.media_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memorials m
      WHERE m.id = memorial_id
      AND (
        (m.is_public = true AND m.status = true)
        OR m.user_id = auth.uid()
        OR (auth.jwt() ->> 'email' = 'admin@eternize.com.br')
      )
    )
  );

CREATE POLICY "Insert Media"
  ON public.media_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memorials m
      WHERE m.id = memorial_id
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Modify Media"
  ON public.media_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.memorials m
      WHERE m.id = memorial_id
      AND (
          m.user_id = auth.uid()
          OR (auth.jwt() ->> 'email' = 'admin@eternize.com.br')
      )
    )
  );

SELECT 'Sucesso! Tipos corrigidos e permissões de Admin aplicadas.' as resultado;