"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function JoinClassroomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const code = formData.get("code") as string;

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        throw new Error(await res.text() || "Invalid code or class is full");
      }

      const classroom = await res.json();
      router.push(`/classroom/${classroom.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Invalid code or class is full");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Join a Class</h1>
        <p className="mt-2 text-gray-600 font-medium">Enter the class code provided by your teacher.</p>
      </div>

      <div className="w-full bg-white px-8 py-10 shadow-sm border border-gray-200 rounded-2xl">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold leading-6 text-gray-900 text-center text-lg mb-2">
              Class Code
            </label>
            <input
              name="code"
              type="text"
              required
              placeholder="Enter code (e.g. ABCD12)"
              className="mx-auto block w-full max-w-sm rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg text-center font-mono uppercase tracking-widest px-3"
            />
          </div>

          <div className="pt-4 flex flex-col items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-sm rounded-md bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Join Class
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm font-medium leading-6 text-gray-500 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>The class code is typically 8 characters.</p>
          <p>Don't have a code? Ask your teacher!</p>
        </div>
      </div>
    </div>
  );
}
