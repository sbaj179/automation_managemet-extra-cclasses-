import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import NavBar from "@/components/NavBar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AuthedLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

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
