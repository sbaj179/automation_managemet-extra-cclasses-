import LoginForm from "@/app/login/LoginForm";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params.error ? decodeURIComponent(params.error) : "";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(1200px 600px at 20% 10%, rgba(56,189,248,0.16), transparent 60%), radial-gradient(900px 500px at 80% 30%, rgba(167,139,250,0.14), transparent 55%), radial-gradient(900px 600px at 40% 90%, rgba(34,197,94,0.10), transparent 55%), #070913",
        color: "rgba(255,255,255,0.92)",
      }}
    >
      <div
        style={{
          width: "min(980px, 100%)",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 18,
          alignItems: "stretch",
        }}
      >
        {/* Left panel: product framing */}
        <section
          style={{
            borderRadius: 26,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.04)",
            padding: 22,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: -2,
              background:
                "radial-gradient(900px 360px at 20% 10%, rgba(56,189,248,0.18), transparent 60%), radial-gradient(900px 420px at 80% 20%, rgba(167,139,250,0.16), transparent 60%)",
              filter: "blur(10px)",
              opacity: 0.9,
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "inline-flex",
                gap: 10,
                alignItems: "center",
                padding: "8px 12px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.25)",
                fontSize: 12,
                letterSpacing: 0.2,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  background: "rgba(34,197,94,0.95)",
                  boxShadow: "0 0 14px rgba(34,197,94,0.35)",
                }}
              />
              Extra Class Command Center
            </div>

            <h1 style={{ margin: "14px 0 8px", fontSize: 34, lineHeight: 1.08 }}>
              Scheduling + Attendance + Parent Updates.
            </h1>

            <p style={{ margin: 0, opacity: 0.75, maxWidth: 560 }}>
              This is not a chat app. It’s an ops system that turns sessions into attendance and
              WhatsApp-ready messages with minimal staff effort.
            </p>

            <div
              style={{
                marginTop: 16,
                display: "grid",
                gap: 10,
                paddingTop: 16,
                borderTop: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              {[
                ["Session planning", "Create a session, assign tutor, auto-attach learners."],
                ["One-tap attendance", "Mark present/absent. Everything else is automated."],
                ["Message queue", "Reminders + outcomes are queued and sent reliably."],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  style={{
                    borderRadius: 18,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(0,0,0,0.18)",
                    padding: 14,
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{title}</div>
                  <div style={{ marginTop: 4, fontSize: 13, opacity: 0.72 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right panel: form */}
        <div style={{ display: "grid", placeItems: "center" }}>
          <LoginForm error={error} />
        </div>
      </div>

      <div style={{ marginTop: 18, fontSize: 12, opacity: 0.6, textAlign: "center" }}>
        Parents don’t log in — they receive WhatsApp updates. Admins run operations here.
      </div>

      <style>{`
        @media (max-width: 920px) {
          main > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
