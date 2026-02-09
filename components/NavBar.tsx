import Link from "next/link";
import type { UserProfile } from "@/lib/data";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/students", label: "Students" },
  { href: "/subjects", label: "Subjects" },
  { href: "/sessions", label: "Sessions" },
  { href: "/messages", label: "Messages" }
];

export default function NavBar({ profile }: { profile: UserProfile | null }) {
  return (
    <nav className="nav">
      <div className="nav-inner container">
        <div>
          <strong>Extra Class Command Center</strong>
          {profile ? (
            <div className="muted" style={{ fontSize: "0.85rem" }}>
              {profile.full_name ?? ""} · {profile.role}
            </div>
          ) : null}
        </div>
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
