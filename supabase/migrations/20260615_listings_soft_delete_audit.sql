-- ============================================================
-- Soft delete + auditoria de anúncios
-- ============================================================

-- 1. Adicionar 'deleted' ao check de status
-- Precisa dropar o constraint antigo (nomeado pelo Postgres) e recriar.
ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS listings_status_check;

ALTER TABLE public.listings
  ADD CONSTRAINT listings_status_check
  CHECK (status IN ('active', 'sold', 'archived', 'deleted'));

-- 2. Atualizar constraint de consistência sold_at para incluir 'deleted'
ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS listings_sold_at_consistency_check;

ALTER TABLE public.listings
  ADD CONSTRAINT listings_sold_at_consistency_check CHECK (
    (status = 'sold'  AND sold_at IS NOT NULL)
    OR
    (status IN ('active', 'archived', 'deleted') AND sold_at IS NULL)
  );

-- 3. Colunas de auditoria
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS deleted_at  timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by  uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at  timestamptz,
  ADD COLUMN IF NOT EXISTS updated_by  uuid REFERENCES auth.users (id) ON DELETE SET NULL;

-- 4. Index para facilitar queries de anúncios excluídos no admin
CREATE INDEX IF NOT EXISTS listings_deleted_at_idx ON public.listings (deleted_at)
  WHERE deleted_at IS NOT NULL;

-- 5. Garantir que exclusão lógica por moradores seja coberta pela política de UPDATE
-- A policy "Owner update own listings" já permite que o morador faça UPDATE
-- nos próprios anúncios, incluindo a mudança para status = 'deleted'.
-- Nenhuma alteração de RLS necessária para isso.

-- 6. Manter a política de DELETE existente para uso exclusivo do admin via painel SQL.
-- Moradores não usarão mais DELETE — apenas UPDATE status='deleted'.
