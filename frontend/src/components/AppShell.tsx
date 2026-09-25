"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/services", label: "Services" },
  { href: "/api-keys", label: "API Keys" },
  { href: "/usage", label: "Usage" },
  { href: "/logs", label: "Logs" },
  { href: "/billing", label: "Billing" },
  { href: "/settings", label: "Settings" },
];


export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-gray-50 flex flex-col">
        <div className="p-4 font-semibold text-lg border-b">AIaaS Platform</div>
        <nav className="flex-1 p-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded text-sm mb-1 ${
                  active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t text-sm">
          <p className="text-gray-500 truncate">{user?.email}</p>
          <button onClick={logout} className="text-gray-600 underline mt-1">
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}