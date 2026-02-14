"use client";

import { useActionState } from "react";
import { onboard, type OnboardingState } from "./actions";

const initialState: OnboardingState = { error: "" };

export default function OnboardingForm() {
  const [state, formAction, isPending] = useActionState<OnboardingState, FormData>(
    onboard,
    initialState
  );

  return (
    <form
      action={formAction}
      style={{
        width: "min(460px, 92vw)",
        padding: 22,
        borderRadius: 22,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(8,10,18,0.82)",
        boxShadow: "0 28px 90px rgba(0,0,0,0.72), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <h1 style={{ margin: 0, color: "rgba(255,255,255,0.95)" }}>Create your workspace</h1>
      <p style={{ marginTop: 8, color: "rgba(255,255,255,0.62)", fontSize: 13, lineHeight: 1.45 }}>
        This creates the school/class and makes your account the admin.
      </p>

      {state.error ? (
        <div
          style={{
            marginTop: 14,
            padding: "10px 12px",
            borderRadius: 16,
            border: "1px solid rgba(248,113,113,0.35)",
            background: "rgba(248,113,113,0.10)",
            color: "rgba(254,226,226,0.95)",
            fontSize: 13,
          }}
        >
          {state.error}
        </div>
      ) : null}

      <div style={{ marginTop: 14 }}>
        <label style={{ display: "block", marginBottom: 8, fontSize: 13, color: "rgba(255,255,255,0.78)" }}>
          School / Extra Class Name
        </label>
        <input
          name="school_name"
          required
          placeholder="e.g. Siba Extra Tuition"
          style={{
            width: "100%",
            borderRadius: 16,
            padding: "12px 12px",
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.46)",
            color: "rgba(255,255,255,0.92)",
            outline: "none",
          }}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: "block", marginBottom: 8, fontSize: 13, color: "rgba(255,255,255,0.78)" }}>
          Your full name (optional)
        </label>
        <input
          name="full_name"
          placeholder="e.g. Sibabalwe Mgangxela"
          style={{
            width: "100%",
            borderRadius: 16,
            padding: "12px 12px",
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.46)",
            color: "rgba(255,255,255,0.92)",
            outline: "none",
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        style={{
          marginTop: 16,
          width: "100%",
          border: "none",
          borderRadius: 16,
          padding: "12px 14px",
          fontWeight: 800,
          fontSize: 13,
          background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.86))",
          color: "rgba(0,0,0,0.92)",
          cursor: isPending ? "not-allowed" : "pointer",
          opacity: isPending ? 0.65 : 1,
        }}
      >
        {isPending ? "Creating…" : "Create workspace"}
      </button>
    </form>
  );
}
