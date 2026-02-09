import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSession } from "@/app/(authed)/sessions/actions";
import { getCurrentUserProfile } from "@/lib/data";

export default async function SessionsPage() {
  const supabase = createSupabaseServerClient();
  const { profile } = await getCurrentUserProfile(supabase);

  const sessionsQuery = supabase
    .from("sessions")
    .select("id, starts_at, location, subject:subjects(name), tutor:users(full_name)")
    .order("starts_at", { ascending: false });

  if (profile?.role === "tutor") {
    sessionsQuery.eq("tutor_id", profile.id);
  }

  const { data: sessions } = await sessionsQuery;

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .order("name", { ascending: true });

  const { data: tutors } = await supabase
    .from("users")
    .select("id, full_name, role")
    .order("full_name", { ascending: true });

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="card">
        <div className="flex justify-between">
          <h1 className="section-title">Sessions</h1>
        </div>
        {sessions && sessions.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Starts</th>
                <th>Location</th>
                <th>Tutor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const startsAt = new Date(session.starts_at);
                const status = startsAt > new Date() ? "Upcoming" : "Completed";

                return (
                  <tr key={session.id}>
                    <td>
                      <Link className="button link" href={`/sessions/${session.id}`}>
                        {session.subject?.name ?? ""}
                      </Link>
                    </td>
                    <td>{startsAt.toLocaleString()}</td>
                    <td>{session.location ?? "-"}</td>
                    <td>{session.tutor?.full_name ?? "-"}</td>
                    <td>
                      <span className="badge">{status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty">No sessions yet.</div>
        )}
      </section>

      {profile?.role === "admin" ? (
        <section className="card" style={{ maxWidth: 600 }}>
          <h2 className="section-title">Create session</h2>
          <form action={createSession}>
            <div className="form-row">
              <label className="label">Subject</label>
              <select className="select" name="subject_id" required>
                <option value="">Select subject</option>
                {subjects?.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label className="label">Date & time</label>
              <input className="input" name="starts_at" type="datetime-local" required />
            </div>
            <div className="form-row">
              <label className="label">Tutor (optional)</label>
              <select className="select" name="tutor_id">
                <option value="">Unassigned</option>
                {tutors?.map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.full_name ?? tutor.role}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label className="label">Location</label>
              <input className="input" name="location" />
            </div>
            <label className="flex" style={{ marginBottom: 16 }}>
              <input type="checkbox" name="auto_assign" />
              <span>Auto-assign students based on subject</span>
            </label>
            <button className="button" type="submit">
              Create session
            </button>
          </form>
        </section>
      ) : (
        <section className="card">
          <h2 className="section-title">Tutor access</h2>
          <p className="notice">Tutors can view assigned sessions and mark attendance.</p>
        </section>
      )}
    </div>
  );
}
