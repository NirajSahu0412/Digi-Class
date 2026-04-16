import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Plus, BookOpen } from "lucide-react";

export default async function ClassroomNotesPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const session = await getServerSession(authOptions);

  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email || "" }
  });

  const [member, notes] = await Promise.all([
    prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: dbUser?.id || "",
          classroomId: classId,
        },
      },
    }),
    prisma.notes.findMany({
      where: { classroomId: classId },
      include: {
        subject: true
      }
    })
  ]);

  const isTeacher = member?.role === "TEACHER";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            Class Notes
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Access study materials and resources shared by the teacher.
          </p>
        </div>

        {isTeacher && (
          <button className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-sm shrink-0">
            <Plus className="w-4 h-4" />
            Upload Note
          </button>
        )}
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100 border-dashed flex flex-col items-center">
          <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No notes yet</h3>
          <p className="text-gray-500 mt-1 max-w-sm">
            {isTeacher
              ? "Upload notes, PDFs, or presentations for your students."
              : "When your teacher uploaded study materials, they will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <div key={note.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer group flex flex-col">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-orange-50 p-3 rounded-full group-hover:bg-orange-100 transition">
                    <BookOpen className="w-6 h-6 text-orange-600" />
                  </div>
                  {isTeacher && (
                    <button className="text-gray-400 hover:text-red-500 text-sm opacity-0 group-hover:opacity-100 transition">
                      Delete
                    </button>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Note Document
                </h3>
                {note.subject && (
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">
                    {note.subject.name}
                  </span>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 hover:underline">
                  Download / View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
