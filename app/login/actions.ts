// app/login/actions.ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string };

export async function signIn(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  // 1) Authenticate
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: signInError.message };
  }

  // 2) Get the logged-in user (source of truth after sign-in)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Signed in, but could not load user session." };
  }

  // 3) Fetch app data from your DB (example: profiles table)
  // Change table/columns to your real schema.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    // Most common reason: RLS policy missing (can't read own profile) or row doesn't exist
    return { error: "Login ok, but profile could not be loaded. Check RLS / profile row." };
  }

  // 4) Route based on profile (optional)
  if (profile.role === "admin") redirect("/dashboard");
  if (profile.role === "tutor") redirect("/dashboard");

  // default
  redirect("/dashboard");
}
