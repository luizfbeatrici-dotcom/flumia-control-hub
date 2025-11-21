export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      api_tokens: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          empresa_id: string
          id: string
          token: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          empresa_id: string
          id?: string
          token: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          empresa_id?: string
          id?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_tokens_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      aplicativos: {
        Row: {
          ativo: boolean | null
          business_id: string | null
          contato: string | null
          created_at: string | null
          empresa_id: string
          id: string
          meta_id: string | null
          nome: string
          token: string | null
          updated_at: string | null
          versao_api: string
          whatsapp_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          business_id?: string | null
          contato?: string | null
          created_at?: string | null
          empresa_id: string
          id?: string
          meta_id?: string | null
          nome: string
          token?: string | null
          updated_at?: string | null
          versao_api?: string
          whatsapp_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          business_id?: string | null
          contato?: string | null
          created_at?: string | null
          empresa_id?: string
          id?: string
          meta_id?: string | null
          nome?: string
          token?: string | null
          updated_at?: string | null
          versao_api?: string
          whatsapp_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aplicativos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      caracteristicas: {
        Row: {
          ativo: boolean
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          ordem: number
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      cidades: {
        Row: {
          cidade: string
          created_at: string | null
          ibge: string | null
          id: string
        }
        Insert: {
          cidade: string
          created_at?: string | null
          ibge?: string | null
          id?: string
        }
        Update: {
          cidade?: string
          created_at?: string | null
          ibge?: string | null
          id?: string
        }
        Relationships: []
      }
      contato_sub_etapa_respostas: {
        Row: {
          completada: boolean
          contato_id: string
          created_at: string
          dados: Json
          empresa_id: string
          etapa_id: string | null
          id: string
          processado: boolean
          sub_etapa_id: string
          updated_at: string
        }
        Insert: {
          completada?: boolean
          contato_id: string
          created_at?: string
          dados?: Json
          empresa_id: string
          etapa_id?: string | null
          id?: string
          processado?: boolean
          sub_etapa_id: string
          updated_at?: string
        }
        Update: {
          completada?: boolean
          contato_id?: string
          created_at?: string
          dados?: Json
          empresa_id?: string
          etapa_id?: string | null
          id?: string
          processado?: boolean
          sub_etapa_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contato_sub_etapa_respostas_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contato_sub_etapa_respostas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contato_sub_etapa_respostas_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contato_sub_etapa_respostas_sub_etapa_id_fkey"
            columns: ["sub_etapa_id"]
            isOneToOne: false
            referencedRelation: "sub_etapas"
            referencedColumns: ["id"]
          },
        ]
      }
      contatos: {
        Row: {
          aplicativo_id: string | null
          created_at: string
          empresa_id: string
          etapa_id: string
          etapa_old_id: string | null
          id: string
          menu: number | null
          name: string | null
          pessoa_id: string | null
          status: string | null
          ultima_interacao: string | null
          updated_at: string
          wa_id: string
          whatsapp_from: string
        }
        Insert: {
          aplicativo_id?: string | null
          created_at?: string
          empresa_id: string
          etapa_id: string
          etapa_old_id?: string | null
          id?: string
          menu?: number | null
          name?: string | null
          pessoa_id?: string | null
          status?: string | null
          ultima_interacao?: string | null
          updated_at?: string
          wa_id: string
          whatsapp_from: string
        }
        Update: {
          aplicativo_id?: string | null
          created_at?: string
          empresa_id?: string
          etapa_id?: string
          etapa_old_id?: string | null
          id?: string
          menu?: number | null
          name?: string | null
          pessoa_id?: string | null
          status?: string | null
          ultima_interacao?: string | null
          updated_at?: string
          wa_id?: string
          whatsapp_from?: string
        }
        Relationships: [
          {
            foreignKeyName: "contatos_aplicativo_id_fkey"
            columns: ["aplicativo_id"]
            isOneToOne: false
            referencedRelation: "aplicativos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contatos_etapa_fk"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contatos_etapa_old_fk"
            columns: ["etapa_old_id"]
            isOneToOne: false
            referencedRelation: "etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contatos_pessoa_fk"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      depoimentos: {
        Row: {
          ativo: boolean
          autor: string
          conteudo: string
          created_at: string | null
          empresa_nome: string
          id: string
          ordem: number
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean
          autor: string
          conteudo: string
          created_at?: string | null
          empresa_nome: string
          id?: string
          ordem?: number
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean
          autor?: string
          conteudo?: string
          created_at?: string | null
          empresa_nome?: string
          id?: string
          ordem?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      empresa_config: {
        Row: {
          created_at: string | null
          empresa_id: string
          id: string
          mensagem_inicial: string | null
          mensagem_nao_cliente: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          empresa_id: string
          id?: string
          mensagem_inicial?: string | null
          mensagem_nao_cliente?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          empresa_id?: string
          id?: string
          mensagem_inicial?: string | null
          mensagem_nao_cliente?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empresa_config_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: true
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresa_tipos_entrega: {
        Row: {
          ativo: boolean
          created_at: string | null
          empresa_id: string
          id: string
          observacao: string | null
          prazo_estimado: string | null
          tipo_entrega_id: string
          updated_at: string | null
          valor_frete: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          empresa_id: string
          id?: string
          observacao?: string | null
          prazo_estimado?: string | null
          tipo_entrega_id: string
          updated_at?: string | null
          valor_frete?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          empresa_id?: string
          id?: string
          observacao?: string | null
          prazo_estimado?: string | null
          tipo_entrega_id?: string
          updated_at?: string | null
          valor_frete?: number
        }
        Relationships: [
          {
            foreignKeyName: "empresa_tipos_entrega_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empresa_tipos_entrega_tipo_entrega_id_fkey"
            columns: ["tipo_entrega_id"]
            isOneToOne: false
            referencedRelation: "tipos_entrega"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          ativo: boolean | null
          celular: string | null
          cidade: string | null
          cnpj: string
          created_at: string | null
          dominio: string | null
          endereco: string | null
          fantasia: string
          id: string
          plano_id: string | null
          razao_social: string
          taxa_transacao: number | null
          updated_at: string | null
          valor_mensal: number | null
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean | null
          celular?: string | null
          cidade?: string | null
          cnpj: string
          created_at?: string | null
          dominio?: string | null
          endereco?: string | null
          fantasia: string
          id?: string
          plano_id?: string | null
          razao_social: string
          taxa_transacao?: number | null
          updated_at?: string | null
          valor_mensal?: number | null
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean | null
          celular?: string | null
          cidade?: string | null
          cnpj?: string
          created_at?: string | null
          dominio?: string | null
          endereco?: string | null
          fantasia?: string
          id?: string
          plano_id?: string | null
          razao_social?: string
          taxa_transacao?: number | null
          updated_at?: string | null
          valor_mensal?: number | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empresas_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque: {
        Row: {
          created_at: string | null
          empresa_id: string
          id: string
          produto_id: string
          saldo: number
          saldo_maximo: number | null
          saldo_minimo: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          empresa_id: string
          id?: string
          produto_id: string
          saldo?: number
          saldo_maximo?: number | null
          saldo_minimo?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          empresa_id?: string
          id?: string
          produto_id?: string
          saldo?: number
          saldo_maximo?: number | null
          saldo_minimo?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_estoque_produto"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      etapas: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          ordem: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          ativo: boolean
          created_at: string | null
          id: string
          ordem: number
          pergunta: string
          resposta: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          id?: string
          ordem?: number
          pergunta: string
          resposta: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          id?: string
          ordem?: number
          pergunta?: string
          resposta?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      jornadas: {
        Row: {
          acao: string
          created_at: string | null
          descricao: string | null
          empresa_id: string
          id: string
          metadata: Json | null
        }
        Insert: {
          acao: string
          created_at?: string | null
          descricao?: string | null
          empresa_id: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          acao?: string
          created_at?: string | null
          descricao?: string | null
          empresa_id?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "jornadas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_page_visitors: {
        Row: {
          cookie_consent: boolean | null
          created_at: string
          email: string | null
          first_visit: string
          id: string
          interesse: string | null
          ip_address: string | null
          last_visit: string
          nome: string | null
          page_views: number | null
          referrer: string | null
          scroll_depth: number | null
          sections_viewed: Json | null
          session_duration: number | null
          session_events: Json | null
          session_id: string
          telefone: string | null
          updated_at: string
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          cookie_consent?: boolean | null
          created_at?: string
          email?: string | null
          first_visit?: string
          id?: string
          interesse?: string | null
          ip_address?: string | null
          last_visit?: string
          nome?: string | null
          page_views?: number | null
          referrer?: string | null
          scroll_depth?: number | null
          sections_viewed?: Json | null
          session_duration?: number | null
          session_events?: Json | null
          session_id: string
          telefone?: string | null
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          cookie_consent?: boolean | null
          created_at?: string
          email?: string | null
          first_visit?: string
          id?: string
          interesse?: string | null
          ip_address?: string | null
          last_visit?: string
          nome?: string | null
          page_views?: number | null
          referrer?: string | null
          scroll_depth?: number | null
          sections_viewed?: Json | null
          session_duration?: number | null
          session_events?: Json | null
          session_id?: string
          telefone?: string | null
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      mensagens: {
        Row: {
          aplicativo_id: string | null
          audio_data: Json | null
          contato_id: string
          created_at: string
          empresa_id: string
          id: string
          image_data: Json | null
          interactive_data: Json | null
          message_body: string | null
          message_type: string
          payload: Json
          wamid: string | null
        }
        Insert: {
          aplicativo_id?: string | null
          audio_data?: Json | null
          contato_id: string
          created_at?: string
          empresa_id: string
          id?: string
          image_data?: Json | null
          interactive_data?: Json | null
          message_body?: string | null
          message_type: string
          payload?: Json
          wamid?: string | null
        }
        Update: {
          aplicativo_id?: string | null
          audio_data?: Json | null
          contato_id?: string
          created_at?: string
          empresa_id?: string
          id?: string
          image_data?: Json | null
          interactive_data?: Json | null
          message_body?: string | null
          message_type?: string
          payload?: Json
          wamid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_mensagens_contato"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_aplicativo_id_fkey"
            columns: ["aplicativo_id"]
            isOneToOne: false
            referencedRelation: "aplicativos"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens_enviadas: {
        Row: {
          aplicativo_id: string | null
          audio_data: Json | null
          contato_id: string
          created_at: string
          empresa_id: string
          error_message: string | null
          id: string
          image_data: Json | null
          interactive_data: Json | null
          message_body: string | null
          message_type: string
          payload: Json | null
          status: string | null
          updated_at: string | null
          wamid: string | null
        }
        Insert: {
          aplicativo_id?: string | null
          audio_data?: Json | null
          contato_id: string
          created_at?: string
          empresa_id: string
          error_message?: string | null
          id?: string
          image_data?: Json | null
          interactive_data?: Json | null
          message_body?: string | null
          message_type: string
          payload?: Json | null
          status?: string | null
          updated_at?: string | null
          wamid?: string | null
        }
        Update: {
          aplicativo_id?: string | null
          audio_data?: Json | null
          contato_id?: string
          created_at?: string
          empresa_id?: string
          error_message?: string | null
          id?: string
          image_data?: Json | null
          interactive_data?: Json | null
          message_body?: string | null
          message_type?: string
          payload?: Json | null
          status?: string | null
          updated_at?: string | null
          wamid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_enviadas_aplicativo_id_fkey"
            columns: ["aplicativo_id"]
            isOneToOne: false
            referencedRelation: "aplicativos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_enviadas_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_enviadas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      mercadopago_config: {
        Row: {
          access_token: string
          client_id: string | null
          client_secret: string | null
          created_at: string
          empresa_id: string
          expires_in: number | null
          id: string
          notification_url: string | null
          public_key: string
          refresh_token: string | null
          tipo: string
          token_type: string | null
          updated_at: string
          url: string
        }
        Insert: {
          access_token: string
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          empresa_id: string
          expires_in?: number | null
          id?: string
          notification_url?: string | null
          public_key: string
          refresh_token?: string | null
          tipo?: string
          token_type?: string | null
          updated_at?: string
          url?: string
        }
        Update: {
          access_token?: string
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          empresa_id?: string
          expires_in?: number | null
          id?: string
          notification_url?: string | null
          public_key?: string
          refresh_token?: string | null
          tipo?: string
          token_type?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "mercadopago_config_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          ativo: boolean
          created_at: string | null
          descricao: string | null
          etapa_id: string | null
          id: string
          tipo: Database["public"]["Enums"]["notification_type"]
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          descricao?: string | null
          etapa_id?: string | null
          id?: string
          tipo: Database["public"]["Enums"]["notification_type"]
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          descricao?: string | null
          etapa_id?: string | null
          id?: string
          tipo?: Database["public"]["Enums"]["notification_type"]
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "etapas"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          contato_id: string | null
          created_at: string | null
          empresa_id: string
          id: string
          lida: boolean
          link: string | null
          mensagem: string
          pedido_id: string | null
          tipo: Database["public"]["Enums"]["notification_type"]
          titulo: string
        }
        Insert: {
          contato_id?: string | null
          created_at?: string | null
          empresa_id: string
          id?: string
          lida?: boolean
          link?: string | null
          mensagem: string
          pedido_id?: string | null
          tipo: Database["public"]["Enums"]["notification_type"]
          titulo: string
        }
        Update: {
          contato_id?: string | null
          created_at?: string | null
          empresa_id?: string
          id?: string
          lida?: boolean
          link?: string | null
          mensagem?: string
          pedido_id?: string | null
          tipo?: Database["public"]["Enums"]["notification_type"]
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          contato_id: string | null
          created_at: string | null
          date_approved: string | null
          date_created: string | null
          date_last_updated: string | null
          date_of_expiration: string | null
          empresa_id: string
          id: string
          id_transacao: string
          mercadopago_config_id: string | null
          pedido_id: string
          pix_base64: string
          pix_url: string
          status: string | null
          ticket_url: string | null
          tipo_pagamento: string
          updated_at: string | null
        }
        Insert: {
          contato_id?: string | null
          created_at?: string | null
          date_approved?: string | null
          date_created?: string | null
          date_last_updated?: string | null
          date_of_expiration?: string | null
          empresa_id: string
          id?: string
          id_transacao: string
          mercadopago_config_id?: string | null
          pedido_id: string
          pix_base64: string
          pix_url: string
          status?: string | null
          ticket_url?: string | null
          tipo_pagamento?: string
          updated_at?: string | null
        }
        Update: {
          contato_id?: string | null
          created_at?: string | null
          date_approved?: string | null
          date_created?: string | null
          date_last_updated?: string | null
          date_of_expiration?: string | null
          empresa_id?: string
          id?: string
          id_transacao?: string
          mercadopago_config_id?: string | null
          pedido_id?: string
          pix_base64?: string
          pix_url?: string
          status?: string | null
          ticket_url?: string | null
          tipo_pagamento?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_mercadopago_config_id_fkey"
            columns: ["mercadopago_config_id"]
            isOneToOne: false
            referencedRelation: "mercadopago_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_itens: {
        Row: {
          created_at: string | null
          id: string
          pedido_id: string
          produto_id: string
          quantidade: number
          updated_at: string | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          pedido_id: string
          produto_id: string
          quantidade: number
          updated_at?: string | null
          valor_total: number
          valor_unitario: number
        }
        Update: {
          created_at?: string | null
          id?: string
          pedido_id?: string
          produto_id?: string
          quantidade?: number
          updated_at?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedido_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          aplicativo_id: string | null
          contato_id: string | null
          created_at: string | null
          empresa_id: string
          empresa_tipo_entrega_id: string | null
          endereco_id: string | null
          finalizado_em: string | null
          id: string
          numero: number
          observacoes: string | null
          pessoa_id: string
          status: Database["public"]["Enums"]["order_status"] | null
          total: number | null
          updated_at: string | null
          vlr_frete: number | null
          whatsapp_from: string | null
        }
        Insert: {
          aplicativo_id?: string | null
          contato_id?: string | null
          created_at?: string | null
          empresa_id: string
          empresa_tipo_entrega_id?: string | null
          endereco_id?: string | null
          finalizado_em?: string | null
          id?: string
          numero: number
          observacoes?: string | null
          pessoa_id: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total?: number | null
          updated_at?: string | null
          vlr_frete?: number | null
          whatsapp_from?: string | null
        }
        Update: {
          aplicativo_id?: string | null
          contato_id?: string | null
          created_at?: string | null
          empresa_id?: string
          empresa_tipo_entrega_id?: string | null
          endereco_id?: string | null
          finalizado_em?: string | null
          id?: string
          numero?: number
          observacoes?: string | null
          pessoa_id?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total?: number | null
          updated_at?: string | null
          vlr_frete?: number | null
          whatsapp_from?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_aplicativo_id_fkey"
            columns: ["aplicativo_id"]
            isOneToOne: false
            referencedRelation: "aplicativos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_empresa_tipo_entrega_id_fkey"
            columns: ["empresa_tipo_entrega_id"]
            isOneToOne: false
            referencedRelation: "empresa_tipos_entrega"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_endereco_id_fkey"
            columns: ["endereco_id"]
            isOneToOne: false
            referencedRelation: "pessoa_enderecos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      pessoa_enderecos: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          created_at: string | null
          ddd: string | null
          endereco: string
          estado: string | null
          ibge: string | null
          id: string
          pessoa_id: string
          principal: boolean | null
          regiao: string | null
          siafi: string | null
          uf: string | null
          updated_at: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          ddd?: string | null
          endereco: string
          estado?: string | null
          ibge?: string | null
          id?: string
          pessoa_id: string
          principal?: boolean | null
          regiao?: string | null
          siafi?: string | null
          uf?: string | null
          updated_at?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          ddd?: string | null
          endereco?: string
          estado?: string | null
          ibge?: string | null
          id?: string
          pessoa_id?: string
          principal?: boolean | null
          regiao?: string | null
          siafi?: string | null
          uf?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pessoa_enderecos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      pessoas: {
        Row: {
          celular: string | null
          cnpjf: string | null
          created_at: string | null
          email: string | null
          empresa_id: string
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          celular?: string | null
          cnpjf?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id: string
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          celular?: string | null
          cnpjf?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id?: string
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pessoas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_caracteristicas: {
        Row: {
          caracteristica_id: string
          created_at: string | null
          id: string
          plano_id: string
        }
        Insert: {
          caracteristica_id: string
          created_at?: string | null
          id?: string
          plano_id: string
        }
        Update: {
          caracteristica_id?: string
          created_at?: string | null
          id?: string
          plano_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plano_caracteristicas_caracteristica_id_fkey"
            columns: ["caracteristica_id"]
            isOneToOne: false
            referencedRelation: "caracteristicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plano_caracteristicas_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      planos: {
        Row: {
          created_at: string | null
          exibir_landing_page: boolean
          id: string
          nome: string
          qtd_pedidos: number
          qtd_pedidos_tipo: string | null
          updated_at: string | null
          valor_implantacao: number
          valor_implantacao_a_verificar: boolean
          valor_pedido_adicional: number
          valor_recorrente: number
        }
        Insert: {
          created_at?: string | null
          exibir_landing_page?: boolean
          id?: string
          nome: string
          qtd_pedidos?: number
          qtd_pedidos_tipo?: string | null
          updated_at?: string | null
          valor_implantacao?: number
          valor_implantacao_a_verificar?: boolean
          valor_pedido_adicional?: number
          valor_recorrente?: number
        }
        Update: {
          created_at?: string | null
          exibir_landing_page?: boolean
          id?: string
          nome?: string
          qtd_pedidos?: number
          qtd_pedidos_tipo?: string | null
          updated_at?: string | null
          valor_implantacao?: number
          valor_implantacao_a_verificar?: boolean
          valor_pedido_adicional?: number
          valor_recorrente?: number
        }
        Relationships: []
      }
      platform_config: {
        Row: {
          created_at: string | null
          id: string
          smtp_from_email: string | null
          smtp_from_name: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_use_tls: boolean | null
          smtp_user: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          smtp_from_email?: string | null
          smtp_from_name?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_use_tls?: boolean | null
          smtp_user?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          smtp_from_email?: string | null
          smtp_from_name?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_use_tls?: boolean | null
          smtp_user?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pre_cadastros: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          cpf: string | null
          created_at: string
          email: string | null
          empresa_id: string
          endereco: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          empresa_id: string
          endereco?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          empresa_id?: string
          endereco?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      produto_imagens: {
        Row: {
          created_at: string | null
          id: string
          ordem: number | null
          produto_id: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ordem?: number | null
          produto_id: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ordem?: number | null
          produto_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "produto_imagens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          complemento: string | null
          created_at: string | null
          departamento: string | null
          descricao: string
          embedding: string | null
          empresa_id: string
          grupo: string | null
          id: string
          limite_venda: number | null
          preco1: number | null
          preco2: number | null
          sku: string | null
          subgrupo: string | null
          unidade: string | null
          updated_at: string | null
          visibilidade: Database["public"]["Enums"]["product_visibility"] | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          complemento?: string | null
          created_at?: string | null
          departamento?: string | null
          descricao: string
          embedding?: string | null
          empresa_id: string
          grupo?: string | null
          id?: string
          limite_venda?: number | null
          preco1?: number | null
          preco2?: number | null
          sku?: string | null
          subgrupo?: string | null
          unidade?: string | null
          updated_at?: string | null
          visibilidade?:
            | Database["public"]["Enums"]["product_visibility"]
            | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          complemento?: string | null
          created_at?: string | null
          departamento?: string | null
          descricao?: string
          embedding?: string | null
          empresa_id?: string
          grupo?: string | null
          id?: string
          limite_venda?: number | null
          preco1?: number | null
          preco2?: number | null
          sku?: string | null
          subgrupo?: string | null
          unidade?: string | null
          updated_at?: string | null
          visibilidade?:
            | Database["public"]["Enums"]["product_visibility"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string
          empresa_id: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email: string
          empresa_id?: string | null
          id: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string
          empresa_id?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_etapas: {
        Row: {
          ativo: boolean
          campos_solicitados: Json
          created_at: string
          descricao: string | null
          etapa_id: string
          id: string
          nome: string
          ordem: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          campos_solicitados?: Json
          created_at?: string
          descricao?: string | null
          etapa_id: string
          id?: string
          nome: string
          ordem?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          campos_solicitados?: Json
          created_at?: string
          descricao?: string | null
          etapa_id?: string
          id?: string
          nome?: string
          ordem?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_etapas_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "etapas"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          id: string
          mensagem_inicial: string | null
          nome_assistente: string | null
          updated_at: string
          whatsapp_contato: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          mensagem_inicial?: string | null
          nome_assistente?: string | null
          updated_at?: string
          whatsapp_contato?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          mensagem_inicial?: string | null
          nome_assistente?: string | null
          updated_at?: string
          whatsapp_contato?: string | null
        }
        Relationships: []
      }
      tipos_entrega: {
        Row: {
          ativo: boolean
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      search_produtos_by_embedding: {
        Args: {
          empresa_id_param?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          categoria: string
          complemento: string
          departamento: string
          descricao: string
          grupo: string
          id: string
          preco1: number
          preco2: number
          similarity: number
          subgrupo: string
        }[]
      }
      user_empresa_id: { Args: { _user_id: string }; Returns: string }
      verificar_disponibilidade_produto: {
        Args: {
          p_empresa_id: string
          p_produto_id: string
          p_quantidade: number
        }
        Returns: {
          disponivel: boolean
          limite_venda: number
          mensagem: string
          quantidade_solicitada: number
          saldo_atual: number
        }[]
      }
    }
    Enums: {
      app_role: "admin_master" | "company_admin" | "company_user"
      notification_type:
        | "conversa_iniciada"
        | "venda_finalizada"
        | "pagamento_finalizado"
      order_status: "pending" | "processing" | "completed" | "cancelled"
      product_visibility: "visible" | "hidden"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin_master", "company_admin", "company_user"],
      notification_type: [
        "conversa_iniciada",
        "venda_finalizada",
        "pagamento_finalizado",
      ],
      order_status: ["pending", "processing", "completed", "cancelled"],
      product_visibility: ["visible", "hidden"],
    },
  },
} as const
