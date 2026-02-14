import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SendButton from "./SendButton";

type QueueRow = {
  id: string;
  guardian_phone: string;
  message_body: string;
  send_after: string;
  status: "queued" | "failed" | "sent";
  created_at: string;
};

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.06)",
        fontSize: 12,
        opacity: 0.9,
      }}
    >
      {children}
    </span>
  );
}

export default async function MessagesPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const nowIso = new Date().toISOString();

  // Main work queue: FAILED + DUE QUEUED
  const { data: dueOrFailedRaw, error: dueOrFailedError } = await supabase
    .from("message_queue")
    .select("id, guardian_phone, message_body, send_after, status, created_at")
    .or(`status.eq.failed,and(status.eq.queued,send_after.lte.${nowIso})`)
    .order("status", { ascending: true }) // failed then queued
    .order("send_after", { ascending: true })
    .limit(200);

  if (dueOrFailedError) {
    return (
      <main style={{ padding: 24 }}>
        <div style={{ color: "white" }}>
          Failed to load queue: {dueOrFailedError.message}
        </div>
      </main>
    );
  }

  const dueOrFailed = (dueOrFailedRaw ?? []) as QueueRow[];

  // Scheduled: QUEUED but future
  const { data: scheduledRaw, error: scheduledError } = await supabase
    .from("message_queue")
    .select("id, guardian_phone, message_body, send_after, status, created_at")
    .eq("status", "queued")
    .gt("send_after", nowIso)
    .order("send_after", { ascending: true })
    .limit(200);

  if (scheduledError) {
    return (
      <main style={{ padding: 24 }}>
        <div style={{ color: "white" }}>
          Failed to load scheduled: {scheduledError.message}
        </div>
      </main>
    );
  }

  const scheduled = (scheduledRaw ?? []) as QueueRow[];

  return (
    <main style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "baseline",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Message Queue</h1>
          <p style={{ margin: "8px 0 0 0", opacity: 0.7, fontSize: 13 }}>
            Main list shows <strong>Due</strong> queued messages + <strong>Failed</strong> messages.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Chip>Due/Failed: {dueOrFailed.length}</Chip>
          <Chip>Scheduled: {scheduled.length}</Chip>
        </div>
      </div>

      {/* MAIN: Due + Failed */}
      <section style={{ marginTop: 16 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Now</h2>
          <span style={{ opacity: 0.7, fontSize: 13 }}>
            Execute these messages.
          </span>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {dueOrFailed.length > 0 ? (
            dueOrFailed.map((m) => (
              <div
                key={m.id}
                style={{
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(8,10,18,0.78)",
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ fontSize: 12, opacity: 0.75 }}>
                      To: <strong style={{ opacity: 0.95 }}>{m.guardian_phone}</strong> • Status:{" "}
                      <strong style={{ opacity: 0.95 }}>{m.status}</strong>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      Send after: {new Date(m.send_after).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(0,0,0,0.35)",
                    whiteSpace: "pre-wrap",
                    fontSize: 13,
                    lineHeight: 1.45,
                  }}
                >
                  {m.message_body}
                </div>

                <div style={{ marginTop: 12 }}>
                  <SendButton
                    id={m.id}
                    phone={m.guardian_phone}
                    message={m.message_body}
                    status={m.status}
                  />
                </div>
              </div>
            ))
          ) : (
            <div style={{ marginTop: 10, opacity: 0.7 }}>
              No due or failed messages.
            </div>
          )}
        </div>
      </section>

      {/* SCHEDULED (collapsed by default via <details>) */}
      <section style={{ marginTop: 18 }}>
        <details
          style={{
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(8,10,18,0.55)",
            padding: 14,
          }}
        >
          <summary
            style={{
              cursor: "pointer",
              listStyle: "none",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 800 }}>Scheduled</span>
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                Queued but not due yet. Mainly for visibility.
              </span>
            </div>
            <Chip>{scheduled.length}</Chip>
          </summary>

          <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
            {scheduled.length > 0 ? (
              scheduled.map((m) => (
                <div
                  key={m.id}
                  style={{
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(0,0,0,0.30)",
                    padding: 12,
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    To: <strong style={{ opacity: 0.95 }}>{m.guardian_phone}</strong> • Due:{" "}
                    <strong style={{ opacity: 0.95 }}>
                      {new Date(m.send_after).toLocaleString()}
                    </strong>
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      padding: 10,
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(8,10,18,0.55)",
                      whiteSpace: "pre-wrap",
                      fontSize: 13,
                      lineHeight: 1.45,
                      opacity: 0.95,
                    }}
                  >
                    {m.message_body}
                  </div>

                  {/* Optional: allow early send by using the same SendButton */}
                  <div style={{ marginTop: 10, opacity: 0.9 }}>
                    <SendButton
                      id={m.id}
                      phone={m.guardian_phone}
                      message={m.message_body}
                      status={m.status}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ opacity: 0.7 }}>No scheduled messages.</div>
            )}
          </div>
        </details>
      </section>
    </main>
  );
}
