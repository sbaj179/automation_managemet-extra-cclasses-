"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markMessageSent(messageId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("message_queue")
    .update({ status: "sent" })
    .eq("id", messageId);

  if (error) throw new Error(error.message);

  revalidatePath("/messages");
}

export async function markMessageFailed(messageId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("message_queue")
    .update({ status: "failed" })
    .eq("id", messageId);

  if (error) throw new Error(error.message);

  revalidatePath("/messages");
}

export async function retryMessage(messageId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("message_queue")
    .update({
      status: "queued",
      send_after: new Date().toISOString(), // make it due immediately
    })
    .eq("id", messageId);

  if (error) throw new Error(error.message);

  revalidatePath("/messages");
}

