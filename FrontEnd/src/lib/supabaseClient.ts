import { createClient } from "@supabase/supabase-js";

// ✅ Replace with your Supabase project values from https://supabase.com/dashboard/project/<your-project>/settings/api
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
