"use client";

import { useState } from "next";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";

export default function CreateClassroomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [currentSubject, setCurrentSubject] = useState("");

  const handleAddSubject = () => {
    if (currentSubject.trim() && !subjects.includes(currentSubject.trim())) {
      setSubjects([...subjects, currentSubject.trim()]);
      setCurrentSubject("");
    }
  };

  const removeSubject = (subjectToRemove: string) => {
    setSubjects(subjects.filter((s) => s !== subjectToRemove));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const academicYear = formData.get("academicYear") as string;
    const maxStudents = formData.get("maxStudents") as string;

    try {
      const res = await fetch("/api/classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          academicYear,
          maxStudents,
          subjects
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text() || "Something went wrong");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create a Class</h1>
        <p className="mt-2 text-gray-600 font-medium">Set up a new classroom to start teaching.</p>
      </div>

      <div className="bg-white px-8 py-10 shadow-sm border border-gray-200 rounded-2xl">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold leading-6 text-gray-900">
                Class Name
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="e.g. Computer Science 101"
                className="mt-2 block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold leading-6 text-gray-900">
                Academic Year
              </label>
              <input
                name="academicYear"
                type="text"
                required
                placeholder="e.g. 2024-2025"
                className="mt-2 block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold leading-6 text-gray-900">
                Max Students
              </label>
              <input
                name="maxStudents"
                type="number"
                min="1"
                required
                placeholder="e.g. 50"
                className="mt-2 block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold leading-6 text-gray-900 mb-2">
                Subjects (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentSubject}
                  onChange={(e) => setCurrentSubject(e.target.value)}
                  placeholder="Add a subject"
                  className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubject();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="bg-gray-100 text-gray-600 p-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              {subjects.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <span
                      key={subject}
                      className="inline-flex items-center gap-x-1 rounded-md bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10"
                    >
                      {subject}
                      <button
                        type="button"
                        onClick={() => removeSubject(subject)}
                        className="group relative -mr-1 h-4 w-4 rounded-sm hover:bg-indigo-600/20"
                      >
                        <span className="sr-only">Remove</span>
                        <X className="w-3 h-3 text-indigo-700" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
