"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Upload", icon: "📤" },
  { href: "/ask", label: "Ask", icon: "❓" },
  { href: "/incidents", label: "Incidents", icon: "🚨" },
  { href: "/health", label: "Health", icon: "🫀" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3">
      <div className="mb-2 text-xs font-semibold text-[var(--muted)]">
        Navigation
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((n) => {
          const isActive =
            pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href));

          return (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-xl px-3 py-2 text-sm transition ${
                isActive ? "bg-black text-white" : "hover:bg-black/5"
              }`}
            >
              <span className="mr-2">{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
