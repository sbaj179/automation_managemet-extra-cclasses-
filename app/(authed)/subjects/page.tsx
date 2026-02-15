import { createServerSupabase } from "@/lib/supabase/server";
import { createSubject } from "@/app/(authed)/subjects/actions";
import { getCurrentUserProfile } from "@/lib/data";

export default async function SubjectsPage() {
  const supabase = await await createServerSupabase();
  const { profile } = await getCurrentUserProfile(supabase);

  if (profile?.role === "tutor") {
    return (
      <div className="card">
        <h1 className="section-title">Subjects</h1>
        <p className="notice">Only admins can manage subjects in this MVP.</p>
      </div>
    );
  }

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name, description")
    .order("name", { ascending: true });

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="card">
        <div className="flex justify-between">
          <h1 className="section-title">Subjects</h1>
        </div>
        {subjects && subjects.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id}>
                  <td>{subject.name}</td>
                  <td>{subject.description ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">No subjects yet.</div>
        )}
      </section>

      <section className="card" style={{ maxWidth: 520 }}>
        <h2 className="section-title">Add subject</h2>
        <form action={createSubject}>
          <div className="form-row">
            <label className="label">Name</label>
            <input className="input" name="name" required />
          </div>
          <div className="form-row">
            <label className="label">Description</label>
            <textarea className="textarea" name="description" rows={3} />
          </div>
          <button className="button" type="submit">
            Add subject
          </button>
        </form>
      </section>
    </div>
  );
}
