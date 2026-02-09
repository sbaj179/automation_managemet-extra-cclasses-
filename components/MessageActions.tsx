"use client";

import { useState } from "react";

export default function MessageActions({
  phone,
  message
}: {
  phone: string;
  message: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const openWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
  };

  return (
    <div className="actions">
      <button className="button secondary" type="button" onClick={handleCopy}>
        {copied ? "Copied" : "Copy"}
      </button>
      <button className="button" type="button" onClick={openWhatsApp}>
        Open WhatsApp
      </button>
    </div>
  );
}
