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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      abandoned_orders: {
        Row: {
          cliente_email: string
          cliente_nome: string | null
          codigo_pix: string | null
          created_at: string
          data_criacao: string
          etapa_1_em: string | null
          etapa_2_em: string | null
          etapa_3_em: string | null
          id: string
          link_pagamento: string | null
          pedido_id: string
          protocolo: string
          recuperado_em: string | null
          status_automacao: string
          ultimo_erro: string | null
          updated_at: string
          valor_recuperado_centavos: number
          valor_total_centavos: number
        }
        Insert: {
          cliente_email: string
          cliente_nome?: string | null
          codigo_pix?: string | null
          created_at?: string
          data_criacao?: string
          etapa_1_em?: string | null
          etapa_2_em?: string | null
          etapa_3_em?: string | null
          id?: string
          link_pagamento?: string | null
          pedido_id: string
          protocolo: string
          recuperado_em?: string | null
          status_automacao?: string
          ultimo_erro?: string | null
          updated_at?: string
          valor_recuperado_centavos?: number
          valor_total_centavos?: number
        }
        Update: {
          cliente_email?: string
          cliente_nome?: string | null
          codigo_pix?: string | null
          created_at?: string
          data_criacao?: string
          etapa_1_em?: string | null
          etapa_2_em?: string | null
          etapa_3_em?: string | null
          id?: string
          link_pagamento?: string | null
          pedido_id?: string
          protocolo?: string
          recuperado_em?: string | null
          status_automacao?: string
          ultimo_erro?: string | null
          updated_at?: string
          valor_recuperado_centavos?: number
          valor_total_centavos?: number
        }
        Relationships: [
          {
            foreignKeyName: "abandoned_orders_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: true
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_recipients: {
        Row: {
          aberto_em: string | null
          campaign_id: string
          clicado_em: string | null
          created_at: string
          email: string
          enviado_em: string | null
          erro: string | null
          id: string
          nome: string | null
          status: string
        }
        Insert: {
          aberto_em?: string | null
          campaign_id: string
          clicado_em?: string | null
          created_at?: string
          email: string
          enviado_em?: string | null
          erro?: string | null
          id?: string
          nome?: string | null
          status?: string
        }
        Update: {
          aberto_em?: string | null
          campaign_id?: string
          clicado_em?: string | null
          created_at?: string
          email?: string
          enviado_em?: string | null
          erro?: string | null
          id?: string
          nome?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "weekly_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      cnj_comarcas: {
        Row: {
          cidade: string | null
          codigo_origem: string
          created_at: string
          id: string
          nome: string
          tribunal_id: string
          uf: string | null
          updated_at: string
        }
        Insert: {
          cidade?: string | null
          codigo_origem: string
          created_at?: string
          id?: string
          nome: string
          tribunal_id: string
          uf?: string | null
          updated_at?: string
        }
        Update: {
          cidade?: string | null
          codigo_origem?: string
          created_at?: string
          id?: string
          nome?: string
          tribunal_id?: string
          uf?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cnj_comarcas_tribunal_id_fkey"
            columns: ["tribunal_id"]
            isOneToOne: false
            referencedRelation: "cnj_tribunais"
            referencedColumns: ["id"]
          },
        ]
      }
      cnj_segmentos: {
        Row: {
          codigo: number
          descricao: string | null
          nome: string
        }
        Insert: {
          codigo: number
          descricao?: string | null
          nome: string
        }
        Update: {
          codigo?: number
          descricao?: string | null
          nome?: string
        }
        Relationships: []
      }
      cnj_tribunais: {
        Row: {
          codigo_tr: string
          created_at: string
          id: string
          nome: string
          sede: string | null
          segmento: number
          sigla: string
          sistema: string | null
          tipo: string
          uf: string | null
          updated_at: string
        }
        Insert: {
          codigo_tr: string
          created_at?: string
          id?: string
          nome: string
          sede?: string | null
          segmento: number
          sigla: string
          sistema?: string | null
          tipo: string
          uf?: string | null
          updated_at?: string
        }
        Update: {
          codigo_tr?: string
          created_at?: string
          id?: string
          nome?: string
          sede?: string | null
          segmento?: number
          sigla?: string
          sistema?: string | null
          tipo?: string
          uf?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cnj_tribunais_segmento_fkey"
            columns: ["segmento"]
            isOneToOne: false
            referencedRelation: "cnj_segmentos"
            referencedColumns: ["codigo"]
          },
        ]
      }
      cron_tokens: {
        Row: {
          created_at: string
          nome: string
          token: string
        }
        Insert: {
          created_at?: string
          nome: string
          token: string
        }
        Update: {
          created_at?: string
          nome?: string
          token?: string
        }
        Relationships: []
      }
      email_config: {
        Row: {
          assunto: string
          ativo: boolean
          chave: string
          corpo: string
          created_at: string
          updated_at: string
        }
        Insert: {
          assunto: string
          ativo?: boolean
          chave: string
          corpo: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          assunto?: string
          ativo?: boolean
          chave?: string
          corpo?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_optouts: {
        Row: {
          created_at: string
          email: string
          motivo: string
        }
        Insert: {
          created_at?: string
          email: string
          motivo?: string
        }
        Update: {
          created_at?: string
          email?: string
          motivo?: string
        }
        Relationships: []
      }
      email_sequencia_config: {
        Row: {
          assunto: string
          ativo: boolean
          corpo: string
          created_at: string
          etapa: number
          updated_at: string
        }
        Insert: {
          assunto: string
          ativo?: boolean
          corpo: string
          created_at?: string
          etapa: number
          updated_at?: string
        }
        Update: {
          assunto?: string
          ativo?: boolean
          corpo?: string
          created_at?: string
          etapa?: number
          updated_at?: string
        }
        Relationships: []
      }
      job_locks: {
        Row: {
          created_at: string
          expira_em: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expira_em: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expira_em?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      pedido_andamentos: {
        Row: {
          autor_id: string | null
          created_at: string
          id: string
          observacao: string | null
          pedido_id: string
          status: string
        }
        Insert: {
          autor_id?: string | null
          created_at?: string
          id?: string
          observacao?: string | null
          pedido_id: string
          status: string
        }
        Update: {
          autor_id?: string | null
          created_at?: string
          id?: string
          observacao?: string | null
          pedido_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedido_andamentos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_anexos: {
        Row: {
          autor_id: string | null
          caminho: string
          content_type: string | null
          created_at: string
          id: string
          nome_arquivo: string
          pedido_id: string
          tamanho_bytes: number | null
          tipo: string
        }
        Insert: {
          autor_id?: string | null
          caminho: string
          content_type?: string | null
          created_at?: string
          id?: string
          nome_arquivo: string
          pedido_id: string
          tamanho_bytes?: number | null
          tipo?: string
        }
        Update: {
          autor_id?: string | null
          caminho?: string
          content_type?: string | null
          created_at?: string
          id?: string
          nome_arquivo?: string
          pedido_id?: string
          tamanho_bytes?: number | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedido_anexos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          certidoes: Json
          checkout_url: string | null
          cidade: string | null
          cpf: string
          created_at: string
          email: string
          id: string
          lembrete_enviado_em: string | null
          nome_parte: string | null
          numero_processo: string
          observacoes: string | null
          pagbank_order_id: string | null
          pago_em: string | null
          pix_codigo: string | null
          pix_expira_em: string | null
          pix_qrcode_url: string | null
          protocolo: string
          quantidade: number
          status: string
          stripe_session_id: string | null
          uf: string | null
          updated_at: string
          user_id: string | null
          valor_centavos: number
          whatsapp: string
        }
        Insert: {
          certidoes?: Json
          checkout_url?: string | null
          cidade?: string | null
          cpf: string
          created_at?: string
          email: string
          id?: string
          lembrete_enviado_em?: string | null
          nome_parte?: string | null
          numero_processo: string
          observacoes?: string | null
          pagbank_order_id?: string | null
          pago_em?: string | null
          pix_codigo?: string | null
          pix_expira_em?: string | null
          pix_qrcode_url?: string | null
          protocolo: string
          quantidade?: number
          status?: string
          stripe_session_id?: string | null
          uf?: string | null
          updated_at?: string
          user_id?: string | null
          valor_centavos?: number
          whatsapp: string
        }
        Update: {
          certidoes?: Json
          checkout_url?: string | null
          cidade?: string | null
          cpf?: string
          created_at?: string
          email?: string
          id?: string
          lembrete_enviado_em?: string | null
          nome_parte?: string | null
          numero_processo?: string
          observacoes?: string | null
          pagbank_order_id?: string | null
          pago_em?: string | null
          pix_codigo?: string | null
          pix_expira_em?: string | null
          pix_qrcode_url?: string | null
          protocolo?: string
          quantidade?: number
          status?: string
          stripe_session_id?: string | null
          uf?: string | null
          updated_at?: string
          user_id?: string | null
          valor_centavos?: number
          whatsapp?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          boas_vindas_em: string | null
          created_at: string
          email: string | null
          id: string
          nome: string | null
          provider: string | null
          status_conta: string
          ultimo_email_enviado: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          boas_vindas_em?: string | null
          created_at?: string
          email?: string | null
          id: string
          nome?: string | null
          provider?: string | null
          status_conta?: string
          ultimo_email_enviado?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          boas_vindas_em?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          provider?: string | null
          status_conta?: string
          ultimo_email_enviado?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_eventos: {
        Row: {
          created_at: string
          id: string
          payload: Json | null
          payment_id: string | null
          provedor: string
          resultado: string | null
          tipo: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json | null
          payment_id?: string | null
          provedor: string
          resultado?: string | null
          tipo?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json | null
          payment_id?: string | null
          provedor?: string
          resultado?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      weekly_campaigns: {
        Row: {
          agendamento_data: string | null
          assunto: string
          conteudo_html: string
          created_at: string
          enviado_em: string | null
          id: string
          status: string
          titulo: string
          total_destinatarios: number
          total_enviados: number
          total_falhas: number
          updated_at: string
        }
        Insert: {
          agendamento_data?: string | null
          assunto: string
          conteudo_html: string
          created_at?: string
          enviado_em?: string | null
          id?: string
          status?: string
          titulo: string
          total_destinatarios?: number
          total_enviados?: number
          total_falhas?: number
          updated_at?: string
        }
        Update: {
          agendamento_data?: string | null
          assunto?: string
          conteudo_html?: string
          created_at?: string
          enviado_em?: string | null
          id?: string
          status?: string
          titulo?: string
          total_destinatarios?: number
          total_enviados?: number
          total_falhas?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "equipe"
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
      app_role: ["admin", "equipe"],
    },
  },
} as const
