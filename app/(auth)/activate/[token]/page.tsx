"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { use } from "react";
import { APP_CONFIG } from "@/app/app.config";
import Logo from "@/components/Logo";

export default function ActivatePage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const resolvedParams = use(params);

  const activateAccount = async () => {
    if (success) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resolvedParams.token }),
      });

      if (!res.ok) {
        throw new Error((await res.text()) || "Failed to activate");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050511] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        <Logo
          className="mb-8 w-max mx-auto"
          textClassName="text-white !text-2xl"
        />

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Activate Account</h1>
          {!success && <p className="text-gray-400 text-sm mb-6">Click the button below to complete your registration.</p>}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {success ? (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Account activated! Redirecting to login...
            </div>
          ) : (
            <button
              onClick={activateAccount}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 mt-4 shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Activate"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
