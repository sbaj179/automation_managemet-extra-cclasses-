"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/data";

export async function createSubject(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { profile } = await getCurrentUserProfile(supabase);

  if (!profile) {
    return { error: "Missing profile." };
  }

  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");

  const { error } = await supabase.from("subjects").insert({
    school_id: profile.school_id,
    name,
    description
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/subjects");
  return { error: "" };
}
