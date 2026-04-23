"use client";

import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, Check, X, BookOpen, AlertCircle } from "lucide-react";
import { createSubject, updateSubject, deleteSubject } from "@/app/(dashboard)/classroom/[classId]/actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface Subject {
  id: string;
  name: string;
  _count?: { assignments: number; notes: number };
}

export function SubjectManager({
  classroomId,
  subjects: initialSubjects,
}: {
  classroomId: string;
  subjects: Subject[];
}) {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState<string | null>(null); // tracks which action is loading
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    setLoading("add");
    setError(null);
    const result = await createSubject(classroomId, trimmed);

    if (result.error) {
      setError(result.error);
    } else if (result.subject) {
      setSubjects((prev) => [...prev, result.subject as Subject]);
      setNewName("");
    }
    setLoading(null);
    router.refresh();
  };

  const handleUpdate = async (subjectId: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;

    setLoading(subjectId);
    setError(null);
    const result = await updateSubject(classroomId, subjectId, trimmed);

    if (result.error) {
      setError(result.error);
    } else {
      setSubjects((prev) =>
        prev.map((s) => (s.id === subjectId ? { ...s, name: trimmed } : s))
      );
      setEditingId(null);
    }
    setLoading(null);
    router.refresh();
  };

  const handleDelete = async (subjectId: string) => {
    setLoading(subjectId);
    setError(null);
    const result = await deleteSubject(classroomId, subjectId);

    if (result.error) {
      setError(result.error);
    } else {
      setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    }
    setLoading(null);
    router.refresh();
  };

  const startEditing = (subject: Subject) => {
    setEditingId(subject.id);
    setEditingName(subject.name);
    setError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div className="space-y-5">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 animate-[fadeIn_0.2s_ease]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add Subject */}
      <div className="flex gap-3">
        <input
          ref={inputRef}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Enter subject name…"
          className="flex-1 rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2.5 text-gray-900 bg-white placeholder:text-gray-400 transition"
        />
        <Button
          onClick={handleAdd}
          isLoading={loading === "add"}
          disabled={!newName.trim()}
          leftIcon={<Plus className="w-4 h-4" />}
          size="sm"
          className="px-4"
        >
          Add
        </Button>
      </div>

      {/* Subject List */}
      {subjects.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No subjects yet</p>
          <p className="text-xs mt-1">Add your first subject above to get started.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
          {subjects.map((subject, index) => {
            const isEditing = editingId === subject.id;
            const isLoading = loading === subject.id;
            const usageCount =
              (subject._count?.assignments ?? 0) + (subject._count?.notes ?? 0);

            return (
              <li
                key={subject.id}
                className={`flex items-center gap-3 px-4 py-3 bg-white transition-colors ${
                  isLoading ? "opacity-60 pointer-events-none" : "hover:bg-gray-50/60"
                }`}
              >
                {/* Index Pill */}
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold shrink-0">
                  {index + 1}
                </span>

                {isEditing ? (
                  /* Edit Mode */
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdate(subject.id);
                        if (e.key === "Escape") cancelEditing();
                      }}
                      className="flex-1 rounded-md border border-indigo-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-1.5 text-gray-900 bg-white"
                    />
                    <button
                      onClick={() => handleUpdate(subject.id)}
                      className="p-1.5 rounded-md text-green-600 hover:bg-green-50 transition"
                      title="Save"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 transition"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* View Mode */
                  <>
                    <span className="flex-1 text-sm font-medium text-gray-800">
                      {subject.name}
                    </span>

                    {usageCount > 0 && (
                      <span className="text-xs text-gray-400 mr-2">
                        {usageCount} item{usageCount !== 1 ? "s" : ""}
                      </span>
                    )}

                    <button
                      onClick={() => startEditing(subject)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                      title="Edit subject"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
