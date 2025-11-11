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
          empresa_id: string
          id: string
          nome: string
          ordem: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          empresa_id: string
          id?: string
          nome: string
          ordem?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          empresa_id?: string
          id?: string
          nome?: string
          ordem?: number
          updated_at?: string
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
      pagamentos: {
        Row: {
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
          updated_at: string | null
        }
        Insert: {
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
          updated_at?: string | null
        }
        Update: {
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
          updated_at?: string | null
        }
        Relationships: [
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
          endereco: string
          id: string
          pessoa_id: string
          principal: boolean | null
          updated_at: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          endereco: string
          id?: string
          pessoa_id: string
          principal?: boolean | null
          updated_at?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          endereco?: string
          id?: string
          pessoa_id?: string
          principal?: boolean | null
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
      planos: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          qtd_pedidos: number
          updated_at: string | null
          valor_pedido_adicional: number
          valor_recorrente: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          qtd_pedidos?: number
          updated_at?: string | null
          valor_pedido_adicional?: number
          valor_recorrente?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          qtd_pedidos?: number
          updated_at?: string | null
          valor_pedido_adicional?: number
          valor_recorrente?: number
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
      order_status: ["pending", "processing", "completed", "cancelled"],
      product_visibility: ["visible", "hidden"],
    },
  },
} as const
