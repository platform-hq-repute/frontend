import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types matching Supabase tables
export interface Tables {
  users: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    created_at: string;
    status: 'active' | 'suspended' | 'pending';
    business_count: number;
    last_login_at: string | null;
  };
  locations: {
    id: string;
    name: string;
    address: string;
    google_place_id: string | null;
    average_rating: number;
    total_reviews: number;
    pending_responses: number;
    owner_id: string;
    owner_name: string;
    created_at: string;
    status: 'active' | 'inactive';
  };
  reviews: {
    id: string;
    location_id: string;
    location_name: string;
    platform: 'google' | 'trustpilot' | 'yelp';
    author_name: string;
    author_avatar: string | null;
    rating: number;
    content: string;
    created_at: string;
    status: 'pending' | 'ai_ready' | 'responded';
    ai_response: string | null;
    published_response: string | null;
    responded_at: string | null;
  };
  admins: {
    id: string;
    email: string;
    name: string;
    role: 'super_admin' | 'admin';
    created_at: string;
    last_login_at: string | null;
    password_hash: string;
  };
}
