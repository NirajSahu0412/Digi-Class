"use client";

import { useState } from "react";
import { Plus, X, Calendar, BookOpen, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createAssignment } from "@/app/(dashboard)/classroom/[classId]/actions";
import { useRouter } from "next/navigation";

interface Subject {
  id: string;
  name: string;
}

export function CreateAssignmentModal({
  classId,
  subjects,
}: {
  classId: string;
  subjects: Subject[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [totalMarks, setTotalMarks] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await createAssignment(
      classId,
      title,
      description,
      deadline,
      subjectId || undefined,
      totalMarks ? parseFloat(totalMarks) : undefined
    );
    setTitle("");
    setDescription("");
    setDeadline("");
    setSubjectId("");
    setTotalMarks("");
    setLoading(false);
    setIsOpen(false);
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Create Assignment
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Create Assignment
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm px-3 py-2.5 text-gray-900 bg-white placeholder:text-gray-400"
                  placeholder="e.g. Chapter 5 — Problems"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-gray-400" /> Subject
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm px-3 py-2.5 text-gray-900 bg-white"
                >
                  <option value="">No subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm px-3 py-2.5 text-gray-900 bg-white placeholder:text-gray-400"
                  placeholder="Detailed instructions for the assignment..."
                />
              </div>

              {/* Marks + Deadline */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Award className="w-4 h-4 text-gray-400" /> Total Marks
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm px-3 py-2.5 text-gray-900 bg-white placeholder:text-gray-400"
                    placeholder="e.g. 100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" /> Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm px-3 py-2.5 text-gray-900 bg-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={loading}>
                  Create Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
