"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When the path changes, stop the progress bar
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest("a");

      if (
        anchor &&
        anchor.href &&
        anchor.href.startsWith(window.location.origin) &&
        !anchor.target &&
        anchor.href !== window.location.href &&
        !anchor.getAttribute("download")
      ) {
        setLoading(true);
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-1.5 overflow-hidden bg-indigo-50/20 backdrop-blur-sm">
      <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-[loading_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
           style={{ width: '100%' }} />
      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
