"use client";

import { SessionProvider } from "next-auth/react";
import { ProgressBar } from "./ui/ProgressBar";
import { Suspense } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Suspense fallback={null}>
        <ProgressBar />
      </Suspense>
      {children}
    </SessionProvider>
  );
}
