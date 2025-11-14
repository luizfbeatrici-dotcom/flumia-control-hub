-- Adicionar colunas de tracking de engajamento à tabela landing_page_visitors
ALTER TABLE landing_page_visitors
ADD COLUMN IF NOT EXISTS session_duration integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS session_events jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS scroll_depth integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS sections_viewed jsonb DEFAULT '[]'::jsonb;

-- Comentários para documentação
COMMENT ON COLUMN landing_page_visitors.session_duration IS 'Tempo total da sessão em segundos';
COMMENT ON COLUMN landing_page_visitors.session_events IS 'Array de eventos de interação (cliques, navegação, etc)';
COMMENT ON COLUMN landing_page_visitors.scroll_depth IS 'Porcentagem máxima de scroll na página (0-100)';
COMMENT ON COLUMN landing_page_visitors.sections_viewed IS 'Seções visualizadas e tempo em cada uma';