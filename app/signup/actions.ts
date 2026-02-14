// app/signup/actions.ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignupState = { error: string };

function getBaseUrl() {
  // Prefer explicit env for prod/tunnel; fallback to localhost
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, "");
  return "http://localhost:3000";
}

export async function signUp(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName) return { error: "Full name is required." };
  if (!email) return { error: "Email is required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = await createClient();

  const baseUrl = getBaseUrl();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  // If confirmations are ON, session is usually null => user must verify email
  if (!data.session) {
    redirect(`/check-email?email=${encodeURIComponent(email)}`);
  }

  // If session exists immediately (confirmations OFF), go onboard
  redirect("/onboarding");
}
