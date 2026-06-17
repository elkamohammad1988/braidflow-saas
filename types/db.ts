// Hand-written to match the canonical `supabase gen types typescript` output.
// Regenerate with `npm run db:types` after schema changes.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: Database['public']['Enums']['user_role'];
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: Database['public']['Enums']['user_role'];
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: Database['public']['Enums']['user_role'];
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      braiders: {
        Row: {
          id: string;
          slug: string;
          business_name: string;
          bio: string | null;
          city: string | null;
          hero_image_url: string | null;
          instagram_handle: string | null;
          accepting_bookings: boolean;
          timezone: string;
          stripe_account_id: string | null;
          charges_enabled: boolean;
          payouts_enabled: boolean;
          stripe_onboarding_complete: boolean;
          onboarding_completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          slug: string;
          business_name: string;
          bio?: string | null;
          city?: string | null;
          hero_image_url?: string | null;
          instagram_handle?: string | null;
          accepting_bookings?: boolean;
          timezone?: string;
          stripe_account_id?: string | null;
          charges_enabled?: boolean;
          payouts_enabled?: boolean;
          stripe_onboarding_complete?: boolean;
          onboarding_completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          business_name?: string;
          bio?: string | null;
          city?: string | null;
          hero_image_url?: string | null;
          instagram_handle?: string | null;
          accepting_bookings?: boolean;
          timezone?: string;
          stripe_account_id?: string | null;
          charges_enabled?: boolean;
          payouts_enabled?: boolean;
          stripe_onboarding_complete?: boolean;
          onboarding_completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'braiders_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      services: {
        Row: {
          id: string;
          braider_id: string;
          name: string;
          description: string | null;
          duration_minutes: number;
          price_cents: number;
          deposit_cents: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          braider_id: string;
          name: string;
          description?: string | null;
          duration_minutes: number;
          price_cents: number;
          deposit_cents: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          braider_id?: string;
          name?: string;
          description?: string | null;
          duration_minutes?: number;
          price_cents?: number;
          deposit_cents?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'services_braider_id_fkey';
            columns: ['braider_id'];
            isOneToOne: false;
            referencedRelation: 'braiders';
            referencedColumns: ['id'];
          }
        ];
      };
      availability_rules: {
        Row: {
          id: string;
          braider_id: string;
          day_of_week: number;
          start_minute: number;
          end_minute: number;
        };
        Insert: {
          id?: string;
          braider_id: string;
          day_of_week: number;
          start_minute: number;
          end_minute: number;
        };
        Update: {
          id?: string;
          braider_id?: string;
          day_of_week?: number;
          start_minute?: number;
          end_minute?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'availability_rules_braider_id_fkey';
            columns: ['braider_id'];
            isOneToOne: false;
            referencedRelation: 'braiders';
            referencedColumns: ['id'];
          }
        ];
      };
      availability_overrides: {
        Row: {
          id: string;
          braider_id: string;
          starts_at: string;
          ends_at: string;
          kind: 'block' | 'open';
          note: string | null;
        };
        Insert: {
          id?: string;
          braider_id: string;
          starts_at: string;
          ends_at: string;
          kind: 'block' | 'open';
          note?: string | null;
        };
        Update: {
          id?: string;
          braider_id?: string;
          starts_at?: string;
          ends_at?: string;
          kind?: 'block' | 'open';
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'availability_overrides_braider_id_fkey';
            columns: ['braider_id'];
            isOneToOne: false;
            referencedRelation: 'braiders';
            referencedColumns: ['id'];
          }
        ];
      };
      bookings: {
        Row: {
          id: string;
          client_id: string | null;
          braider_id: string;
          service_id: string;
          scheduled_at: string;
          duration_minutes: number;
          status: Database['public']['Enums']['booking_status'];
          price_cents: number;
          deposit_cents: number;
          client_notes: string | null;
          guest_name: string | null;
          guest_email: string | null;
          guest_phone: string | null;
          guest_token: string | null;
          reminder_sent_at: string | null;
          final_reminder_sent_at: string | null;
          created_at: string;
          time_range: unknown;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          braider_id: string;
          service_id: string;
          scheduled_at: string;
          duration_minutes: number;
          status?: Database['public']['Enums']['booking_status'];
          price_cents: number;
          deposit_cents: number;
          client_notes?: string | null;
          guest_name?: string | null;
          guest_email?: string | null;
          guest_phone?: string | null;
          guest_token?: string | null;
          reminder_sent_at?: string | null;
          final_reminder_sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string | null;
          braider_id?: string;
          service_id?: string;
          scheduled_at?: string;
          duration_minutes?: number;
          status?: Database['public']['Enums']['booking_status'];
          price_cents?: number;
          deposit_cents?: number;
          client_notes?: string | null;
          guest_name?: string | null;
          guest_email?: string | null;
          guest_phone?: string | null;
          guest_token?: string | null;
          reminder_sent_at?: string | null;
          final_reminder_sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookings_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_braider_id_fkey';
            columns: ['braider_id'];
            isOneToOne: false;
            referencedRelation: 'braiders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_service_id_fkey';
            columns: ['service_id'];
            isOneToOne: false;
            referencedRelation: 'services';
            referencedColumns: ['id'];
          }
        ];
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          kind: Database['public']['Enums']['payment_kind'];
          amount_cents: number;
          status: Database['public']['Enums']['payment_status'];
          stripe_payment_intent_id: string | null;
          stripe_charge_id: string | null;
          stripe_refund_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          kind: Database['public']['Enums']['payment_kind'];
          amount_cents: number;
          status?: Database['public']['Enums']['payment_status'];
          stripe_payment_intent_id?: string | null;
          stripe_charge_id?: string | null;
          stripe_refund_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          kind?: Database['public']['Enums']['payment_kind'];
          amount_cents?: number;
          status?: Database['public']['Enums']['payment_status'];
          stripe_payment_intent_id?: string | null;
          stripe_charge_id?: string | null;
          stripe_refund_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_booking_id_fkey';
            columns: ['booking_id'];
            isOneToOne: false;
            referencedRelation: 'bookings';
            referencedColumns: ['id'];
          }
        ];
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          braider_id: string;
          client_id: string;
          rating: number;
          body: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          braider_id: string;
          client_id: string;
          rating: number;
          body?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          braider_id?: string;
          client_id?: string;
          rating?: number;
          body?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_booking_id_fkey';
            columns: ['booking_id'];
            isOneToOne: true;
            referencedRelation: 'bookings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_braider_id_fkey';
            columns: ['braider_id'];
            isOneToOne: false;
            referencedRelation: 'braiders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_logs_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      stripe_webhook_events: {
        Row: {
          id: string;
          type: string;
          received_at: string;
        };
        Insert: {
          id: string;
          type: string;
          received_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          received_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      user_role: 'client' | 'braider';
      booking_status: 'pending_payment' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
      payment_kind: 'deposit' | 'balance' | 'refund';
      payment_status: 'pending' | 'succeeded' | 'failed' | 'refunded';
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
  ? PublicSchema['Tables'][PublicTableNameOrOptions] extends { Row: infer R }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
  ? PublicSchema['Tables'][PublicTableNameOrOptions] extends { Insert: infer I }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
  ? PublicSchema['Tables'][PublicTableNameOrOptions] extends { Update: infer U }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
  ? PublicSchema['Enums'][PublicEnumNameOrOptions]
  : never;
