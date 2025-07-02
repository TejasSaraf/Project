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
  const { data: session, status } = useSession();
  const isAuthPage =
    pathname?.startsWith("/signin") || pathname?.startsWith("/signup");

  const shouldShowLanding = !session && !isAuthPage && status !== "loading";

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthPage && <Navbar />}
      {shouldShowLanding && <Landing />}
      <main className="flex-1 bg-[var(--icon-black-primary)]">{children}</main>
    </div>
  );
}
