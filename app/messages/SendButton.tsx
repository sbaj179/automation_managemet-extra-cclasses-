"use client";

import { useTransition } from "react";
import { markMessageFailed, markMessageSent, retryMessage } from "./actions";

function toWaPhone(phone: string) {
  // Minimal SA-friendly formatting for wa.me
  const raw = phone.trim();

  // Remove spaces/dashes
  const cleaned = raw.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+")) return cleaned;       // +27...
  if (cleaned.startsWith("0")) return "+27" + cleaned.slice(1); // 0xx -> +27xx
  if (cleaned.startsWith("27")) return "+" + cleaned;           // 27xx -> +27xx

  // fallback: assume SA local without 0
  return "+27" + cleaned;
}

export default function SendButton({
  id,
  phone,
  message,
  status,
}: {
  id: string;
  phone: string;
  message: string;
  status: "queued" | "failed" | "sent";
}) {
  const [pending, startTransition] = useTransition();

  const waPhone = toWaPhone(phone);
  const waUrl = `https://wa.me/${waPhone.replace("+", "")}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <a
        href={waUrl}
        target="_blank"
        rel="noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.92)",
          textDecoration: "none",
          fontSize: 12,
          fontWeight: 750,
        }}
      >
        Open WhatsApp
      </a>

      {status === "failed" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await retryMessage(id);
            })
          }
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "none",
            background: "white",
            color: "black",
            fontSize: 12,
            fontWeight: 850,
            cursor: pending ? "not-allowed" : "pointer",
            opacity: pending ? 0.7 : 1,
          }}
        >
          Retry (queue now)
        </button>
      ) : (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await markMessageSent(id);
              })
            }
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "none",
              background: "white",
              color: "black",
              fontSize: 12,
              fontWeight: 850,
              cursor: pending ? "not-allowed" : "pointer",
              opacity: pending ? 0.7 : 1,
            }}
          >
            Mark sent
          </button>

          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await markMessageFailed(id);
              })
            }
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "transparent",
              color: "rgba(255,255,255,0.86)",
              fontSize: 12,
              fontWeight: 750,
              cursor: pending ? "not-allowed" : "pointer",
              opacity: pending ? 0.7 : 1,
            }}
          >
            Failed
          </button>
        </>
      )}
    </div>
  );
}
