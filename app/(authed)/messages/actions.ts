"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function markMessageSent(formData: FormData) {
  const messageId = String(formData.get("message_id") ?? "");
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("message_queue")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", messageId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/messages");
  return { error: "" };
}
