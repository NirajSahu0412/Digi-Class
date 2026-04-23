import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Settings, Trash2, BookOpen } from "lucide-react";
import { ClassroomSettingsForm } from "@/components/classroom/ClassroomSettingsForm";
import { SubjectManager } from "@/components/classroom/SubjectManager";

export default async function ClassroomSettingsPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const session = await getServerSession(authOptions);

  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email || "" }
  });

  const member = await prisma.classroomMember.findUnique({
    where: {
      userId_classroomId: {
        userId: dbUser?.id || "",
        classroomId: classId,
      },
    },
    include: {
      classroom: true
    }
  });

  if (!member || member.role !== "TEACHER") {
    redirect(`/classroom/${classId}`);
  }

  const { classroom } = member;

  const subjects = await prisma.subject.findMany({
    where: { classroomId: classId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { assignments: true, notes: true }
      }
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          Classroom Settings
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Manage your classroom details and core configurations.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">General Details</h3>
          <ClassroomSettingsForm classroom={classroom} />
        </div>
      </div>

      {/* Subject Management */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Subjects
          </h3>
          <p className="text-gray-500 text-sm mb-4 border-b pb-3">
            Add, rename, or remove subjects for this classroom.
          </p>
          <SubjectManager classroomId={classId} subjects={subjects} />
        </div>
      </div>

      <div className="bg-red-50 p-6 rounded-xl border border-red-200 space-y-4">
        <h3 className="text-lg font-semibold text-red-700">Danger Zone</h3>
        <p className="text-sm text-red-600">
          Deleting a classroom will permanently remove all assignments, submissions, notes, and members. This action cannot be undone.
        </p>
        <button className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Delete Classroom
        </button>
      </div>
    </div>
  );
}
