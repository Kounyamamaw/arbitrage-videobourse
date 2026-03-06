import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  || "";
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Database = {
  public: {
    Tables: {
      brokers: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category: string;
          deposit_minimum: number;
          regulation: string[];
          trustpilot_score: number;
          trustpilot_count: number;
          affiliate_url: string;
          score_overall: number;
          is_active: boolean;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      affiliate_clicks: {
        Row: {
          id: string;
          broker_id: string;
          clicked_at: string;
          source_page: string;
          device_type: string;
          session_id: string;
        };
      };
    };
  };
};
