"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles, Key, ArrowLeft, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1 = request email, 2 = enter OTP and new password
  const [email, setEmail] = useState("");

  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const targetEmail = formData.get("email") as string;

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });

      if (!res.ok) {
        throw new Error(await res.text() || "Internal error");
      }

      setEmail(targetEmail);
      setStep(2);
    } catch (err: any) {
      setError(err?.message || "Internal error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const token = formData.get("token") as string;
    const newPassword = formData.get("password") as string;

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      });

      if (!res.ok) {
        throw new Error(await res.text() || "Invalid OTP or error resetting password");
      }

      router.push("/login");
    } catch (err: any) {
      setError(err?.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050511] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        <Link href="/login" className="flex items-center gap-2 mb-8 group w-max mx-auto">
          <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
          <span className="text-gray-500 group-hover:text-white text-sm transition-colors">
            Back to Login
          </span>
        </Link>
        
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              {step === 1 ? "Forgot Password?" : "Reset Password"}
            </h1>
            <p className="text-gray-400 text-sm">
              {step === 1 ? "Enter your email to receive a 6-digit OTP code." : `Confirm the OTP sent to ${email}.`}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="you@email.com"
                  />
                  <ShieldCheck className="w-5 h-5 text-gray-600 absolute left-4 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Receive OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  6-Digit OTP
                </label>
                <input
                  name="token"
                  type="text"
                  required
                  maxLength={6}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-center font-mono text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                  <Key className="w-5 h-5 text-gray-600 absolute left-4 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
              </button>

              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="w-full text-center text-gray-500 text-sm hover:text-white transition-colors"
              >
                Resend OTP / Change Email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
