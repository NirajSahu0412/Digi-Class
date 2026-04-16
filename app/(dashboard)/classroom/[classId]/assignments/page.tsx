import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ClipboardList, Calendar } from "lucide-react";
import { CreateAssignmentModal } from "@/components/classroom/CreateAssignmentModal";

export default async function ClassroomAssignmentsPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const session = await getServerSession(authOptions);

  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email || "" }
  });

  const [member, assignments] = await Promise.all([
    prisma.classroomMember.findUnique({
      where: {
        userId_classroomId: {
          userId: dbUser?.id || "",
          classroomId: classId,
        },
      },
    }),
    prisma.assignment.findMany({
      where: { classroomId: classId },
      orderBy: { deadline: "asc" },
      include: {
        creator: true,
      }
    })
  ]);

  const isTeacher = member?.role === "TEACHER";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            Classwork & Assignments
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {isTeacher 
              ? "Manage assignments and class materials here."
              : "View all your pending and completed assignments."}
          </p>
        </div>
        
        {isTeacher && (
          <div className="w-full sm:w-auto self-end sm:self-auto">
            <CreateAssignmentModal classId={classId} />
          </div>
        )}
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100 border-dashed flex flex-col items-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No assignments yet</h3>
          <p className="text-gray-500 mt-1 max-w-sm">
            {isTeacher 
              ? "Create your first assignment for the class." 
              : "When your teacher posts an assignment, it will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map(assignment => (
            <div key={assignment.id} className="bg-white p-5 rounded-xl block border border-gray-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer group">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-indigo-50 p-2 sm:p-3 rounded-full group-hover:bg-indigo-100 transition shrink-0">
                    <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900 group-hover:text-indigo-600 transition">
                      {assignment.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2 sm:line-clamp-1">{assignment.description || 'No description provided.'}</p>
                  </div>
                </div>
                {assignment.deadline && (
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-orange-600 bg-orange-50 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full border border-orange-100 self-start sm:self-auto shrink-0 w-max">
                    <Calendar className="w-3.5 h-3.5" />
                    Due {new Date(assignment.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Posted by {assignment.creator.name}</span>
                {isTeacher && (
                  <div className="flex items-center gap-4 font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                    <span className="hover:underline">Edit</span>
                    <span className="hover:underline">View Submissions</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
