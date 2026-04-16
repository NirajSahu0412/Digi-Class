"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/Button";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await signOut({ callbackUrl: "/" });
    setLoading(false);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      isLoading={loading}
      onClick={handleLogout}
      leftIcon={<LogOut className="w-4 h-4" />}
      className="text-gray-600 hover:text-red-600 transition-colors"
    >
      <span className="hidden sm:inline">Logout</span>
    </Button>
  );
}
