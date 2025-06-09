"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "./Navbar";
import Landing from "./landing/Landing";

export default function NavigationWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAuthPage =
    pathname?.startsWith("/signin") || pathname?.startsWith("/signup");

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthPage && <Navbar />}
      {!session && !isAuthPage && <Landing />}
      <main className="flex-1">{children}</main>
    </div>
  );
}
