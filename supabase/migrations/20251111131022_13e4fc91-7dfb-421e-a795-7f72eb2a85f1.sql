-- Adicionar campos para configurar a assistente virtual e mensagem inicial do WhatsApp
ALTER TABLE public.system_settings
ADD COLUMN IF NOT EXISTS nome_assistente TEXT DEFAULT 'Assistente Flumia',
ADD COLUMN IF NOT EXISTS mensagem_inicial TEXT DEFAULT 'Olá! Como posso ajudar você hoje?';