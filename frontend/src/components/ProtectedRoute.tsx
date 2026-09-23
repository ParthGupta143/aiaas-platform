// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/lib/auth-context";
// import { AppShell } from "@/components/AppShell";

// export function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const { token, isLoading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!isLoading && !token) {
//       router.push("/login");
//     }
//   }, [token, isLoading, router]);

//   if (!token) return null;

//   return <AppShell>{children}</AppShell>;
// }

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";

export function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !token) {
      // Preserve the page the user originally wanted to visit.
      const search =
        typeof window !== "undefined" ? window.location.search : "";

      const currentPath = `${pathname}${search}`;

      router.replace(
        `/login?redirect=${encodeURIComponent(currentPath)}`
      );
    }
  }, [token, isLoading, pathname, router]);

  // Wait until authentication state has been determined.
  if (isLoading) {
    return null;
  }

  // User is not authenticated.
  // Redirect is handled by the effect above.
  if (!token) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}