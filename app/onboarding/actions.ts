"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type OnboardingState = { error: string };

export async function onboard(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const schoolName = String(formData.get("school_name") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim() || null;

  if (!schoolName) return { error: "School / class name is required." };

  const supabase = await createClient();

  // ensure session exists
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated. Please sign in again." };

  const { error } = await supabase.rpc("onboard_school_admin", {
    p_school_name: schoolName,
    p_full_name: fullName,
  });

  if (error) return { error: error.message };

  redirect("/dashboard");
}
