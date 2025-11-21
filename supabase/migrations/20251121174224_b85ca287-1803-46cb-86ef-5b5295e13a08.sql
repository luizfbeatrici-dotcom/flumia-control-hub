-- Função para criar notificações quando a etapa de um contato muda
CREATE OR REPLACE FUNCTION public.criar_notificacao_mudanca_etapa()
RETURNS TRIGGER AS $$
DECLARE
  v_notification_setting RECORD;
  v_pedido_id UUID;
  v_pessoa_nome TEXT;
  v_pedido_numero INTEGER;
BEGIN
  -- Apenas processar se a etapa mudou
  IF OLD.etapa_id IS DISTINCT FROM NEW.etapa_id THEN
    -- Buscar configuração de notificação para a nova etapa
    SELECT * INTO v_notification_setting
    FROM notification_settings
    WHERE etapa_id = NEW.etapa_id
      AND ativo = true
    LIMIT 1;
    
    -- Se existe configuração ativa para essa etapa
    IF FOUND THEN
      -- Buscar o pedido mais recente do contato
      SELECT p.id, p.numero, pe.nome INTO v_pedido_id, v_pedido_numero, v_pessoa_nome
      FROM pedidos p
      LEFT JOIN pessoas pe ON pe.id = p.pessoa_id
      WHERE p.contato_id = NEW.id
      ORDER BY p.created_at DESC
      LIMIT 1;
      
      -- Criar a notificação
      INSERT INTO notifications (
        empresa_id,
        tipo,
        titulo,
        mensagem,
        pedido_id,
        contato_id,
        link,
        lida
      ) VALUES (
        NEW.empresa_id,
        v_notification_setting.tipo,
        v_notification_setting.titulo,
        CASE 
          WHEN v_pedido_numero IS NOT NULL THEN
            format('%s - Pedido #%s de %s', 
              v_notification_setting.descricao, 
              v_pedido_numero,
              COALESCE(v_pessoa_nome, NEW.name, 'Cliente')
            )
          ELSE
            format('%s - Contato %s', 
              v_notification_setting.descricao,
              COALESCE(NEW.name, 'sem nome')
            )
        END,
        v_pedido_id,
        NEW.id,
        CASE 
          WHEN v_pedido_id IS NOT NULL THEN '/pedidos'
          ELSE NULL
        END,
        false
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger para mudança de etapa
DROP TRIGGER IF EXISTS trigger_criar_notificacao_mudanca_etapa ON contatos;
CREATE TRIGGER trigger_criar_notificacao_mudanca_etapa
  AFTER UPDATE OF etapa_id ON contatos
  FOR EACH ROW
  EXECUTE FUNCTION criar_notificacao_mudanca_etapa();

-- Comentários
COMMENT ON FUNCTION public.criar_notificacao_mudanca_etapa() IS 'Cria notificações automaticamente quando a etapa de um contato muda';
COMMENT ON TRIGGER trigger_criar_notificacao_mudanca_etapa ON contatos IS 'Dispara a criação de notificações quando a etapa de um contato é alterada';