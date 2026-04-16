"use client";

import { useState } from "react";
import { Plus, X, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createAssignment } from "@/app/(dashboard)/classroom/[classId]/actions";

export function CreateAssignmentModal({ classId }: { classId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await createAssignment(classId, title, description, deadline);
    setTitle("");
    setDescription("");
    setDeadline("");
    setLoading(false);
    setIsOpen(false);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="font-semibold text-lg text-gray-900">Create New Assignment</h3>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 text-gray-900 bg-white"
                  placeholder="e.g. Chapter 1 Homework"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructions (Optional)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 text-gray-900 bg-white"
                  placeholder="Additional details for the assignment..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" /> Deadline (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 text-gray-900 bg-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  isLoading={loading}
                >
                  Assign
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
