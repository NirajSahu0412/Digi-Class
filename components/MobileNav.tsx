"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export function MobileNav({ userName, userEmail, userImage }: { userName: string; userEmail: string; userImage?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 -mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-lg py-4 px-4 flex flex-col gap-4 z-50 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold overflow-hidden border border-indigo-100 ring-2 ring-white shrink-0">
              {userImage ? (
                <img src={userImage} alt={userName || "User"} width={40} height={40} />
              ) : (
                (userName || userEmail || "U")[0].toUpperCase()
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900">{userName}</span>
              <span className="text-xs text-gray-500 truncate max-w-[200px]">{userEmail}</span>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <Link
              href="/classroom/join"
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg font-medium transition-colors"
            >
              Join Class
            </Link>
            <Link
              href="/classroom/create"
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg font-medium transition-colors"
            >
              Create Class
            </Link>
          </nav>

          <div className="pt-2">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
