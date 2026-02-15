import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const cookieStore = await cookies();
  const cookieNames = cookieStore.getAll().map((cookie) => cookie.name);
  const hasSbCookie = cookieNames.some((name) => name.startsWith("sb-"));

  const supabase = await await createServerSupabase();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return NextResponse.json({
    cookieNames,
    hasSbCookie,
    sessionNull: !session,
    userNull: !user
  });
}
