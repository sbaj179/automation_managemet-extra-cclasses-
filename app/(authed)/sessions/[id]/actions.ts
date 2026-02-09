"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/data";

function resolveSendAfter(now: Date) {
  const startHour = 8;
  const endHour = 17;
  const sendAfter = new Date(now);

  if (now.getHours() < startHour) {
    sendAfter.setHours(startHour, 0, 0, 0);
    return sendAfter;
  }

  if (now.getHours() >= endHour) {
    sendAfter.setDate(now.getDate() + 1);
    sendAfter.setHours(startHour, 0, 0, 0);
    return sendAfter;
  }

  return now;
}

export async function saveAttendance(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { profile } = await getCurrentUserProfile(supabase);

  if (!profile) {
    return { error: "Missing profile." };
  }

  const sessionId = String(formData.get("session_id") ?? "");

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, starts_at, subject_id, subject:subjects(name)")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    return { error: sessionError?.message ?? "Session not found." };
  }

  const { data: assigned } = await supabase
    .from("session_students")
    .select("student_id, student:students(full_name, guardian_name, guardian_phone)")
    .eq("session_id", sessionId);

  const attendanceRows =
    assigned?.map((row) => {
      const status = String(formData.get(`status_${row.student_id}`) ?? "absent");
      const present = status === "present";

      return {
        school_id: profile.school_id,
        session_id: sessionId,
        student_id: row.student_id,
        present
      };
    }) ?? [];

  if (attendanceRows.length > 0) {
    const { error: attendanceError } = await supabase
      .from("attendance")
      .upsert(attendanceRows, { onConflict: "session_id,student_id" });

    if (attendanceError) {
      return { error: attendanceError.message };
    }
  }

  const { data: nextSession } = await supabase
    .from("sessions")
    .select("starts_at")
    .eq("subject_id", session.subject_id)
    .gt("starts_at", session.starts_at)
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const nextSessionDate = nextSession?.starts_at
    ? new Date(nextSession.starts_at).toLocaleString()
    : "TBA";
  const now = new Date();
  const sendAfter = resolveSendAfter(now);

  const messages =
    assigned?.map((row) => {
      const student = row.student;
      const status = String(formData.get(`status_${row.student_id}`) ?? "absent");
      const statusText = status === "present" ? "present" : "absent";

      return {
        school_id: profile.school_id,
        student_id: row.student_id,
        guardian_phone: student?.guardian_phone ?? "",
        message_body: `Hi ${student?.guardian_name ?? "there"}, ${student?.full_name ?? "Student"} was ${statusText} for ${session.subject?.name ?? "class"} on ${new Date(
          session.starts_at
        ).toLocaleString()}. Next session: ${nextSessionDate}. Reply here if any issues.`,
        status: "queued",
        send_after: sendAfter.toISOString()
      };
    }) ?? [];

  if (messages.length > 0) {
    const { error: messageError } = await supabase.from("message_queue").insert(messages);

    if (messageError) {
      return { error: messageError.message };
    }
  }

  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath("/messages");
  return { error: "" };
}
