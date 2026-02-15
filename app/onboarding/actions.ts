"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export type OnboardingState = { error: string };

export async function onboard(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const name = String(formData.get("school_name") ?? "").trim();
  const code = String(formData.get("school_code") ?? "").trim();

  if (!name) return { error: "School name is required." };
  if (!code) return { error: "School code is required." };

  const supabase = await createServerSupabase();

  const { data, error } = await supabase.rpc("onboard_school", {
    p_name: name,
    p_school_code: code,
  });

  if (error) return { error: error.message };
  if (!data) return { error: "Onboarding failed (no school id returned)." };

  redirect("/dashboard");
}
