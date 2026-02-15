"use client";

import { useMemo, useState } from "react";

type LoginFormProps = {
  error?: string;
};

export default function LoginForm({ error }: LoginFormProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");

  // helps browsers treat this as a "new" form instance (slightly reduces sticky autofill)
  const formKey = useMemo(() => `${mode}-${Date.now()}`, [mode]);

  return (
    <div
      style={{
        width: "min(460px, 92vw)",
        borderRadius: 26,
        border: "1px solid rgba(255,255,255,0.12)",
        background:
          "radial-gradient(800px 300px at 20% 10%, rgba(56,189,248,0.14), transparent 55%), radial-gradient(700px 320px at 80% 0%, rgba(167,139,250,0.12), transparent 55%), rgba(10,12,22,0.78)",
        padding: 18,
        color: "rgba(255,255,255,0.92)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
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
            "radial-gradient(500px 200px at 15% 15%, rgba(34,197,94,0.10), transparent 60%)",
          filter: "blur(10px)",
          opacity: 0.8,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <button type="button" onClick={() => setMode("login")} style={tabStyle(mode === "login")}>
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            style={tabStyle(mode === "signup")}
          >
            Create account
          </button>
        </div>

        <div style={{ padding: "6px 2px 12px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.22)",
              fontSize: 12,
              opacity: 0.9,
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
            Tuition Ops • Secure Access
          </div>

          <h1 style={{ margin: "12px 0 6px", fontSize: 22 }}>
            {mode === "login" ? "Admin & Tutor Login" : "Create your admin account"}
          </h1>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.72 }}>
            {mode === "login"
              ? "Sign in to manage sessions, attendance, and WhatsApp-ready updates."
              : "Create a workspace. For testing, email verification should be disabled in Supabase."}
          </p>

          {error ? (
            <div
              style={{
                marginTop: 12,
                padding: 10,
                borderRadius: 14,
                border: "1px solid rgba(248,113,113,0.35)",
                background: "rgba(248,113,113,0.10)",
                color: "rgba(254,226,226,0.95)",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          ) : null}
        </div>

        {mode === "login" ? (
          <form
            key={formKey}
            action="/auth/sign-in"
            method="post"
            autoComplete="off"
            spellCheck={false}
            style={formStyle}
          >
            {/* Autofill decoys (browsers often fill these instead of your real fields) */}
            <input type="text" name="username" autoComplete="username" style={decoyStyle} />
            <input type="password" name="password" autoComplete="current-password" style={decoyStyle} />

            <Field label="Email" htmlFor="email">
              <input
                className="input"
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                required
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                inputMode="email"
                style={inputOverride}
              />
            </Field>

            <Field label="Password" htmlFor="password">
              <input
                className="input"
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                style={inputOverride}
              />
            </Field>

            <button className="button" type="submit" style={primaryButton}>
              Sign in
            </button>

            <div style={footerLine}>
              <span>New here?</span>
              <button type="button" onClick={() => setMode("signup")} style={linkBtn}>
                Create workspace
              </button>
            </div>
          </form>
        ) : (
          <form
            key={formKey}
            action="/auth/sign-up"
            method="post"
            autoComplete="off"
            spellCheck={false}
            style={formStyle}
          >
            <input type="text" name="username" autoComplete="username" style={decoyStyle} />
            <input type="password" name="password" autoComplete="new-password" style={decoyStyle} />

            <Field label="Full name" htmlFor="full_name">
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="e.g. Sibabalwe Mgangxela"
                required
                autoComplete="off"
                style={inputOverride}
              />
            </Field>

            <Field label="Email" htmlFor="email_su">
              <input
                id="email_su"
                name="email"
                type="email"
                placeholder="you@company.com"
                required
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                inputMode="email"
                style={inputOverride}
              />
            </Field>

            <Field label="Password" htmlFor="password_su">
              <input
                id="password_su"
                name="password"
                type="password"
                placeholder="Minimum 8 characters"
                required
                autoComplete="new-password"
                style={inputOverride}
              />
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.65 }}>
                Tip: use 12+ characters. You’re running a business system, not a hobby.
              </div>
            </Field>

            <button className="button" type="submit" style={primaryButton}>
              Create account
            </button>

            <div style={footerLine}>
              <span>Already have an account?</span>
              <button type="button" onClick={() => setMode("login")} style={linkBtn}>
                Sign in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <label htmlFor={htmlFor} style={{ fontSize: 13, opacity: 0.85 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: active ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.18)",
    color: "rgba(255,255,255,0.92)",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
  };
}

const formStyle: React.CSSProperties = {
  marginTop: 8,
  display: "grid",
  gap: 12,
  padding: 14,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.20)",
};

const inputOverride: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(0,0,0,0.35)",
  color: "rgba(255,255,255,0.92)",
  outline: "none",
  boxSizing: "border-box",
};

const primaryButton: React.CSSProperties = {
  marginTop: 6,
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "none",
  background: "white",
  color: "black",
  fontWeight: 900,
};

const footerLine: React.CSSProperties = {
  marginTop: 6,
  paddingTop: 12,
  borderTop: "1px solid rgba(255,255,255,0.10)",
  fontSize: 12,
  opacity: 0.75,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const linkBtn: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "rgba(125,211,252,0.92)",
  cursor: "pointer",
  padding: 0,
  fontWeight: 900,
};

const decoyStyle: React.CSSProperties = {
  position: "absolute",
  left: -9999,
  top: -9999,
  height: 1,
  width: 1,
  opacity: 0,
  pointerEvents: "none",
};
