import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY (or legacy VITE_SUPABASE_ANON_KEY). Supabase reads will fail until these are set."
  );
}

if (
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
) {
  // Legacy anon keys can be disabled in newer Supabase projects.
  console.warn(
    "Using legacy VITE_SUPABASE_ANON_KEY. If you receive 'Legacy API keys are disabled', switch to VITE_SUPABASE_PUBLISHABLE_KEY from Supabase project settings."
  );
}

export const supabase = createClient(
  supabaseUrl ?? "",
  supabasePublishableKey ?? ""
);
