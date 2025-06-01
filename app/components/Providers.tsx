"use client";

import { SessionProvider } from "next-auth/react";
import NavigationWrapper from "./NavigationWrapper";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NavigationWrapper>{children}</NavigationWrapper>
    </SessionProvider>
  );
}
