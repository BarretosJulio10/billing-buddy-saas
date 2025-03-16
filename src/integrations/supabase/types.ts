export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      collection_rules: {
        Row: {
          confirmation_template: string
          created_at: string | null
          deleted_at: string | null
          due_date_template: string
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          overdue_days_after: number[]
          overdue_template: string
          reminder_days_before: number
          reminder_template: string
          send_on_due_date: boolean | null
          updated_at: string | null
        }
        Insert: {
          confirmation_template: string
          created_at?: string | null
          deleted_at?: string | null
          due_date_template: string
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          overdue_days_after: number[]
          overdue_template: string
          reminder_days_before: number
          reminder_template: string
          send_on_due_date?: boolean | null
          updated_at?: string | null
        }
        Update: {
          confirmation_template?: string
          created_at?: string | null
          deleted_at?: string | null
          due_date_template?: string
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          overdue_days_after?: number[]
          overdue_template?: string
          reminder_days_before?: number
          reminder_template?: string
          send_on_due_date?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_collection_rules_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          collection_rule_id: string | null
          created_at: string | null
          deleted_at: string | null
          document: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          organization_id: string | null
          phone: string
          state: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          collection_rule_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          document?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          organization_id?: string | null
          phone: string
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          collection_rule_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          document?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_customers_collection_rule"
            columns: ["collection_rule_id"]
            isOneToOne: false
            referencedRelation: "collection_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_customers_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          collection_rule_id: string | null
          created_at: string | null
          customer_id: string
          deleted_at: string | null
          description: string
          due_date: string
          id: string
          organization_id: string | null
          paid_at: string | null
          payment_amount: number | null
          payment_gateway: string | null
          payment_gateway_id: string | null
          payment_link: string | null
          payment_method: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          collection_rule_id?: string | null
          created_at?: string | null
          customer_id: string
          deleted_at?: string | null
          description: string
          due_date: string
          id?: string
          organization_id?: string | null
          paid_at?: string | null
          payment_amount?: number | null
          payment_gateway?: string | null
          payment_gateway_id?: string | null
          payment_link?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          collection_rule_id?: string | null
          created_at?: string | null
          customer_id?: string
          deleted_at?: string | null
          description?: string
          due_date?: string
          id?: string
          organization_id?: string | null
          paid_at?: string | null
          payment_amount?: number | null
          payment_gateway?: string | null
          payment_gateway_id?: string | null
          payment_link?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_invoices_collection_rule"
            columns: ["collection_rule_id"]
            isOneToOne: false
            referencedRelation: "collection_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoices_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoices_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_history: {
        Row: {
          channel: string
          content: string
          created_at: string | null
          customer_id: string
          error_message: string | null
          id: string
          invoice_id: string | null
          message_type: string
          organization_id: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          channel: string
          content: string
          created_at?: string | null
          customer_id: string
          error_message?: string | null
          id?: string
          invoice_id?: string | null
          message_type: string
          organization_id?: string | null
          sent_at?: string | null
          status: string
        }
        Update: {
          channel?: string
          content?: string
          created_at?: string | null
          customer_id?: string
          error_message?: string | null
          id?: string
          invoice_id?: string | null
          message_type?: string
          organization_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_message_history_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_message_history_invoice"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_message_history_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_settings: {
        Row: {
          additional_config: Json | null
          api_endpoint: string | null
          auth_token: string | null
          channel: string
          created_at: string | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          additional_config?: Json | null
          api_endpoint?: string | null
          auth_token?: string | null
          channel: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_config?: Json | null
          api_endpoint?: string | null
          auth_token?: string | null
          channel?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_messaging_settings_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          blocked: boolean | null
          created_at: string | null
          deleted_at: string | null
          email: string
          gateway: string | null
          id: string
          is_admin: boolean | null
          last_payment_date: string | null
          logo_url: string | null
          name: string
          phone: string | null
          primary_color: string | null
          subscription_amount: number | null
          subscription_due_date: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          blocked?: boolean | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          gateway?: string | null
          id?: string
          is_admin?: boolean | null
          last_payment_date?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          primary_color?: string | null
          subscription_amount?: number | null
          subscription_due_date?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          blocked?: boolean | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          gateway?: string | null
          id?: string
          is_admin?: boolean | null
          last_payment_date?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          subscription_amount?: number | null
          subscription_due_date?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_gateway_settings: {
        Row: {
          additional_config: Json | null
          api_key: string
          api_secret: string | null
          created_at: string | null
          gateway_name: string
          id: string
          is_active: boolean | null
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          additional_config?: Json | null
          api_key: string
          api_secret?: string | null
          created_at?: string | null
          gateway_name: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_config?: Json | null
          api_key?: string
          api_secret?: string | null
          created_at?: string | null
          gateway_name?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_payment_gateway_settings_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_system_settings_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          organization_id: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          organization_id?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_instances: {
        Row: {
          created_at: string | null
          id: string
          instance_name: string
          number: string | null
          organization_id: string
          qrcode: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          instance_name: string
          number?: string | null
          organization_id: string
          qrcode?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instance_name?: string
          number?: string | null
          organization_id?: string
          qrcode?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_instances_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_payment: {
        Args: {
          p_invoice_id: string
          p_amount: number
          p_payment_method: string
          p_payment_gateway: string
          p_payment_gateway_id: string
          p_org_id: string
        }
        Returns: boolean
      }
      clean_up_trash: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_organization: {
        Args: {
          org_name: string
          org_email: string
          due_date: string
        }
        Returns: string
      }
      create_user_profile: {
        Args: {
          user_id: string
          org_id: string
          user_role: string
          user_email: string
        }
        Returns: undefined
      }
      get_pending_messages: {
        Args: {
          p_org_id: string
        }
        Returns: {
          invoice_id: string
          customer_id: string
          customer_name: string
          customer_phone: string
          message_type: string
          template_text: string
          payment_link: string
          amount: number
          days_to_due: number
          days_overdue: number
        }[]
      }
      get_trash_items: {
        Args: {
          org_id: string
        }
        Returns: {
          id: string
          entity_type: string
          name: string
          deleted_at: string
        }[]
      }
      get_user_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      permanently_delete_from_trash: {
        Args: {
          p_id: string
          p_entity_type: string
          p_org_id: string
        }
        Returns: boolean
      }
      restore_from_trash: {
        Args: {
          p_id: string
          p_entity_type: string
          p_org_id: string
        }
        Returns: boolean
      }
      update_overdue_invoices: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      update_user_profile: {
        Args: {
          user_id: string
          org_id: string
          first_name: string
          last_name: string
          user_role: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
