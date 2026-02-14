"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const searchParams = useSearchParams();

  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Pull error from URL (set by /auth/sign-in redirect)
  useEffect(() => {
    const e = searchParams.get("error");
    setError(e ? decodeURIComponent(e) : "");
  }, [searchParams]);

  return (
    <form
      action="/auth/sign-in"
      method="post"
      autoComplete="off"
      spellCheck={false}
      onSubmit={() => {
        setError("");
        setPending(true); // allow normal submit; do NOT preventDefault
      }}
      style={{
        width: "min(420px, 92vw)",
        borderRadius: 22,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(8,10,18,0.82)",
        padding: 22,
        color: "#fff",
      }}
    >
      <h1 style={{ margin: 0 }}>Admin & Tutor Login</h1>
      <p style={{ marginTop: 8, opacity: 0.7, fontSize: 13 }}>
        Sign in to manage sessions, attendance, and parent updates.
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
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </div>
      ) : null}

      <div style={{ marginTop: 14 }}>
        <label
          htmlFor="email"
          style={{ display: "block", fontSize: 13, opacity: 0.8, marginBottom: 8 }}
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@company.com"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          required
          style={{
            width: "100%",
            padding: "12px 12px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.45)",
            color: "rgba(255,255,255,0.92)",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <label
          htmlFor="password"
          style={{ display: "block", fontSize: 13, opacity: 0.8, marginBottom: 8 }}
        >
          Password
        </label>

        <div style={{ position: "relative" }}>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            style={{
              width: "100%",
              padding: "12px 12px",
              paddingRight: 76,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(0,0,0,0.45)",
              color: "rgba(255,255,255,0.92)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.88)",
              padding: "7px 10px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        style={{
          marginTop: 16,
          width: "100%",
          padding: "12px 14px",
          borderRadius: 14,
          border: "none",
          background: "white",
          color: "black",
          fontWeight: 900,
          cursor: pending ? "not-allowed" : "pointer",
          opacity: pending ? 0.7 : 1,
        }}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: "1px solid rgba(255,255,255,0.10)",
          fontSize: 12,
          opacity: 0.7,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>New here?</span>
        <a
          href="/onboarding"
          style={{ color: "rgba(125,211,252,0.92)", textDecoration: "none" }}
        >
          Create workspace
        </a>
      </div>
    </form>
  );
}

