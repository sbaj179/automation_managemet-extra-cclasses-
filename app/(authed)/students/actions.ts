"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/data";

export async function createStudent(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { profile } = await getCurrentUserProfile(supabase);

  if (!profile) {
    return { error: "Missing profile." };
  }

  const full_name = String(formData.get("full_name") ?? "");
  const grade = String(formData.get("grade") ?? "");
  const guardian_name = String(formData.get("guardian_name") ?? "");
  const guardian_phone = String(formData.get("guardian_phone") ?? "");

  const { error } = await supabase.from("students").insert({
    school_id: profile.school_id,
    full_name,
    grade,
    guardian_name,
    guardian_phone
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/students");
  return { error: "" };
}

export async function assignSubjects(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { profile } = await getCurrentUserProfile(supabase);

  if (!profile) {
    return { error: "Missing profile." };
  }

  const studentId = String(formData.get("student_id") ?? "");
  const subjects = formData.getAll("subject_ids").map(String);

  if (!studentId) {
    return { error: "Select a student." };
  }

  const { error: deleteError } = await supabase
    .from("student_subjects")
    .delete()
    .eq("student_id", studentId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  if (subjects.length > 0) {
    const { error } = await supabase.from("student_subjects").insert(
      subjects.map((subject_id) => ({
        school_id: profile.school_id,
        student_id: studentId,
        subject_id
      }))
    );

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/students");
  return { error: "" };
}

export async function importStudentsCsv(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { profile } = await getCurrentUserProfile(supabase);

  if (!profile) {
    return { error: "Missing profile." };
  }

  const raw = String(formData.get("csv") ?? "");
  const rows = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length === 0) {
    return { error: "Provide CSV rows." };
  }

  const students = rows.map((line) => {
    const [full_name, grade, guardian_name, guardian_phone] = line
      .split(",")
      .map((value) => value.trim());

    return {
      school_id: profile.school_id,
      full_name,
      grade,
      guardian_name,
      guardian_phone
    };
  });

  const { error } = await supabase.from("students").insert(students);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/students");
  return { error: "" };
}
