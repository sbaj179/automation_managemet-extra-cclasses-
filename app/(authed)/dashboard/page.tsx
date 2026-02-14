import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/data";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { profile } = await getCurrentUserProfile(supabase);

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, starts_at, location, subject:subjects(name)")
    .order("starts_at", { ascending: true })
    .limit(5);

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="card">
        <h1 style={{ marginTop: 0 }}>Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}</h1>
        <p className="muted">
          Use the quick links below to manage students, subjects, sessions, and WhatsApp-ready
          updates.
        </p>
        <div className="grid grid-2">
          <Link className="card" href="/students">
            <strong>Students</strong>
            <p className="muted">Manage profiles and subject assignments.</p>
          </Link>
          <Link className="card" href="/subjects">
            <strong>Subjects</strong>
            <p className="muted">Create and update subject offerings.</p>
          </Link>
          <Link className="card" href="/sessions">
            <strong>Sessions</strong>
            <p className="muted">Schedule classes and track attendance.</p>
          </Link>
          <Link className="card" href="/messages">
            <strong>Messages</strong>
            <p className="muted">Review and send queued parent updates.</p>
          </Link>
        </div>
      </section>
      <section className="card">
        <div className="flex justify-between">
          <h2 className="section-title">Upcoming sessions</h2>
          <Link className="button secondary" href="/sessions">
            View all
          </Link>
        </div>
        {sessions && sessions.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Starts</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.subject?.name ?? ""}</td>
                  <td>{new Date(session.starts_at).toLocaleString()}</td>
                  <td>{session.location ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">No sessions scheduled yet.</div>
        )}
      </section>
    </div>
  );
}
