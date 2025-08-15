
-- Adicionar colunas de onboarding na tabela users
ALTER TABLE IF EXISTS public.users
ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_data jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS onboarding_updated_at timestamp with time zone DEFAULT now();

-- Comentários para documentar o propósito das colunas
COMMENT ON COLUMN public.users.onboarding_step IS 'Etapa atual do processo de onboarding (0-8)';
COMMENT ON COLUMN public.users.onboarding_data IS 'Dados salvos do progresso do onboarding';
COMMENT ON COLUMN public.users.onboarding_updated_at IS 'Data da última atualização do onboarding';
