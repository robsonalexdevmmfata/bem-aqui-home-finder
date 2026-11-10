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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      agencies: {
        Row: {
          city: string | null
          cnpj: string | null
          created_at: string
          creci: string | null
          description: string | null
          email: string | null
          id: string
          is_demo: boolean
          logo_url: string | null
          name: string
          owner_id: string | null
          phone: string | null
          state: string | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          city?: string | null
          cnpj?: string | null
          created_at?: string
          creci?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_demo?: boolean
          logo_url?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          city?: string | null
          cnpj?: string | null
          created_at?: string
          creci?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_demo?: boolean
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          active: boolean
          created_at: string
          id: string
          image_url: string | null
          link_url: string | null
          position: number
          subtitle: string | null
          title: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string | null
          link_url?: string | null
          position?: number
          subtitle?: string | null
          title: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string | null
          link_url?: string | null
          position?: number
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      brokers: {
        Row: {
          agency_id: string | null
          bio: string | null
          city: string | null
          created_at: string
          creci: string | null
          display_name: string
          featured: boolean
          id: string
          is_demo: boolean
          photo_url: string | null
          public_email: string | null
          specialties: string[]
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          agency_id?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          creci?: string | null
          display_name: string
          featured?: boolean
          id?: string
          is_demo?: boolean
          photo_url?: string | null
          public_email?: string | null
          specialties?: string[]
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          agency_id?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          creci?: string | null
          display_name?: string
          featured?: boolean
          id?: string
          is_demo?: boolean
          photo_url?: string | null
          public_email?: string | null
          specialties?: string[]
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brokers_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_simulations: {
        Row: {
          created_at: string
          id: string
          inputs: Json
          name: string
          property_id: string | null
          results: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inputs: Json
          name?: string
          property_id?: string | null
          results: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inputs?: Json
          name?: string
          property_id?: string | null
          results?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_simulations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_analyses: {
        Row: {
          created_at: string
          id: string
          inputs: Json
          name: string
          property_id: string | null
          results: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inputs: Json
          name?: string
          property_id?: string | null
          results: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inputs?: Json
          name?: string
          property_id?: string | null
          results?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_analyses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          author_id: string
          channel: string
          created_at: string
          id: string
          lead_id: string
          note: string
        }
        Insert: {
          author_id: string
          channel?: string
          created_at?: string
          id?: string
          lead_id: string
          note: string
        }
        Update: {
          author_id?: string
          channel?: string
          created_at?: string
          id?: string
          lead_id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          consent: boolean
          created_at: string
          email: string
          id: string
          is_demo: boolean
          message: string | null
          name: string
          owner_id: string | null
          phone: string | null
          property_id: string | null
          source: string
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          consent?: boolean
          created_at?: string
          email: string
          id?: string
          is_demo?: boolean
          message?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          property_id?: string | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          consent?: boolean
          created_at?: string
          email?: string
          id?: string
          is_demo?: boolean
          message?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          property_id?: string | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      negotiations: {
        Row: {
          amount: number | null
          author_id: string | null
          created_at: string
          id: string
          kind: string
          message: string | null
          proposal_id: string
        }
        Insert: {
          amount?: number | null
          author_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          message?: string | null
          proposal_id: string
        }
        Update: {
          amount?: number | null
          author_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          message?: string | null
          proposal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "negotiations_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          is_demo: boolean
          logo_url: string | null
          name: string
          position: number
          website: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_demo?: boolean
          logo_url?: string | null
          name: string
          position?: number
          website?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_demo?: boolean
          logo_url?: string | null
          name?: string
          position?: number
          website?: string | null
        }
        Relationships: []
      }
      partnerships: {
        Row: {
          commission_split: number
          created_at: string
          id: string
          message: string | null
          partner_broker_id: string
          partner_user_id: string | null
          property_id: string | null
          requester_id: string
          status: Database["public"]["Enums"]["partnership_status"]
          updated_at: string
        }
        Insert: {
          commission_split?: number
          created_at?: string
          id?: string
          message?: string | null
          partner_broker_id: string
          partner_user_id?: string | null
          property_id?: string | null
          requester_id: string
          status?: Database["public"]["Enums"]["partnership_status"]
          updated_at?: string
        }
        Update: {
          commission_split?: number
          created_at?: string
          id?: string
          message?: string | null
          partner_broker_id?: string
          partner_user_id?: string | null
          property_id?: string | null
          requester_id?: string
          status?: Database["public"]["Enums"]["partnership_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partnerships_partner_broker_id_fkey"
            columns: ["partner_broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partnerships_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["app_role"]
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_demo: boolean
          lgpd_consent_at: string | null
          marketing_consent: boolean
          phone: string | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["app_role"]
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          is_demo?: boolean
          lgpd_consent_at?: string | null
          marketing_consent?: boolean
          phone?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["app_role"]
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_demo?: boolean
          lgpd_consent_at?: string | null
          marketing_consent?: boolean
          phone?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          agency_id: string | null
          area_m2: number | null
          bathrooms: number
          bedrooms: number
          broker_id: string | null
          category_id: string | null
          city: string | null
          condo_fee: number | null
          created_at: string
          description: string
          expected_rent: number | null
          featured: boolean
          id: string
          iptu: number | null
          is_demo: boolean
          is_investment: boolean
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          owner_id: string
          parking_spots: number
          price: number
          published_at: string | null
          purpose: Database["public"]["Enums"]["property_purpose"]
          rejection_reason: string | null
          slug: string
          state: string | null
          status: Database["public"]["Enums"]["property_status"]
          suites: number
          title: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          agency_id?: string | null
          area_m2?: number | null
          bathrooms?: number
          bedrooms?: number
          broker_id?: string | null
          category_id?: string | null
          city?: string | null
          condo_fee?: number | null
          created_at?: string
          description?: string
          expected_rent?: number | null
          featured?: boolean
          id?: string
          iptu?: number | null
          is_demo?: boolean
          is_investment?: boolean
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          owner_id: string
          parking_spots?: number
          price?: number
          published_at?: string | null
          purpose?: Database["public"]["Enums"]["property_purpose"]
          rejection_reason?: string | null
          slug: string
          state?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          suites?: number
          title: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          agency_id?: string | null
          area_m2?: number | null
          bathrooms?: number
          bedrooms?: number
          broker_id?: string | null
          category_id?: string | null
          city?: string | null
          condo_fee?: number | null
          created_at?: string
          description?: string
          expected_rent?: number | null
          featured?: boolean
          id?: string
          iptu?: number | null
          is_demo?: boolean
          is_investment?: boolean
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          owner_id?: string
          parking_spots?: number
          price?: number
          published_at?: string | null
          purpose?: Database["public"]["Enums"]["property_purpose"]
          rejection_reason?: string | null
          slug?: string
          state?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          suites?: number
          title?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "property_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      property_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position?: number
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          slug?: string
        }
        Relationships: []
      }
      property_features: {
        Row: {
          created_at: string
          id: string
          name: string
          property_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          property_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_features_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          created_at: string
          id: string
          position: number
          property_id: string
          storage_path: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          property_id: string
          storage_path?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          property_id?: string
          storage_path?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_valuations: {
        Row: {
          created_at: string
          id: string
          inputs: Json
          name: string
          property_id: string | null
          results: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inputs: Json
          name?: string
          property_id?: string | null
          results: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inputs?: Json
          name?: string
          property_id?: string | null
          results?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_valuations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_videos: {
        Row: {
          created_at: string
          id: string
          property_id: string
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_videos_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_views: {
        Row: {
          created_at: string
          id: string
          property_id: string
          viewer_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          viewer_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_views_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          agreed_amount: number | null
          agreed_at: string | null
          amount: number
          client_email: string | null
          client_id: string
          client_name: string
          client_phone: string | null
          created_at: string
          id: string
          is_demo: boolean
          last_offer_by: string | null
          message: string | null
          owner_id: string | null
          payment_conditions: string | null
          property_id: string
          status: Database["public"]["Enums"]["proposal_status"]
          type: Database["public"]["Enums"]["proposal_type"]
          updated_at: string
        }
        Insert: {
          agreed_amount?: number | null
          agreed_at?: string | null
          amount: number
          client_email?: string | null
          client_id: string
          client_name: string
          client_phone?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          last_offer_by?: string | null
          message?: string | null
          owner_id?: string | null
          payment_conditions?: string | null
          property_id: string
          status?: Database["public"]["Enums"]["proposal_status"]
          type?: Database["public"]["Enums"]["proposal_type"]
          updated_at?: string
        }
        Update: {
          agreed_amount?: number | null
          agreed_at?: string | null
          amount?: number
          client_email?: string | null
          client_id?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          last_offer_by?: string | null
          message?: string | null
          owner_id?: string | null
          payment_conditions?: string | null
          property_id?: string
          status?: Database["public"]["Enums"]["proposal_status"]
          type?: Database["public"]["Enums"]["proposal_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          property_id: string | null
          reason: string
          reporter_email: string | null
          reporter_id: string | null
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          property_id?: string | null
          reason: string
          reporter_email?: string | null
          reporter_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          property_id?: string | null
          reason?: string
          reporter_email?: string | null
          reporter_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          active: boolean
          author_name: string
          author_role: string | null
          content: string
          created_at: string
          id: string
          is_demo: boolean
          rating: number
        }
        Insert: {
          active?: boolean
          author_name: string
          author_role?: string | null
          content: string
          created_at?: string
          id?: string
          is_demo?: boolean
          rating?: number
        }
        Update: {
          active?: boolean
          author_name?: string
          author_role?: string | null
          content?: string
          created_at?: string
          id?: string
          is_demo?: boolean
          rating?: number
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_stats: { Args: never; Returns: Json }
      can_manage_lead: { Args: { _lid: string }; Returns: boolean }
      can_manage_property: { Args: { _pid: string }; Returns: boolean }
      can_view_property: { Args: { _pid: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_professional: { Args: { _user_id: string }; Returns: boolean }
      is_proposal_participant: { Args: { _pid: string }; Returns: boolean }
      log_activity: {
        Args: {
          _action: string
          _details: Json
          _entity: string
          _entity_id: string
        }
        Returns: undefined
      }
      notify: {
        Args: {
          _body: string
          _link: string
          _title: string
          _type: string
          _user: string
        }
        Returns: undefined
      }
    }
    Enums: {
      account_status: "pending" | "approved" | "rejected" | "suspended"
      app_role: "admin" | "broker" | "agency" | "client"
      lead_status: "new" | "contacted" | "qualified" | "converted" | "lost"
      partnership_status: "pending" | "accepted" | "rejected" | "ended"
      property_purpose: "venda" | "aluguel"
      property_status:
        | "draft"
        | "pending"
        | "published"
        | "rejected"
        | "archived"
      proposal_status:
        | "pending"
        | "countered"
        | "accepted"
        | "rejected"
        | "withdrawn"
      proposal_type: "compra" | "aluguel"
      report_status: "open" | "reviewing" | "resolved" | "dismissed"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      account_status: ["pending", "approved", "rejected", "suspended"],
      app_role: ["admin", "broker", "agency", "client"],
      lead_status: ["new", "contacted", "qualified", "converted", "lost"],
      partnership_status: ["pending", "accepted", "rejected", "ended"],
      property_purpose: ["venda", "aluguel"],
      property_status: [
        "draft",
        "pending",
        "published",
        "rejected",
        "archived",
      ],
      proposal_status: [
        "pending",
        "countered",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      proposal_type: ["compra", "aluguel"],
      report_status: ["open", "reviewing", "resolved", "dismissed"],
    },
  },
} as const
