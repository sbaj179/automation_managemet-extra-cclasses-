import { createClient } from "@/lib/supabase/server";
import { assignSubjects, createStudent, importStudentsCsv } from "@/app/(authed)/students/actions";
import { getCurrentUserProfile } from "@/lib/data";

export default async function StudentsPage() {
  const supabase = await createClient();
  const { profile } = await getCurrentUserProfile(supabase);

  if (profile?.role === "tutor") {
    return (
      <div className="card">
        <h1 className="section-title">Students</h1>
        <p className="notice">Only admins can manage students in this MVP.</p>
      </div>
    );
  }

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, grade, guardian_name, guardian_phone")
    .order("full_name", { ascending: true });

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="card">
        <div className="flex justify-between">
          <h1 className="section-title">Students</h1>
        </div>
        {students && students.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Grade/Class</th>
                <th>Guardian</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.full_name}</td>
                  <td>{student.grade ?? "-"}</td>
                  <td>{student.guardian_name ?? "-"}</td>
                  <td>{student.guardian_phone ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">No students yet.</div>
        )}
      </section>

      <section className="grid grid-2">
        <div className="card">
          <h2 className="section-title">Add student</h2>
          <form action={createStudent}>
            <div className="form-row">
              <label className="label">Full name</label>
              <input className="input" name="full_name" required />
            </div>
            <div className="form-row">
              <label className="label">Grade/Class</label>
              <input className="input" name="grade" />
            </div>
            <div className="form-row">
              <label className="label">Guardian name</label>
              <input className="input" name="guardian_name" />
            </div>
            <div className="form-row">
              <label className="label">Guardian phone</label>
              <input className="input" name="guardian_phone" />
            </div>
            <button className="button" type="submit">
              Add student
            </button>
          </form>
        </div>
        <div className="card">
          <h2 className="section-title">Assign subjects</h2>
          <form action={assignSubjects}>
            <div className="form-row">
              <label className="label">Student</label>
              <select className="select" name="student_id" required>
                <option value="">Select student</option>
                {students?.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label className="label">Subjects</label>
              <select className="select" name="subject_ids" multiple size={5}>
                {subjects?.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="button secondary" type="submit">
              Save assignments
            </button>
          </form>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">CSV import (optional)</h2>
        <p className="muted">One student per line: full_name, grade, guardian_name, guardian_phone</p>
        <form action={importStudentsCsv}>
          <textarea className="textarea" name="csv" rows={4} />
          <div style={{ marginTop: 12 }}>
            <button className="button secondary" type="submit">
              Import CSV
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}


