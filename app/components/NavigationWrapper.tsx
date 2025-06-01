"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavigationWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage =
    pathname?.startsWith("/signin") || pathname?.startsWith("/signup");

  return (
    <>
      {!isAuthPage && <Navbar />}
      {children}
    </>
  );
}
