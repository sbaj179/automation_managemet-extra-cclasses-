import { createSupabaseServerClient } from "@/lib/supabase/server";
import { saveAttendance } from "@/app/(authed)/sessions/[id]/actions";

export default async function SessionDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const { id } = params;

  const { data: session } = await supabase
    .from("sessions")
    .select(
      "id, starts_at, location, subject:subjects(name), tutor:users(full_name, role)"
    )
    .eq("id", id)
    .single();

  const { data: assigned } = await supabase
    .from("session_students")
    .select("student_id, student:students(full_name, guardian_name, guardian_phone)")
    .eq("session_id", id)
    .order("student(full_name)");

  const { data: attendance } = await supabase
    .from("attendance")
    .select("student_id, present")
    .eq("session_id", id);

  const attendanceMap = new Map(attendance?.map((row) => [row.student_id, row.present]));

  if (!session) {
    return <div className="card">Session not found.</div>;
  }

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="card">
        <h1 style={{ marginTop: 0 }}>{session.subject?.name ?? "Session"}</h1>
        <p className="muted">
          {new Date(session.starts_at).toLocaleString()} · {session.location ?? "TBA"}
        </p>
        <p className="muted">Tutor: {session.tutor?.full_name ?? session.tutor?.role ?? "-"}</p>
      </section>

      <section className="card">
        <h2 className="section-title">Attendance</h2>
        <form action={saveAttendance}>
          <input type="hidden" name="session_id" value={id} />
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Guardian</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assigned && assigned.length > 0 ? (
                assigned.map((row) => {
                  const present = attendanceMap.get(row.student_id) ?? false;

                  return (
                    <tr key={row.student_id}>
                      <td>{row.student?.full_name ?? ""}</td>
                      <td>
                        {row.student?.guardian_name ?? "-"}
                        <div className="muted" style={{ fontSize: "0.85rem" }}>
                          {row.student?.guardian_phone ?? ""}
                        </div>
                      </td>
                      <td>
                        <select
                          className="select"
                          name={`status_${row.student_id}`}
                          defaultValue={present ? "present" : "absent"}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3}>
                    <div className="empty">No students assigned to this session.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ marginTop: 16 }}>
            <button className="button" type="submit">
              Save attendance & queue messages
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
