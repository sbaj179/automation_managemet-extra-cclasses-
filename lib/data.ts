import type { SupabaseClient } from "@supabase/supabase-js";

export type UserProfile = {
  id: string;
  school_id: string;
  role: "admin" | "tutor";
  full_name: string | null;
};

export async function getCurrentUserProfile(supabase: SupabaseClient) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { profile: null, error: userError };
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, school_id, role, full_name")
    .eq("auth_user_id", user.id)
    .single();

  return { profile: profile as UserProfile | null, error };
}
