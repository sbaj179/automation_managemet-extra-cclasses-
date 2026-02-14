// app/check-email/page.tsx

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const raw = sp.email;
  const email = Array.isArray(raw) ? raw[0] : raw ?? "";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#070a12",
        color: "#fff",
      }}
    >
      <div
        style={{
          width: "min(520px, 92vw)",
          padding: 22,
          borderRadius: 22,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(8,10,18,0.82)",
        }}
      >
        <h1 style={{ margin: 0 }}>Check your email</h1>

        <p style={{ marginTop: 10, color: "rgba(255,255,255,0.70)" }}>
          We sent a verification link{email ? ` to ${email}` : ""}. Open it to activate your
          account, then sign in.
        </p>

        <p style={{ marginTop: 10, color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
          After verifying, go to <span style={{ color: "rgba(125,211,252,0.9)" }}>/login</span> and
          sign in. Then you’ll be taken to onboarding.
        </p>
      </div>
    </main>
  );
}
