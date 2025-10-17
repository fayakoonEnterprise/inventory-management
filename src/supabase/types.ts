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
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      product_units: {
        Row: {
          conversion_factor: number
          id: string
          is_primary: boolean | null
          product_id: string | null
          purchase_price: number
          selling_price: number
          unit_name: string
        }
        Insert: {
          conversion_factor?: number
          id?: string
          is_primary?: boolean | null
          product_id?: string | null
          purchase_price: number
          selling_price: number
          unit_name: string
        }
        Update: {
          conversion_factor?: number
          id?: string
          is_primary?: boolean | null
          product_id?: string | null
          purchase_price?: number
          selling_price?: number
          unit_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_units_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_box_sellable: boolean | null
          low_stock_limit: number | null
          name: string
          price_per_box: number | null
          price_per_piece: number | null
          purchase_price: number
          selling_price: number
          stock: number | null
          unit: string | null
          units_per_box: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_box_sellable?: boolean | null
          low_stock_limit?: number | null
          name: string
          price_per_box?: number | null
          price_per_piece?: number | null
          purchase_price: number
          selling_price: number
          stock?: number | null
          unit?: string | null
          units_per_box?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_box_sellable?: boolean | null
          low_stock_limit?: number | null
          name?: string
          price_per_box?: number | null
          price_per_piece?: number | null
          purchase_price?: number
          selling_price?: number
          stock?: number | null
          unit?: string | null
          units_per_box?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      purchase_items: {
        Row: {
          cost_price: number
          id: string
          product_id: string | null
          purchase_id: string | null
          quantity: number
        }
        Insert: {
          cost_price: number
          id?: string
          product_id?: string | null
          purchase_id?: string | null
          quantity: number
        }
        Update: {
          cost_price?: number
          id?: string
          product_id?: string | null
          purchase_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string | null
          id: string
          purchase_date: string | null
          supplier_name: string | null
          total_amount: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          purchase_date?: string | null
          supplier_name?: string | null
          total_amount?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          purchase_date?: string | null
          supplier_name?: string | null
          total_amount?: number | null
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          id: string
          price: number
          product_id: string | null
          quantity: number
          sale_id: string | null
        }
        Insert: {
          id?: string
          price: number
          product_id?: string | null
          quantity: number
          sale_id?: string | null
        }
        Update: {
          id?: string
          price?: number
          product_id?: string | null
          quantity?: number
          sale_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string | null
          customer_name: string | null
          id: string
          payment_type: string | null
          sale_date: string | null
          total_amount: number | null
        }
        Insert: {
          created_at?: string | null
          customer_name?: string | null
          id?: string
          payment_type?: string | null
          sale_date?: string | null
          total_amount?: number | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string | null
          id?: string
          payment_type?: string | null
          sale_date?: string | null
          total_amount?: number | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          address: string | null
          created_at: string | null
          currency: string | null
          id: string
          include_tax: boolean | null
          logo_url: string | null
          shop_name: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          include_tax?: boolean | null
          logo_url?: string | null
          shop_name: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          include_tax?: boolean | null
          logo_url?: string | null
          shop_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      daily_sales_summary: {
        Row: {
          sale_date: string | null
          total_bills: number | null
          total_sales: number | null
        }
        Relationships: []
      }
      stock_value: {
        Row: {
          name: string | null
          selling_price: number | null
          stock: number | null
          stock_value: number | null
        }
        Insert: {
          name?: string | null
          selling_price?: number | null
          stock?: number | null
          stock_value?: never
        }
        Update: {
          name?: string | null
          selling_price?: number | null
          stock?: number | null
          stock_value?: never
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
