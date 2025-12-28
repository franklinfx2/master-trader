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
      ai_credit_usage: {
        Row: {
          created_at: string | null
          credits_used: number
          feature_name: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_used?: number
          feature_name: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_used?: number
          feature_name?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_credit_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          amount: number
          commission_rate: number
          created_at: string
          id: string
          paid_at: string | null
          payment_reference: string | null
          referral_id: string
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          amount?: number
          commission_rate?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_reference?: string | null
          referral_id: string
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          amount?: number
          commission_rate?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_reference?: string | null
          referral_id?: string
          referred_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_risk_tracker: {
        Row: {
          created_at: string
          date: string
          id: string
          risk_limit: number
          trades_count: number
          updated_at: string
          used_risk: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          risk_limit?: number
          trades_count?: number
          updated_at?: string
          used_risk?: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          risk_limit?: number
          trades_count?: number
          updated_at?: string
          used_risk?: number
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          feedback_type: string
          id: string
          message: string
          screenshot_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_type: string
          id?: string
          message: string
          screenshot_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_type?: string
          id?: string
          message?: string
          screenshot_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_price: number
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_price: number
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_phone: string | null
          id: string
          order_number: string
          payment_reference: string | null
          shipping_address: Json | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_phone?: string | null
          id?: string
          order_number: string
          payment_reference?: string | null
          shipping_address?: Json | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_phone?: string | null
          id?: string
          order_number?: string
          payment_reference?: string | null
          shipping_address?: Json | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payout_requests: {
        Row: {
          admin_notes: string | null
          affiliate_id: string
          amount: number
          id: string
          payment_details: Json | null
          payment_method: string | null
          processed_at: string | null
          processed_by: string | null
          requested_at: string
          status: string
        }
        Insert: {
          admin_notes?: string | null
          affiliate_id: string
          amount: number
          id?: string
          payment_details?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: string
        }
        Update: {
          admin_notes?: string | null
          affiliate_id?: string
          amount?: number
          id?: string
          payment_details?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          images: string[]
          is_active: boolean
          name: string
          price: number
          slug: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          is_active?: boolean
          name: string
          price: number
          slug: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          is_active?: boolean
          name?: string
          price?: number
          slug?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ai_credits_monthly_limit: number | null
          ai_credits_remaining: number | null
          ai_credits_reset_date: string | null
          ai_last_analysis_at: string | null
          ai_response_priority: string | null
          created_at: string | null
          current_streak: number | null
          email: string | null
          highest_streak: number | null
          id: string
          is_admin: boolean | null
          last_log_date: string | null
          paystack_customer_code: string | null
          paystack_subscription_code: string | null
          pending_balance: number | null
          plan: string
          referral_code: string | null
          streak_shields: number | null
          total_earnings: number | null
          updated_at: string | null
        }
        Insert: {
          ai_credits_monthly_limit?: number | null
          ai_credits_remaining?: number | null
          ai_credits_reset_date?: string | null
          ai_last_analysis_at?: string | null
          ai_response_priority?: string | null
          created_at?: string | null
          current_streak?: number | null
          email?: string | null
          highest_streak?: number | null
          id: string
          is_admin?: boolean | null
          last_log_date?: string | null
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          pending_balance?: number | null
          plan?: string
          referral_code?: string | null
          streak_shields?: number | null
          total_earnings?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_credits_monthly_limit?: number | null
          ai_credits_remaining?: number | null
          ai_credits_reset_date?: string | null
          ai_last_analysis_at?: string | null
          ai_response_priority?: string | null
          created_at?: string | null
          current_streak?: number | null
          email?: string | null
          highest_streak?: number | null
          id?: string
          is_admin?: boolean | null
          last_log_date?: string | null
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          pending_balance?: number | null
          plan?: string
          referral_code?: string | null
          streak_shields?: number | null
          total_earnings?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          created_at: string | null
          direction: string
          entry: number
          executed_at: string | null
          exit: number | null
          id: string
          notes: string | null
          pair: string
          pnl: number | null
          result: string | null
          risk_pct: number | null
          rr: number | null
          screenshot_url: string | null
          sl: number | null
          tp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          direction: string
          entry: number
          executed_at?: string | null
          exit?: number | null
          id?: string
          notes?: string | null
          pair: string
          pnl?: number | null
          result?: string | null
          risk_pct?: number | null
          rr?: number | null
          screenshot_url?: string | null
          sl?: number | null
          tp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          direction?: string
          entry?: number
          executed_at?: string | null
          exit?: number | null
          id?: string
          notes?: string | null
          pair?: string
          pnl?: number | null
          result?: string | null
          risk_pct?: number | null
          rr?: number | null
          screenshot_url?: string | null
          sl?: number | null
          tp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trades_v2_elite: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type_enum"]
          annotations_present: Database["public"]["Enums"]["yes_no_enum"] | null
          classification_status: Database["public"]["Enums"]["classification_status_enum"]
          confidence_level: number
          confirmation_present: Database["public"]["Enums"]["yes_no_enum"]
          created_at: string
          day_of_week: Database["public"]["Enums"]["day_of_week_enum"]
          drawdown_during_trade_pct: number | null
          entry_candle: Database["public"]["Enums"]["entry_candle_enum"]
          entry_model: Database["public"]["Enums"]["entry_model_enum"]
          entry_precision: Database["public"]["Enums"]["entry_precision_enum"]
          entry_price: number
          execution_tf: Database["public"]["Enums"]["execution_tf_enum"]
          exit_price: number | null
          fatigue_present: Database["public"]["Enums"]["yes_no_enum"]
          first_move_was_fake: Database["public"]["Enums"]["yes_no_enum"]
          gold_behavior_tags: Database["public"]["Enums"]["gold_behavior_tag_enum"][]
          htf_bias: Database["public"]["Enums"]["htf_bias_enum"]
          htf_screenshot: string | null
          htf_timeframe: Database["public"]["Enums"]["htf_timeframe_enum"]
          id: string
          instrument: string
          killzone: Database["public"]["Enums"]["killzone_enum"]
          legacy_trade_id: string | null
          liquidity_taken_against_bias: Database["public"]["Enums"]["yes_no_enum"]
          liquidity_taken_before_entry: Database["public"]["Enums"]["yes_no_enum"]
          liquidity_targeted: Database["public"]["Enums"]["liquidity_target_enum"][]
          ltf_entry_screenshot: string | null
          mae: number | null
          market_phase: Database["public"]["Enums"]["market_phase_enum"]
          mfe: number | null
          news_day: Database["public"]["Enums"]["yes_no_enum"]
          news_impact: Database["public"]["Enums"]["news_impact_enum"] | null
          news_timing: Database["public"]["Enums"]["news_timing_enum"] | null
          news_type: Database["public"]["Enums"]["news_type_enum"] | null
          notes: string | null
          partial_taken: Database["public"]["Enums"]["yes_no_enum"]
          post_trade_screenshot: string | null
          pre_trade_state: Database["public"]["Enums"]["pre_trade_state_enum"]
          r_multiple: number | null
          real_move_after_liquidity: Database["public"]["Enums"]["yes_no_enum"]
          result: Database["public"]["Enums"]["trade_result_enum"] | null
          revenge_trade: Database["public"]["Enums"]["yes_no_enum"]
          risk_per_trade_pct: number
          rr_planned: number
          rr_realized: number | null
          rules_followed: Database["public"]["Enums"]["yes_no_enum"]
          screenshots_valid: boolean
          session: Database["public"]["Enums"]["session_enum"]
          setup_grade: Database["public"]["Enums"]["setup_grade_enum"]
          setup_type: Database["public"]["Enums"]["setup_type_enum"]
          stop_loss: number
          stop_placement_quality: Database["public"]["Enums"]["stop_placement_quality_enum"]
          structure_state: Database["public"]["Enums"]["structure_state_enum"]
          take_profit: number
          trade_aligned_with_real_move: Database["public"]["Enums"]["yes_no_enum"]
          trade_date: string
          trade_time: string | null
          updated_at: string
          user_id: string
          would_i_take_this_trade_again:
            | Database["public"]["Enums"]["yes_no_enum"]
            | null
        }
        Insert: {
          account_type: Database["public"]["Enums"]["account_type_enum"]
          annotations_present?:
            | Database["public"]["Enums"]["yes_no_enum"]
            | null
          classification_status?: Database["public"]["Enums"]["classification_status_enum"]
          confidence_level: number
          confirmation_present: Database["public"]["Enums"]["yes_no_enum"]
          created_at?: string
          day_of_week: Database["public"]["Enums"]["day_of_week_enum"]
          drawdown_during_trade_pct?: number | null
          entry_candle: Database["public"]["Enums"]["entry_candle_enum"]
          entry_model: Database["public"]["Enums"]["entry_model_enum"]
          entry_precision: Database["public"]["Enums"]["entry_precision_enum"]
          entry_price: number
          execution_tf: Database["public"]["Enums"]["execution_tf_enum"]
          exit_price?: number | null
          fatigue_present: Database["public"]["Enums"]["yes_no_enum"]
          first_move_was_fake: Database["public"]["Enums"]["yes_no_enum"]
          gold_behavior_tags?: Database["public"]["Enums"]["gold_behavior_tag_enum"][]
          htf_bias: Database["public"]["Enums"]["htf_bias_enum"]
          htf_screenshot?: string | null
          htf_timeframe: Database["public"]["Enums"]["htf_timeframe_enum"]
          id?: string
          instrument?: string
          killzone: Database["public"]["Enums"]["killzone_enum"]
          legacy_trade_id?: string | null
          liquidity_taken_against_bias: Database["public"]["Enums"]["yes_no_enum"]
          liquidity_taken_before_entry: Database["public"]["Enums"]["yes_no_enum"]
          liquidity_targeted?: Database["public"]["Enums"]["liquidity_target_enum"][]
          ltf_entry_screenshot?: string | null
          mae?: number | null
          market_phase: Database["public"]["Enums"]["market_phase_enum"]
          mfe?: number | null
          news_day: Database["public"]["Enums"]["yes_no_enum"]
          news_impact?: Database["public"]["Enums"]["news_impact_enum"] | null
          news_timing?: Database["public"]["Enums"]["news_timing_enum"] | null
          news_type?: Database["public"]["Enums"]["news_type_enum"] | null
          notes?: string | null
          partial_taken: Database["public"]["Enums"]["yes_no_enum"]
          post_trade_screenshot?: string | null
          pre_trade_state: Database["public"]["Enums"]["pre_trade_state_enum"]
          r_multiple?: number | null
          real_move_after_liquidity: Database["public"]["Enums"]["yes_no_enum"]
          result?: Database["public"]["Enums"]["trade_result_enum"] | null
          revenge_trade: Database["public"]["Enums"]["yes_no_enum"]
          risk_per_trade_pct: number
          rr_planned: number
          rr_realized?: number | null
          rules_followed: Database["public"]["Enums"]["yes_no_enum"]
          screenshots_valid?: boolean
          session: Database["public"]["Enums"]["session_enum"]
          setup_grade: Database["public"]["Enums"]["setup_grade_enum"]
          setup_type: Database["public"]["Enums"]["setup_type_enum"]
          stop_loss: number
          stop_placement_quality: Database["public"]["Enums"]["stop_placement_quality_enum"]
          structure_state: Database["public"]["Enums"]["structure_state_enum"]
          take_profit: number
          trade_aligned_with_real_move: Database["public"]["Enums"]["yes_no_enum"]
          trade_date: string
          trade_time?: string | null
          updated_at?: string
          user_id: string
          would_i_take_this_trade_again?:
            | Database["public"]["Enums"]["yes_no_enum"]
            | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type_enum"]
          annotations_present?:
            | Database["public"]["Enums"]["yes_no_enum"]
            | null
          classification_status?: Database["public"]["Enums"]["classification_status_enum"]
          confidence_level?: number
          confirmation_present?: Database["public"]["Enums"]["yes_no_enum"]
          created_at?: string
          day_of_week?: Database["public"]["Enums"]["day_of_week_enum"]
          drawdown_during_trade_pct?: number | null
          entry_candle?: Database["public"]["Enums"]["entry_candle_enum"]
          entry_model?: Database["public"]["Enums"]["entry_model_enum"]
          entry_precision?: Database["public"]["Enums"]["entry_precision_enum"]
          entry_price?: number
          execution_tf?: Database["public"]["Enums"]["execution_tf_enum"]
          exit_price?: number | null
          fatigue_present?: Database["public"]["Enums"]["yes_no_enum"]
          first_move_was_fake?: Database["public"]["Enums"]["yes_no_enum"]
          gold_behavior_tags?: Database["public"]["Enums"]["gold_behavior_tag_enum"][]
          htf_bias?: Database["public"]["Enums"]["htf_bias_enum"]
          htf_screenshot?: string | null
          htf_timeframe?: Database["public"]["Enums"]["htf_timeframe_enum"]
          id?: string
          instrument?: string
          killzone?: Database["public"]["Enums"]["killzone_enum"]
          legacy_trade_id?: string | null
          liquidity_taken_against_bias?: Database["public"]["Enums"]["yes_no_enum"]
          liquidity_taken_before_entry?: Database["public"]["Enums"]["yes_no_enum"]
          liquidity_targeted?: Database["public"]["Enums"]["liquidity_target_enum"][]
          ltf_entry_screenshot?: string | null
          mae?: number | null
          market_phase?: Database["public"]["Enums"]["market_phase_enum"]
          mfe?: number | null
          news_day?: Database["public"]["Enums"]["yes_no_enum"]
          news_impact?: Database["public"]["Enums"]["news_impact_enum"] | null
          news_timing?: Database["public"]["Enums"]["news_timing_enum"] | null
          news_type?: Database["public"]["Enums"]["news_type_enum"] | null
          notes?: string | null
          partial_taken?: Database["public"]["Enums"]["yes_no_enum"]
          post_trade_screenshot?: string | null
          pre_trade_state?: Database["public"]["Enums"]["pre_trade_state_enum"]
          r_multiple?: number | null
          real_move_after_liquidity?: Database["public"]["Enums"]["yes_no_enum"]
          result?: Database["public"]["Enums"]["trade_result_enum"] | null
          revenge_trade?: Database["public"]["Enums"]["yes_no_enum"]
          risk_per_trade_pct?: number
          rr_planned?: number
          rr_realized?: number | null
          rules_followed?: Database["public"]["Enums"]["yes_no_enum"]
          screenshots_valid?: boolean
          session?: Database["public"]["Enums"]["session_enum"]
          setup_grade?: Database["public"]["Enums"]["setup_grade_enum"]
          setup_type?: Database["public"]["Enums"]["setup_type_enum"]
          stop_loss?: number
          stop_placement_quality?: Database["public"]["Enums"]["stop_placement_quality_enum"]
          structure_state?: Database["public"]["Enums"]["structure_state_enum"]
          take_profit?: number
          trade_aligned_with_real_move?: Database["public"]["Enums"]["yes_no_enum"]
          trade_date?: string
          trade_time?: string | null
          updated_at?: string
          user_id?: string
          would_i_take_this_trade_again?:
            | Database["public"]["Enums"]["yes_no_enum"]
            | null
        }
        Relationships: []
      }
    }
    Views: {
      trades_stats: {
        Row: {
          avg_rr: number | null
          total_pnl: number | null
          trade_count: number | null
          user_id: string | null
          win_rate: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trades_v2_elite_stats: {
        Row: {
          asia_win_rate: number | null
          avg_r_multiple: number | null
          bb_win_rate: number | null
          breakeven: number | null
          liquidity_taken_win_rate: number | null
          london_win_rate: number | null
          losses: number | null
          news_day_win_rate: number | null
          no_liquidity_win_rate: number | null
          non_news_day_win_rate: number | null
          ny_win_rate: number | null
          obc_win_rate: number | null
          obr_win_rate: number | null
          rules_broken_win_rate: number | null
          rules_followed_win_rate: number | null
          total_r: number | null
          trade_count: number | null
          user_id: string | null
          win_rate: number | null
          wins: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      deduct_ai_credits: {
        Args: { p_credits: number; p_feature_name: string; p_user_id: string }
        Returns: boolean
      }
      get_user_trade_stats: {
        Args: { target_user_id?: string }
        Returns: {
          avg_rr: number
          total_pnl: number
          trade_count: number
          user_id: string
          win_rate: number
        }[]
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      migrate_legacy_trade: {
        Args: { p_legacy_trade_id: string; p_user_id: string }
        Returns: string
      }
      reset_monthly_ai_credits: { Args: never; Returns: undefined }
    }
    Enums: {
      account_type_enum: "Demo" | "Live" | "Funded"
      classification_status_enum:
        | "legacy_unclassified"
        | "partially_classified"
        | "fully_classified"
      day_of_week_enum:
        | "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday"
      entry_candle_enum:
        | "Engulfing"
        | "Displacement"
        | "Rejection"
        | "Break & Retest"
      entry_model_enum:
        | "OB retest"
        | "Sweep → Displacement → OB"
        | "BOS pullback"
      entry_precision_enum: "Early" | "Optimal" | "Late"
      execution_tf_enum: "M1" | "M3" | "M5"
      gold_behavior_tag_enum:
        | "Trap move before real move"
        | "Fake breakout"
        | "News exaggeration"
        | "Range expansion NY"
        | "London manipulation"
        | "Clean continuation"
        | "Violent rejection"
      htf_bias_enum: "Bullish" | "Bearish" | "Range"
      htf_timeframe_enum: "H4" | "H1"
      killzone_enum: "LO" | "NYO" | "NYPM" | "None"
      liquidity_target_enum:
        | "Asian High"
        | "Asian Low"
        | "Previous Day High (PDH)"
        | "Previous Day Low (PDL)"
        | "Equal Highs"
        | "Equal Lows"
        | "Structural Liquidity"
        | "Displacement"
      market_phase_enum: "Expansion" | "Retracement" | "Consolidation"
      news_impact_enum: "LOW" | "MEDIUM" | "HIGH"
      news_timing_enum: "PRE_NEWS" | "AT_RELEASE" | "POST_NEWS"
      news_type_enum:
        | "INFLATION"
        | "RATES"
        | "EMPLOYMENT"
        | "RISK_SENTIMENT"
        | "NONE"
      pre_trade_state_enum: "Calm" | "FOMO" | "Hesitant" | "Overconfident"
      session_enum: "Asia" | "London" | "NY"
      setup_grade_enum: "A+" | "A" | "B" | "Trash"
      setup_type_enum: "OBC" | "OBR" | "BB"
      stop_placement_quality_enum: "Clean" | "Wide" | "Tight"
      structure_state_enum: "HH-HL" | "LH-LL" | "CHoCH" | "BOS"
      trade_result_enum: "Win" | "Loss" | "BE"
      yes_no_enum: "Yes" | "No"
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
      account_type_enum: ["Demo", "Live", "Funded"],
      classification_status_enum: [
        "legacy_unclassified",
        "partially_classified",
        "fully_classified",
      ],
      day_of_week_enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      entry_candle_enum: [
        "Engulfing",
        "Displacement",
        "Rejection",
        "Break & Retest",
      ],
      entry_model_enum: [
        "OB retest",
        "Sweep → Displacement → OB",
        "BOS pullback",
      ],
      entry_precision_enum: ["Early", "Optimal", "Late"],
      execution_tf_enum: ["M1", "M3", "M5"],
      gold_behavior_tag_enum: [
        "Trap move before real move",
        "Fake breakout",
        "News exaggeration",
        "Range expansion NY",
        "London manipulation",
        "Clean continuation",
        "Violent rejection",
      ],
      htf_bias_enum: ["Bullish", "Bearish", "Range"],
      htf_timeframe_enum: ["H4", "H1"],
      killzone_enum: ["LO", "NYO", "NYPM", "None"],
      liquidity_target_enum: [
        "Asian High",
        "Asian Low",
        "Previous Day High (PDH)",
        "Previous Day Low (PDL)",
        "Equal Highs",
        "Equal Lows",
        "Structural Liquidity",
        "Displacement",
      ],
      market_phase_enum: ["Expansion", "Retracement", "Consolidation"],
      news_impact_enum: ["LOW", "MEDIUM", "HIGH"],
      news_timing_enum: ["PRE_NEWS", "AT_RELEASE", "POST_NEWS"],
      news_type_enum: [
        "INFLATION",
        "RATES",
        "EMPLOYMENT",
        "RISK_SENTIMENT",
        "NONE",
      ],
      pre_trade_state_enum: ["Calm", "FOMO", "Hesitant", "Overconfident"],
      session_enum: ["Asia", "London", "NY"],
      setup_grade_enum: ["A+", "A", "B", "Trash"],
      setup_type_enum: ["OBC", "OBR", "BB"],
      stop_placement_quality_enum: ["Clean", "Wide", "Tight"],
      structure_state_enum: ["HH-HL", "LH-LL", "CHoCH", "BOS"],
      trade_result_enum: ["Win", "Loss", "BE"],
      yes_no_enum: ["Yes", "No"],
    },
  },
} as const
