"use client";

import { useState } from "react";
import { Edit, Loader2 } from "lucide-react";
import { updateClassroom } from "@/app/(dashboard)/classroom/[classId]/actions";
import { useRouter } from "next/navigation";

export function ClassroomSettingsForm({ 
  classroom 
}: { 
  classroom: { id: string; name: string; academicYear: string; maxStudents: number; code: string }
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      academicYear: formData.get("academicYear") as string,
      maxStudents: parseInt(formData.get("maxStudents") as string, 10),
    };

    await updateClassroom(classroom.id, data);
    setLoading(false);
    router.refresh(); // Refresh the layout to show new names
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Class Name</label>
          <input
            name="name"
            type="text"
            required
            defaultValue={classroom.name}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border text-gray-900 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Academic Year</label>
          <input
            name="academicYear"
            type="text"
            required
            defaultValue={classroom.academicYear}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border text-gray-900 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Students Capacity</label>
          <input
            name="maxStudents"
            type="number"
            required
            defaultValue={classroom.maxStudents}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border text-gray-900 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Invite Code</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="text"
              readOnly
              defaultValue={classroom.code}
              className="block w-full rounded-md bg-gray-50 border-gray-300 shadow-sm sm:text-sm px-3 py-2 border font-mono text-gray-500"
            />
            <button type="button" onClick={() => navigator.clipboard.writeText(classroom.code)} className="bg-gray-100 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-200 transition">
              Copy
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button disabled={loading} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}
