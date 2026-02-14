import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // If exchange fails, force login
      return NextResponse.redirect(new URL("/login", url.origin));
    }
  }

  // If they land here without code, still route them somewhere useful
  return NextResponse.redirect(new URL("/onboarding", url.origin));
}
