import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AuthedLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    // If Supabase returns an error, treat it as unauthenticated for safety.
    redirect("/login");
  }

  if (!session) {
    redirect("/login");
  }

  const { profile } = await getCurrentUserProfile(supabase);

  return (
    <>
      <NavBar profile={profile} />
      <main>
        <div className="container">{children}</div>
      </main>
    </>
  );
}
