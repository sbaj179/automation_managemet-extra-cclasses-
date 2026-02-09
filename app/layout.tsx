import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Extra Class Command Center",
  description: "Manage extra class attendance and parent messaging."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
