import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import MessageActions from "@/components/MessageActions";
import { markMessageSent } from "@/app/(authed)/messages/actions";
import { getCurrentUserProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

const statusOptions = ["queued", "sent", "failed"] as const;
type Status = (typeof statusOptions)[number];

type MessageRow = {
  id: string;
  message_body: string;
  guardian_phone: string;
  status: Status;
  send_after: string;
  students: { full_name: string | null }[] | null; // relation as array
};

function chipClass(active: boolean) {
  return `button ${active ? "" : "secondary"}`;
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = await createServerSupabase();
  const { profile } = await getCurrentUserProfile(supabase);

  if (profile?.role === "tutor") {
    return (
      <div className="card">
        <h1 className="section-title">Message queue</h1>
        <p className="notice">Only admins can send and manage queued messages.</p>
      </div>
    );
  }

  const rawStatus = searchParams.status;
  const status: Status = statusOptions.includes(rawStatus as Status) ? (rawStatus as Status) : "queued";

  const { data, error } = await supabase
    .from("message_queue")
    .select("id, message_body, guardian_phone, status, send_after, students(full_name)")
    .eq("status", status)
    .order("send_after", { ascending: true });

  if (error) {
    return (
      <div className="card">
        <h1 className="section-title">Message queue</h1>
        <p className="notice">{error.message}</p>
      </div>
    );
  }

  const messages = (data ?? []) as unknown as MessageRow[];

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="card">
        <div className="flex justify-between" style={{ alignItems: "flex-start", gap: 16 }}>
          <div>
            <h1 className="section-title" style={{ marginBottom: 6 }}>
              Message queue
            </h1>
            <p className="muted" style={{ margin: 0 }}>
              Messages are generated automatically. Your job is just to send (WhatsApp) and mark sent.
            </p>
          </div>

          <div className="flex" style={{ gap: 10 }}>
            <Link className="button secondary" href="/dashboard">
              Dashboard
            </Link>
          </div>
        </div>

        <div className="flex" style={{ marginTop: 14, gap: 10, flexWrap: "wrap" }}>
          {statusOptions.map((opt) => (
            <Link key={opt} className={chipClass(opt === status)} href={`/messages?status=${opt}`}>
              {opt}
            </Link>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="flex justify-between" style={{ alignItems: "center", gap: 12 }}>
          <h2 className="section-title" style={{ margin: 0 }}>
            {status === "queued" ? "Ready to send" : status === "sent" ? "Sent messages" : "Failed messages"}
          </h2>
          <span className="muted" style={{ fontSize: 13 }}>
            {messages.length} messages
          </span>
        </div>

        {messages.length > 0 ? (
          <table className="table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th style={{ width: 220 }}>Student</th>
                <th style={{ width: 190 }}>Send after</th>
                <th>Message</th>
                <th style={{ width: 240 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => {
                const studentName = m.students?.[0]?.full_name ?? "-";
                return (
                  <tr key={m.id}>
                    <td>{studentName}</td>
                    <td>{new Date(m.send_after).toLocaleString()}</td>
                    <td style={{ maxWidth: 420, whiteSpace: "pre-wrap" }}>{m.message_body}</td>
                    <td>
                      <MessageActions phone={m.guardian_phone} message={m.message_body} />
                      {status !== "sent" ? (
                        <form action={markMessageSent} style={{ marginTop: 8 }}>
                          <input type="hidden" name="message_id" value={m.id} />
                          <button className="button success" type="submit">
                            Mark as sent
                          </button>
                        </form>
                      ) : (
                        <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
                          Already sent ✅
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty" style={{ marginTop: 12 }}>
            No messages in this status.
          </div>
        )}
      </section>
    </div>
  );
}
