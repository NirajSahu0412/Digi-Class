"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteClassroom } from "@/app/(dashboard)/classroom/[classId]/actions";
import { useRouter } from "next/navigation";

export function DeleteClassroomButton({ classId }: { classId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;
    setLoading(true);
    const res = await deleteClassroom(classId);
    if (res.success) {
      router.push("/dashboard");
    } else {
      setLoading(false);
      alert(res.error || "Failed to delete classroom");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Delete Classroom
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 p-5 border-b border-gray-100 bg-red-50">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-red-900">Delete Classroom</h3>
                <p className="text-sm text-red-700">This action is permanent and irreversible.</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">
                You are about to delete this classroom. This will permanently remove:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
                <li>All enrolled students and members</li>
                <li>All subjects, notes, and folders</li>
                <li>All assignments and student submissions</li>
                <li>All uploaded files (from our storage)</li>
              </ul>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please type <strong>DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm px-3 py-2 text-gray-900 bg-white"
                  placeholder="DELETE"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                >
                  Cancel
                </button>
                <Button
                  onClick={handleDelete}
                  disabled={confirmText !== "DELETE"}
                  isLoading={loading}
                  className="bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500"
                >
                  Delete Permanently
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
