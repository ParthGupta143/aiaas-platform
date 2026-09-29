// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useAuth } from "@/lib/auth-context";

// const NAV_ITEMS = [
//   { href: "/dashboard", label: "Dashboard" },
//   { href: "/services", label: "Services" },
//   { href: "/api-keys", label: "API Keys" },
//   { href: "/usage", label: "Usage" },
//   { href: "/logs", label: "Logs" },
//   { href: "/billing", label: "Billing" },
//   { href: "/settings", label: "Settings" },
// ];


// export function AppShell({ children }: { children: React.ReactNode }) {
//   const { user, logout } = useAuth();
//   const pathname = usePathname();

//   return (
//     <div className="flex min-h-screen">
//       <aside className="w-56 border-r bg-gray-50 flex flex-col">
//         <div className="p-4 font-semibold text-lg border-b">AIaaS Platform</div>
//         <nav className="flex-1 p-2">
//           {NAV_ITEMS.map((item) => {
//             const active = pathname === item.href;
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={`block px-3 py-2 rounded text-sm mb-1 ${
//                   active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-200"
//                 }`}
//               >
//                 {item.label}
//               </Link>
//             );
//           })}
//         </nav>
//         <div className="p-4 border-t text-sm">
//           <p className="text-gray-500 truncate">{user?.email}</p>
//           <button onClick={logout} className="text-gray-600 underline mt-1">
//             Log out
//           </button>
//         </div>
//       </aside>
//       <main className="flex-1 p-8">{children}</main>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/services", label: "Services", icon: "✦" },
  { href: "/api-keys", label: "API Keys", icon: "⌁" },
  { href: "/usage", label: "Usage", icon: "▥" },
  { href: "/logs", label: "Logs", icon: "≡" },
  { href: "/billing", label: "Billing", icon: "◫" },
];

const SYSTEM_ITEMS = [
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-value flex">
      {/* -------------------------------------------------- */}
      {/* Sidebar */}
      {/* -------------------------------------------------- */}
      <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-border">
          <Link href="/dashboard" className="block">
            <div className="flex items-center gap-3">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
  <img
    src="/mindora-icon.png"
    alt="Mindora"
    className="h-15 w-15 object-contain"
  />
</div>

              <div>
                <div className="font-semibold text-value tracking-tight">
                  Mindora
                </div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted mt-0.5">
                  AIaaS Platform
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Workspace */}
        <div className="px-5 pt-6 pb-2">
          <p className="text-[10px] uppercase tracking-[0.16em] font-medium text-muted">
            Workspace
          </p>
        </div>

        {/* Navigation */}
        <nav className="px-3">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 mb-1 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-[#15212C] text-accent border border-[#1D3945]"
                    : "text-label hover:bg-card-hover hover:text-value border border-transparent"
                }`}
              >
                <span
                  className={`w-5 text-center text-base ${
                    active
                      ? "text-accent"
                      : "text-muted group-hover:text-label"
                  }`}
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* System */}
        <div className="px-5 pt-6 pb-2">
          <p className="text-[10px] uppercase tracking-[0.16em] font-medium text-muted">
            System
          </p>
        </div>

        <nav className="px-3">
          {SYSTEM_ITEMS.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-[#15212C] text-accent border border-[#1D3945]"
                    : "text-label hover:bg-card-hover hover:text-value border border-transparent"
                }`}
              >
                <span
                  className={`w-5 text-center ${
                    active
                      ? "text-accent"
                      : "text-muted group-hover:text-label"
                  }`}
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* System status */}
        <div className="mx-4 mb-4 rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />

            <span className="text-xs text-label">
              All systems operational
            </span>
          </div>
        </div>

        {/* User */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#17212B] border border-border flex items-center justify-center text-xs font-semibold text-accent">
              {user?.email?.charAt(0).toUpperCase() ?? "U"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs text-value truncate">
                {user?.email}
              </p>

              <button
                onClick={logout}
                className="text-xs text-muted hover:text-accent transition-colors mt-1"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* -------------------------------------------------- */}
      {/* Main application area */}
      {/* -------------------------------------------------- */}
      <div className="flex-1 min-w-0 flex flex-col bg-background">
        {/* Top bar */}
        <header className="h-14 shrink-0 border-b border-border px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted">AIaaS Platform</span>

            <span className="text-muted">/</span>

            <span className="text-value font-medium">
              {getPageName(pathname)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Operational
            </div>

            <div className="h-8 w-8 rounded-md border border-border bg-card flex items-center justify-center text-xs font-medium text-label">
              ?
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

function getPageName(pathname: string) {
  if (pathname.startsWith("/dashboard")) return "Overview";
  if (pathname.startsWith("/services")) return "Services";
  if (pathname.startsWith("/api-keys")) return "API Keys";
  if (pathname.startsWith("/usage")) return "Usage";
  if (pathname.startsWith("/logs")) return "Request Logs";
  if (pathname.startsWith("/billing")) return "Billing";
  if (pathname.startsWith("/settings")) return "Settings";

  return "Overview";
}