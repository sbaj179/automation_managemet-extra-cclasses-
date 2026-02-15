import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { createSession } from "@/app/(authed)/sessions/actions";
import { getCurrentUserProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

type SessionRow = {
  id: string;
  starts_at: string;
  location: string | null;
  subjects: { name: string }[] | null;
  users: { full_name: string | null }[] | null;
};

type SubjectRow = { id: string; name: string };
type TutorRow = { id: string; full_name: string | null; role: string | null };

function badgeTone(status: "Upcoming" | "Completed") {
  return status === "Upcoming" ? "badge" : "badge secondary";
}

export default async function SessionsPage() {
  const supabase = await createServerSupabase();
  const { profile } = await getCurrentUserProfile(supabase);

  // Load sessions (avoid aliasing; treat relations as arrays)
  let sessionsQuery = supabase
    .from("sessions")
    .select("id, starts_at, location, subjects(name), users(full_name)")
    .order("starts_at", { ascending: false });

  // Tutors only see their own sessions
  if (profile?.role === "tutor") {
    // NOTE: assumes tutor_id is a FK to public.users.id
    sessionsQuery = sessionsQuery.eq("tutor_id", profile.id);
  }

  const [{ data: sessionsRaw, error: sessionsError }, { data: subjectsRaw }, { data: tutorsRaw }] =
    await Promise.all([
      sessionsQuery,
      supabase.from("subjects").select("id, name").order("name", { ascending: true }),
      supabase.from("users").select("id, full_name, role").order("full_name", { ascending: true }),
    ]);

  if (sessionsError) {
    return (
      <div className="card">
        <h1 className="section-title">Sessions</h1>
        <p className="notice">{sessionsError.message}</p>
      </div>
    );
  }

  const sessions = (sessionsRaw ?? []) as unknown as SessionRow[];
  const subjects = (subjectsRaw ?? []) as SubjectRow[];
  const tutors = (tutorsRaw ?? []) as TutorRow[];

  const now = new Date();

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="card">
        <div className="flex justify-between" style={{ alignItems: "flex-start", gap: 16 }}>
          <div>
            <h1 className="section-title" style={{ marginBottom: 6 }}>
              Sessions
            </h1>
            <p className="muted" style={{ margin: 0 }}>
              {profile?.role === "admin"
                ? "Create sessions, assign tutors, and keep the schedule clean."
                : "View your assigned sessions and track what’s coming next."}
            </p>
          </div>

          <div className="flex" style={{ gap: 10 }}>
            <Link className="button secondary" href="/dashboard">
              Dashboard
            </Link>
            {profile?.role === "admin" ? (
              <a className="button" href="#create-session">
                + Create session
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="flex justify-between" style={{ alignItems: "center", gap: 12 }}>
          <h2 className="section-title" style={{ margin: 0 }}>
            Session list
          </h2>
          <span className="muted" style={{ fontSize: 13 }}>
            {sessions.length} total
          </span>
        </div>

        {sessions.length > 0 ? (
          <table className="table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th style={{ width: 220 }}>Subject</th>
                <th>Starts</th>
                <th>Location</th>
                <th style={{ width: 200 }}>Tutor</th>
                <th style={{ width: 140 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const startsAt = new Date(s.starts_at);
                const status: "Upcoming" | "Completed" = startsAt > now ? "Upcoming" : "Completed";
                const subjectName = s.subjects?.[0]?.name ?? "";
                const tutorName = s.users?.[0]?.full_name ?? "-";

                return (
                  <tr key={s.id}>
                    <td>
                      <Link className="button link" href={`/sessions/${s.id}`}>
                        {subjectName || "Open session"}
                      </Link>
                    </td>
                    <td>{startsAt.toLocaleString()}</td>
                    <td>{s.location ?? "-"}</td>
                    <td>{tutorName}</td>
                    <td>
                      <span className={badgeTone(status)}>{status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty" style={{ marginTop: 12 }}>
            No sessions yet.
          </div>
        )}
      </section>

      {profile?.role === "admin" ? (
        <section id="create-session" className="card" style={{ maxWidth: 720 }}>
          <div style={{ marginBottom: 12 }}>
            <h2 className="section-title" style={{ marginBottom: 6 }}>
              Create session
            </h2>
            <p className="muted" style={{ margin: 0 }}>
              Fast input. Everything else (student assignment + message queue) should be automated.
            </p>
          </div>

          <form action={createSession}>
            <div className="form-row">
              <label className="label">Subject</label>
              <select className="select" name="subject_id" required>
                <option value="">Select subject</option>
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.name}
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
                {tutors.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name ?? t.role ?? "Tutor"}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label className="label">Location</label>
              <input className="input" name="location" placeholder="e.g. Room 3" />
            </div>

            <label className="flex" style={{ marginBottom: 16, gap: 10 }}>
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
          <p className="notice" style={{ marginBottom: 0 }}>
            You can view assigned sessions and mark attendance. Message queue is admin-only.
          </p>
        </section>
      )}
    </div>
  );
}
