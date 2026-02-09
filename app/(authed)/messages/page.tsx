import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import MessageActions from "@/components/MessageActions";
import { markMessageSent } from "@/app/(authed)/messages/actions";
import { getCurrentUserProfile } from "@/lib/data";

const statusOptions = ["queued", "sent", "failed"] as const;

export default async function MessagesPage({
  searchParams
}: {
  searchParams: { status?: string };
}) {
  const supabase = createSupabaseServerClient();
  const { profile } = await getCurrentUserProfile(supabase);

  if (profile?.role === "tutor") {
    return (
      <div className="card">
        <h1 className="section-title">Message queue</h1>
        <p className="notice">Only admins can send and manage queued messages.</p>
      </div>
    );
  }

  const status = statusOptions.includes(searchParams.status as typeof statusOptions[number])
    ? (searchParams.status as typeof statusOptions[number])
    : "queued";

  const { data: messages } = await supabase
    .from("message_queue")
    .select(
      "id, message_body, guardian_phone, status, send_after, student:students(full_name)"
    )
    .eq("status", status)
    .order("send_after", { ascending: true });

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="card">
        <div className="flex justify-between">
          <h1 className="section-title">Message queue</h1>
          <div className="flex">
            {statusOptions.map((option) => (
              <Link
                key={option}
                className={`button ${option === status ? "" : "secondary"}`}
                href={`/messages?status=${option}`}
              >
                {option}
              </Link>
            ))}
          </div>
        </div>
        {messages && messages.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Send after</th>
                <th>Message</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id}>
                  <td>{message.student?.full_name ?? "-"}</td>
                  <td>{new Date(message.send_after).toLocaleString()}</td>
                  <td style={{ maxWidth: 320 }}>{message.message_body}</td>
                  <td>
                    <MessageActions
                      phone={message.guardian_phone}
                      message={message.message_body}
                    />
                    <form action={markMessageSent} style={{ marginTop: 8 }}>
                      <input type="hidden" name="message_id" value={message.id} />
                      <button className="button success" type="submit">
                        Mark as sent
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">No messages in this status.</div>
        )}
      </section>
    </div>
  );
}
