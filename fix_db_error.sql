-- =================================================================
-- CORREÇÃO DO ERRO DE BANCO DE DADOS
-- Rode este script no SQL Editor do Supabase
-- =================================================================

-- O erro "violates check constraint memorials_status_check" indica que existe uma
-- regra no banco de dados impedindo a inserção do valor 'false' na coluna status.

-- 1. Remover a restrição problemática
ALTER TABLE public.memorials DROP CONSTRAINT IF EXISTS memorials_status_check;

-- 2. Garantir que a coluna status existe e é do tipo BOOLEAN
-- Adiciona se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memorials' AND column_name = 'status') THEN
        ALTER TABLE public.memorials ADD COLUMN status BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 3. Definir o valor padrão como false (Pendente)
ALTER TABLE public.memorials ALTER COLUMN status SET DEFAULT false;

-- 4. Atualizar registros existentes nulos para false
UPDATE public.memorials SET status = false WHERE status IS NULL;
