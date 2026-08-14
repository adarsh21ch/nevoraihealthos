-- Schema Reconciliation Migration
-- This migration documents the current state of the database schema 
-- specifically focusing on the transition from 'tenants' to 'distributors' 
-- and ensuring all tables and columns are tracked.

-- 1. Ensure 'distributors' exists (it does, but this ensures migration history tracks it)
CREATE TABLE IF NOT EXISTS public.distributors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    name text NOT NULL,
    phone text,
    whatsapp_number text,
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Ensure 'customers' has 'distributor_id' and not 'tenant_id'
-- This was already handled by previous untracked actions but we track it here for history
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='distributor_id') THEN
        ALTER TABLE public.customers ADD COLUMN distributor_id uuid REFERENCES public.distributors(id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='tenant_id') THEN
        ALTER TABLE public.customers DROP COLUMN tenant_id;
    END IF;
END $$;

-- 3. Mark the end of the multi-tenant 'tenants' table era in favor of 'distributors'
-- Any remaining references to 'tenants' table in other tables should be updated to 'distributors' if they haven't been.
-- For now, this acts as the "Source of Truth" mark.

COMMENT ON TABLE public.distributors IS 'Primary entity for health coach / distributor organization, replacing the old tenants concept.';
