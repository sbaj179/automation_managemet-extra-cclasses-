"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/data";

export async function createSession(formData: FormData) {
  const supabase = await await createServerSupabase();
  const { profile } = await getCurrentUserProfile(supabase);

  if (!profile) {
    return { error: "Missing profile." };
  }

  const subject_id = String(formData.get("subject_id") ?? "");
  const starts_at = String(formData.get("starts_at") ?? "");
  const tutor_id = String(formData.get("tutor_id") ?? "");
  const location = String(formData.get("location") ?? "");
  const autoAssign = formData.get("auto_assign") === "on";

  const { data: session, error } = await supabase
    .from("sessions")
    .insert({
      school_id: profile.school_id,
      subject_id,
      starts_at,
      tutor_id: tutor_id || null,
      location
    })
    .select("id")
    .single();

  if (error || !session) {
    return { error: error?.message ?? "Unable to create session." };
  }

  if (autoAssign) {
    const { data: studentSubjects } = await supabase
      .from("student_subjects")
      .select("student_id")
      .eq("subject_id", subject_id);

    if (studentSubjects && studentSubjects.length > 0) {
      const { error: assignError } = await supabase.from("session_students").insert(
        studentSubjects.map((row) => ({
          school_id: profile.school_id,
          session_id: session.id,
          student_id: row.student_id
        }))
      );

      if (assignError) {
        return { error: assignError.message };
      }
    }
  }

  revalidatePath("/sessions");
  return { error: "" };
}
