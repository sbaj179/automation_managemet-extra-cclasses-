import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { profile } = await getCurrentUserProfile(supabase);

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, starts_at, location, subject:subjects(name)")
    .order("starts_at", { ascending: true })
    .limit(5);

  return (
    <div className="grid" style={{ gap: 24 }}>
      {/* ... keep your existing JSX ... */}
      <div />
    </div>
  );
}

