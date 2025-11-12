-- Adicionar comentários para documentar corretamente os campos de mensagens
COMMENT ON COLUMN public.mensagens.message_body IS 'Conteúdo da mensagem - deve armazenar wpp.Mensagem (texto puro), não wpp.Body';
COMMENT ON COLUMN public.mensagens.wamid IS 'ID da mensagem do WhatsApp - armazena wpp.Id';
COMMENT ON COLUMN public.mensagens.message_type IS 'Tipo da mensagem - armazena wpp.TipoMessagem (text, image, audio, interactive, etc)';
COMMENT ON COLUMN public.mensagens.payload IS 'Payload completo da mensagem em JSON - armazena todo o objeto wpp original';